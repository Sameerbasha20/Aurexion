from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.portal.views import (
    ClientTicketViewSet,
    SupportExecutiveTicketViewSet,
    AdministratorTicketViewSet,
    TicketViewSet,
    ClientProjectViewSet,
    ClientRequestViewSet,
    ClientDocumentViewSet,
)

router = DefaultRouter()
router.register(r'support/my-tickets', ClientTicketViewSet, basename='client-ticket')
router.register(r'support/tickets', SupportExecutiveTicketViewSet, basename='support-ticket')
router.register(r'support/admin/tickets', AdministratorTicketViewSet, basename='admin-ticket')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'projects', ClientProjectViewSet, basename='client-project')
router.register(r'requests', ClientRequestViewSet, basename='client-request')
router.register(r'documents', ClientDocumentViewSet, basename='client-document')

urlpatterns = [
    path('', include(router.urls)),
]
