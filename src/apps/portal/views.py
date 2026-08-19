from django.http import Http404

from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from rest_framework.authentication import SessionAuthentication
from apps.authentication.audit import log_audit_event
from apps.administration.permissions import IsAdministrator
from apps.portal.models import SupportTicket, ClientProject, ClientRequest, ClientDocument
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
    ClientRequestSerializer,
    ClientDocumentSerializer,
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
        return (
            SupportTicket.objects
            .filter(assigned_to=self.request.user)
            .select_related('client_user', 'assigned_to')
            .order_by('-created_at')
        )

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return SupportExecutiveTicketUpdateSerializer
        if self.action == 'retrieve':
            return SupportTicketDetailSerializer
        return SupportTicketListSerializer

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
            category=data['category'],
            priority=data['priority'],
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


@extend_schema_view(
    list=extend_schema(tags=['Client Portal (Projects)'], summary="List my projects"),
    create=extend_schema(tags=['Client Portal (Projects)'], summary="Create a project"),
    retrieve=extend_schema(tags=['Client Portal (Projects)'], summary="Get project details"),
    update=extend_schema(tags=['Client Portal (Projects)'], summary="Update project"),
    partial_update=extend_schema(tags=['Client Portal (Projects)'], summary="Partially update project"),
    destroy=extend_schema(tags=['Client Portal (Projects)'], summary="Delete project"),
)
class ClientProjectViewSet(viewsets.ModelViewSet):
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ClientProjectSerializer
    queryset = ClientProject.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        return ClientProject.objects.filter(client_user=self.request.user)

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
    create=extend_schema(tags=['Client Portal (Documents)'], summary="Create a document"),
    retrieve=extend_schema(tags=['Client Portal (Documents)'], summary="Get document details"),
    update=extend_schema(tags=['Client Portal (Documents)'], summary="Update document"),
    partial_update=extend_schema(tags=['Client Portal (Documents)'], summary="Partially update document"),
    destroy=extend_schema(tags=['Client Portal (Documents)'], summary="Delete document"),
)
class ClientDocumentViewSet(viewsets.ModelViewSet):
    authentication_classes = [ProfileJWTAuthentication, SessionAuthentication]
    serializer_class = ClientDocumentSerializer
    queryset = ClientDocument.objects.none()
    lookup_field = 'pk'

    def get_queryset(self):
        return ClientDocument.objects.filter(client_user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(client_user=self.request.user)
