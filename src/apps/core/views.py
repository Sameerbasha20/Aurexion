from django.db import connections
from django.http import JsonResponse
from django.views import View
import redis


class HealthCheckView(View):
    def get(self, request):
        health_status = {
            "status": "healthy",
            "version": "1.0.0",
            "services": {}
        }
        
        # Check database
        try:
            db_conn = connections['default']
            db_conn.ensure_connection()
            health_status["services"]["database"] = "connected"
        except Exception as e:
            health_status["services"]["database"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
        
        # Check Redis (optional)
        try:
            from django.conf import settings
            if hasattr(settings, 'CACHES') and 'redis' in str(settings.CACHES.get('default', {}).get('BACKEND', '')).lower():
                redis_url = settings.CACHES['default'].get('LOCATION', 'redis://localhost:6379/1')
                r = redis.from_url(redis_url)
                r.ping()
                health_status["services"]["redis"] = "connected"
            else:
                health_status["services"]["redis"] = "not_configured"
        except Exception as e:
            health_status["services"]["redis"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
        
        status_code = 200 if health_status["status"] == "healthy" else 503
        return JsonResponse(health_status, status=status_code)


def health_check(request):
    """Simple function-based health check endpoint."""
    from django.db import connections
    from django.conf import settings
    from datetime import datetime
    
    try:
        db_conn = connections['default']
        db_conn.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "error"
    
    # Get project info
    project_name = getattr(settings, 'PROJECT_NAME', 'Aurexion Enterprise Platform')
    # Last updated - could be from git, env, or a file
    last_updated = getattr(settings, 'LAST_UPDATED', datetime.now().strftime('%Y-%m-%d'))
    
    return JsonResponse({
        "status": "healthy" if db_status == "ok" else "unhealthy",
        "project_name": project_name,
        "last_updated": last_updated,
        "database": db_status,
        "api": "v1",
    }, status=200 if db_status == "ok" else 503)