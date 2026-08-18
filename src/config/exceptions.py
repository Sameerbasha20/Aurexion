import logging

from django.core.exceptions import SuspiciousOperation
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def exception_handler(exc, context):
    """
    Security-focused DRF exception handler.

    - Suspicious requests (oversized uploads, malformed multipart, path
      traversal attempts, disallowed hosts) are rejected with a generic
      400 response instead of bubbling up as 500s.
    - Unhandled exceptions never leak internals to the client. A generic 500
      JSON body is always returned — regardless of DEBUG — so even an
      accidentally-enabled DEBUG deployment cannot expose stack traces,
      filesystem paths, settings or credentials through API error responses.
    """
    if isinstance(exc, SuspiciousOperation):
        return Response(
            {"detail": "Malformed request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    logger.error("Unhandled exception in API view", exc_info=exc)
    return Response(
        {"detail": "Internal server error."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )