from django.http import Http404

from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from rest_framework.authentication import SessionAuthentication
from apps.authentication.audit import log_audit_event
from apps.administration.permissions import IsAdministrator, IsClientUser
from apps.portal.models import (
    SupportTicket,
    ClientProject,
    ProjectMilestone,
    SprintDeliverable,
    ClientRequest,
    ConsultationRequest,
    ClientDocument,
    ClientNotification,
)
from apps.portal.authentication import ProfileJWTAuthentication
from apps.portal.permissions import (
    IsClientTicketOwner,
    IsSupportTicketAssignee,
    IsTicketAccessible,
)
from apps.portal.serializers import (
    SupportTicketListSerializer,
    SupportTicketDetailSerializer,
    ClientTicketCreateSerializer,
    ClientTicketUpdateSerializer,
    SupportExecutiveTicketUpdateSerializer,
    AdministratorTicketUpdateSerializer,
    ClientProjectSerializer,
    ProjectMilestoneSerializer,
    SprintDeliverableSerializer,
    ClientRequestSerializer,
    ConsultationRequestSerializer,
    ClientDocumentSerializer,
    ClientNotificationSerializer,
)
from apps.portal.services import SupportTicketService

TICKET_ID_PARAM = OpenApiParameter(
    'id', OpenApiTypes.INT, OpenApiParameter.PATH, description='Ticket primary key'
)


class PermissionScopedObjectMixin:
    """
    Resolves an object from the full ticket set so that object-level
    authorization is enforced by `has_object_permission` (403).

    `get_queryset()` remains scoped to the caller, so list endpoints never
    expose tickets outside the caller's scope. Detail/update requests, however,
    are resolved against the full set and then checked against the object-level
    permission so that an authorized-but-unpermitted object returns 403 instead
    of a misleading 404. Tickets that do not exist at all still return 404.
    """

    def get_object(self):
        queryset = SupportTicket.objects.select_related('client_user', 'assigned_to')
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        try:
            obj = queryset.get(**filter_kwargs)
        except (SupportTicket.DoesNotExist, TypeError, ValueError):
            raise Http404
        self.check_object_permissions(self.request, obj)
        return obj


class AuditAccessDeniedMixin:
    """
    Audits authenticated unauthorized-access attempts before DRF raises 403.

    Reuses the existing AuditLog infrastructure via `log_audit_event`. Records
    an `ACCESS_DENIED` event (module=portal) when an authenticated user is
    denied by view-level RBAC or object-level authorization. Unauthenticated
    requests (401) are not audited because there is no user identity to
    attribute the event to.
    """

    def permission_denied(self, request, message=None, code=None):
        if request.user and request.user.is_authenticated:
            role = None
            if hasattr(request.user, 'profile'):
                role = request.user.profile.role
            log_audit_event(
                user=request.user,
                action='ACCESS_DENIED',
                module='portal',
                object_id=self.kwargs.get(self.lookup_url_kwarg or self.lookup_field),
                repr_str=(
                    f"Unauthorized {request.method} {request.path} "
                    f"denied for role: {role}"
                ),
                request=request,
            )
        return super().permission_denied(request, message=message, code=code)


@extend_schema_view(
    list=extend_schema(tags=['Support (Client Portal)'], summary="List my support tickets"),
    create=extend_schema(tags=['Support (Client Portal)'], summary="Create a support ticket"),
    retrieve=extend_schema(tags=['Support (Client Portal)'], summary="Get one of my support tickets", parameters=[TICKET_ID_PARAM]),
    partial_update=extend_schema(tags=['Support (Client Portal)'], summary="Update one of my support tickets", parameters=[TICKET_ID_PARAM]),
    update=extend_schema(tags=['Support (Client Portal)'], summary="Update one of my support tickets", parameters=[TICKET_ID_PARAM]),
)
class ClientTicketViewSet(
    AuditAccessDeniedMixin,
    PermissionScopedObjectMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Client Portal API: /api/v1/support/my-tickets/

    Authenticated Client Users can create, list, retrieve and update only the
    tickets that belong to them. All authorization is enforced server-side:

    - View-level (RBAC): Client User role only.
    - Object-level: the client is the owner of the ticket.
    - List filtering: queryset is always scoped to the authenticated user, so
      no other client's tickets are ever exposed.
    """
    permission_classes = [IsClientTicketOwner]
    authentication_classes = [
        ProfileJWTAuthentication,
        SessionAuthentication,
    ]

    def get_queryset(self):
        return (
            SupportTicket.objects
            .filter(client_user=self.request.user)
            .select_related('client_user', 'assigned_to')
            .order_by('-created_at')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return ClientTicketCreateSerializer
        if self.action in ('update', 'partial_update'):
            return ClientTicketUpdateSerializer
        if self.action == 'retrieve':
            return SupportTicketDetailSerializer
        return SupportTicketListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        output = SupportTicketDetailSerializer(
            serializer.instance, context=self.get_serializer_context()
        ).data
        headers = self.get_success_headers(output)
        return Response(output, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        ticket = serializer.save(client_user=self.request.user)
        log_audit_event(
            user=self.request.user,
            action='CREATE',
            module='portal',
            object_id=ticket.id,
            repr_str=f"Created ticket {ticket.ticket_id}: {ticket.subject}",
            updated_state={
                'ticket_id': ticket.ticket_id,
                'subject': ticket.subject,
                'category': ticket.category,
                'priority': ticket.priority,
                'status': ticket.status,
            },
            request=self.request,
        )

    def perform_update(self, serializer):
        instance = serializer.instance
        previous_state = {
            'subject': instance.subject,
            'category': instance.category,
            'priority': instance.priority,
            'status': instance.status,
            'resolution_notes': instance.resolution_notes,
        }
        ticket = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='UPDATE',
            module='portal',
            object_id=ticket.id,
            repr_str=f"Updated ticket {ticket.ticket_id}: {ticket.subject}",
            previous_state=previous_state,
            updated_state={
                'subject': ticket.subject,
                'category': ticket.category,
                'priority': ticket.priority,
                'status': ticket.status,
                'resolution_notes': ticket.resolution_notes,
            },
            request=self.request,
        )


@extend_schema_view(
    list=extend_schema(tags=['Support (Executive)'], summary="List tickets assigned to me"),
    retrieve=extend_schema(tags=['Support (Executive)'], summary="Get a ticket assigned to me", parameters=[TICKET_ID_PARAM]),
    partial_update=extend_schema(tags=['Support (Executive)'], summary="Update a ticket assigned to me", parameters=[TICKET_ID_PARAM]),
    update=extend_schema(tags=['Support (Executive)'], summary="Update a ticket assigned to me", parameters=[TICKET_ID_PARAM]),
)
class SupportExecutiveTicketViewSet(
    AuditAccessDeniedMixin,
    PermissionScopedObjectMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Support Executive API: /api/v1/support/tickets/

    Authenticated Support Executives can list, retrieve and update only the
    tickets assigned to them. Authorization is enforced server-side:

    - View-level (RBAC): Support Executive role only.
    - Object-level: the executive is the current assignee of the ticket.
    - List filtering: the queryset is scoped to tickets assigned to the
      authenticated executive, so tickets of other executives are never exposed.
    """
    permission_classes = [IsSupportTicketAssignee]
    authentication_classes = [
        ProfileJWTAuthentication,
        SessionAuthentication,
    ]

    def get_queryset(self):
        return SupportTicketService.get_support_tickets(self.request.user)

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return SupportExecutiveTicketUpdateSerializer
        if self.action == 'retrieve':
            return SupportTicketDetailSerializer
        return SupportTicketListSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        output = SupportTicketDetailSerializer(instance, context=self.get_serializer_context()).data
        return Response(output)

    def perform_update(self, serializer):
        instance = serializer.instance
        previous_state = {
            'status': instance.status,
            'priority': instance.priority,
            'assigned_to_id': instance.assigned_to_id,
            'resolution_notes': instance.resolution_notes,
        }
        ticket = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='UPDATE',
            module='portal',
            object_id=ticket.id,
            repr_str=f"Support updated ticket {ticket.ticket_id}: status {previous_state['status']} -> {ticket.status}",
            previous_state=previous_state,
            updated_state={
                'status': ticket.status,
                'priority': ticket.priority,
                'assigned_to_id': ticket.assigned_to_id,
                'resolution_notes': ticket.resolution_notes,
            },
            request=self.request,
        )

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        user = request.user
        role = getattr(getattr(user, 'profile', None), 'role', None)
        if user.is_superuser or role in ('administrator', 'super_admin'):
            qs = SupportTicket.objects.all()
            assigned_qs = qs.filter(assigned_to__isnull=False)
        else:
            qs = SupportTicketService.get_support_tickets(user)
            assigned_qs = qs.filter(assigned_to=user)

        stats_data = {
            'totalAssigned': assigned_qs.count(),
            'openAssigned': qs.filter(status__in=['open', 'assigned']).count(),
            'inProgress': qs.filter(status='in_progress').count(),
            'awaitingClient': qs.filter(status='awaiting_client').count(),
            'resolvedClosed': qs.filter(status__in=['resolved', 'closed']).count(),
            'criticalPriority': qs.filter(priority='critical').exclude(status__in=['resolved', 'closed']).count(),
        }
        return Response(stats_data)


@extend_schema_view(
    list=extend_schema(tags=['Support (Administrator)'], summary="List all support tickets"),
    retrieve=extend_schema(tags=['Support (Administrator)'], summary="Get any support ticket", parameters=[TICKET_ID_PARAM]),
    partial_update=extend_schema(tags=['Support (Administrator)'], summary="Update any support ticket", parameters=[TICKET_ID_PARAM]),
    update=extend_schema(tags=['Support (Administrator)'], summary="Update any support ticket", parameters=[TICKET_ID_PARAM]),
)
class AdministratorTicketViewSet(
    AuditAccessDeniedMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Administrator API: /api/v1/support/admin/tickets/

    Authenticated Administrators (and Super Admins) can list, retrieve and
    update any support ticket. Access is controlled via the existing RBAC
    IsAdministrator permission (super_admin + administrator).
    """
    queryset = (
        SupportTicket.objects
        .select_related('client_user', 'assigned_to')
        .all()
        .order_by('-created_at')
    )
    permission_classes = [IsAdministrator]
    authentication_classes = [
        ProfileJWTAuthentication,
        SessionAuthentication,
    ]

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return AdministratorTicketUpdateSerializer
        if self.action == 'retrieve':
            return SupportTicketDetailSerializer
        return SupportTicketListSerializer

    def perform_update(self, serializer):
        instance = serializer.instance
        previous_state = {
            'status': instance.status,
            'assigned_to_id': instance.assigned_to_id,
            'client_user_id': instance.client_user_id,
            'resolution_notes': instance.resolution_notes,
        }
        ticket = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='UPDATE',
            module='portal',
            object_id=ticket.id,
            repr_str=f"Administrator updated ticket {ticket.ticket_id}: status {previous_state['status']} -> {ticket.status}",
            previous_state=previous_state,
            updated_state={
                'status': ticket.status,
                'assigned_to_id': ticket.assigned_to_id,
                'client_user_id': ticket.client_user_id,
                'resolution_notes': ticket.resolution_notes,
            },
            request=self.request,
        )


@extend_schema_view(
    list=extend_schema(tags=['Support Tickets API'], summary="List tickets"),
    create=extend_schema(tags=['Support Tickets API'], summary="Create a support ticket"),
    retrieve=extend_schema(tags=['Support Tickets API'], summary="Get a support ticket", parameters=[TICKET_ID_PARAM]),
    partial_update=extend_schema(tags=['Support Tickets API'], summary="Update a support ticket", parameters=[TICKET_ID_PARAM]),
    update=extend_schema(tags=['Support Tickets API'], summary="Update a support ticket", parameters=[TICKET_ID_PARAM]),
)
class TicketViewSet(
    AuditAccessDeniedMixin,
    PermissionScopedObjectMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Support REST API: /api/v1/tickets/

    Unified resource for the Support module. Reuses the existing Authentication
    (JWT), RBAC, Support model, serializers and service layer.

    Operations:
      POST   /api/v1/tickets/        create (Client Users; Super Admins bypass)
      GET    /api/v1/tickets/        list (role-scoped)
      GET    /api/v1/tickets/{id}/   retrieve (object-level authorization)
      PATCH  /api/v1/tickets/{id}/   update (role-authorized fields only)

    Authorization (enforced server-side):
      - client_user:       own tickets; may create; may not change status/assignment
      - support_executive: tickets assigned to them; may manage priority/status/notes
      - administrator:     any ticket; may manage all role-authorized fields
      - super_admin:       bypasses all checks (existing RBAC convention)
    """
    permission_classes = [IsTicketAccessible]
    authentication_classes = [
        ProfileJWTAuthentication,
        SessionAuthentication,
    ]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    @staticmethod
    def _get_role(user):
        if user.is_superuser:
            return 'super_admin'
        if hasattr(user, 'profile'):
            return user.profile.role
        return None

    @staticmethod
    def _is_admin(role):
        return role in ('super_admin', 'administrator')

    def get_queryset(self):
        role = self._get_role(self.request.user)
        if self._is_admin(role):
            return SupportTicketService.get_all_tickets()
        if role == 'support_executive':
            return SupportTicketService.get_support_tickets(self.request.user)
        return SupportTicketService.get_client_tickets(self.request.user)

    def get_serializer_class(self):
        role = self._get_role(self.request.user)
        if self.action == 'create':
            return ClientTicketCreateSerializer
        if self.action in ('update', 'partial_update'):
            if role == 'support_executive':
                return SupportExecutiveTicketUpdateSerializer
            if self._is_admin(role):
                return AdministratorTicketUpdateSerializer
            return ClientTicketUpdateSerializer
        if self.action == 'retrieve':
            return SupportTicketDetailSerializer
        return SupportTicketListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        output = SupportTicketDetailSerializer(
            serializer.instance, context=self.get_serializer_context()
        ).data
        headers = self.get_success_headers(output)
        return Response(output, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        data = serializer.validated_data
        ticket = SupportTicketService.create_ticket(
            client_user=self.request.user,
            subject=data['subject'],
            category=data.get('category', 'technical'),
            priority=data.get('priority', 'medium'),
        )
        serializer.instance = ticket
        log_audit_event(
            user=self.request.user,
            action='CREATE',
            module='portal',
            object_id=ticket.id,
            repr_str=f"Created ticket {ticket.ticket_id}: {ticket.subject}",
            updated_state={
                'ticket_id': ticket.ticket_id,
                'subject': ticket.subject,
                'category': ticket.category,
                'priority': ticket.priority,
                'status': ticket.status,
            },
            request=self.request,
        )

    def perform_update(self, serializer):
        ticket = serializer.instance
        role = self._get_role(self.request.user)
        previous_state = {
            'subject': ticket.subject,
            'category': ticket.category,
            'status': ticket.status,
            'priority': ticket.priority,
            'assigned_to_id': ticket.assigned_to_id,
            'resolution_notes': ticket.resolution_notes,
        }
        try:
            if role == 'support_executive':
                SupportTicketService.update_ticket_as_support(ticket, self.request.user, serializer.validated_data)
            elif self._is_admin(role):
                SupportTicketService.update_ticket_as_admin(ticket, self.request.user, serializer.validated_data)
            else:
                SupportTicketService.update_ticket_as_client(ticket, self.request.user, serializer.validated_data)
        except PermissionError:
            raise PermissionDenied("You are not authorized to update this ticket.")
        log_audit_event(
            user=self.request.user,
            action='UPDATE',
            module='portal',
            object_id=ticket.id,
            repr_str=f"Updated ticket {ticket.ticket_id}: status {previous_state['status']} -> {ticket.status}",
            previous_state=previous_state,
            updated_state={
                'subject': ticket.subject,
                'category': ticket.category,
                'status': ticket.status,
                'priority': ticket.priority,
                'assigned_to_id': ticket.assigned_to_id,
                'resolution_notes': ticket.resolution_notes,
            },
            request=self.request,
        )

from datetime import timedelta
from django.utils import timezone

def ensure_client_project_exists(user):
    """
    Ensures an onboarded client user has at least one active project and timeline milestones.
    """
    if not user or not user.is_authenticated:
        return None

    if getattr(user, '_has_checked_project', False):
        return None
    user._has_checked_project = True

    if ClientProject.objects.filter(client_user=user).exists():
        return None

    company_name = user.first_name or (user.username.split('@')[0].capitalize() if '@' in user.username else user.username)
    today = timezone.now().date()
    target_date = today + timedelta(days=90)

    project = ClientProject.objects.create(
        client_user=user,
        title=f"{company_name} - Digital Transformation & Systems Integration",
        description=f"Active enterprise project engagement for {company_name}. Scope includes custom development, architecture setup, and cloud integration.",
        status='in_progress',
        progress_percentage=35,
        delivery_lead_name="Aurexion Senior Delivery Lead",
        start_date=today - timedelta(days=14),
        target_completion_date=target_date,
    )

    # Create Milestones
    ProjectMilestone.objects.create(
        project=project,
        name="Phase 1: Discovery & Requirements Sign-off",
        status="completed",
        is_current=False,
        planned_date=today - timedelta(days=7),
    )
    ProjectMilestone.objects.create(
        project=project,
        name="Phase 2: Architecture & Core Module Implementation",
        status="in_progress",
        is_current=True,
        planned_date=today + timedelta(days=30),
    )
    ProjectMilestone.objects.create(
        project=project,
        name="Phase 3: System Integration & UAT Testing",
        status="upcoming",
        is_current=False,
        planned_date=today + timedelta(days=60),
    )
    ProjectMilestone.objects.create(
        project=project,
        name="Phase 4: Final Production Deployment & Handoff",
        status="upcoming",
        is_current=False,
        planned_date=target_date,
    )

    return project


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Projects)'], summary="List my projects"),
    create=extend_schema(tags=['Client Portal (Projects)'], summary="Create a project"),
    retrieve=extend_schema(tags=['Client Portal (Projects)'], summary="Get project details"),
    update=extend_schema(tags=['Client Portal (Projects)'], summary="Update project"),
    partial_update=extend_schema(tags=['Client Portal (Projects)'], summary="Partially update project"),
    destroy=extend_schema(tags=['Client Portal (Projects)'], summary="Delete project"),
)
class ClientProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ClientProjectSerializer
    queryset = ClientProject.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            ensure_client_project_exists(user)
            return ClientProject.objects.filter(client_user=user)
        return ClientProject.objects.none()

    def perform_create(self, serializer):
        serializer.save(client_user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Requests)'], summary="List my requests"),
    create=extend_schema(tags=['Client Portal (Requests)'], summary="Create a request"),
    retrieve=extend_schema(tags=['Client Portal (Requests)'], summary="Get request details"),
    update=extend_schema(tags=['Client Portal (Requests)'], summary="Update request"),
    partial_update=extend_schema(tags=['Client Portal (Requests)'], summary="Partially update request"),
    destroy=extend_schema(tags=['Client Portal (Requests)'], summary="Delete request"),
)
class ClientRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ClientRequestSerializer
    queryset = ClientRequest.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        return ClientRequest.objects.filter(client_user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(client_user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Documents)'], summary="List my documents"),
    create=extend_schema(tags=['Client Portal (Documents)'], summary="Upload a document"),
    retrieve=extend_schema(tags=['Client Portal (Documents)'], summary="Get document details"),
    update=extend_schema(tags=['Client Portal (Documents)'], summary="Update document"),
    partial_update=extend_schema(tags=['Client Portal (Documents)'], summary="Partially update document"),
    destroy=extend_schema(tags=['Client Portal (Documents)'], summary="Delete document"),
)
class ClientDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ClientDocumentSerializer
    queryset = ClientDocument.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        return ClientDocument.objects.filter(client_user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(client_user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Milestones)'], summary="List project milestones"),
    retrieve=extend_schema(tags=['Client Portal (Milestones)'], summary="Get milestone details"),
)
class ProjectMilestoneViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ProjectMilestoneSerializer
    queryset = ProjectMilestone.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            ensure_client_project_exists(user)
            return ProjectMilestone.objects.filter(project__client_user=user).select_related('project')
        return ProjectMilestone.objects.none()


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Deliverables)'], summary="List sprint deliverables"),
    retrieve=extend_schema(tags=['Client Portal (Deliverables)'], summary="Get deliverable details"),
)
class SprintDeliverableViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = SprintDeliverableSerializer
    queryset = SprintDeliverable.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        return SprintDeliverable.objects.filter(project__client_user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Consultations)'], summary="List my consultation requests"),
    create=extend_schema(tags=['Client Portal (Consultations)'], summary="Request a consultation"),
    retrieve=extend_schema(tags=['Client Portal (Consultations)'], summary="Get consultation details"),
    destroy=extend_schema(tags=['Client Portal (Consultations)'], summary="Cancel consultation request"),
)
class ConsultationRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ConsultationRequestSerializer
    queryset = ConsultationRequest.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        return ConsultationRequest.objects.filter(client_user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(client_user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Notifications)'], summary="List my notifications"),
    retrieve=extend_schema(tags=['Client Portal (Notifications)'], summary="Get notification details"),
)
class ClientNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ClientNotificationSerializer
    queryset = ClientNotification.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        return ClientNotification.objects.filter(client_user=self.request.user)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        ClientNotification.objects.filter(client_user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})


class DocumentDownloadView(viewsets.ViewSet):
    permission_classes = [IsClientUser]
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]

    def retrieve(self, request, pk=None):
        try:
            document = ClientDocument.objects.get(pk=pk)
        except ClientDocument.DoesNotExist:
            raise Http404("Document not found.")

        if document.client_user_id != request.user.id and not request.user.is_superuser:
            log_audit_event(
                user=request.user,
                action='ACCESS_DENIED',
                module='portal',
                object_id=pk,
                repr_str=f"Unauthorized download attempt for document ID {pk} belonging to user ID {document.client_user_id}",
                request=request
            )
            raise PermissionDenied("You are not authorized to download this document.")

        log_audit_event(
            user=request.user,
            action='DOWNLOAD',
            module='portal',
            object_id=document.id,
            repr_str=f"Downloaded document {document.title}",
            request=request
        )

        return Response({
            'id': document.id,
            'title': document.title,
            'document_type': document.document_type,
            'file_url': document.file_url,
            'file_size': document.file_size,
            'download_allowed': True
        })

