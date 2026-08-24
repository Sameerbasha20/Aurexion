from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.crm.views import LeadViewSet, PublicLeadCreateView, EstimatorCalculateView, RFPSubmitView

class OptionalSlashRouter(DefaultRouter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trailing_slash = '/?'

router = OptionalSlashRouter()
router.register(r"leads", LeadViewSet, basename="lead")

from django.urls import path, re_path, include

urlpatterns = [
    path("", include(router.urls)),
    re_path(r"^public/leads/?$", PublicLeadCreateView.as_view(), name="public-lead-create"),
    re_path(r"^estimator/calculate/?$", EstimatorCalculateView.as_view(), name="estimator-calculate"),
    re_path(r"^crm/estimator/calculate/?$", EstimatorCalculateView.as_view(), name="crm-estimator-calculate"),
    re_path(r"^rfp/submit/?$", RFPSubmitView.as_view(), name="rfp-submit"),
    re_path(r"^crm/rfp/submit/?$", RFPSubmitView.as_view(), name="crm-rfp-submit"),
]

 