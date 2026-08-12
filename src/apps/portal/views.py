from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.utils.decorators import method_decorator
from django.views import View
from django.http import HttpResponseForbidden

from apps.authentication.models import UserProfile, AuditLog
from apps.authentication.audit import log_audit_event, get_model_state

def get_user_role(user):
    return user.profile.role if hasattr(user, 'profile') else 'client_user'

class PortalLoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('portal:dashboard')
        return render(request, 'authentication/login.html')

    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.is_active:
                auth_login(request, user)
                log_audit_event(
                    user=user,
                    action='LOGIN_SUCCESS',
                    module='authentication',
                    repr_str=f"Successful login for user: {username} via Web UI",
                    request=request
                )
                role = get_user_role(user)
                if role in ['super_admin', 'administrator']:
                    return redirect('portal:dashboard')
                else:
                    return redirect('portal:dashboard') # Client portal or generic dashboard
            else:
                messages.error(request, "This account is inactive.")
        else:
            try:
                db_user = User.objects.get(username=username)
            except User.DoesNotExist:
                db_user = None
            log_audit_event(
                user=db_user,
                action='LOGIN_FAILURE',
                module='authentication',
                repr_str=f"Failed login attempt for username: {username} via Web UI",
                request=request
            )
            messages.error(request, "Invalid username or password.")
            
        return render(request, 'authentication/login.html')

class PortalLogoutView(View):
    def get(self, request):
        if request.user.is_authenticated:
            log_audit_event(
                user=request.user,
                action='LOGOUT',
                module='authentication',
                repr_str=f"Successful logout for user: {request.user.username}",
                request=request
            )
            auth_logout(request)
        return redirect('portal:login')

class DashboardView(View):
    @method_decorator(login_required(login_url='portal:login'))
    def dispatch(self, request, *args, **kwargs):
        role = get_user_role(request.user)
        if role not in ['super_admin', 'administrator']:
            return render(request, 'errors/403.html', status=403)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        role = get_user_role(request.user)
        users = User.objects.select_related('profile').all().order_by('-date_joined')
        
        # Super admin can view all logs, administrators cannot
        logs = None
        if role == 'super_admin':
            logs = AuditLog.objects.select_related('user').all().order_by('-timestamp')[:50]

        context = {
            'users': users,
            'current_user_role': role,
            'logs': logs,
            'role_choices': UserProfile.ROLE_CHOICES,
        }
        return render(request, 'portal/dashboard.html', context)

    def post(self, request):
        action = request.POST.get('action')
        role = get_user_role(request.user)

        if action == 'update_role':
            user_id = request.POST.get('user_id')
            target_user = get_object_or_400(User, id=user_id)
            new_role = request.POST.get('role')
            
            # Security Constraint Checks (Prevent Privilege Escalation)
            # 1. Non-super_admin cannot assign super_admin
            if new_role == 'super_admin' and role != 'super_admin':
                messages.error(request, "Security constraint violation: Only Super Admins can assign the Super Admin role.")
                return redirect('portal:dashboard')

            # 2. Non-super_admin cannot modify super_admin accounts
            if hasattr(target_user, 'profile') and target_user.profile.role == 'super_admin' and role != 'super_admin':
                messages.error(request, "Security constraint violation: Only Super Admins can modify Super Admin accounts.")
                return redirect('portal:dashboard')

            # Save the changes
            prev_state = get_model_state(target_user)
            
            # Update user profile
            profile = target_user.profile
            old_role_display = profile.get_role_display()
            profile.role = new_role
            profile.save()
            
            updated_state = get_model_state(target_user)

            # Log Audit trail
            log_audit_event(
                user=request.user,
                action='UPDATE',
                module='authentication',
                object_id=target_user.id,
                repr_str=f"Updated role of user {target_user.username} from {old_role_display} to {profile.get_role_display()}",
                previous_state=prev_state,
                updated_state=updated_state,
                request=request
            )
            messages.success(request, f"Successfully updated role for {target_user.username} to {profile.get_role_display()}.")
            
        return redirect('portal:dashboard')

def get_object_or_400(model, **kwargs):
    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        raise PermissionDenied("Target object not found.")
