from django.contrib import admin
from .models import JobVacancy, CandidateApplication, ApplicationNote

@admin.register(JobVacancy)
class JobVacancyAdmin(admin.ModelAdmin):
    list_display = ('job_id', 'title', 'department', 'location', 'status', 'created_at')
    list_filter = ('status', 'department', 'location')
    search_fields = ('job_id', 'title', 'department')

@admin.register(CandidateApplication)
class CandidateApplicationAdmin(admin.ModelAdmin):
    list_display = ('tracking_code', 'first_name', 'last_name', 'job_vacancy', 'stage', 'created_at')
    list_filter = ('stage', 'job_vacancy')
    search_fields = ('tracking_code', 'email', 'first_name', 'last_name')

@admin.register(ApplicationNote)
class ApplicationNoteAdmin(admin.ModelAdmin):
    list_display = ('application', 'author', 'created_at')
