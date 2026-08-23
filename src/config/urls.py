from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from apps.core.views import health_check, readiness_check, HealthCheckView

@require_GET
def devtools_empty_view(request):
    return JsonResponse({}, status=200)


from rest_framework.permissions import AllowAny

urlpatterns = [
    path('.well-known/appspecific/com.chrome.devtools.json', devtools_empty_view),
    path('', health_check, name='health-check'),
    path('api/v1/health/', health_check, name='api-health-check'),
    path('api/v1/health/readiness/', readiness_check, name='api-readiness-check'),
    path('health/readiness/', readiness_check, name='readiness-check'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.authentication.urls')),
    path('api/v1/', include('apps.administration.urls')),
    path('api/v1/', include('apps.recruitment.urls')),
    path('api/v1/', include('apps.cms.urls')),
    path('api/v1/', include('apps.portal.urls')),
    path('api/v1/', include('apps.crm.urls')),
    path('api/v1/', include('apps.bdm.urls')),
    path('api/v1/schema/', SpectacularAPIView.as_view(permission_classes=[AllowAny]), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[AllowAny]), name='swagger-ui'),
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[AllowAny]), name='redoc'),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Production media fallback: serve local uploads when MEDIA is on local disk
    # (Supabase/S3 should be used for large scale; this ensures localhost URLs are never returned)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler400 = 'config.views.error_400'
handler403 = 'config.views.error_403'
handler404 = 'config.views.error_404'
handler500 = 'config.views.error_500'

