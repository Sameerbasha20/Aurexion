def make_user(username, role, is_active=True):
    """Create a User with the given UserProfile role."""
    from django.contrib.auth.models import User

    user = User.objects.create_user(
        username=username,
        password="TestP@ss1234",
        email=f"{username}@example.com",
        is_active=is_active,
    )
    user.profile.role = role
    user.profile.save()
    return user


def create_lead(actor, **kwargs):
    """Convenience wrapper around the CRM create_lead service."""
    from apps.crm.services import create_lead

    defaults = {"name": "Acme Corp"}
    defaults.update(kwargs)
    return create_lead(actor=actor, **defaults)
