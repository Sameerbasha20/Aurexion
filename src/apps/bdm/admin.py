from django.contrib import admin
from .models import BdmLead, BdmFollowUp
from apps.crm.admin import LeadFollowUpInline, LeadNoteInline


@admin.register(BdmLead)
class BdmLeadAdmin(admin.ModelAdmin):
    list_display = (
        "reference_id",
        "name",
        "company",
        "status",
        "priority",
        "assigned_to",
        "next_follow_up_at",
        "created_at",
    )
    list_filter = (
        "status",
        "priority",
        "assigned_to",
        "industry",
        "source",
        "created_at",
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
            "BDM Pipeline Lead Info",
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
            "Target Industry & Lead Source",
            {
                "fields": (
                    "industry",
                    "source",
                    "description",
                )
            },
        ),
        (
            "Deal Status & Priority",
            {
                "fields": (
                    "status",
                    "priority",
                    "lost_reason",
                )
            },
        ),
        (
            "Account Executive Assignment & Schedule",
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
            "Audit Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    actions = ["reassign_to_current_user", "mark_as_proposal_submitted", "mark_as_won"]

    @admin.action(description="Assign selected leads to current user")
    def reassign_to_current_user(self, request, queryset):
        if request is not None and getattr(request, "user", None):
            updated = queryset.update(assigned_to=request.user)
            self.message_user(request, f"{updated} lead(s) reassigned to {request.user.username}.")
        else:
            queryset.update(assigned_to=None)

    @admin.action(description="Mark selected leads as Proposal Submitted")
    def mark_as_proposal_submitted(self, request, queryset):
        updated = queryset.update(status=BdmLead.Status.PROPOSAL_SUBMITTED)
        if request is not None:
            self.message_user(request, f"{updated} lead(s) updated to Proposal Submitted.")

    @admin.action(description="Mark selected leads as Won")
    def mark_as_won(self, request, queryset):
        updated = queryset.update(status=BdmLead.Status.WON)
        if request is not None:
            self.message_user(request, f"{updated} lead(s) updated to Won.")


@admin.register(BdmFollowUp)
class BdmFollowUpAdmin(admin.ModelAdmin):
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

