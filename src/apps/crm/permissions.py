from rest_framework import permissions

from apps.administration.permissions import BaseRolePermission


class CanAccessLead(BaseRolePermission):
    """
    Roles that may view/manage CRM leads. 
    """
    allowed_roles = ["administrator", "bdm", "business_dev_manager", "sales_executive", "sales", "sales_user"]


class CanCreateLead(BaseRolePermission):
    """Roles that may create leads in the CRM."""
    allowed_roles = ["super_admin", "administrator", "bdm", "business_dev_manager", "sales_executive", "sales", "sales_user"]


class CanAssignLead(BaseRolePermission):
    """Roles that may assign (or reassign) leads to pipeline users or onboard clients."""
    allowed_roles = ["super_admin", "administrator", "bdm", "business_dev_manager", "sales_executive", "sales", "sales_user"]


class CanDeleteLead(BaseRolePermission):
    """Roles that may delete leads from the CRM."""
    allowed_roles = ["super_admin", "administrator", "bdm", "business_dev_manager"]


class IsSalesOrBdm(BaseRolePermission):
    """Roles that participate in the lead pipeline (sales + BDM + admins)."""
    allowed_roles = ["super_admin", "administrator", "bdm", "business_dev_manager", "sales_executive", "sales", "sales_user"]


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

        role = str(getattr(getattr(user, "profile", None), "role", "") or "").lower()
        if role in ("super_admin", "administrator", "admin", "bdm", "business_dev_manager"):
            return True

        if role in ("sales_executive", "sales", "sales_user"):
            return obj.assigned_to_id == user.id

        return False
