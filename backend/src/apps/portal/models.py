from django.db import models
from django.conf import settings
from django.utils import timezone


STATUS_IN_PROGRESS_LABEL = 'In Progress'
STATUS_UNDER_REVIEW_LABEL = 'Under Review'
STATUS_COMPLETED_LABEL = 'Completed'


class SupportTicket(models.Model):
    CATEGORY_CHOICES = [
        ('bug', 'Bug'),
        ('enhancement', 'Enhancement'),
        ('security', 'Security'),
        ('infrastructure', 'Infrastructure'),
        ('incident', 'Operational Incident'),
        ('general', 'General'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('in_progress', STATUS_IN_PROGRESS_LABEL),
        ('awaiting_client', 'Awaiting Client'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    ticket_id = models.CharField(max_length=20, unique=True, db_index=True)
    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='support_tickets',
        limit_choices_to={'profile__role': 'client_user'}
    )
    project = models.ForeignKey(
        'ClientProject',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets',
        limit_choices_to={'profile__role': 'support_executive'}
    )
    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolution_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client_user', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['priority', 'status']),
        ]

    def __str__(self):
        return f"{self.ticket_id} - {self.subject}"

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            self.ticket_id = self.generate_ticket_id()
        if self.status == 'closed' and not self.closed_at:
            self.closed_at = timezone.now()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_ticket_id():
        year = timezone.now().year
        prefix = f"TKT-{year}-"
        last_ticket = SupportTicket.objects.filter(ticket_id__startswith=prefix).order_by('-created_at', '-id').first()
        if last_ticket:
            try:
                num = int(last_ticket.ticket_id.rsplit('-', 1)[1]) + 1
            except (ValueError, IndexError):
                num = SupportTicket.objects.filter(ticket_id__startswith=prefix).count() + 1
        else:
            num = 1
        candidate = f"{prefix}{num:05d}"
        while SupportTicket.objects.filter(ticket_id=candidate).exists():
            num += 1
            candidate = f"{prefix}{num:05d}"
        return candidate


class ClientProject(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', STATUS_IN_PROGRESS_LABEL),
        ('under_review', STATUS_UNDER_REVIEW_LABEL),
        ('completed', STATUS_COMPLETED_LABEL),
        ('on_hold', 'On Hold'),
    ]

    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_projects'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    progress_percentage = models.IntegerField(default=0)
    delivery_lead_name = models.CharField(max_length=255, blank=True, default='')
    start_date = models.DateField(null=True, blank=True)
    target_completion_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class ProjectMilestone(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('in_progress', STATUS_IN_PROGRESS_LABEL),
        ('completed', STATUS_COMPLETED_LABEL),
        ('delayed', 'Delayed'),
    ]

    project = models.ForeignKey(
        ClientProject,
        on_delete=models.CASCADE,
        related_name='milestones'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    planned_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['planned_date', 'created_at']

    def __str__(self):
        return f"{self.name} - {self.project.title}"


class SprintDeliverable(models.Model):
    STATUS_CHOICES = [
        ('completed', STATUS_COMPLETED_LABEL),
        ('in_progress', STATUS_IN_PROGRESS_LABEL),
        ('pending', 'Pending'),
    ]

    project = models.ForeignKey(
        ClientProject,
        on_delete=models.CASCADE,
        related_name='deliverables'
    )
    sprint_name = models.CharField(max_length=255)
    sprint_period = models.CharField(max_length=100, blank=True, default='')
    deliverable_name = models.CharField(max_length=255)
    delivery_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    completion_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-completion_date', '-created_at']

    def __str__(self):
        return f"{self.sprint_name}: {self.deliverable_name}"


class ClientRequest(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', STATUS_UNDER_REVIEW_LABEL),
        ('approved', 'Approved'),
        ('in_progress', STATUS_IN_PROGRESS_LABEL),
        ('completed', STATUS_COMPLETED_LABEL),
        ('rejected', 'Rejected'),
    ]

    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_requests'
    )
    project = models.ForeignKey(
        ClientProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests'
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, default='General Request')
    description = models.TextField(blank=True, default='')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"


class ConsultationRequest(models.Model):
    TYPE_CHOICES = [
        ('technical_review', 'Technical Review Meeting'),
        ('status_call', 'Status Call'),
    ]

    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('under_review', STATUS_UNDER_REVIEW_LABEL),
        ('scheduled', 'Scheduled'),
        ('completed', STATUS_COMPLETED_LABEL),
        ('cancelled', 'Cancelled'),
    ]

    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consultation_requests'
    )
    project = models.ForeignKey(
        ClientProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consultations'
    )
    request_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='technical_review')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    preferred_date = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    meeting_link = models.CharField(max_length=500, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_request_type_display()} - {self.title} ({self.get_status_display()})"


class ClientDocument(models.Model):
    TYPE_CHOICES = [
        ('requirements', 'Project Requirements'),
        ('architecture', 'Architecture Diagram'),
        ('sow', 'SOW'),
        ('report', 'Report'),
        ('contract', 'Contract'),
        ('invoice', 'Invoice'),
        ('deliverable', 'Deliverable'),
        ('specification', 'Specification'),
        ('other', 'Other'),
    ]

    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_documents'
    )
    project = models.ForeignKey(
        ClientProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    file_url = models.CharField(max_length=500, blank=True, default='')
    file_size = models.CharField(max_length=50, blank=True, default='1.2 MB')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} ({self.get_document_type_display()})"


class ClientNotification(models.Model):
    TYPE_CHOICES = [
        ('ticket_update', 'Ticket Update'),
        ('project_update', 'Project Update'),
        ('milestone_update', 'Milestone Update'),
        ('document_available', 'Document Available'),
        ('consultation_update', 'Consultation Update'),
    ]

    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='project_update')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{'Read' if self.is_read else 'Unread'}] {self.title}"

