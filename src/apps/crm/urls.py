from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.crm.views import LeadViewSet, PublicLeadCreateView, EstimatorCalculateView

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")

urlpatterns = [
    path("", include(router.urls)),
    path("public/leads/", PublicLeadCreateView.as_view(), name="public-lead-create"),
    path("estimator/calculate/", EstimatorCalculateView.as_view(), name="estimator-calculate"),
    path("crm/estimator/calculate/", EstimatorCalculateView.as_view(), name="crm-estimator-calculate"),
]

 