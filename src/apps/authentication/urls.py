from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from apps.authentication.views import (
    LoginView, LogoutView, UserProfileView, UserViewSet, AuditLogViewSet, CookieTokenRefreshView
)
from apps.administration.views import UserRoleChoicesView, AdminDashboardView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserProfileView.as_view(), name='me'),
    path('users/roles/', UserRoleChoicesView.as_view(), name='user-role-choices'),
    re_path(r'^admin/dashboard/?$', AdminDashboardView.as_view(), name='auth-admin-dashboard'),
    path('', include(router.urls)),
]
