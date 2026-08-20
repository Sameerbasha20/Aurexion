from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.crm.views import LeadViewSet, PublicLeadCreateView, EstimatorCalculateView, RFPSubmitView

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")

urlpatterns = [
    path("", include(router.urls)),
    path("public/leads/", PublicLeadCreateView.as_view(), name="public-lead-create"),
    path("estimator/calculate/", EstimatorCalculateView.as_view(), name="estimator-calculate"),
    path("crm/estimator/calculate/", EstimatorCalculateView.as_view(), name="crm-estimator-calculate"),
    path("rfp/submit/", RFPSubmitView.as_view(), name="rfp-submit"),
    path("crm/rfp/submit/", RFPSubmitView.as_view(), name="crm-rfp-submit"),
]

 