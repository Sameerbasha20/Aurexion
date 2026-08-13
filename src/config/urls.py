from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.authentication.urls')),
    path('api/v1/', include('apps.administration.urls')),
    path('api/v1/', include('apps.recruitment.urls')),
    path('api/v1/', include('apps.cms.urls')),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

