import logging
import secrets
import string

logger = logging.getLogger(__name__)

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.core.cache import cache
from rest_framework import status
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError


def _clear_dashboard_cache():
    try:
        cache.delete("bdm_dashboard_metrics")
    except Exception:
        pass

from apps.authentication.audit import get_model_state, log_audit_event
from apps.authentication.models import UserProfile
from apps.crm.models import Lead, LeadFollowUp, LeadNote
from apps.core.services import (
    send_meeting_scheduled_email,
    send_welcome_credentials_email,
    send_form_submission_confirmation_email,
    send_lead_status_update_email,
    send_lead_won_email,
    send_lead_declined_email,
    PUBLIC_FORM_SOURCES,
)

User = get_user_model()

REFERENCE_PREFIX = "AUR-LEAD-"
REFERENCE_ALPHABET = string.ascii_uppercase + string.digits
REFERENCE_SUFFIX_LENGTH = 8
REFERENCE_MAX_RETRIES = 5

# Roles that are valid lead assignment targets (BDM / Sales pipeline users).
ASSIGNABLE_ROLES = {"super_admin", "administrator", "admin", "bdm", "business_dev_manager", "sales_executive", "sales", "sales_user"}

# Roles allowed to update any note (admins) vs. only own notes.
NOTE_ADMIN_ROLES = {"super_admin", "administrator", "admin", "bdm", "business_dev_manager"}

STATUS_TRANSITIONS = {
    Lead.Status.NEW: {
        Lead.Status.UNDER_REVIEW,
        Lead.Status.CONTACTED,
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.UNDER_REVIEW: {
        Lead.Status.CONTACTED,
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.CONTACTED: {
        Lead.Status.QUALIFIED,
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.QUALIFIED: {
        Lead.Status.PROPOSAL_SUBMITTED,
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.PROPOSAL_SUBMITTED: {
        Lead.Status.NEGOTIATION,
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.NEGOTIATION: {
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.WON: set(),
    Lead.Status.LOST: {
        Lead.Status.NEW,
        Lead.Status.UNDER_REVIEW,
        Lead.Status.CONTACTED,
    },
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

    # Send auto-reply confirmation email to user if submitted via a public form
    if lead.email and getattr(lead, "source", None) in PUBLIC_FORM_SOURCES:
        try:
            send_form_submission_confirmation_email(lead)
        except Exception:
            logger.exception(f"Failed to send form submission confirmation email for lead {lead.reference_id}")

    _clear_dashboard_cache()
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

    # Notify the lead/client about their status update (only for meaningful transitions)
    if lead.email:
        try:
            send_lead_status_update_email(lead, previous, new_status)
        except Exception:
            logger.exception(f"Failed to send status update email for lead {lead.reference_id}")

    _clear_dashboard_cache()
    return lead


def qualify_lead(*, lead, actor, request=None):
    """Move a lead to QUALIFIED (valid only from CONTACTED)."""
    return change_lead_stage(
        lead=lead,
        new_status=Lead.Status.QUALIFIED,
        actor=actor,
        request=request,
    )


def mark_lead_won(*, lead, actor, value=None, notes=None, request=None):
    """
    Mark a lead as WON (valid from active stages).
    Records agreed project cost (value) and closing notes.
    The lead transitions to WON and awaits BDM onboarding & credential dispatch.
    """
    # B-01 Fix: Validate transition first before updating lead value
    lead = change_lead_stage(
        lead=lead,
        new_status=Lead.Status.WON,
        actor=actor,
        request=request,
    )

    if value is not None:
        try:
            lead.value = float(value)
            lead.save(update_fields=["value"])
        except (ValueError, TypeError):
            pass

    if notes and str(notes).strip():
        try:
            add_note(lead=lead, author=actor, content=f"Deal WON Notes: {str(notes).strip()}", request=request)
        except Exception:
            pass

    # Send congratulations email to the client
    if lead.email:
        try:
            send_lead_won_email(lead)
        except Exception:
            logger.exception(f"Failed to send WON congratulations email for lead {lead.reference_id}")

    return lead


def onboard_lead_as_client(*, lead, actor, password=None, email=None, request=None):
    """
    BDM action: Review won lead details, create/activate client user account,
    and dispatch official welcome email with login credentials.
    """
    from django.conf import settings

    if lead.status != Lead.Status.WON:
        raise LeadStateTransitionError(f"Lead {lead.reference_id} must be marked as WON before onboarding as client.")

    if email and str(email).strip():
        lead.email = str(email).strip().lower()
        lead.save(update_fields=["email", "updated_at"])

    # D-02 Fix: Generate a secure 12-char random password if no password/setting provided
    if password:
        default_password = password
    elif getattr(settings, 'DEFAULT_CLIENT_PASSWORD', ''):
        default_password = settings.DEFAULT_CLIENT_PASSWORD
    else:
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        default_password = "".join(secrets.choice(alphabet) for _ in range(12))

    login_url = getattr(settings, 'CLIENT_PORTAL_LOGIN_URL', 'http://localhost:3000/login')

    clean_email = (lead.email or "").strip().lower()
    if not clean_email:
        raise ValidationError("Lead does not have a valid email address for client portal onboarding. Please enter a valid client email.")

    # Safely find existing user by email (case-insensitive) or username
    user = User.objects.filter(email__iexact=clean_email).first()
    if not user:
        user = User.objects.filter(username__iexact=clean_email).first()

    first_name = lead.name.split(' ')[0] if lead.name else 'Client'
    last_name = ' '.join(lead.name.split(' ')[1:]) if lead.name and len(lead.name.split(' ')) > 1 else ''

    if user:
        user.set_password(default_password)
        if not user.email:
            user.email = clean_email
        user.is_active = True
        user.save()
    else:
        # Create new client user with safe username length limit
        username_candidate = clean_email[:150]
        # Guarantee unique username
        if User.objects.filter(username=username_candidate).exists():
            username_candidate = f"client_{lead.id}_{clean_email}"[:150]

        user = User.objects.create(
            username=username_candidate,
            email=clean_email,
            first_name=first_name[:150],
            last_name=last_name[:150],
            is_active=True,
        )
        user.set_password(default_password)
        user.save()

    # Ensure profile has client_user role
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = 'client_user'
    profile.save()

    # Provision initial ClientProject & Milestones for Client Dashboard
    try:
        from apps.portal.views import ensure_client_project_exists
        ensure_client_project_exists(user)
    except Exception:
        pass

    # Dispatch welcome credentials email
    try:
        send_welcome_credentials_email(user, default_password, login_url)
    except Exception as e:
        logger.exception(f"Failed to send welcome credentials email for user {user.email}: {e}")

    lead.client_onboarded = True
    lead.save(update_fields=["client_onboarded", "updated_at"])

    log_audit_event(
        user=actor,
        action="CLIENT_ONBOARDED_BY_BDM",
        module="crm",
        object_id=user.id,
        repr_str=f"BDM {actor.username} onboarded won lead {lead.reference_id} as client user ({user.email}) and dispatched portal credentials.",
        updated_state={"user_id": user.id, "email": user.email, "role": "client_user", "client_onboarded": True},
        request=request,
    )

    return lead, user


def create_client_user_and_send_credentials(lead, actor, request=None):
    """
    Backwards-compatible helper for client user creation and credential dispatch.
    """
    lead, user = onboard_lead_as_client(lead=lead, actor=actor, request=request)
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


    previous = lead.status
    lead.status = Lead.Status.LOST
    lead.lost_reason = reason
    lead.save(update_fields=["status", "lost_reason", "updated_at"])

    # Send decline notification email to the client
    if lead.email:
        try:
            send_lead_declined_email(lead, reason)
        except Exception:
            logger.exception(f"Failed to send lead decline email for lead {lead.reference_id}")

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
    _clear_dashboard_cache()
    return lead


def schedule_followup(*, lead, actor, scheduled_at, follow_up_type, notes="", meeting_link="", status=None, assigned_to=None, request=None, **kwargs):
    """
    Create a follow-up and refresh the lead's next_follow_up_at.
    If follow_up_type is MEETING, send email notification to lead.
    """
    if assigned_to is not None:
        validate_assignable_user(assigned_to)

    if isinstance(scheduled_at, str):
        parsed = parse_datetime(scheduled_at)
        if parsed is None:
            from datetime import datetime
            for fmt in ("%m/%d/%Y %I:%M %p", "%m/%d/%Y %H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
                try:
                    parsed = datetime.strptime(scheduled_at.strip(), fmt)
                    break
                except ValueError:
                    pass
        scheduled_at = parsed
        if scheduled_at is None:
            raise ValidationError("scheduled_at must be a valid datetime.")

    followup_status = status or LeadFollowUp.Status.PENDING

    followup = LeadFollowUp.objects.create(
        lead=lead,
        created_by=actor,
        assigned_to=assigned_to,
        follow_up_type=follow_up_type,
        scheduled_at=scheduled_at,
        notes=notes,
        meeting_link=meeting_link or "",
        status=followup_status,
    )
    _sync_lead_next_follow_up(lead)

    iso_str = scheduled_at.isoformat() if hasattr(scheduled_at, 'isoformat') else str(scheduled_at)
    log_audit_event(
        user=actor,
        action="FOLLOWUP_CREATED",
        module="crm",
        object_id=lead.id,
        repr_str=f"Follow-up scheduled for lead {lead.reference_id} at {iso_str}",
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
    if role not in ("super_admin", "administrator", "admin", "bdm", "business_dev_manager"):
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
        created_by=actor,
        assigned_to=actor or lead.assigned_to,
        follow_up_type=follow_up_type,
        scheduled_at=scheduled_at,
        notes=notes or f"Meeting scheduled with client. Link: {meeting_link or 'N/A'}",
        meeting_link=meeting_link or "",
        status=LeadFollowUp.Status.PENDING,
    )

    _sync_lead_next_follow_up(lead)

    # B-02 Fix: Transition lead to contacted via change_lead_stage for proper audit logging and email notification
    if lead.status in (Lead.Status.NEW, Lead.Status.UNDER_REVIEW):
        try:
            change_lead_stage(
                lead=lead,
                new_status=Lead.Status.CONTACTED,
                actor=actor,
                request=request,
            )
        except Exception:
            pass

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
