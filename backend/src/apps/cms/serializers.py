from rest_framework import serializers
from django.contrib.auth.models import User
from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost, CompanyInformation

class ServiceSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(required=False, allow_blank=True)
    problem = serializers.CharField(required=False, allow_blank=True, default='')
    solution = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Service
        fields = '__all__'

    def create(self, validated_data):
        if not validated_data.get('slug') and validated_data.get('title'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data['title']) or "service"
            slug = base_slug
            counter = 1
            while Service.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug
        return super().create(validated_data)

class CaseStudySerializer(serializers.ModelSerializer):
    slug = serializers.CharField(required=False, allow_blank=True)
    client = serializers.CharField(required=False, allow_blank=True, default='Client')

    class Meta:
        model = CaseStudy
        fields = '__all__'

    def create(self, validated_data):
        if not validated_data.get('slug') and validated_data.get('title'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data['title']) or "case-study"
            slug = base_slug
            counter = 1
            while CaseStudy.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug
        return super().create(validated_data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        is_staff = False
        if request and request.user and request.user.is_authenticated:
            role = request.user.profile.role if hasattr(request.user, 'profile') else None
            if request.user.is_superuser or role in ['super_admin', 'content_manager']:
                is_staff = True

        if instance.confidential and not is_staff:
            ret['client'] = "Confidential Client"
            # Redact the name of the client to satisfy the validation of confidentiality
        ret['coverimage'] = instance.cover_image or instance.media
        ret['coverImage'] = instance.cover_image or instance.media
        return ret


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = '__all__'

class IndustryPublicSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    case_studies = CaseStudySerializer(many=True, read_only=True)

    class Meta:
        model = Industry
        fields = ['id', 'name', 'slug', 'challenges', 'target_solutions', 'services', 'case_studies', 'status']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BlogPostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    category_name = serializers.ReadOnlyField(source='category.name', default='General')
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    author = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    slug = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = BlogPost
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['coverimage'] = instance.cover_image or instance.media
        ret['coverImage'] = instance.cover_image or instance.media
        return ret


    def create(self, validated_data):
        if not validated_data.get('category'):
            default_cat = Category.objects.filter(name='General').first() or Category.objects.first()
            if not default_cat:
                default_cat, _ = Category.objects.get_or_create(name='General', defaults={'slug': 'general'})
            validated_data['category'] = default_cat

        if not validated_data.get('author'):
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                validated_data['author'] = request.user
            else:
                validated_data['author'] = User.objects.filter(is_superuser=True).first() or User.objects.first()

        if not validated_data.get('slug') and validated_data.get('title'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data['title']) or "blog-post"
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug

        # Sync cover_image and media
        media_val = validated_data.get('media') or validated_data.get('cover_image')
        cover_val = validated_data.get('cover_image') or validated_data.get('media')
        if media_val:
            validated_data['media'] = media_val
        if cover_val:
            validated_data['cover_image'] = cover_val

        return super().create(validated_data)

    def update(self, instance, validated_data):
        media_val = validated_data.get('media') or validated_data.get('cover_image')
        cover_val = validated_data.get('cover_image') or validated_data.get('media')
        if media_val:
            validated_data['media'] = media_val
        if cover_val:
            validated_data['cover_image'] = cover_val
        return super().update(instance, validated_data)


class CompanyInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyInformation
        fields = '__all__'

