from django.urls import path
from apps.portal.views import PortalLoginView, PortalLogoutView, DashboardView

app_name = 'portal'

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('login/', PortalLoginView.as_view(), name='login'),
    path('logout/', PortalLogoutView.as_view(), name='logout'),
]
