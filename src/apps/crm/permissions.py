from rest_framework import permissions

from apps.administration.permissions import BaseRolePermission


class CanAccessLead(BaseRolePermission):
    """
    Roles that may view/manage CRM leads. 

    Super Admin is granted by the base class bypass; Administrator and BDM
    have full lead CRM access; Sales Executives are restricted to the leads
    assigned to them (enforced at the queryset level in the view).
    """
    allowed_roles = ["administrator", "bdm", "sales_executive"]


class CanCreateLead(BaseRolePermission):
    """Roles that may create leads in the CRM."""
    allowed_roles = ["super_admin", "administrator", "bdm"]


class CanAssignLead(BaseRolePermission):
    """Roles that may assign (or reassign) leads to pipeline users."""
    allowed_roles = ["super_admin", "administrator", "bdm"]


class CanDeleteLead(BaseRolePermission):
    """Roles that may delete leads from the CRM."""
    allowed_roles = ["super_admin", "administrator", "bdm"]


class IsSalesOrBdm(BaseRolePermission):
    """Roles that participate in the lead pipeline (sales + BDM + admins)."""
    allowed_roles = ["super_admin", "administrator", "bdm", "sales_executive"]


class CanAccessObjectLead(permissions.BasePermission):
    """
    Object-level guard for nested CRM resources (follow-ups, notes, activities).

    BDM / Administrator / Super Admin may access any lead. Sales Executives may
    only access leads assigned to them. Unauthorized users receive 403.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        role = getattr(getattr(user, "profile", None), "role", None)
        if role in ("super_admin", "administrator", "bdm"):
            return True

        if role == "sales_executive":
            return obj.assigned_to_id == user.id

        return False
