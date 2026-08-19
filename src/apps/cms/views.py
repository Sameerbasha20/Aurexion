from rest_framework import viewsets, generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.utils import timezone
from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost
from apps.cms.serializers import (
    ServiceSerializer, CaseStudySerializer, IndustrySerializer, 
    IndustryPublicSerializer, CategorySerializer, BlogPostSerializer
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


# --- Public CMS Views (Cached) ---

@extend_schema_view(
    get=extend_schema(tags=['CMS (Public)'], auth=[])
)
@method_decorator(cache_page(60 * 15), name='dispatch')
class PublicServiceDetailView(generics.RetrieveAPIView):
    """
    Public API: GET /api/v1/cms/public/services/{slug}/
    Resolves active services by slug.
    """
    queryset = Service.objects.filter(status='published')
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

@extend_schema_view(
    get=extend_schema(tags=['CMS (Public)'], auth=[])
)
@method_decorator(cache_page(60 * 15), name='dispatch')
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
    Retrieve list or detail of non-draft case studies.
    Supports portfolio filters: ?tech_stack=Python
    """
    serializer_class = CaseStudySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = CaseStudy.objects.filter(status='published').order_by('-created_at')
        tech_stack = self.request.query_params.get('tech_stack')
        if tech_stack:
            # Filter if tech_stack contains the value
            queryset = queryset.filter(tech_stack__icontains=tech_stack)
        return queryset

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
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
        queryset = BlogPost.objects.filter(
            Q(status='published') | Q(status='scheduled', published_at__lte=now)
        ).order_by('-created_at')
        
        category_slug = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
            
        return queryset

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
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
