from rest_framework import serializers
from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost, CompanyInformation

class ServiceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Service
        fields = '__all__'

class CaseStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudy
        fields = '__all__'

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
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = BlogPost
        fields = '__all__'

class CompanyInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyInformation
        fields = '__all__'

