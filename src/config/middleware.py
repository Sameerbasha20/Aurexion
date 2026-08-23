from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Adds security headers to all responses.
    """
    def process_response(self, request, response):
        # Strict-Transport-Security (HSTS)
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        # Content-Security-Policy
        response['Content-Security-Policy'] = "default-src 'self'; img-src 'self' data: http: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://maps.googleapis.com; connect-src 'self' http: https: https://maps.googleapis.com; frame-src 'self' https://www.google.com https://maps.google.com https://www.google.com/maps/; object-src 'none';"
        
        # Permissions-Policy
        response['Permissions-Policy'] = "geolocation=(), microphone=(), camera=()"
        
        # X-Content-Type-Options
        response['X-Content-Type-Options'] = 'nosniff'
        
        # X-Frame-Options
        response['X-Frame-Options'] = 'DENY'
        
        # Referrer-Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        return response


class RequestBodySizeLimitMiddleware(MiddlewareMixin):
    """
    Rejects raw (non-multipart) request bodies that exceed the configured
    limit with a generic JSON 400 before they reach application code, so
    oversized payloads cannot cause 500s or memory exhaustion.

    Multipart uploads are instead capped by Django's
    DATA_UPLOAD_MAX_MEMORY_SIZE / FILE_UPLOAD_MAX_MEMORY_SIZE settings.
    """

    def process_request(self, request):
        content_type = request.META.get('CONTENT_TYPE', '') or ''
        if content_type.startswith('multipart/'):
            return None

        content_length = request.META.get('CONTENT_LENGTH')
        if content_length is None:
            return None
        try:
            content_length = int(content_length)
        except (TypeError, ValueError):
            return None

        limit = getattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE', 5 * 1024 * 1024)
        if content_length > limit:
            return JsonResponse({'detail': 'Malformed request.'}, status=400)
        return None
