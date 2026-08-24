from rest_framework import permissions

from apps.administration.permissions import IsClientUser, IsSupportExecutive


class IsClientTicketOwner(IsClientUser):
    """
    Object-level permission for Client Users.

    View-level: only Client Users (and Super Admins) may use the client ticket API.
    Object-level: a Client User may only access tickets they created (horizontal
    access violations are denied with 403).
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        return obj.client_user_id == request.user.id


class IsSupportTicketAssignee(IsSupportExecutive):
    """
    Object-level permission for Support Executives.

    View-level: only Support Executives (and Super Admins) may use the support API.
    Object-level: a Support Executive may access tickets assigned to them or
    unassigned tickets (to claim/update status). Tickets assigned to another
    executive are denied.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if obj.assigned_to_id == request.user.id or obj.assigned_to_id is None:
            return True
        return False



class IsTicketAccessible(permissions.BasePermission):
    """
    View-level and object-level authorization for the unified Tickets REST API
    (`/api/v1/tickets/`), built on the existing role-based permission pattern.

    View-level:
      - unauthenticated requests are denied (-> 401 by DRF)
      - Super Admins bypass all checks
      - client_user, support_executive and administrator roles are admitted
      - all other roles are denied (-> 403)
      - only Client Users (or Super Admins) may create tickets

    Object-level:
      - Super Admins bypass
      - client_user may access tickets they created
      - support_executive may access tickets assigned to them
      - administrator may access any ticket
    """
    allowed_roles = ('client_user', 'support_executive', 'administrator')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser or (
            hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin'
        ):
            return True

        if not hasattr(request.user, 'profile'):
            return False

        role = request.user.profile.role
        if role not in self.allowed_roles:
            return False

        if getattr(view, 'action', None) == 'create':
            return role == 'client_user'

        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or (
            hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin'
        ):
            return True

        role = request.user.profile.role
        if role == 'client_user':
            return obj.client_user_id == request.user.id
        if role == 'support_executive':
            if request.method in permissions.SAFE_METHODS:
                return obj.assigned_to_id == request.user.id or obj.assigned_to_id is None
            return obj.assigned_to_id == request.user.id
        return True


from apps.administration.permissions import BaseRolePermission

class CanAccessAdminSupport(BaseRolePermission):
    allowed_roles = ['super_admin', 'administrator', 'admin', 'bdm', 'business_dev_manager', 'support_executive', 'support']

