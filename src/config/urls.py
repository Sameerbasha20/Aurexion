from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse
from apps.core.views import health_check

def devtools_empty_view(request):
    return JsonResponse({}, status=200)


urlpatterns = [
    path('.well-known/appspecific/com.chrome.devtools.json', devtools_empty_view),
    path('', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.authentication.urls')),
    path('api/v1/', include('apps.administration.urls')),
    path('api/v1/', include('apps.recruitment.urls')),
    path('api/v1/', include('apps.cms.urls')),
    path('api/v1/', include('apps.portal.urls')),
    path('api/v1/', include('apps.crm.urls')),
    path('api/v1/', include('apps.bdm.urls')),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

