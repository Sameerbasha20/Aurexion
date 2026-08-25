import logging
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

logger = logging.getLogger(__name__)


import hashlib
from django.core.cache import cache

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that reads the access token from cookies.
    If the access token cookie is not present, it falls back to the standard
    Authorization header (useful for API testing and system compatibility).
    For security, CSRF validation is enforced on all state-changing requests
    authenticated via cookies.
    """

    def authenticate(self, request):
        # 1. Attempt Authorization header extraction first (preferred for stateless SPA apps)
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                token_str = raw_token.decode('utf-8') if isinstance(raw_token, bytes) else str(raw_token)
                token_hash = hashlib.sha256(token_str.encode('utf-8')).hexdigest()
                if cache.get(f"bl_token_{token_hash}"):
                    raise exceptions.AuthenticationFailed('Token has been invalidated (logged out).')

                try:
                    validated_token = self.get_validated_token(raw_token)
                    return self.get_user(validated_token), validated_token
                except Exception:
                    pass  # Fall back to cookie authentication if header validation fails

        # 2. Attempt cookie extraction if no valid header token was supplied
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return None

        token_str = raw_token.decode('utf-8') if isinstance(raw_token, bytes) else str(raw_token)
        token_hash = hashlib.sha256(token_str.encode('utf-8')).hexdigest()
        if cache.get(f"bl_token_{token_hash}"):
            raise exceptions.AuthenticationFailed('Token has been invalidated (logged out).')

        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception:
            return None

        user = self.get_user(validated_token)

        # Enforce CSRF check for browser/cookie sessions
        self.enforce_csrf(request)

        return user, validated_token

    def enforce_csrf(self, request):
        """
        Runs Django's CSRF middleware verification.
        """
        def dummy_get_response(request):
            return None

        check = CSRFCheck(dummy_get_response)
        # Populates request.META['CSRF_COOKIE']
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")

    def get_user(self, validated_token):
        from rest_framework_simplejwt.settings import api_settings
        from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken

        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise InvalidToken("Token contained no recognizable user identification")

        try:
            user = self.user_model.objects.select_related('profile').get(
                **{api_settings.USER_ID_FIELD: user_id}
            )
        except self.user_model.DoesNotExist:
            raise AuthenticationFailed("User not found", code="user_not_found")

        if not user.is_active:
            raise AuthenticationFailed("User is inactive", code="user_inactive")

        return user


try:
    from drf_spectacular.extensions import OpenApiAuthenticationExtension

    class CookieJWTAuthenticationScheme(OpenApiAuthenticationExtension):
        target_class = 'apps.authentication.authentication.CookieJWTAuthentication'
        name = 'jwtAuth'

        def get_security_definition(self, auto_schema):
            return {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
            }
except ImportError:
    pass