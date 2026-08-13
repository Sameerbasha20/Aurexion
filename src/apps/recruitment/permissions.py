from rest_framework import permissions
from apps.administration.permissions import has_module_permission

class IsHRManagerOrSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow HR Managers or Super Admins to access ATS endpoints.
    Checks database module permissions for recruitment.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Super Admins get access via Django's built-in is_superuser flag
        if request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin'):
            return True
            
        # Deduce action name
        action_map = {
            'GET': 'read',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete'
        }
        action = action_map.get(request.method, 'read')
        
        return has_module_permission(request.user, 'recruitment', action)
