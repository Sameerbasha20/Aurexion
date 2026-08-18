from django.conf import settings
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)


def send_email(
    subject: str,
    message: str,
    recipient_list: list,
    from_email: str = None,
    fail_silently: bool = False,
):
    """
    Send a plain text email.

    Args:
        subject: Email subject line
        message: Plain text message body
        recipient_list: List of recipient email addresses
        from_email: Sender email (defaults to DEFAULT_FROM_EMAIL)
        fail_silently: If True, suppress exceptions
    """
    from_email = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@aurexion.com')

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=fail_silently,
        )
        logger.info(f"Email sent to {recipient_list}: {subject}")
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_list}: {e}")
        if not fail_silently:
            raise


def send_meeting_scheduled_email(lead, followup, meeting_link: str = None):
    """Send meeting scheduled notification to lead."""
    message = f"""
Dear {lead.name},

A meeting has been scheduled for you with our team.

Meeting Details:
- Date & Time: {followup.scheduled_at.strftime('%B %d, %Y at %I:%M %p')}
- Meeting Type: {followup.get_follow_up_type_display()}
- Your Contact: {followup.assigned_to.get_full_name() or followup.assigned_to.username if followup.assigned_to else 'Aurexion Team'}
{f"- Notes: {followup.notes}" if followup.notes else ""}
{f"- Meeting Link: {meeting_link}" if meeting_link else ""}

Please reach out if you need to reschedule or have any questions before the meeting.

Best regards,
Aurexion Technologies Team
"""
    send_email(
        subject=f"Meeting Scheduled with Aurexion - {followup.scheduled_at.strftime('%B %d, %Y')}",
        message=message,
        recipient_list=[lead.email],
    )


def send_welcome_credentials_email(client_user, default_password: str, login_url: str):
    """Send welcome email with login credentials to new client."""
    message = f"""
Dear {client_user.get_full_name() or client_user.username},

Welcome to Aurexion Client Portal! Your project has been approved.

Your Login Credentials:
- Username: {client_user.username}
- Email: {client_user.email}
- Default Password: {default_password}

Login URL: {login_url}

IMPORTANT: For security, please log in and change your password immediately after your first login.

Best regards,
Aurexion Technologies Team
"""
    send_email(
        subject="Welcome to Aurexion Client Portal - Your Login Credentials",
        message=message,
        recipient_list=[client_user.email],
    )


def send_ticket_resolved_email(ticket):
    """Send ticket resolved notification to client."""
    message = f"""
Dear {ticket.client_user.get_full_name() or ticket.client_user.username},

Your support ticket has been resolved.

Ticket Details:
- Ticket ID: {ticket.ticket_id}
- Subject: {ticket.subject}
- Status: Resolved
- Resolved On: {ticket.closed_at.strftime('%B %d, %Y at %I:%M %p')}

Resolution Notes:
{ticket.resolution_notes}

If you have any further questions, please create a new ticket in the client portal.

Best regards,
Aurexion Support Team
"""
    send_email(
        subject=f"Ticket Resolved: {ticket.ticket_id} - {ticket.subject}",
        message=message,
        recipient_list=[ticket.client_user.email],
    )