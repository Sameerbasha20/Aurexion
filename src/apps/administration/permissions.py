from rest_framework import permissions
from apps.administration.models import Role, ModulePermission

def has_module_permission(user, module, action):
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    if not hasattr(user, 'profile'):
        return False
        
    role_code = user.profile.role
    if role_code == 'super_admin':
        return True
        
    try:
        role = Role.objects.get(code=role_code)
        perm = ModulePermission.objects.get(role=role, module=module)
        if action == 'create':
            return perm.can_create
        elif action == 'read':
            return perm.can_read
        elif action == 'update':
            return perm.can_update
        elif action == 'delete':
            return perm.can_delete
    except (Role.DoesNotExist, ModulePermission.DoesNotExist):
        return False
    return False

class BaseRolePermission(permissions.BasePermission):
    """
    Base permission class to check dynamic module/action permissions from the database.
    Super Admins are always allowed.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Super Admin bypasses all checks
        if request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin'):
            return True

        # Deduce module name
        module = getattr(self, 'rbac_module', None) or getattr(view, 'rbac_module', None)
        if not module:
            module_parts = view.__class__.__module__.split('.')
            if 'apps' in module_parts:
                module = module_parts[module_parts.index('apps') + 1]
            else:
                module = 'portal'

        # Deduce action name
        action_map = {
            'GET': 'read',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete'
        }
        action = action_map.get(request.method, 'read')

        role_code = request.user.profile.role if hasattr(request.user, 'profile') else 'client_user'
        try:
            role = Role.objects.get(code=role_code)
            perm = ModulePermission.objects.get(role=role, module=module)
            if action == 'create':
                return perm.can_create
            elif action == 'read':
                return perm.can_read
            elif action == 'update':
                return perm.can_update
            elif action == 'delete':
                return perm.can_delete
        except (Role.DoesNotExist, ModulePermission.DoesNotExist):
            # Fallback to the original hardcoded allowed_roles check
            if hasattr(request.user, 'profile') and request.user.profile.role in self.allowed_roles:
                return True
        return False

class IsSuperAdmin(BaseRolePermission):
    allowed_roles = ['super_admin']

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin')

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
