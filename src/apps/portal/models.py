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
        year = timezone.now().year
        prefix = f"TKT-{year}-"
        count = SupportTicket.objects.filter(ticket_id__startswith=prefix).count()
        return f"{prefix}{count + 1:05d}"