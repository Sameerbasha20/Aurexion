from django.db import models
from django.conf import settings
from django.utils import timezone


class SupportTicket(models.Model):
    CATEGORY_CHOICES = [
        ('bug', 'Bug'),
        ('enhancement', 'Enhancement'),
        ('security', 'Security'),
        ('infrastructure', 'Infrastructure'),
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
        ('in_progress', 'In Progress'),
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
        from django.db import connection
        year = timezone.now().year
        prefix = f"TKT-{year}-"
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM portal_supportticket WHERE ticket_id LIKE %s",
                [f"{prefix}%"]
            )
            count = cursor.fetchone()[0] + 1
        return f"{prefix}{count:05d}"


class ClientProject(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('under_review', 'Under Review'),
        ('completed', 'Completed'),
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
    start_date = models.DateField(null=True, blank=True)
    target_completion_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class ClientRequest(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]

    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_requests'
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


class ClientDocument(models.Model):
    TYPE_CHOICES = [
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