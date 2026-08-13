from rest_framework import viewsets, serializers
from apps.administration.models import Role, ModulePermission
from apps.administration.serializers import RoleSerializer, ModulePermissionSerializer
from apps.administration.permissions import IsSuperAdmin
from apps.authentication.audit import log_audit_event

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related('permissions').all()
    serializer_class = RoleSerializer
    permission_classes = [IsSuperAdmin]

    def perform_create(self, serializer):
        role = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='CREATE',
            module='administration',
            object_id=role.id,
            repr_str=f"Created role: {role.name} ({role.code})",
            updated_state=RoleSerializer(role).data,
            request=self.request
        )

    def perform_update(self, serializer):
        role = self.get_object()
        prev_state = RoleSerializer(role).data
        
        # Save first
        updated_role = serializer.save()
        
        # Validate security constraints
        if updated_role.code == 'super_admin':
            for perm in updated_role.permissions.all():
                if perm.module in ['administration', 'authentication'] and not (perm.can_create and perm.can_read and perm.can_update and perm.can_delete):
                    raise serializers.ValidationError("Super Admin must have full permissions (CRUD) for 'administration' and 'authentication' modules.")
        
        log_audit_event(
            user=self.request.user,
            action='UPDATE',
            module='administration',
            object_id=updated_role.id,
            repr_str=f"Updated role: {updated_role.name} ({updated_role.code})",
            previous_state=prev_state,
            updated_state=RoleSerializer(updated_role).data,
            request=self.request
        )

    def perform_destroy(self, instance):
        role_id = instance.id
        role_name = instance.name
        role_code = instance.code
        prev_state = RoleSerializer(instance).data
        
        if role_code in ['super_admin', 'administrator']:
            raise serializers.ValidationError(f"Cannot delete system role: {role_name}")
            
        instance.delete()
        log_audit_event(
            user=self.request.user,
            action='DELETE',
            module='administration',
            object_id=role_id,
            repr_str=f"Deleted role: {role_name} ({role_code})",
            previous_state=prev_state,
            request=self.request
        )
