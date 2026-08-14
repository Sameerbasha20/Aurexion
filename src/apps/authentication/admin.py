from django.contrib import admin
from .models import UserProfile, AuditLog


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email", "role")
    raw_id_fields = ("user",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "module", "object_id", "timestamp")
    list_filter = ("module", "action", "timestamp")
    search_fields = ("user__username", "action", "module", "object_id", "repr")
    readonly_fields = (
        "user",
        "action",
        "module",
        "object_id",
        "repr",
        "previous_state",
        "updated_state",
        "ip_address",
        "user_agent",
        "timestamp",
    )

