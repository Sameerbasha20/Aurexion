from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    PublicJobVacancyListView, PublicJobVacancyDetailView, ApplyForJobView,
    AdminJobVacancyViewSet, AdminCandidateApplicationViewSet
)

class OptionalSlashRouter(DefaultRouter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trailing_slash = '/?'

router = OptionalSlashRouter()
router.register(r'careers/admin/jobs', AdminJobVacancyViewSet, basename='admin-jobs')
router.register(r'careers/admin/applications', AdminCandidateApplicationViewSet, basename='admin-applications')

urlpatterns = [
    # Public APIs
    path('careers/jobs/', PublicJobVacancyListView.as_view(), name='public-jobs-list'),
    path('careers/jobs/<str:job_id>/', PublicJobVacancyDetailView.as_view(), name='public-jobs-detail'),
    path('careers/apply/', ApplyForJobView.as_view(), name='public-apply'),
] + router.urls
