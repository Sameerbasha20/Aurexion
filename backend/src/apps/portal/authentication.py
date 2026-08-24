from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.settings import api_settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from apps.authentication.authentication import CookieJWTAuthentication


class ProfileJWTAuthentication(CookieJWTAuthentication):
    """
    JWT authentication for the Support module.

    Behaves identically to the project's default JWTAuthentication but loads
    the user's UserProfile in the same query (select_related). This removes one
    round trip per request (the RBAC checks read `request.user.profile`), which
    is the dominant cost when the database is a remote managed PostgreSQL.

    No authentication semantics are changed.
    """

    def get_user(self, validated_token):
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


class ProfileJWTExtension(OpenApiAuthenticationExtension):
    """
    Document ProfileJWTAuthentication with an HTTP bearer JWT scheme equivalent
    to the project-wide ``jwtAuth`` scheme. A distinct name is used because the
    built-in simplejwt extension does not match subclasses, so two separate
    scheme components cannot share the ``jwtAuth`` name.
    """

    target_class = ProfileJWTAuthentication
    name = 'jwtAuthProfile'

    def get_security_definition(self, auto_schema):
        return {'type': 'http', 'scheme': 'bearer', 'bearerFormat': 'JWT'}

