from django.contrib import admin
from .models import SupportTicket


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['ticket_id', 'subject', 'client_user', 'assigned_to', 'category', 'priority', 'status', 'created_at']
    list_filter = ['category', 'priority', 'status', 'created_at', 'assigned_to']
    search_fields = ['ticket_id', 'subject', 'client_user__email', 'client_user__username', 'assigned_to__email', 'assigned_to__username']
    ordering = ['-created_at']
    readonly_fields = ['ticket_id', 'created_at', 'updated_at', 'closed_at']
