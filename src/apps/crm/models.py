from django.contrib.auth.models import User
from django.db import models


class LeadStatus(models.TextChoices):
    NEW = "new", "New"
    UNDER_REVIEW = "under_review", "Under Review"
    CONTACTED = "contacted", "Contacted"
    QUALIFIED = "qualified", "Qualified"
    PROPOSAL_SUBMITTED = "proposal_submitted", "Proposal Submitted"
    NEGOTIATION = "negotiation", "Negotiation"
    WON = "won", "Won"
    LOST = "lost", "Lost"


class LeadPriority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class LeadFollowUpStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class LeadFollowUpType(models.TextChoices):
    PHONE = "phone", "Phone Call"
    EMAIL = "email", "Email"
    MEETING = "meeting", "Meeting"
    WHATSAPP = "whatsapp", "WhatsApp"
    LINKEDIN = "linkedin", "LinkedIn"
    OTHER = "other", "Other"


class Lead(models.Model):
    # Aliases retained for a concise service-layer API (Lead.Status.NEW).
    Status = LeadStatus
    Priority = LeadPriority

    # Statuses that end the lead lifecycle and cannot transition further.
    TERMINAL_STATUSES = {LeadStatus.WON, LeadStatus.LOST}

    # Statuses considered "active opportunities" for pipeline reporting.
    OPPORTUNITY_STATUSES = {
        LeadStatus.QUALIFIED,
        LeadStatus.PROPOSAL_SUBMITTED,
        LeadStatus.NEGOTIATION,
    }

    reference_id = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    name = models.CharField(
        max_length=255,
    )

    email = models.EmailField(
        blank=True,
    )

    phone = models.CharField(
        max_length=30,
        blank=True,
    )

    company = models.CharField(
        max_length=255,
        blank=True,
    )

    website = models.URLField(
        max_length=255,
        blank=True,
    )

    industry = models.CharField(
        max_length=100,
        blank=True,
    )

    source = models.CharField(
        max_length=100,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.NEW,
    )

    priority = models.CharField(
        max_length=10,
        choices=LeadPriority.choices,
        default=LeadPriority.MEDIUM,
    )

    value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        null=True,
        blank=True,
        help_text="Agreed project cost / deal value.",
    )

    lost_reason = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Business reason captured when a lead is marked as lost.",
    )

    client_onboarded = models.BooleanField(
        default=False,
        help_text="True once BDM reviews details, onboards client, and dispatches portal credentials.",
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_leads",
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_leads",
    )

    last_contacted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    next_follow_up_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(
                fields=["status"],
                name="crm_lead_status_idx",
            ),
            models.Index(
                fields=["assigned_to"],
                name="crm_lead_assigned_idx",
            ),
            models.Index(
                fields=["created_at"],
                name="crm_lead_created_idx",
            ),
            models.Index(
                fields=["priority"],
                name="crm_lead_priority_idx",
            ),
            models.Index(
                fields=["industry"],
                name="crm_lead_industry_idx",
            ),
            models.Index(
                fields=["next_follow_up_at"],
                name="crm_lead_next_followup_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=LeadStatus.values),
                name="crm_lead_status_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(priority__in=LeadPriority.values),
                name="crm_lead_priority_valid",
            ),
        ]

    def __str__(self):
        return f"{self.reference_id} - {self.name} ({self.get_status_display()})"


class LeadFollowUp(models.Model):
    """
    Represents a follow-up activity associated with a lead.
    A lead can have multiple follow-ups.
    """

    # Aliases retained for a concise service-layer API.
    Status = LeadFollowUpStatus
    FollowUpType = LeadFollowUpType

    # Open statuses used for overdue / next-follow-up computation.
    OPEN_STATUSES = {LeadFollowUpStatus.PENDING, LeadFollowUpStatus.IN_PROGRESS}

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="follow_ups",
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lead_follow_ups",
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_lead_follow_ups",
    )

    follow_up_type = models.CharField(
        max_length=20,
        choices=LeadFollowUpType.choices,
        default=LeadFollowUpType.OTHER,
    )

    scheduled_at = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=LeadFollowUpStatus.choices,
        default=LeadFollowUpStatus.PENDING,
    )

    notes = models.TextField(
        blank=True,
    )

    meeting_link = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Meeting link (Google Meet, Zoom, Teams, etc.)",
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["scheduled_at"]

        indexes = [
            models.Index(
                fields=["lead", "scheduled_at"],
                name="crm_followup_lead_date_idx",
            ),
            models.Index(
                fields=["scheduled_at"],
                name="crm_followup_scheduled_idx",
            ),
            models.Index(
                fields=["status"],
                name="crm_followup_status_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=LeadFollowUpStatus.values),
                name="crm_followup_status_valid",
            ),
        ]

    def __str__(self):
        return f"Follow-up for {self.lead.name} - {self.scheduled_at}"


class LeadNote(models.Model):
    """
    Represents a note added to a lead.
    A lead can have multiple notes.
    """

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="notes",
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_lead_notes",
    )

    content = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(
                fields=["lead", "created_at"],
                name="crm_note_lead_created_idx",
            ),
        ]

    def __str__(self):
        return f"Note for {self.lead.name}"


class EstimatorSubmission(models.Model):
    """
    Model for storing requirement calculation estimates submitted via the Interactive Estimator tool.
    """
    project_scope = models.JSONField(default=list)
    platform_scale = models.CharField(max_length=50, default="medium")
    user_scale = models.CharField(max_length=50, default="10k")
    compliance_requirements = models.JSONField(default=list)
    engineering_effort_hours = models.IntegerField(default=0)
    indicative_budget_min = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    indicative_budget_max = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"EstimatorSubmission #{self.id} ({self.engineering_effort_hours} hrs)"


class RFPEnquiry(models.Model):
    reference_id = models.CharField(max_length=30, unique=True, editable=False)
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    work_email = models.EmailField()
    phone = models.CharField(max_length=50)
    designation = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    project_type = models.CharField(max_length=100)
    budget_range = models.CharField(max_length=100)
    project_description = models.TextField()
    document_attachment = models.FileField(upload_to='rfps/%Y/%m/', null=True, blank=True)
    nda_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.reference_id:
            import datetime
            year = datetime.datetime.now().year
            count = RFPEnquiry.objects.filter(created_at__year=year).count() + 1
            self.reference_id = f"AUR-RFP-{year}-{count:05d}"
        super().save(*args, **kwargs)


