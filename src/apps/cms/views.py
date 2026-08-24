from rest_framework import viewsets, generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.utils import timezone
from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost, CompanyInformation
from apps.cms.serializers import (
    ServiceSerializer, CaseStudySerializer, IndustrySerializer, 
    IndustryPublicSerializer, CategorySerializer, BlogPostSerializer,
    CompanyInformationSerializer
)
from apps.administration.permissions import IsContentManager


# --- Admin/Staff CMS ViewSets (CRUD) ---

class AdminServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by('-created_at')
    serializer_class = ServiceSerializer
    permission_classes = [IsContentManager]
    lookup_field = 'slug'

class AdminCaseStudyViewSet(viewsets.ModelViewSet):
    queryset = CaseStudy.objects.all().order_by('-created_at')
    serializer_class = CaseStudySerializer
    permission_classes = [IsContentManager]
    lookup_field = 'slug'

class AdminIndustryViewSet(viewsets.ModelViewSet):
    queryset = Industry.objects.all().prefetch_related('services', 'case_studies').order_by('-created_at')
    serializer_class = IndustrySerializer
    permission_classes = [IsContentManager]
    lookup_field = 'slug'

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsContentManager]
    lookup_field = 'slug'

class AdminBlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().select_related('author', 'category').order_by('-created_at')
    serializer_class = BlogPostSerializer
    permission_classes = [IsContentManager]
    lookup_field = 'slug'

    def dispatch(self, request, *args, **kwargs):
        if hasattr(request, 'user') and request.user.is_authenticated:
            role = getattr(getattr(request.user, 'profile', None), 'role', None)
            if role not in ['super_admin', 'content_manager'] and not request.user.is_superuser:
                from django.http import JsonResponse
                return JsonResponse({"detail": "Not allowed"}, status=403)
        return super().dispatch(request, *args, **kwargs)


# --- Public CMS Views (Cached) ---

@extend_schema_view(
    get=extend_schema(tags=['CMS (Public)'], auth=[])
)
class PublicServiceDetailView(generics.RetrieveAPIView):
    """
    Public API: GET /api/v1/cms/public/services/{slug}/
    Retrieves full details for a published service.
    """
    queryset = Service.objects.filter(status='published')
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

@extend_schema_view(
    get=extend_schema(tags=['CMS (Public)'], auth=[])
)
class PublicIndustryDetailView(generics.RetrieveAPIView):
    """
    Public API: GET /api/v1/cms/public/industries/{slug}/
    Queries and returns related challenges, solutions, services, and case studies.
    """
    queryset = Industry.objects.filter(status='published').prefetch_related('services', 'case_studies')
    serializer_class = IndustryPublicSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

@extend_schema_view(
    list=extend_schema(tags=['CMS (Public)'], auth=[]),
    retrieve=extend_schema(tags=['CMS (Public)'], auth=[])
)
class PublicCaseStudyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API: GET /api/v1/cms/public/case-studies/
    Lists published case studies with tech stack filtering and detail view.
    """
    serializer_class = CaseStudySerializer
    permission_classes = [AllowAny]
    pagination_class = None
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = CaseStudy.objects.filter(status='published').order_by('-created_at')
        tech_stack = self.request.query_params.get('tech_stack')
        if tech_stack:
            from django.db import connection
            if connection.vendor == 'postgresql':
                queryset = queryset.filter(tech_stack__contains=[tech_stack])
            else:
                queryset = queryset.filter(tech_stack__icontains=tech_stack)
        return queryset

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

@extend_schema_view(
    list=extend_schema(tags=['CMS (Public)'], auth=[]),
    retrieve=extend_schema(tags=['CMS (Public)'], auth=[]),
    related=extend_schema(tags=['CMS (Public)'], auth=[])
)
class PublicBlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API: GET /api/v1/cms/public/blog/
    List or retrieve published blog articles.
    Supports tag filtering, categories, keyword search, and related suggestions.
    """
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content']

    def get_queryset(self):
        now = timezone.now()
        # Include Published, or Scheduled posts whose time has passed
        queryset = BlogPost.objects.select_related('author', 'category').filter(
            Q(status='published') | Q(status='scheduled', published_at__lte=now)
        ).order_by('-created_at')
        
        category_slug = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
            
        return queryset

    def list(self, request, *args, **kwargs):
        from django.core.cache import cache
        import hashlib
        category = request.query_params.get('category', '')
        tag = request.query_params.get('tag', '')
        search = request.query_params.get('search', '')
        if not search:
            raw_key = f"{category}:{tag}"
            hashed = hashlib.md5(raw_key.encode()).hexdigest()
            cache_key = f"cms_blog_list_{hashed}"
            cached = cache.get(cache_key)
            if cached is not None:
                return Response(cached)
            resp = super().list(request, *args, **kwargs)
            if resp.status_code == 200:
                cache.set(cache_key, resp.data, timeout=300)
            return resp
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """
        Public API: GET /api/v1/cms/public/blog/{slug}/related/
        Suggests up to 3 blog posts within the same category.
        """
        post = self.get_object()
        now = timezone.now()
        qs = BlogPost.objects.filter(
            Q(status='published') | Q(status='scheduled', published_at__lte=now)
        ).exclude(id=post.id)
        
        category_posts = qs.filter(category=post.category)
        suggestions = list(category_posts[:3])
        if len(suggestions) < 3:
            remaining = qs.exclude(id__in=[p.id for p in suggestions])
            suggestions.extend(list(remaining[:3 - len(suggestions)]))
            
        serializer = BlogPostSerializer(suggestions, many=True, context={'request': request})
        return Response(serializer.data)


class PublicServiceListView(generics.ListAPIView):
    """
    Public API: GET /api/v1/cms/public/services/
    Returns a list of published services.
    """
    queryset = Service.objects.filter(status='published').order_by('-created_at')
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def list(self, request, *args, **kwargs):
        from django.core.cache import cache
        cache_key = "cms_service_list"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        resp = super().list(request, *args, **kwargs)
        if resp.status_code == 200:
            cache.set(cache_key, resp.data, timeout=300)
        return resp


class PublicIndustryListView(generics.ListAPIView):
    """
    Public API: GET /api/v1/cms/public/industries/
    Returns a list of published industries.
    """
    queryset = Industry.objects.filter(status='published').prefetch_related('services', 'case_studies').order_by('-created_at')
    serializer_class = IndustrySerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def list(self, request, *args, **kwargs):
        from django.core.cache import cache
        cache_key = "cms_industry_list"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        resp = super().list(request, *args, **kwargs)
        if resp.status_code == 200:
            cache.set(cache_key, resp.data, timeout=300)
        return resp


from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os

class MediaUploadView(APIView):
    """
    CMS API: POST /api/v1/cms/admin/upload/
    Uploads a media file/picture and returns its absolute URL.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure uploads folder exists in MEDIA_ROOT
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'uploads'), exist_ok=True)
        
        fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'uploads'))
        filename = fs.save(file_obj.name, file_obj)
        # Use MEDIA_BASE_URL env var if set (production CDN/Render), otherwise build from request.
        # This prevents localhost URLs in production when behind proxy.
        media_base = getattr(settings, 'MEDIA_BASE_URL', '')
        if media_base:
            file_url = f"{media_base}{settings.MEDIA_URL}uploads/{filename}"
        else:
            file_url = request.build_absolute_uri(settings.MEDIA_URL + 'uploads/' + filename)
        
        return Response({'url': file_url}, status=status.HTTP_200_OK)


class AdminCompanyInformationViewSet(viewsets.ModelViewSet):
    queryset = CompanyInformation.objects.all().order_by('-created_at')
    serializer_class = CompanyInformationSerializer
    permission_classes = [IsContentManager]
    lookup_field = 'slug'


@extend_schema_view(
    get=extend_schema(tags=['CMS (Public)'], auth=[])
)
class PublicCompanyInformationView(generics.RetrieveAPIView):
    """
    Public API: GET /api/v1/cms/public/company-info/
    Returns the dynamic published company information.
    """
    serializer_class = CompanyInformationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        obj = CompanyInformation.objects.filter(status='published').first()
        if not obj:
            obj = CompanyInformation.objects.first()
        if not obj:
            obj = CompanyInformation.objects.create(
                title="Aurexion Technologies", 
                slug="aurexion", 
                status="published",
                hero={"title": "ENGINEERING WHAT COMES NEXT.", "subtitle": "AI. Software. Cloud. Data. Engineered for the enterprise.", "eyebrow": "DIGITAL INTELLIGENCE"}
            )
        return obj


