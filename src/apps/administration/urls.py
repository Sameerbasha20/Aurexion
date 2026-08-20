from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from apps.administration.views import RoleViewSet, AdminDashboardView, UserRoleChoicesView

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='role')

urlpatterns = [
    re_path(r'^admin/dashboard/?$', AdminDashboardView.as_view(), name='admin-dashboard-metrics'),
    re_path(r'^administration/dashboard/?$', AdminDashboardView.as_view(), name='administration-dashboard-metrics'),
    re_path(r'^admin-dashboard/?$', AdminDashboardView.as_view(), name='admin-dashboard-alt'),
    path('users/roles/', UserRoleChoicesView.as_view(), name='user-role-choices'),
    path('', include(router.urls)),
]

