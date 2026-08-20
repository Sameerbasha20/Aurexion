from django.conf import settings
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

# Public form sources that should receive auto-confirmation emails
PUBLIC_FORM_SOURCES = {"rfp_form", "contact_form", "request_quote", "estimator", "website_form"}


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
    except Exception:
        logger.exception(f"Failed to send email to {recipient_list}")
        if not fail_silently:
            raise


# ---------------------------------------------------------------------------
# Form Submission Confirmation
# ---------------------------------------------------------------------------

def send_form_submission_confirmation_email(lead):
    """
    Send an auto-reply confirmation to the user when they submit a public form
    (contact form, RFP form, quote request, etc.).
    """
    if not lead.email:
        return

    source_labels = {
        "rfp_form": "Request for Proposal (RFP)",
        "contact_form": "Contact Form",
        "request_quote": "Quote Request",
        "estimator": "Project Estimator",
        "website_form": "Website Inquiry",
    }
    source_label = source_labels.get(getattr(lead, "source", ""), "Inquiry")

    message = f"""Dear {lead.name or 'Valued Client'},

Thank you for reaching out to Aurexion Technologies!

We have successfully received your {source_label} submission and our Business Development team will review it shortly.

Your Submission Details:
- Reference ID : {lead.reference_id}
- Name         : {lead.name or '—'}
- Company      : {lead.company or '—'}
- Submitted On : {lead.created_at.strftime('%B %d, %Y at %I:%M %p') if lead.created_at else '—'}

What happens next?
Our team typically reviews submissions within 1–2 business days. You will receive a follow-up from us regarding next steps.

If you have any urgent questions, feel free to reply to this email.

Best regards,
Business Development Team
Aurexion Technologies
https://aurexion.com
"""
    send_email(
        subject=f"We've received your {source_label} — Aurexion Technologies ({lead.reference_id})",
        message=message,
        recipient_list=[lead.email],
        fail_silently=True,
    )


# ---------------------------------------------------------------------------
# Lead Status Update Notification
# ---------------------------------------------------------------------------

def send_lead_status_update_email(lead, previous_status: str, new_status: str):
    """
    Notify the lead/client when their inquiry status is updated by the team.
    Only sends for meaningful forward-progress transitions to avoid spam.
    """
    if not lead.email:
        return

    # Map statuses to user-friendly labels and messages
    status_messages = {
        "under_review": (
            "Your Inquiry is Under Review",
            "Great news — your submission is now being actively reviewed by our Business Development team. "
            "We will reach out to you soon with our assessment."
        ),
        "contacted": (
            "Our Team Has Reached Out",
            "One of our Business Development representatives has been assigned to your inquiry. "
            "Please expect a call or email from our team shortly."
        ),
        "qualified": (
            "Your Inquiry Has Been Qualified",
            "Excellent! Your project inquiry has been evaluated and qualified by our team. "
            "We are moving forward with preparing a tailored proposal for you."
        ),
        "proposal_submitted": (
            "Your Project Proposal Is Ready",
            "We have submitted a formal project proposal for your review. "
            "Our team will follow up to walk you through the details and answer any questions."
        ),
        "negotiation": (
            "We Are in the Final Stages",
            "Your project is now in the negotiation phase. Our team will be in touch to finalize the details and scope."
        ),
    }

    if new_status not in status_messages:
        # Don't send emails for won/lost (handled separately) or unimportant transitions
        return

    status_title, status_detail = status_messages[new_status]

    message = f"""Dear {lead.name or 'Valued Client'},

We have an update regarding your project inquiry ({lead.reference_id}).

Status Update: {status_title}

{status_detail}

Your Inquiry Details:
- Reference ID : {lead.reference_id}
- Company      : {lead.company or '—'}
- Current Stage: {new_status.replace('_', ' ').title()}

If you have any questions or would like to discuss your project further, please don't hesitate to reply to this email or contact us directly.

Best regards,
Business Development Team
Aurexion Technologies
https://aurexion.com
"""
    send_email(
        subject=f"Update on Your Inquiry ({lead.reference_id}) — {status_title}",
        message=message,
        recipient_list=[lead.email],
        fail_silently=True,
    )


# ---------------------------------------------------------------------------
# Lead WON — Congratulations Email
# ---------------------------------------------------------------------------

def send_lead_won_email(lead):
    """
    Send a congratulatory email to the client when their deal is marked WON.
    Informs them that the project is approved and onboarding is next.
    """
    if not lead.email:
        return

    message = f"""Dear {lead.name or 'Valued Client'},

We are thrilled to share some exciting news — your project has been approved!

Aurexion Technologies is delighted to move forward with your project ({lead.reference_id}). Our team is now preparing for the onboarding phase, and you will receive your client portal login credentials shortly.

Project Summary:
- Reference ID : {lead.reference_id}
- Company      : {lead.company or '—'}
- Project Value: {'${:,.0f}'.format(float(lead.value)) if lead.value else 'To be confirmed'}

What's Next?
1. You will receive a separate email with your Aurexion Client Portal login credentials.
2. Our project team will schedule a kick-off call with you.
3. We will begin the formal onboarding and project initiation process.

We look forward to a successful collaboration!

Best regards,
Business Development Team
Aurexion Technologies
https://aurexion.com
"""
    send_email(
        subject=f"Congratulations! Your Project Has Been Approved — Aurexion Technologies ({lead.reference_id})",
        message=message,
        recipient_list=[lead.email],
        fail_silently=True,
    )


# ---------------------------------------------------------------------------
# Lead LOST — Decline Notification Email
# ---------------------------------------------------------------------------

def send_lead_declined_email(lead, reason: str):
    """Send polite inquiry declined notification email to lead/client."""
    if not lead.email:
        return

    message = f"""Dear {lead.name or 'Valued Client'},

Thank you for your interest in Aurexion Technologies and for submitting your project inquiry ({lead.reference_id}).

After careful evaluation by our Business Development team, we regret to inform you that we are unable to proceed with this submission at this time.

Reason / Review Feedback:
{reason}

We appreciate the time you spent reaching out to us. If you have any further questions or would like to submit another proposal in the future, please do not hesitate to contact our team.

Best regards,
Business Development Team
Aurexion Technologies
https://aurexion.com
"""
    send_email(
        subject=f"Update Regarding Your Inquiry — Aurexion Technologies ({lead.reference_id})",
        message=message,
        recipient_list=[lead.email],
        fail_silently=True,
    )


# ---------------------------------------------------------------------------
# Client Onboarding — Welcome Credentials Email
# ---------------------------------------------------------------------------

def send_welcome_credentials_email(client_user, default_password: str, login_url: str):
    """Send welcome email with login credentials to newly onboarded client."""
    message = f"""Dear {client_user.get_full_name() or client_user.username},

Welcome to Aurexion Client Portal! Your project has been approved and your account is now active.

Your Login Credentials:
- Username        : {client_user.username}
- Email           : {client_user.email}
- Default Password: {default_password}

Login URL: {login_url}

IMPORTANT: For your security, please log in and change your password immediately after your first login.

Inside the portal you can:
- Track your project progress
- Review documents and proposals
- Raise support tickets
- Communicate with your project team

Best regards,
Aurexion Technologies Team
https://aurexion.com
"""
    send_email(
        subject="Welcome to Aurexion Client Portal — Your Login Credentials",
        message=message,
        recipient_list=[client_user.email],
        fail_silently=True,
    )


# ---------------------------------------------------------------------------
# Meeting Scheduled Notification
# ---------------------------------------------------------------------------

def send_meeting_scheduled_email(lead, followup, meeting_link: str = None):
    """Send meeting scheduled notification to lead."""
    if not lead.email:
        return

    contact_name = (
        followup.assigned_to.get_full_name() or followup.assigned_to.username
        if followup.assigned_to else "Aurexion Team"
    )
    message = f"""Dear {lead.name},

A meeting has been scheduled for you with our team.

Meeting Details:
- Date & Time   : {followup.scheduled_at.strftime('%B %d, %Y at %I:%M %p')}
- Meeting Type  : {followup.get_follow_up_type_display()}
- Your Contact  : {contact_name}
{f"- Notes        : {followup.notes}" if followup.notes else ""}
{f"- Meeting Link : {meeting_link}" if meeting_link else ""}

Please reach out if you need to reschedule or have any questions before the meeting.

Best regards,
Aurexion Technologies Team
"""
    send_email(
        subject=f"Meeting Scheduled — Aurexion Technologies ({lead.reference_id})",
        message=message,
        recipient_list=[lead.email],
        fail_silently=True,
    )


# ---------------------------------------------------------------------------
# Support Ticket Resolved
# ---------------------------------------------------------------------------

def send_ticket_resolved_email(ticket):
    """Send ticket resolved notification to client."""
    message = f"""Dear {ticket.client_user.get_full_name() or ticket.client_user.username},

Your support ticket has been resolved.

Ticket Details:
- Ticket ID   : {ticket.ticket_id}
- Subject     : {ticket.subject}
- Status      : Resolved
- Resolved On : {ticket.closed_at.strftime('%B %d, %Y at %I:%M %p')}

Resolution Notes:
{ticket.resolution_notes}

If you have any further questions, please create a new ticket in the client portal.

Best regards,
Aurexion Support Team
"""
    send_email(
        subject=f"Ticket Resolved: {ticket.ticket_id} — {ticket.subject}",
        message=message,
        recipient_list=[ticket.client_user.email],
        fail_silently=True,
    )