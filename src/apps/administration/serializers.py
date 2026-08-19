from rest_framework import serializers
from apps.administration.models import Role, ModulePermission

class ModulePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModulePermission
        fields = ['id', 'module', 'can_create', 'can_read', 'can_update', 'can_delete']

class RoleSerializer(serializers.ModelSerializer):
    permissions = ModulePermissionSerializer(many=True, required=False)

    class Meta:
        model = Role
        fields = ['id', 'code', 'name', 'description', 'permissions']

    def create(self, validated_data):
        permissions_data = validated_data.pop('permissions', [])
        role = Role.objects.create(**validated_data)
        for perm_data in permissions_data:
            ModulePermission.objects.create(role=role, **perm_data)
        return role

    def update(self, instance, validated_data):
        permissions_data = validated_data.pop('permissions', [])
        
        # Update Role details
        instance.code = validated_data.get('code', instance.code)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # Update permissions
        existing_perms = {p.module: p for p in instance.permissions.all()}
        for perm_data in permissions_data:
            module = perm_data.get('module')
            if module in existing_perms:
                # Update existing
                perm_obj = existing_perms[module]
                perm_obj.can_create = perm_data.get('can_create', perm_obj.can_create)
                perm_obj.can_read = perm_data.get('can_read', perm_obj.can_read)
                perm_obj.can_update = perm_data.get('can_update', perm_obj.can_update)
                perm_obj.can_delete = perm_data.get('can_delete', perm_obj.can_delete)
                perm_obj.save()
            else:
                # Create new
                ModulePermission.objects.create(role=instance, **perm_data)
        return instance
