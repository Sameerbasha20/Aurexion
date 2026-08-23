from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from apps.authentication.views import (
    LoginView, LogoutView, UserProfileView, UserViewSet, AuditLogViewSet, CookieTokenRefreshView,
    ForgotPasswordView, ResetPasswordView, ChangePasswordView
)
from apps.administration.views import UserRoleChoicesView, AdminDashboardView

class OptionalSlashRouter(DefaultRouter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trailing_slash = '/?'

router = OptionalSlashRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    re_path(r'^auth/login/?$', LoginView.as_view(), name='login'),
    re_path(r'^auth/logout/?$', LogoutView.as_view(), name='logout'),
    re_path(r'^auth/token/refresh/?$', CookieTokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^auth/me/?$', UserProfileView.as_view(), name='me'),
    re_path(r'^auth/forgot-password/?$', ForgotPasswordView.as_view(), name='forgot_password'),
    re_path(r'^auth/reset-password/?$', ResetPasswordView.as_view(), name='reset_password'),
    re_path(r'^auth/change-password/?$', ChangePasswordView.as_view(), name='change_password'),
    re_path(r'^users/roles/?$', UserRoleChoicesView.as_view(), name='user-role-choices'),
    re_path(r'^admin/dashboard/?$', AdminDashboardView.as_view(), name='auth-admin-dashboard'),
    path('', include(router.urls)),
]
