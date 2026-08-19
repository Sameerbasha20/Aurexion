import logging
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that reads the access token from cookies.
    If the access token cookie is not present, it falls back to the standard
    Authorization header (useful for API testing and system compatibility).
    For security, CSRF validation is enforced on all state-changing requests
    authenticated via cookies.
    """

    def authenticate(self, request):
        # 1. Attempt cookie extraction
        raw_token = request.COOKIES.get('access_token')

        # 2. If cookie is missing, fall back to Authorization header
        if not raw_token:
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None

            # Header authentication is stateless and not subject to CSRF
            try:
                validated_token = self.get_validated_token(raw_token)
            except Exception:
                return None

            return self.get_user(validated_token), validated_token

        # 3. If token came from cookie, validate it and enforce CSRF protection
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception:
            return None

        user = self.get_user(validated_token)

        # Enforce CSRF check for browser/cookie sessions (safe methods GET/HEAD/OPTIONS are naturally bypassed by Django's CSRF)
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
