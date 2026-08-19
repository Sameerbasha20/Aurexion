from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.cms.views import (
    AdminServiceViewSet, AdminCaseStudyViewSet, AdminIndustryViewSet, AdminCategoryViewSet, AdminBlogPostViewSet,
    PublicServiceDetailView, PublicIndustryDetailView, PublicCaseStudyViewSet, PublicBlogPostViewSet
)

router = DefaultRouter()
# Admin routes
router.register(r'cms/admin/service', AdminServiceViewSet, basename='admin-service')
router.register(r'cms/admin/case-studies', AdminCaseStudyViewSet, basename='admin-case-studies')
router.register(r'cms/admin/industry', AdminIndustryViewSet, basename='admin-industry')
router.register(r'cms/admin/categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'cms/admin/blog', AdminBlogPostViewSet, basename='admin-blog')

# Public viewsets
router.register(r'cms/public/case-studies', PublicCaseStudyViewSet, basename='public-case-studies')
router.register(r'cms/public/blog', PublicBlogPostViewSet, basename='public-blog')

urlpatterns = [
    # Public detail views
    path('cms/public/service/<slug:slug>/', PublicServiceDetailView.as_view(), name='public-service-detail'),
    path('cms/public/industry/<slug:slug>/', PublicIndustryDetailView.as_view(), name='public-industry-detail'),
    
    path('', include(router.urls)),
]
