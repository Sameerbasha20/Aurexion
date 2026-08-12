from functools import wraps
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect

def role_required(*roles):
    """
    Decorator to restrict access to views based on user roles.
    If the user is not logged in, they are redirected to the login page.
    If the user is logged in but does not have the required role, a 403 PermissionDenied is raised.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            
            # Super Admin has access to everything
            if request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin'):
                return view_func(request, *args, **kwargs)
                
            if hasattr(request.user, 'profile') and request.user.profile.role in roles:
                return view_func(request, *args, **kwargs)
                
            raise PermissionDenied
        return _wrapped_view
    return decorator

# Convenience decorators for role checking
def super_admin_required(view_func):
    return role_required('super_admin')(view_func)

def administrator_required(view_func):
    return role_required('super_admin', 'administrator')(view_func)

def bdm_required(view_func):
    return role_required('super_admin', 'bdm')(view_func)

def sales_executive_required(view_func):
    return role_required('super_admin', 'sales_executive')(view_func)

def hr_manager_required(view_func):
    return role_required('super_admin', 'hr_manager')(view_func)

def content_manager_required(view_func):
    return role_required('super_admin', 'content_manager')(view_func)

def support_executive_required(view_func):
    return role_required('super_admin', 'support_executive')(view_func)

def client_user_required(view_func):
    return role_required('super_admin', 'client_user')(view_func)

