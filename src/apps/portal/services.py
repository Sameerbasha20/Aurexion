import logging
from django.db import models
from django.contrib.auth import get_user_model
from apps.portal.models import SupportTicket
from apps.authentication.audit import log_audit_event
from apps.core.services import send_ticket_resolved_email

logger = logging.getLogger(__name__)

User = get_user_model()


class SupportTicketService:
    @staticmethod
    def create_ticket(client_user, subject, category, priority):
        ticket = SupportTicket.objects.create(
            client_user=client_user,
            subject=subject,
            category=category,
            priority=priority,
            status='open'
        )
        return ticket

    @staticmethod
    def get_client_tickets(client_user, status=None):
        queryset = SupportTicket.objects.filter(client_user=client_user).select_related('client_user', 'assigned_to')
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('-created_at', '-id')

    @staticmethod
    def get_support_tickets(support_user, status=None):
        queryset = SupportTicket.objects.filter(
            models.Q(assigned_to=support_user) | models.Q(assigned_to__isnull=True)
        ).select_related('client_user', 'assigned_to')
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('-created_at', '-id')

    @staticmethod
    def get_all_tickets(status=None, category=None, priority=None):
        queryset = SupportTicket.objects.all().select_related('client_user', 'assigned_to')
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        return queryset.order_by('-created_at', '-id')

    @staticmethod
    def get_ticket_by_id(ticket_id):
        try:
            return SupportTicket.objects.select_related('client_user', 'assigned_to').get(ticket_id=ticket_id)
        except SupportTicket.DoesNotExist:
            return None

    @staticmethod
    def get_ticket_by_pk(pk):
        try:
            return SupportTicket.objects.select_related('client_user', 'assigned_to').get(pk=pk)
        except SupportTicket.DoesNotExist:
            return None

    @staticmethod
    def update_ticket_as_client(ticket, client_user, validated_data):
        if ticket.client_user != client_user:
            raise PermissionError("You can only update your own tickets.")
        if ticket.status == 'closed':
            raise PermissionError("Cannot update a closed ticket.")

        for field, value in validated_data.items():
            setattr(ticket, field, value)
        ticket.save()
        return ticket

    @staticmethod
    def update_ticket_as_support(ticket, support_user, validated_data, request=None):
        if ticket.assigned_to and ticket.assigned_to != support_user:
            raise PermissionError("You can only update tickets assigned to you.")

        old_status = ticket.status
        old_assigned = ticket.assigned_to

        for field, value in validated_data.items():
            setattr(ticket, field, value)
        ticket.save()

        if request:
            log_audit_event(
                user=support_user,
                action='UPDATE',
                module='portal',
                object_id=ticket.id,
                repr_str=f"Updated ticket {ticket.ticket_id}: status {old_status} -> {ticket.status}",
                previous_state={'status': old_status, 'assigned_to_id': old_assigned.id if old_assigned else None},
                updated_state={'status': ticket.status, 'assigned_to_id': ticket.assigned_to.id if ticket.assigned_to else None},
                request=request
            )

        return ticket

    @staticmethod
    def update_ticket_as_admin(ticket, admin_user, validated_data, request=None):
        old_status = ticket.status
        old_assigned = ticket.assigned_to
        old_client = ticket.client_user

        for field, value in validated_data.items():
            setattr(ticket, field, value)
        ticket.save()

        if request:
            log_audit_event(
                user=admin_user,
                action='UPDATE',
                module='portal',
                object_id=ticket.id,
                repr_str=f"Admin updated ticket {ticket.ticket_id}: status {old_status} -> {ticket.status}",
                previous_state={
                    'status': old_status,
                    'assigned_to_id': old_assigned.id if old_assigned else None,
                    'client_user_id': old_client.id
                },
                updated_state={
                    'status': ticket.status,
                    'assigned_to_id': ticket.assigned_to.id if ticket.assigned_to else None,
                    'client_user_id': ticket.client_user.id
                },
                request=request
            )

        return ticket

    @staticmethod
    def close_ticket(ticket, user, resolution_notes=None, request=None):
        notes_to_use = resolution_notes.strip() if (resolution_notes and resolution_notes.strip()) else ticket.resolution_notes
        if not notes_to_use or not notes_to_use.strip():
            raise ValueError("Resolution notes are required to close a ticket.")

        old_status = ticket.status
        ticket.status = 'closed'
        ticket.resolution_notes = notes_to_use
        ticket.save()

        if request:
            log_audit_event(
                user=user,
                action='TICKET_CLOSE',
                module='portal',
                object_id=ticket.id,
                repr_str=f"Closed ticket {ticket.ticket_id}",
                previous_state={'status': old_status, 'resolution_notes': ticket.resolution_notes},
                updated_state={'status': 'closed', 'resolution_notes': notes_to_use},
                request=request
            )

        # Send ticket resolved email to client
        try:
            send_ticket_resolved_email(ticket)
        except Exception:
            logger.exception(f"Failed to send ticket resolved email for ticket {ticket.ticket_id}")

        return ticket

    @staticmethod
    def assign_ticket(ticket, support_user, admin_user, request=None):
        if not hasattr(support_user, 'profile') or support_user.profile.role != 'support_executive':
            raise ValueError("Assigned user must have support_executive role.")

        old_assigned = ticket.assigned_to
        ticket.assigned_to = support_user
        if ticket.status == 'open':
            ticket.status = 'assigned'
        ticket.save()

        if request:
            log_audit_event(
                user=admin_user,
                action='UPDATE',
                module='portal',
                object_id=ticket.id,
                repr_str=f"Assigned ticket {ticket.ticket_id} to {support_user.username}",
                previous_state={'assigned_to_id': old_assigned.id if old_assigned else None, 'status': old_status if 'old_status' in dir() else ticket.status},
                updated_state={'assigned_to_id': support_user.id, 'status': ticket.status},
                request=request
            )

        return ticket