from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.crm.views import LeadViewSet, PublicLeadCreateView

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")

urlpatterns = [
    path("", include(router.urls)),
    path("public/leads/", PublicLeadCreateView.as_view(), name="public-lead-create"),
]
 