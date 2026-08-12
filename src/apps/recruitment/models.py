from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class JobVacancy(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        CLOSED = 'CLOSED', _('Closed')

    job_id = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100, db_index=True)
    location = models.CharField(max_length=100, db_index=True)
    experience = models.CharField(max_length=100, db_index=True)
    skills = models.TextField()
    responsibilities = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_id} - {self.title}"


class CandidateApplication(models.Model):
    class Stage(models.TextChoices):
        RECEIVED = 'RECEIVED', _('Received')
        SHORTLISTED = 'SHORTLISTED', _('Shortlisted')
        INTERVIEWED = 'INTERVIEWED', _('Interviewed')
        OFFERED = 'OFFERED', _('Offered')
        REJECTED = 'REJECTED', _('Rejected')

    tracking_code = models.CharField(max_length=50, unique=True, db_index=True)
    job_vacancy = models.ForeignKey(JobVacancy, on_delete=models.CASCADE, related_name='applications', db_index=True)
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    resume_storage_path = models.CharField(max_length=500)
    
    stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.RECEIVED, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tracking_code} - {self.first_name} {self.last_name}"


class ApplicationNote(models.Model):
    application = models.ForeignKey(CandidateApplication, on_delete=models.CASCADE, related_name='notes', db_index=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='application_notes')
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note on {self.application.tracking_code} by {self.author}"
