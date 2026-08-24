from django.contrib import admin
from apps.administration.models import Role, ModulePermission

class ModulePermissionInline(admin.TabularInline):
    model = ModulePermission
    extra = 0

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'description')
    search_fields = ('code', 'name')
    inlines = [ModulePermissionInline]

@admin.register(ModulePermission)
class ModulePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'module', 'can_create', 'can_read', 'can_update', 'can_delete')
    list_filter = ('module', 'role')
    search_fields = ('role__name', 'module')
