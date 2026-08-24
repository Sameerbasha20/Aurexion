from django.urls import path

from apps.bdm.views import BdmDashboardView

urlpatterns = [
    path("bdm/dashboard/", BdmDashboardView.as_view(), name="bdm-dashboard"),
]
