from django.contrib import admin
from .models import Lead, LeadFollowUp, LeadNote


class LeadFollowUpInline(admin.TabularInline):
    model = LeadFollowUp
    extra = 0
    raw_id_fields = ("assigned_to", "created_by")
    fields = (
        "follow_up_type",
        "scheduled_at",
        "status",
        "assigned_to",
        "completed_at",
        "notes",
    )


class LeadNoteInline(admin.TabularInline):
    model = LeadNote
    extra = 0
    raw_id_fields = ("created_by",)
    fields = ("created_by", "content", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "reference_id",
        "name",
        "company",
        "email",
        "phone",
        "status",
        "priority",
        "assigned_to",
        "next_follow_up_at",
        "created_at",
    )
    list_filter = (
        "status",
        "priority",
        "industry",
        "source",
        "created_at",
        "assigned_to",
    )
    search_fields = (
        "reference_id",
        "name",
        "email",
        "phone",
        "company",
        "industry",
        "source",
        "description",
    )
    readonly_fields = ("reference_id", "created_at", "updated_at")
    raw_id_fields = ("created_by", "assigned_to")
    inlines = [LeadFollowUpInline, LeadNoteInline]

    fieldsets = (
        (
            "Lead Information",
            {
                "fields": (
                    "reference_id",
                    "name",
                    "company",
                    "email",
                    "phone",
                    "website",
                )
            },
        ),
        (
            "Categorization & Details",
            {
                "fields": (
                    "industry",
                    "source",
                    "description",
                )
            },
        ),
        (
            "Status & Pipeline Stage",
            {
                "fields": (
                    "status",
                    "priority",
                    "lost_reason",
                )
            },
        ),
        (
            "Assignment & Timings",
            {
                "fields": (
                    "created_by",
                    "assigned_to",
                    "last_contacted_at",
                    "next_follow_up_at",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    actions = ["mark_as_contacted", "mark_as_qualified"]

    @admin.action(description="Mark selected leads as Contacted")
    def mark_as_contacted(self, request, queryset):
        updated = queryset.update(status=Lead.Status.CONTACTED)
        if request is not None:
            self.message_user(request, f"{updated} lead(s) updated to Contacted.")

    @admin.action(description="Mark selected leads as Qualified")
    def mark_as_qualified(self, request, queryset):
        updated = queryset.update(status=Lead.Status.QUALIFIED)
        if request is not None:
            self.message_user(request, f"{updated} lead(s) updated to Qualified.")


@admin.register(LeadFollowUp)
class LeadFollowUpAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "lead",
        "follow_up_type",
        "scheduled_at",
        "status",
        "assigned_to",
        "created_by",
        "completed_at",
    )
    list_filter = ("status", "follow_up_type", "scheduled_at", "created_at")
    search_fields = ("lead__name", "lead__reference_id", "lead__company", "notes")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("lead", "assigned_to", "created_by")


@admin.register(LeadNote)
class LeadNoteAdmin(admin.ModelAdmin):
    list_display = ("id", "lead", "created_by", "short_content", "created_at")
    list_filter = ("created_at",)
    search_fields = ("lead__name", "lead__reference_id", "content")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("lead", "created_by")

    @admin.display(description="Content Preview")
    def short_content(self, obj):
        return obj.content[:60] + "..." if len(obj.content) > 60 else obj.content

