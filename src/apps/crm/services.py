import logging
import secrets
import string

logger = logging.getLogger(__name__)

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError

from apps.authentication.audit import get_model_state, log_audit_event
from apps.authentication.models import UserProfile
from apps.crm.models import Lead, LeadFollowUp, LeadNote
from apps.core.services import send_meeting_scheduled_email, send_welcome_credentials_email

User = get_user_model()

REFERENCE_PREFIX = "AUR-LEAD-"
REFERENCE_ALPHABET = string.ascii_uppercase + string.digits
REFERENCE_SUFFIX_LENGTH = 8
REFERENCE_MAX_RETRIES = 5

# Roles that are valid lead assignment targets (BDM / Sales pipeline users).
ASSIGNABLE_ROLES = {"super_admin", "administrator", "bdm", "sales_executive"}

# Roles allowed to update any note (admins) vs. only own notes.
NOTE_ADMIN_ROLES = {"super_admin", "administrator", "bdm"}

STATUS_TRANSITIONS = {
    Lead.Status.NEW: {
        Lead.Status.UNDER_REVIEW,
        Lead.Status.CONTACTED,
        Lead.Status.LOST,
    },
    Lead.Status.UNDER_REVIEW: {
        Lead.Status.CONTACTED,
        Lead.Status.LOST,
    },
    Lead.Status.CONTACTED: {
        Lead.Status.QUALIFIED,
        Lead.Status.LOST,
    },
    Lead.Status.QUALIFIED: {
        Lead.Status.PROPOSAL_SUBMITTED,
        Lead.Status.LOST,
    },
    Lead.Status.PROPOSAL_SUBMITTED: {
        Lead.Status.NEGOTIATION,
        Lead.Status.LOST,
    },
    Lead.Status.NEGOTIATION: {
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.WON: set(),
    Lead.Status.LOST: set(),
}


class LeadStateTransitionError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Invalid lead status transition."
    default_code = "invalid_transition"


def generate_reference():
    """
    Generate a server-side business reference identifier.

    The reference is random (not sequential), never derived from client input,
    and uniqueness is enforced at the database level by the `unique=True`
    constraint on Lead.reference_id. The random component uses the cryptographically
    strong `secrets` module to avoid predictable identifiers.
    """
    suffix = "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(REFERENCE_SUFFIX_LENGTH))
    return f"{REFERENCE_PREFIX}{suffix}"


def get_user_role(user):
    return getattr(getattr(user, "profile", None), "role", None)


def _status_label(value):
    return dict(Lead.Status.choices).get(value, value)


def validate_assignable_user(user):
    """
    Validate that a target user can receive a lead assignment.

    The user must exist, be active, and hold a CRM pipeline role.
    """
    if user is None:
        raise ValidationError("An assigned user is required.")
    if not user.is_active:
        raise ValidationError(f"User '{user.username}' is inactive and cannot be assigned leads.")
    role = get_user_role(user)
    if role not in ASSIGNABLE_ROLES:
        raise ValidationError(
            f"User '{user.username}' does not hold an assignable role (BDM or Sales Executive)."
        )


def _sync_lead_next_follow_up(lead):
    """
    Recompute the lead's next_follow_up_at from its earliest open follow-up.

    Open statuses are PENDING and IN_PROGRESS.
    """
    earliest = (
        lead.follow_ups.filter(status__in=LeadFollowUp.OPEN_STATUSES)
        .order_by("scheduled_at")
        .values_list("scheduled_at", flat=True)
        .first()
    )
    updated_fields = ["updated_at"]
    if lead.next_follow_up_at != earliest:
        lead.next_follow_up_at = earliest
        updated_fields.append("next_follow_up_at")
    lead.save(update_fields=updated_fields)


def create_lead(*, actor, request=None, **data):
    """
    Create a lead with a unique, server-generated reference identifier.

    Assignment targets are validated before persistence. Reference collisions are
    handled with bounded retries inside an atomic savepoint.
    """
    assignee = data.pop("assigned_to", None)
    if assignee is None and actor and get_user_role(actor) == "sales_executive":
        assignee = actor
    if assignee is not None:
        validate_assignable_user(assignee)

    for attempt in range(REFERENCE_MAX_RETRIES):
        try:
            with transaction.atomic():
                lead = Lead.objects.create(
                    reference_id=generate_reference(),
                    created_by=actor,
                    assigned_to=assignee,
                    **data,
                )
            break
        except IntegrityError:
            if attempt == REFERENCE_MAX_RETRIES - 1:
                raise

    log_audit_event(
        user=actor,
        action="LEAD_CREATED",
        module="crm",
        object_id=lead.id,
        repr_str=f"Lead {lead.reference_id} created",
        updated_state=get_model_state(lead),
        request=request,
    )
    return lead


def change_lead_stage(*, lead, new_status, actor, request=None):
    """
    Transition a lead between lifecycle states, validating the transition.

    Terminal states (WON/LOST) cannot transition further. Invalid transitions
    raise LeadStateTransitionError (HTTP 409 Conflict).
    """
    if new_status == lead.status:
        return lead

    allowed = STATUS_TRANSITIONS.get(lead.status, set())
    if new_status not in allowed:
        raise LeadStateTransitionError(
            f"Lead {lead.reference_id} cannot transition from "
            f"'{_status_label(lead.status)}' to '{_status_label(new_status)}'."
        )

    previous = lead.status
    lead.status = new_status
    lead.save(update_fields=["status", "updated_at"])

    log_audit_event(
        user=actor,
        action="LEAD_STATUS_CHANGED",
        module="crm",
        object_id=lead.id,
        repr_str=(
            f"Lead {lead.reference_id} status changed from "
            f"'{_status_label(previous)}' to '{_status_label(lead.status)}'"
        ),
        previous_state={"status": previous},
        updated_state={"status": lead.status},
        request=request,
    )
    return lead


def qualify_lead(*, lead, actor, request=None):
    """Move a lead to QUALIFIED (valid only from CONTACTED)."""
    return change_lead_stage(
        lead=lead,
        new_status=Lead.Status.QUALIFIED,
        actor=actor,
        request=request,
    )


def mark_lead_won(*, lead, actor, request=None):
    """Mark a lead as WON (valid only from NEGOTIATION)."""
    lead = change_lead_stage(
        lead=lead,
        new_status=Lead.Status.WON,
        actor=actor,
        request=request,
    )

    # Create client user and send welcome credentials
    if lead.email:
        try:
            create_client_user_and_send_credentials(lead, actor, request)
        except Exception:
            logger.exception(f"Failed to create client user for lead {lead.reference_id}")

    return lead


def create_client_user_and_send_credentials(lead, actor, request=None):
    """
    Create a client user for the won lead and send welcome credentials email.
    Uses the lead's email as username and a default password.
    """
    from django.conf import settings

    default_password = getattr(settings, 'DEFAULT_CLIENT_PASSWORD', '') or secrets.token_urlsafe(12)
    login_url = getattr(settings, 'CLIENT_PORTAL_LOGIN_URL', 'http://localhost:3000/login')

    # Check if user already exists with this email
    user, created = User.objects.get_or_create(
        email=lead.email,
        defaults={
            'username': lead.email,
            'first_name': lead.name.split(' ')[0] if lead.name else 'Client',
            'last_name': ' '.join(lead.name.split(' ')[1:]) if lead.name and len(lead.name.split(' ')) > 1 else '',
            'is_active': True,
        }
    )

    if created:
        user.set_password(default_password)
        user.save()

        # Create or update user profile with client_user role
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'client_user'
        profile.save()
    else:
        # User exists, update password to default (they can change it later)
        user.set_password(default_password)
        user.save()

        # Ensure profile has client_user role
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'client_user'
        profile.save()

    # Send welcome credentials email
    send_welcome_credentials_email(user, default_password, login_url)

    log_audit_event(
        user=actor,
        action="CLIENT_USER_CREATED",
        module="crm",
        object_id=user.id,
        repr_str=f"Client user created for lead {lead.reference_id}: {user.email}",
        updated_state={"user_id": user.id, "email": user.email, "role": "client_user"},
        request=request,
    )

    return user


def mark_lead_lost(*, lead, actor, reason, request=None):
    """
    Mark a lead as LOST (valid from most active states).

    A non-empty business reason is required; it is stored on the lead and
    included in the audit history so losses remain explainable.
    """
    if lead.status == Lead.Status.LOST:
        return lead

    allowed = STATUS_TRANSITIONS.get(lead.status, set())
    if Lead.Status.LOST not in allowed:
        raise LeadStateTransitionError(
            f"Lead {lead.reference_id} cannot be marked as lost from "
            f"'{_status_label(lead.status)}'."
        )

    reason = (reason or "").strip()
    if not reason:
        raise ValidationError("A reason is required when a lead is marked as lost.")
    if len(reason) < 10:
        raise ValidationError("A minimum explanation of at least 10 characters is required when declining a lead.")

    previous = lead.status
    lead.status = Lead.Status.LOST
    lead.lost_reason = reason
    lead.save(update_fields=["status", "lost_reason", "updated_at"])

    # Send decline notification email to client user
    try:
        from apps.core.services import send_lead_declined_email
        send_lead_declined_email(lead, reason)
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Failed to send lead decline email to {lead.email}: {e}")

    log_audit_event(
        user=actor,
        action="LEAD_LOST",
        module="crm",
        object_id=lead.id,
        repr_str=(
            f"Lead {lead.reference_id} marked as lost from "
            f"'{_status_label(previous)}'. Reason: {reason}"
        ),
        previous_state={"status": previous},
        updated_state={"status": Lead.Status.LOST, "lost_reason": reason},
        request=request,
    )
    return lead


def reopen_lost_lead(*, lead, actor, request=None):
    """
    Reopen a LOST lead back into the active pipeline.

    The lead returns to NEW and its lost reason is cleared so the fresh
    lifecycle starts with a clean slate. Only LOST leads can be reopened.
    """
    if lead.status != Lead.Status.LOST:
        raise LeadStateTransitionError(
            f"Lead {lead.reference_id} is not lost and cannot be reopened."
        )

    previous_reason = lead.lost_reason
    lead.status = Lead.Status.NEW
    lead.lost_reason = ""
    lead.save(update_fields=["status", "lost_reason", "updated_at"])

    log_audit_event(
        user=actor,
        action="LEAD_REOPENED",
        module="crm",
        object_id=lead.id,
        repr_str=(
            f"Lead {lead.reference_id} reopened into the pipeline"
            f"{f' (previous reason: {previous_reason})' if previous_reason else ''}"
        ),
        previous_state={"status": Lead.Status.LOST},
        updated_state={"status": Lead.Status.NEW, "lost_reason": ""},
        request=request,
    )
    return lead


def assign_lead(*, lead, target_user, actor, request=None):
    """
    Assign (or reassign) a lead to an authorized, active user.

    Previous and resulting assignees are recorded in the audit history.
    """
    validate_assignable_user(target_user)

    previous = lead.assigned_to
    if previous == target_user:
        return lead

    lead.assigned_to = target_user
    lead.save(update_fields=["assigned_to", "updated_at"])

    action = "LEAD_ASSIGNED" if previous is None else "LEAD_REASSIGNED"
    log_audit_event(
        user=actor,
        action=action,
        module="crm",
        object_id=lead.id,
        repr_str=(
            f"Lead {lead.reference_id} assigned from "
            f"'{previous.username if previous else 'unassigned'}' to '{target_user.username}'"
        ),
        previous_state={"assigned_to": previous.username if previous else None},
        updated_state={"assigned_to": target_user.username},
        request=request,
    )
    return lead


def schedule_followup(*, lead, actor, scheduled_at, follow_up_type, notes="", assigned_to=None, request=None):
    """
    Create a follow-up and refresh the lead's next_follow_up_at.
    If follow_up_type is MEETING, send email notification to lead.
    """
    if assigned_to is not None:
        validate_assignable_user(assigned_to)

    if isinstance(scheduled_at, str):
        scheduled_at = parse_datetime(scheduled_at)
        if scheduled_at is None:
            raise ValidationError("scheduled_at must be a valid datetime.")

    followup = LeadFollowUp.objects.create(
        lead=lead,
        created_by=actor,
        assigned_to=assigned_to,
        follow_up_type=follow_up_type,
        scheduled_at=scheduled_at,
        notes=notes,
    )
    _sync_lead_next_follow_up(lead)

    log_audit_event(
        user=actor,
        action="FOLLOWUP_CREATED",
        module="crm",
        object_id=lead.id,
        repr_str=f"Follow-up scheduled for lead {lead.reference_id} at {scheduled_at.isoformat()}",
        updated_state=get_model_state(followup),
        request=request,
    )

    # Send email notification if this is a meeting
    if follow_up_type == LeadFollowUp.FollowUpType.MEETING and lead.email:
        try:
            send_meeting_scheduled_email(lead, followup)
        except Exception:
            # Log but don't fail the follow-up creation
            logger.exception(f"Failed to send meeting email for lead {lead.reference_id}")

    return followup


def update_followup(*, followup, actor, request=None, **data):
    """
    Update follow-up fields, refusing edits to an already completed follow-up
    except by authorized administrators.
    """
    role = get_user_role(actor)
    if followup.status == LeadFollowUp.Status.COMPLETED and role not in NOTE_ADMIN_ROLES:
        raise ValidationError("A completed follow-up cannot be modified.")

    old_scheduled_at = followup.scheduled_at
    old_status = followup.status

    for field, value in data.items():
        setattr(followup, field, value)
    followup.save()

    if data.get("scheduled_at") != old_scheduled_at or data.get("status") != old_status:
        _sync_lead_next_follow_up(followup.lead)

    log_audit_event(
        user=actor,
        action="FOLLOWUP_UPDATED",
        module="crm",
        object_id=followup.lead.id,
        repr_str=f"Follow-up updated for lead {followup.lead.reference_id}",
        updated_state=get_model_state(followup),
        request=request,
    )
    return followup


def delete_followup(*, followup, actor, request=None):
    """Delete a follow-up (restricted to BDM/administrator roles)."""
    role = get_user_role(actor)
    if role not in ("super_admin", "administrator", "bdm"):
        raise PermissionDenied("You are not allowed to delete this follow-up.")

    lead = followup.lead
    followup.delete()
    _sync_lead_next_follow_up(lead)

    log_audit_event(
        user=actor,
        action="FOLLOWUP_DELETED",
        module="crm",
        object_id=lead.id,
        repr_str=f"Follow-up deleted for lead {lead.reference_id}",
        request=request,
    )


def complete_followup(*, followup, actor, request=None):
    """
    Complete a follow-up and record the lead's last_contacted_at timestamp.
    """
    if followup.status == LeadFollowUp.Status.COMPLETED:
        return followup

    followup.status = LeadFollowUp.Status.COMPLETED
    followup.completed_at = timezone.now()
    followup.save(update_fields=["status", "completed_at", "updated_at"])

    lead = followup.lead
    lead.last_contacted_at = followup.completed_at
    lead.save(update_fields=["last_contacted_at", "updated_at"])
    _sync_lead_next_follow_up(lead)

    log_audit_event(
        user=actor,
        action="FOLLOWUP_COMPLETED",
        module="crm",
        object_id=lead.id,
        repr_str=f"Follow-up completed for lead {lead.reference_id} at {followup.completed_at.isoformat()}",
        updated_state=get_model_state(followup),
        request=request,
    )
    return followup


def add_note(*, lead, author, content, request=None):
    """Add a note to a lead and record the activity in the audit history."""
    note = LeadNote.objects.create(lead=lead, created_by=author, content=content)

    log_audit_event(
        user=author,
        action="NOTE_ADDED",
        module="crm",
        object_id=lead.id,
        repr_str=f"Note added to lead {lead.reference_id}",
        updated_state=get_model_state(note),
        request=request,
    )
    return note


def can_modify_note(*, note, actor):
    """Only the note author or an authorized administrator may modify a note."""
    role = get_user_role(actor)
    if role in NOTE_ADMIN_ROLES:
        return True
    return note.created_by_id == actor.id


def update_note(*, note, actor, content, request=None):
    """Update a note where the actor is allowed to."""
    if not can_modify_note(note=note, actor=actor):
        raise PermissionDenied("You are not allowed to modify this note.")
    note.content = content
    note.save(update_fields=["content", "updated_at"])

    log_audit_event(
        user=actor,
        action="NOTE_UPDATED",
        module="crm",
        object_id=note.lead.id,
        repr_str=f"Note updated on lead {note.lead.reference_id}",
        updated_state=get_model_state(note),
        request=request,
    )
    return note


def delete_note(*, note, actor, request=None):
    """Delete a note where the actor is allowed to."""
    if not can_modify_note(note=note, actor=actor):
        raise PermissionDenied("You are not allowed to delete this note.")
    lead_id = note.lead_id
    lead_ref = note.lead.reference_id
    note.delete()

    log_audit_event(
        user=actor,
        action="NOTE_DELETED",
        module="crm",
        object_id=lead_id,
        repr_str=f"Note deleted from lead {lead_ref}",
        request=request,
    )


def schedule_meeting_and_notify(*, lead, scheduled_at, follow_up_type="meeting", meeting_link=None, notes="", actor=None, request=None):
    """
    Schedule a meeting with a lead, record the follow-up, and dispatch email notification.
    """
    if isinstance(scheduled_at, str):
        parsed_dt = parse_datetime(scheduled_at)
        if parsed_dt is None:
            raise ValidationError("Invalid datetime format for scheduled_at.")
        scheduled_at = parsed_dt

    followup = LeadFollowUp.objects.create(
        lead=lead,
        assigned_to=actor or lead.assigned_to,
        follow_up_type=follow_up_type,
        scheduled_at=scheduled_at,
        notes=notes or f"Meeting scheduled with client. Link: {meeting_link or 'N/A'}",
        meeting_link=meeting_link or "",
        status=LeadFollowUp.Status.PENDING,
    )

    _sync_lead_next_follow_up(lead)

    # Transition lead to contacted if new/under_review
    if lead.status in (Lead.Status.NEW, Lead.Status.UNDER_REVIEW):
        lead.status = Lead.Status.CONTACTED
        lead.save(update_fields=["status", "updated_at"])

    # Dispatch email if lead has an email address
    if lead.email:
        try:
            send_meeting_scheduled_email(lead, followup, meeting_link)
        except Exception:
            logger.exception(f"Failed to send meeting scheduled email to {lead.email}")

    log_audit_event(
        user=actor,
        action="MEETING_SCHEDULED",
        module="crm",
        object_id=followup.id,
        repr_str=f"Meeting scheduled for lead {lead.reference_id} at {scheduled_at}",
        updated_state={
            "lead_id": lead.id,
            "scheduled_at": scheduled_at.isoformat(),
            "meeting_link": meeting_link,
        },
        request=request,
    )

    return followup
