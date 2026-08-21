from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from apps.authentication.views import (
    LoginView, LogoutView, UserProfileView, UserViewSet, AuditLogViewSet, CookieTokenRefreshView,
    ForgotPasswordView, ResetPasswordView, ChangePasswordView
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
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/roles/', UserRoleChoicesView.as_view(), name='user-role-choices'),
    re_path(r'^admin/dashboard/?$', AdminDashboardView.as_view(), name='auth-admin-dashboard'),
    path('', include(router.urls)),
]
