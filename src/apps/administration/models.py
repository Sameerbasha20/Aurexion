from django.db import models

class Role(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['id']
        indexes = [
            models.Index(fields=['code'], name='admin_role_code_idx'),
            models.Index(fields=['name'], name='admin_role_name_idx'),
        ]

    def __str__(self):
        return self.name

class ModulePermission(models.Model):
    MODULE_CHOICES = [
        ('authentication', 'Authentication & User Management'),
        ('recruitment', 'Recruitment & ATS'),
        ('cms', 'Content Management System'),
        ('crm', 'Customer Relationship Management'),
        ('portal', 'Client Portal'),
        ('administration', 'Administration & Role Management'),
    ]

    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    can_create = models.BooleanField(default=False)
    can_read = models.BooleanField(default=False)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        unique_together = ('role', 'module')

    def __str__(self):
        return f"{self.role.name} - {self.module} (C:{self.can_create}, R:{self.can_read}, U:{self.can_update}, D:{self.can_delete})"
