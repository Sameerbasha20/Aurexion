from rest_framework import permissions

class BaseRolePermission(permissions.BasePermission):
    """
    Base permission class to check if a user is authenticated and has a matching role.
    Super Admins are always allowed.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Super Admin bypasses all checks
        if request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin'):
            return True
            
        if hasattr(request.user, 'profile') and request.user.profile.role in self.allowed_roles:
            return True
            
        return False

class IsSuperAdmin(BaseRolePermission):
    allowed_roles = ['super_admin']

class IsAdministrator(BaseRolePermission):
    allowed_roles = ['super_admin', 'administrator']

class IsBDM(BaseRolePermission):
    allowed_roles = ['super_admin', 'bdm']

class IsSalesExecutive(BaseRolePermission):
    allowed_roles = ['super_admin', 'sales_executive']

class IsHRManager(BaseRolePermission):
    allowed_roles = ['super_admin', 'hr_manager']

class IsContentManager(BaseRolePermission):
    allowed_roles = ['super_admin', 'content_manager']

class IsSupportExecutive(BaseRolePermission):
    allowed_roles = ['super_admin', 'support_executive']

class IsClientUser(BaseRolePermission):
    allowed_roles = ['super_admin', 'client_user']

