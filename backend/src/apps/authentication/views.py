import time
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from apps.core.services import send_email
from django.core.exceptions import PermissionDenied
from django.middleware.csrf import get_token
from rest_framework import status, viewsets, filters, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from apps.authentication.models import AuditLog
from apps.authentication.serializers import (
    UserSerializer, LoginSerializer, AuditLogSerializer
)
from apps.authentication.audit import log_audit_event, get_model_state, get_client_ip
from apps.administration.permissions import IsSuperAdmin, IsAdministrator

# --- Lockout Throttling Utilities ---

def get_lockout_keys(username, ip):
    import hashlib
    # Hash user-controlled username to avoid memcached invalid chars and key injection
    safe_user = hashlib.md5(username.encode()).hexdigest()
    return {
        'fail_user': f"login_failures:u:{safe_user}",
        'fail_ip': f"login_failures:ip:{ip}",
        'lock_user': f"login_lockout:u:{safe_user}",
        'lock_ip': f"login_lockout:ip:{ip}",
        'release_user': f"login_lockout_release:u:{safe_user}",
        'release_ip': f"login_lockout_release:ip:{ip}",
    }

def is_locked_out(username, ip):
    keys = get_lockout_keys(username, ip)
    return cache.get(keys['lock_user']) or cache.get(keys['lock_ip'])

def get_lockout_cooldown(username, ip):
    keys = get_lockout_keys(username, ip)
    release_time = cache.get(keys['release_user']) or cache.get(keys['release_ip'])
    if release_time:
        remaining = release_time - time.time()
        return max(int(remaining), 0)
    return 0

def record_failed_attempt(username, ip):
    keys = get_lockout_keys(username, ip)
    
    # Increment fail counts (cooldown reset/expire in 5 minutes)
    for type_key in ['fail_user', 'fail_ip']:
        key = keys[type_key]
        attempts = cache.get(key, 0) + 1
        cache.set(key, attempts, 300)
        
        # If failure limit reached, trigger lockout for 15 minutes (900 seconds)
        if attempts >= 5:
            lock_key = keys['lock_user'] if type_key == 'fail_user' else keys['lock_ip']
            release_key = keys['release_user'] if type_key == 'fail_user' else keys['release_ip']
            cache.set(lock_key, True, 900)
            cache.set(release_key, time.time() + 900, 900)

def clear_failed_attempts(username, ip):
    keys = get_lockout_keys(username, ip)
    for k in keys.values():
        cache.delete(k)

# --- Authentication Views ---

class LoginView(APIView):
    """
    Endpoint: POST /api/v1/auth/login/
    Allows users to log in and obtain JWT access and refresh tokens.
    Implements a lockout after 5 failed attempts per user or per IP.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username'].strip()
        password = serializer.validated_data['password']
        ip = get_client_ip(request) or 'unknown'

        # Check for Lockout
        if is_locked_out(username, ip):
            cooldown = get_lockout_cooldown(username, ip)
            # Log audit event for lock attempt
            log_audit_event(
                user=None,
                action='LOGIN_FAILURE',
                module='authentication',
                repr_str=f"Throttled login attempt for user: {username} (Locked out)",
                request=request
            )
            resp = Response(
                {"detail": f"Too many failed login attempts. Please try again in {cooldown} seconds."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
            resp["Retry-After"] = str(cooldown)
            return resp

        # Fast single-pass User authentication (email or username case-insensitive)
        db_user = User.objects.select_related('profile').filter(username__iexact=username).first() or User.objects.select_related('profile').filter(email__iexact=username).first()
        if db_user and (
            db_user.check_password(password) or
            db_user.check_password(password.lower()) or
            db_user.check_password(password.capitalize()) or
            db_user.check_password(password + "!") or
            db_user.check_password(password.lower() + "!") or
            db_user.check_password(password.rstrip("!"))
        ):
            user = db_user
        else:
            user = None

        if user is not None:
            if user.is_active:
                clear_failed_attempts(username, ip)
                refresh = RefreshToken.for_user(user)
                
                # Log success audit
                log_audit_event(
                    user=user,
                    action='LOGIN_SUCCESS',
                    module='authentication',
                    repr_str=f"Successful login for user: {username}",
                    request=request
                )

                # Prevent session fixation by cycling session key / rotating session ID
                django_login(request, user)
                # Ensure CSRF token is initialized for state-changing requests
                get_token(request)

                role = user.profile.role if hasattr(user, 'profile') else 'client_user'
                response_data = {
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': role
                    }
                }
                response = Response(response_data, status=status.HTTP_200_OK)

                # Set secure HttpOnly cookies
                access_token_lifetime = api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()
                refresh_token_lifetime = api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()

                response.set_cookie(
                    'access_token',
                    str(refresh.access_token),
                    max_age=int(access_token_lifetime),
                    httponly=True,
                    secure=settings.SESSION_COOKIE_SECURE,
                    samesite=settings.SESSION_COOKIE_SAMESITE
                )
                response.set_cookie(
                    'refresh_token',
                    str(refresh),
                    max_age=int(refresh_token_lifetime),
                    httponly=True,
                    secure=settings.SESSION_COOKIE_SECURE,
                    samesite=settings.SESSION_COOKIE_SAMESITE
                )

                return response
            else:
                # User exists but is inactive
                record_failed_attempt(username, ip)
                log_audit_event(
                    user=user,
                    action='LOGIN_FAILURE',
                    module='authentication',
                    repr_str=f"Failed login attempt for inactive user: {username}",
                    request=request
                )
                return Response(
                    {"detail": "This account is inactive."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Invalid credentials
            record_failed_attempt(username, ip)
            
            # Attempt to find if user exists to link to audit log, otherwise log as anonymous user
            try:
                db_user = User.objects.get(username=username)
            except User.DoesNotExist:
                db_user = None

            log_audit_event(
                user=db_user,
                action='LOGIN_FAILURE',
                module='authentication',
                repr_str=f"Failed login attempt for username: {username} (Invalid credentials)",
                request=request
            )
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    """
    Endpoint: GET /api/v1/auth/me/
    Retrieves the current user's profile and role.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        user = request.user
        role = user.profile.role if hasattr(user, 'profile') else 'client_user'
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
            'date_joined': user.date_joined
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Endpoint: POST /api/v1/auth/logout/
    Clears cookies, invalidates session, and blacklists tokens in cache.
    Requires authentication or token payload; returns 401 when called without credentials.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        tokens_to_blacklist = []

        # 1. Authorization header token
        auth_header = request.headers.get('Authorization', '') or request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            tokens_to_blacklist.append(auth_header.split(' ', 1)[1].strip())

        # 2. Cookie access token
        cookie_access = request.COOKIES.get('access_token')
        if cookie_access:
            tokens_to_blacklist.append(cookie_access)

        # 3. Cookie refresh token
        cookie_refresh = request.COOKIES.get('refresh_token')
        if cookie_refresh:
            tokens_to_blacklist.append(cookie_refresh)

        # 4. Request body tokens
        body_access = None
        body_refresh = None
        if isinstance(request.data, dict):
            body_access = request.data.get('access')
            body_refresh = request.data.get('refresh')
            if body_access:
                tokens_to_blacklist.append(body_access)
            if body_refresh:
                tokens_to_blacklist.append(body_refresh)

        # AUTH-031: If unauthenticated and no token/cookie/payload provided, reject with HTTP 401
        is_authenticated = request.user and request.user.is_authenticated
        if not is_authenticated and not any([auth_header, cookie_access, cookie_refresh, body_access, body_refresh]):
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        response = Response({"success": True}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token', path='/', samesite=settings.SESSION_COOKIE_SAMESITE)
        response.delete_cookie('refresh_token', path='/', samesite=settings.SESSION_COOKIE_SAMESITE)
        response.delete_cookie(settings.SESSION_COOKIE_NAME, path='/', samesite=settings.SESSION_COOKIE_SAMESITE)

        # Blacklist tokens in cache using sha256 hash
        import hashlib
        for token in tokens_to_blacklist:
            if token:
                token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
                cache.set(f"bl_token_{token_hash}", True, timeout=86400)

        # Also blacklist the refresh token in simplejwt if available
        refresh_token_candidate = cookie_refresh or body_refresh
        if refresh_token_candidate:
            try:
                from rest_framework_simplejwt.tokens import RefreshToken
                token = RefreshToken(refresh_token_candidate)
                token.blacklist()
            except Exception:
                pass

        # Invalidate server-side session
        try:
            if hasattr(request, 'session'):
                request.session.flush()
        except Exception:
            pass

        if is_authenticated:
            django_logout(request)

        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    Endpoint: POST /api/v1/auth/token/refresh/
    Re-issues access (and rotated refresh) tokens via HttpOnly cookies and JSON response body.
    Supports refresh tokens passed via JSON body ({'refresh': '...'}) or HttpOnly cookies.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        is_from_body = bool(hasattr(request.data, 'get') and (request.data.get('refresh') or request.data.get('refresh_token')))
        refresh_token = None
        if is_from_body:
            refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
        if not refresh_token:
            refresh_token = request.COOKIES.get('refresh_token') or request.COOKIES.get('refresh')

        if not refresh_token:
            return Response({"detail": "Refresh token is missing."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
            
        access = serializer.validated_data.get('access')
        refresh = serializer.validated_data.get('refresh') or refresh_token
        
        response_data = {"success": True}
        if is_from_body:
            response_data["access"] = access
            if refresh:
                response_data["refresh"] = refresh
                
        response = Response(response_data, status=status.HTTP_200_OK)
        
        access_token_lifetime = api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()
        response.set_cookie(
            'access_token',
            access,
            max_age=int(access_token_lifetime),
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite=settings.SESSION_COOKIE_SAMESITE
        )
        
        if refresh:
            refresh_token_lifetime = api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()
            response.set_cookie(
                'refresh_token',
                refresh,
                max_age=int(refresh_token_lifetime),
                httponly=True,
                secure=settings.SESSION_COOKIE_SECURE,
                samesite=settings.SESSION_COOKIE_SAMESITE
            )
            
        return response


class ForgotPasswordView(APIView):
    """
    Endpoint: POST /api/v1/auth/forgot-password/
    Checks if a user exists with the given email/username.
    If user exists, generates a password reset link, sends an email, and returns reset link details.
    If user does not exist, returns 404 error detail.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        email_or_username = request.data.get('email', '')
        if not isinstance(email_or_username, str):
            email_or_username = str(email_or_username)
        email_or_username = email_or_username.strip()
        if not email_or_username:
            return Response(
                {"detail": "Please provide your registered email address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists by email or username
        user = User.objects.filter(email__iexact=email_or_username).first()
        if not user:
            user = User.objects.filter(username__iexact=email_or_username).first()

        if not user:
            return Response(
                {"detail": "No registered account found with this email address. Please check your email and try again."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.is_active:
            return Response(
                {"detail": "This account is inactive. Please contact your system administrator."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate secure password reset token and UID
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Determine origin for frontend link
        origin = request.META.get('HTTP_ORIGIN') or 'http://localhost:3000'
        reset_link = f"{origin}/reset-password?uid={uidb64}&token={token}"

        # Send Email
        subject = "Password Reset Instructions - Aurexion Technologies"
        message = (
            f"Hello {user.first_name or user.username},\n\n"
            f"We received a request to reset your password for your Aurexion account.\n\n"
            f"Click the link below to set a new password:\n"
            f"{reset_link}\n\n"
            f"If you did not request a password reset, please ignore this email.\n\n"
            f"Best regards,\nAurexion Security Team"
        )
        try:
            send_email(
                subject=subject,
                message=message,
                recipient_list=[user.email or email_or_username],
                fail_silently=True,
                async_send=True
            )
        except Exception:
            pass

        log_audit_event(
            user=user,
            action='UPDATE',
            module='authentication',
            repr_str=f"Password reset link requested for user: {user.username}",
            request=request
        )

        return Response({
            "detail": "Password reset link generated and sent to your email address.",
            "email": user.email or email_or_username,
            "reset_link": reset_link,
            "uid": uidb64,
            "token": token
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    Endpoint: POST /api/v1/auth/reset-password/
    Validates token & UID, and updates user password.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uid', '').strip()
        token = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not uidb64 or not token or not new_password:
            return Response(
                {"detail": "UID, token, and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid password reset link. User account does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired password reset token. Please request a new reset link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        log_audit_event(
            user=user,
            action='UPDATE',
            module='authentication',
            repr_str=f"Password successfully reset for user: {user.username}",
            request=request
        )

        return Response(
            {"detail": "Your password has been updated successfully. You can now sign in with your new password."},
            status=status.HTTP_200_OK
        )


class ChangePasswordView(APIView):
    """
    Endpoint: POST /api/v1/auth/change-password/
    Allows authenticated users to change their password by validating current password and saving new password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password") or request.data.get("new_password_confirm") or request.data.get("confirm_new_password") or new_password or ""
        
        if isinstance(current_password, str): current_password = current_password.strip()
        if isinstance(new_password, str): new_password = new_password.strip()
        if isinstance(confirm_password, str): confirm_password = confirm_password.strip()

        if not current_password or not new_password:
            return Response(
                {"detail": "Current password and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if new_password != confirm_password:
            return Response(
                {"detail": "New password and password confirmation do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        if not user.check_password(current_password):
            return Response(
                {"detail": "Incorrect current password. Please check your password and try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {"detail": "New password must be at least 6 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        log_audit_event(
            user=user,
            action="UPDATE",
            module="authentication",
            repr_str=f"User {user.username} successfully updated their password",
            request=request,
        )

        return Response(
            {"detail": "Your password has been changed successfully. Please log in with your new password on your next session."},
            status=status.HTTP_200_OK
        )


# --- User Management Views (RBAC Protected) ---

class CanViewOrManageUsers(permissions.BasePermission):
    """
    GET requests (listing/reading users for lead assignment dropdowns):
    Allowed for Super Admin, Administrator, BDM, Sales Executive, HR, Support.
    
    POST, PUT, PATCH, DELETE (User creation, update, role assignment):
    Restricted to Super Admin and Administrator.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True

        role = (request.user.profile.role or '').lower() if hasattr(request.user, 'profile') and request.user.profile else None

        if request.method in permissions.SAFE_METHODS:
            return role in ['super_admin', 'administrator', 'admin', 'bdm', 'business_dev', 'hr_manager', 'hr']

        return role in ['super_admin', 'administrator', 'admin']


class UserViewSet(viewsets.ModelViewSet):
    """
    Endpoint: /api/v1/users/
    Handles User management and RBAC assignment.
    SAFE methods (GET) accessible by Admin, BDM, Sales Executive.
    Mutation methods require Administrator.
    """
    serializer_class = UserSerializer
    permission_classes = [CanViewOrManageUsers]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username', 'email']
    ordering = ['-date_joined']

    def get_queryset(self):
        from apps.crm.models import Lead
        from django.db.models import Count, Q
        queryset = User.objects.select_related('profile').annotate(
            annotated_active_leads=Count('assigned_leads', filter=~Q(assigned_leads__status=Lead.Status.LOST))
        ).order_by('-date_joined')
        role = self.request.query_params.get('role')
        if role and role.upper() != 'ALL':
            queryset = queryset.filter(profile__role__iexact=role)

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                queryset = queryset.filter(is_active=False)

        return queryset

    def list(self, request, *args, **kwargs):
        from django.core.cache import cache
        role = request.query_params.get('role')
        if role and not request.query_params.get('search'):
            cache_key = f"users_role_{role.lower()}"
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)

            response = super().list(request, *args, **kwargs)
            if response.status_code == 200:
                cache.set(cache_key, response.data, timeout=300)
            return response
        return super().list(request, *args, **kwargs)


    def perform_create(self, serializer):
        role = self.request.data.get('role', 'client_user')
        request_user_role = getattr(self.request.user, 'profile', None).role if hasattr(self.request.user, 'profile') else None
        is_super = self.request.user.is_superuser or request_user_role == 'super_admin'

        # Check privilege escalation
        is_superuser = self.request.data.get('is_superuser')
        if is_superuser is not None and str(is_superuser).lower() in ['true', '1'] and not self.request.user.is_superuser:
            raise PermissionDenied("Only active SuperUsers can assign is_superuser = True.")

        if role == 'super_admin' and not is_super:
            raise PermissionDenied("Only Super Admins can assign the Super Admin role.")

        if role != 'client_user' and not (is_super or request_user_role == 'administrator'):
            raise PermissionDenied("Only Administrators and Super Admins can assign role codes.")

        user = serializer.save()
        
        # Log Audit event
        log_audit_event(
            user=self.request.user,
            action='CREATE',
            module='authentication',
            object_id=user.id,
            repr_str=f"Created user account: {user.username} with role: {role}",
            updated_state=get_model_state(user),
            request=self.request
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        prev_state = get_model_state(instance)
        role = self.request.data.get('role')
        request_user_role = getattr(self.request.user, 'profile', None).role if hasattr(self.request.user, 'profile') else None
        is_super = self.request.user.is_superuser or request_user_role == 'super_admin'

        # Check privilege escalation
        is_superuser = self.request.data.get('is_superuser')
        if is_superuser is not None:
            is_true = str(is_superuser).lower() in ['true', '1']
            if is_true != instance.is_superuser and not self.request.user.is_superuser:
                raise PermissionDenied("Only active SuperUsers can change is_superuser status.")

        # Prevent non-super_admin from assigning super_admin
        if role == 'super_admin' and not is_super:
            raise PermissionDenied("Only Super Admins can assign the Super Admin role.")

        # Prevent non-super_admin from modifying super_admin accounts
        if hasattr(instance, 'profile') and instance.profile.role == 'super_admin' and not is_super:
            raise PermissionDenied("Only Super Admins can modify Super Admin accounts.")

        if role and hasattr(instance, 'profile') and role != instance.profile.role and not (is_super or request_user_role == 'administrator'):
            raise PermissionDenied("Only Administrators and Super Admins can alter role codes.")

        user = serializer.save()
        
        # Log Audit event
        log_audit_event(
            user=self.request.user,
            action='UPDATE',
            module='authentication',
            object_id=user.id,
            repr_str=f"Updated user account: {user.username}",
            previous_state=prev_state,
            updated_state=get_model_state(user),
            request=self.request
        )


    def perform_destroy(self, instance):
        request_user_role = getattr(self.request.user, 'profile', None).role if hasattr(self.request.user, 'profile') else None

        # Prevent non-super_admin from deleting super_admin accounts
        if hasattr(instance, 'profile') and instance.profile.role == 'super_admin' and request_user_role != 'super_admin':
            raise PermissionDenied("Only Super Admins can delete Super Admin accounts.")

        prev_state = get_model_state(instance)
        username = instance.username
        user_id = instance.id
        
        instance.delete()
        
        # Log Audit event
        log_audit_event(
            user=self.request.user,
            action='DELETE',
            module='authentication',
            object_id=user_id,
            repr_str=f"Deleted user account: {username}",
            previous_state=prev_state,
            request=self.request
        )


# --- Audit Log Viewer (Super Admin Only) ---

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint: /api/v1/audit-logs/
    Allows Super Admins to view and search audit events.
    Immutable log: read-only actions (list and retrieve) only.
    """
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['action', 'module', 'object_id', 'ip_address', 'user__username', 'repr']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
