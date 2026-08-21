import logging
from django.contrib.auth.models import AnonymousUser
from apps.authentication.models import AuditLog

logger = logging.getLogger(__name__)

def get_client_ip(request):
    """
    Extract IP address from HTTP request headers or remote address.
    """
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_client_user_agent(request):
    """
    Extract User Agent string from HTTP request headers.
    """
    if not request:
        return None
    return request.META.get('HTTP_USER_AGENT', '')

import threading

def _save_audit_log_task(db_user_id, action, module, object_id, repr_str, clean_prev, clean_updated, resolved_ip, resolved_ua):
    try:
        from django.contrib.auth.models import User
        db_user = User.objects.filter(id=db_user_id).first() if db_user_id else None
        AuditLog.objects.create(
            user=db_user,
            action=action,
            module=module,
            object_id=str(object_id) if object_id is not None else None,
            repr=repr_str,
            previous_state=clean_prev,
            updated_state=clean_updated,
            ip_address=resolved_ip,
            user_agent=resolved_ua
        )
    except Exception as exc:
        logger.debug("Background audit log creation failed: %s", exc)

def log_audit_event(user, action, module, object_id=None, repr_str=None, previous_state=None, updated_state=None, request=None, ip_address=None, user_agent=None):
    """
    Create and save an AuditLog record asynchronously in a daemon thread.
    If 'request' is provided, automatically extract IP address and User Agent.
    """
    db_user_id = None
    if user and not isinstance(user, AnonymousUser) and hasattr(user, 'id'):
        db_user_id = user.id

    # Resolve IP and User Agent
    resolved_ip = ip_address
    resolved_ua = user_agent

    if request:
        if not resolved_ip:
            resolved_ip = get_client_ip(request)
        if not resolved_ua:
            resolved_ua = get_client_user_agent(request)

    # Ensure previous_state and updated_state are dictionaries or None
    clean_prev = previous_state if isinstance(previous_state, dict) else None
    clean_updated = updated_state if isinstance(updated_state, dict) else None

    # Dispatch to background thread to avoid blocking HTTP request cycle
    t = threading.Thread(
        target=_save_audit_log_task,
        args=(db_user_id, action, module, object_id, repr_str, clean_prev, clean_updated, resolved_ip, resolved_ua),
        daemon=True
    )
    t.start()
    return None

def get_model_state(instance):
    """
    Helper to serialize a Django model instance to a simple dictionary for audit state tracking.
    """
    if not instance:
        return None
    state = {}
    for field in instance._meta.fields:
        if field.name in ['password', 'last_login']:
            continue
        try:
            val = getattr(instance, field.name)
            # Check if JSON serializable
            if isinstance(val, (dict, list, str, int, float, bool, type(None))):
                state[field.name] = val
            else:
                state[field.name] = str(val)
        except Exception as exc:
            logger.debug("Failed to serialize field %s for audit log: %s", getattr(field, 'name', 'unknown'), exc)
    return state
