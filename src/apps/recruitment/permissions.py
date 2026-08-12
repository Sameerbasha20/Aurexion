from rest_framework import permissions

class IsHRManagerOrSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow HR Managers or Super Admins to access ATS endpoints.
    Denies access to all other roles (e.g., Sales, BDM, Client).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Super Admins get access via Django's built-in is_superuser flag
        if request.user.is_superuser:
            return True
            
        if not hasattr(request.user, 'profile'):
            return False
            
        # Otherwise, only the HR Manager role is allowed
        return request.user.profile.role == 'hr_manager'
