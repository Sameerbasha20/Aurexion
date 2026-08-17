from apps.administration.permissions import BaseRolePermission

class IsHRManagerOrSuperAdmin(BaseRolePermission):
    """
    Custom permission to only allow HR Managers or Super Admins to access ATS endpoints.
    Checks database module permissions for recruitment.
    """
    allowed_roles = ['super_admin', 'hr_manager']
    rbac_module = 'recruitment'
