from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('administrator', 'Administrator'),
        ('bdm', 'Business Development Manager'),
        ('sales_executive', 'Sales Executive'),
        ('hr_manager', 'HR Manager'),
        ('content_manager', 'Content Manager'),
        ('support_executive', 'Support Executive'),
        ('client_user', 'Client User'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='client_user', db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    instance.profile.save()


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50)  # e.g., CREATE, UPDATE, DELETE, LOGIN_SUCCESS, LOGIN_FAILURE, EXPORT, TICKET_CLOSE
    module = models.CharField(max_length=100)  # e.g., authentication, cms, crm, portal, recruitment
    object_id = models.CharField(max_length=255, null=True, blank=True)
    repr = models.TextField(null=True, blank=True)  # String representation of object
    previous_state = models.JSONField(null=True, blank=True)
    updated_state = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            # Covers ORDER BY timestamp DESC queries (AuditLog list, dashboard recent
            # activities). Eliminates sequential scan as the table grows.
            models.Index(fields=['-timestamp'], name='auditlog_timestamp_idx'),
            # Covers WHERE module='crm' ORDER BY timestamp DESC queries
            # (BDM dashboard, CRM activity feeds). Composite index satisfies
            # both the filter and the sort in one index scan.
            models.Index(fields=['module', '-timestamp'], name='auditlog_module_timestamp_idx'),
            # Covers WHERE module='crm' AND object_id=X ORDER BY timestamp DESC
            # (Lead activity history). Eliminates full table scan on LeadViewSet.activities.
            models.Index(fields=['module', 'object_id', '-timestamp'], name='auditlog_mod_obj_ts_idx'),
        ]

    def __str__(self):
        return f"{self.user} - {self.action} on {self.module} ({self.timestamp})"


