from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.portal.views import (
    ClientTicketViewSet,
    SupportExecutiveTicketViewSet,
    AdministratorTicketViewSet,
    TicketViewSet,
    ClientProjectViewSet,
    ProjectMilestoneViewSet,
    SprintDeliverableViewSet,
    ClientRequestViewSet,
    ConsultationRequestViewSet,
    ClientDocumentViewSet,
    ClientNotificationViewSet,
    DocumentDownloadView,
)

class OptionalSlashRouter(DefaultRouter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trailing_slash = '/?'

router = OptionalSlashRouter()
router.register(r'support/my-tickets', ClientTicketViewSet, basename='client-ticket')
router.register(r'support/tickets', SupportExecutiveTicketViewSet, basename='support-ticket')
router.register(r'support/admin/tickets', AdministratorTicketViewSet, basename='admin-ticket')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'projects', ClientProjectViewSet, basename='client-project')
router.register(r'milestones', ProjectMilestoneViewSet, basename='client-milestone')
router.register(r'deliverables', SprintDeliverableViewSet, basename='client-deliverable')
router.register(r'requests', ClientRequestViewSet, basename='client-request')
router.register(r'consultations', ConsultationRequestViewSet, basename='client-consultation')
router.register(r'documents', ClientDocumentViewSet, basename='client-document')
router.register(r'notifications', ClientNotificationViewSet, basename='client-notification')

urlpatterns = [
    path('documents/<int:pk>/download/', DocumentDownloadView.as_view({'get': 'retrieve'}), name='document-download'),
    path('', include(router.urls)),
]

