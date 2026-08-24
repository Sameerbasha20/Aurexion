from django.core.cache import cache
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
        
    cache_key = f"rbac:{role_code}:{module}:{action}"
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    try:
        role = Role.objects.get(code=role_code)
        perm = ModulePermission.objects.get(role=role, module=module)
        if action == 'create':
            result = perm.can_create
        elif action == 'read':
            result = perm.can_read
        elif action == 'update':
            result = perm.can_update
        elif action == 'delete':
            result = perm.can_delete
        else:
            result = False
        cache.set(cache_key, result, timeout=300)
        return result
    except (Role.DoesNotExist, ModulePermission.DoesNotExist):
        cache.set(cache_key, False, timeout=300)
        return False

class BaseRolePermission(permissions.BasePermission):
    """
    Base permission class to check dynamic module/action permissions from the database.
    Super Admins are always allowed.

    RBAC lookup results are cached in Redis for 300 seconds per (role, module, action)
    tuple to eliminate the 2 DB queries fired on every authenticated non-super-admin
    request. Cache is keyed by role code so that different roles never share entries.
    Permission changes take effect within 300 seconds without any explicit invalidation.
    """
    allowed_roles = []

    # Cache TTL in seconds.  Roles and ModulePermissions are near-static; 5 minutes
    # balances freshness with the elimination of 2 DB round-trips per request.
    _RBAC_CACHE_TTL = 300

    def _get_cached_permission(self, role_code, module, action):
        """
        Return the cached boolean permission for (role_code, module, action), or
        None if the entry is not in the cache.
        Cache key format: "rbac:{role_code}:{module}:{action}"
        """
        cache_key = f"rbac:{role_code}:{module}:{action}"
        return cache.get(cache_key)

    def _set_cached_permission(self, role_code, module, action, result):
        """Store a boolean permission result in the cache."""
        cache_key = f"rbac:{role_code}:{module}:{action}"
        cache.set(cache_key, result, timeout=self._RBAC_CACHE_TTL)

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Super Admin bypasses all checks — never cached, always fast
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
        if request.method == 'POST' and getattr(view, 'detail', False):
            action = 'update'

        raw_role = (request.user.profile.role if hasattr(request.user, 'profile') else 'client_user') or 'client_user'
        role_map = {
            'business_dev_manager': 'bdm',
            'sales': 'sales_executive',
            'sales_user': 'sales_executive',
            'sales_rep': 'sales_executive',
            'admin': 'administrator',
            'hr': 'hr_manager',
            'content': 'content_manager',
            'support': 'support_executive',
            'client': 'client_user',
        }
        role_code = role_map.get(raw_role.lower(), raw_role.lower())

        # Enforce class-level allowed_roles constraint if specified by role subclass
        if self.allowed_roles:
            normalized_allowed = set()
            for r in self.allowed_roles:
                normalized_allowed.add(r.lower())
                normalized_allowed.add(role_map.get(r.lower(), r.lower()))
            if role_code not in normalized_allowed and raw_role.lower() not in normalized_allowed:
                return False
            return True

        # --- Cache lookup: avoids 2 DB queries on every non-super-admin request ---
        cached_result = self._get_cached_permission(role_code, module, action)
        if cached_result is not None:
            return cached_result

        # --- DB lookup (cache miss) ---
        try:
            role = Role.objects.get(code=role_code)
            perm = ModulePermission.objects.get(role=role, module=module)
            if action == 'create':
                result = perm.can_create
            elif action == 'read':
                result = perm.can_read
            elif action == 'update':
                result = perm.can_update
            elif action == 'delete':
                result = perm.can_delete
            else:
                result = False
            self._set_cached_permission(role_code, module, action, result)
            return result
        except (Role.DoesNotExist, ModulePermission.DoesNotExist):
            # Fallback to the original hardcoded allowed_roles check
            if hasattr(request.user, 'profile') and request.user.profile.role in self.allowed_roles:
                # Cache the positive fallback result so we don't re-check DB on next request
                self._set_cached_permission(role_code, module, action, True)
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
