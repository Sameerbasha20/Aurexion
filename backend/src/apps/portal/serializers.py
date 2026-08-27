from rest_framework import serializers
from apps.portal.models import (
    SupportTicket,
    ClientProject,
    ProjectMilestone,
    SprintDeliverable,
    ClientRequest,
    ConsultationRequest,
    ClientDocument,
    ClientNotification,
)
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = ProjectMilestone
        fields = (
            'id', 'project', 'project_title', 'name', 'description',
            'status', 'status_display', 'planned_date', 'completion_date',
            'is_current', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class SprintDeliverableSerializer(serializers.ModelSerializer):
    delivery_status_display = serializers.CharField(source='get_delivery_status_display', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = SprintDeliverable
        fields = (
            'id', 'project', 'project_title', 'sprint_name', 'sprint_period',
            'deliverable_name', 'delivery_status', 'delivery_status_display',
            'completion_date', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class SupportTicketListSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client_user.username', read_only=True)
    assigned_username = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)
    project_title = serializers.CharField(source='project.title', read_only=True, allow_null=True)

    class Meta:
        model = SupportTicket
        fields = (
            'id', 'ticket_id', 'subject', 'category', 'priority', 'status',
            'client_username', 'assigned_username', 'project', 'project_title',
            'created_at', 'updated_at'
        )
        read_only_fields = fields


class SupportTicketDetailSerializer(serializers.ModelSerializer):
    client_user = serializers.StringRelatedField(read_only=True)
    assigned_to = serializers.StringRelatedField(read_only=True, allow_null=True)
    client_user_id = serializers.IntegerField(source='client_user.id', read_only=True)
    assigned_to_id = serializers.IntegerField(source='assigned_to.id', read_only=True, allow_null=True)
    project_title = serializers.CharField(source='project.title', read_only=True, allow_null=True)

    class Meta:
        model = SupportTicket
        fields = (
            'id', 'ticket_id', 'client_user', 'client_user_id', 'assigned_to', 'assigned_to_id',
            'project', 'project_title', 'subject', 'category', 'priority', 'status', 'resolution_notes',
            'created_at', 'updated_at', 'closed_at'
        )
        read_only_fields = (
            'id', 'ticket_id', 'client_user', 'client_user_id', 'assigned_to', 'assigned_to_id',
            'created_at', 'updated_at', 'closed_at'
        )


class ClientTicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ('subject', 'category', 'priority', 'project')
        read_only_fields = ('ticket_id', 'status', 'resolution_notes', 'closed_at', 'assigned_to')

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject is required.")
        if len(value) > 255:
            raise serializers.ValidationError("Subject must not exceed 255 characters.")
        return value

    def validate_category(self, value):
        valid_categories = dict(SupportTicket.CATEGORY_CHOICES).keys()
        if value not in valid_categories:
            raise serializers.ValidationError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return value

    def validate_priority(self, value):
        valid_priorities = dict(SupportTicket.PRIORITY_CHOICES).keys()
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Invalid priority. Must be one of: {', '.join(valid_priorities)}")
        return value


class ClientTicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ('subject', 'category', 'priority', 'project', 'resolution_notes')
        read_only_fields = ('ticket_id', 'status', 'closed_at', 'assigned_to', 'client_user')

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject is required.")
        if len(value) > 255:
            raise serializers.ValidationError("Subject must not exceed 255 characters.")
        return value

    def validate_category(self, value):
        valid_categories = dict(SupportTicket.CATEGORY_CHOICES).keys()
        if value not in valid_categories:
            raise serializers.ValidationError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return value

    def validate_priority(self, value):
        valid_priorities = dict(SupportTicket.PRIORITY_CHOICES).keys()
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Invalid priority. Must be one of: {', '.join(valid_priorities)}")
        return value

    def validate(self, attrs):
        instance = self.instance
        if instance and instance.status == 'closed':
            raise serializers.ValidationError("Cannot update a closed ticket.")
        return attrs


class SupportExecutiveTicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ('subject', 'category', 'priority', 'status', 'assigned_to', 'project', 'resolution_notes')
        read_only_fields = ('ticket_id', 'client_user', 'created_at', 'updated_at', 'closed_at')

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject is required.")
        if len(value) > 255:
            raise serializers.ValidationError("Subject must not exceed 255 characters.")
        return value

    def validate_category(self, value):
        valid_categories = dict(SupportTicket.CATEGORY_CHOICES).keys()
        if value not in valid_categories:
            raise serializers.ValidationError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return value

    def validate_priority(self, value):
        valid_priorities = dict(SupportTicket.PRIORITY_CHOICES).keys()
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Invalid priority. Must be one of: {', '.join(valid_priorities)}")
        return value

    def validate_status(self, value):
        valid_statuses = dict(SupportTicket.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        return value

    def validate_assigned_to(self, value):
        if value is not None:
            role = getattr(getattr(value, 'profile', None), 'role', None)
            if role not in ('support_executive', 'administrator', 'super_admin') and not value.is_superuser:
                raise serializers.ValidationError("Assigned user must have support_executive or administrator role.")
        return value

    def validate(self, attrs):
        instance = self.instance
        if not instance:
            return attrs

        current_status = instance.status
        new_status = attrs.get('status', current_status)

        if current_status == 'closed':
            if new_status != 'closed':
                raise serializers.ValidationError("Cannot reopen a closed ticket.")
            raise serializers.ValidationError("Cannot modify a closed ticket.")

        allowed_transitions = {
            'open': {'open', 'assigned', 'in_progress', 'awaiting_client', 'resolved', 'closed'},
            'assigned': {'assigned', 'in_progress', 'awaiting_client', 'resolved', 'open', 'closed'},
            'in_progress': {'in_progress', 'awaiting_client', 'resolved', 'assigned', 'open', 'closed'},
            'awaiting_client': {'awaiting_client', 'resolved', 'in_progress', 'assigned', 'open', 'closed'},
            'resolved': {'resolved', 'closed', 'awaiting_client', 'in_progress', 'assigned', 'open'},
            'closed': {'closed'},
        }

        allowed = allowed_transitions.get(current_status, {current_status})
        if new_status not in allowed:
            raise serializers.ValidationError(
                f"Invalid status transition from {current_status} to {new_status}."
            )

        if new_status in ('resolved', 'closed'):
            resolution_notes = attrs.get('resolution_notes', instance.resolution_notes)
            if not resolution_notes or not resolution_notes.strip():
                if new_status == 'closed':
                    attrs['resolution_notes'] = "Closed by Support Executive."
                else:
                    raise serializers.ValidationError("Resolution notes are required before resolving this ticket.")

        return attrs


class AdministratorTicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ('subject', 'category', 'priority', 'status', 'assigned_to', 'project', 'resolution_notes', 'client_user')
        read_only_fields = ('ticket_id', 'created_at', 'updated_at', 'closed_at')

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject is required.")
        if len(value) > 255:
            raise serializers.ValidationError("Subject must not exceed 255 characters.")
        return value

    def validate_category(self, value):
        valid_categories = dict(SupportTicket.CATEGORY_CHOICES).keys()
        if value not in valid_categories:
            raise serializers.ValidationError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return value

    def validate_priority(self, value):
        valid_priorities = dict(SupportTicket.PRIORITY_CHOICES).keys()
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Invalid priority. Must be one of: {', '.join(valid_priorities)}")
        return value

    def validate_status(self, value):
        valid_statuses = dict(SupportTicket.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        return value

    def validate_assigned_to(self, value):
        if value is not None:
            role = getattr(getattr(value, 'profile', None), 'role', None)
            if role not in ('support_executive', 'administrator', 'super_admin') and not value.is_superuser:
                raise serializers.ValidationError("Assigned user must have support_executive or administrator role.")
        return value

    def validate_client_user(self, value):
        if value is not None:
            if not hasattr(value, 'profile') or value.profile.role != 'client_user':
                raise serializers.ValidationError("Client user must have client_user role.")
        return value

    def validate(self, attrs):
        instance = self.instance
        if not instance:
            return attrs

        current_status = instance.status
        new_status = attrs.get('status', current_status)

        if current_status == 'closed':
            if new_status != 'closed':
                raise serializers.ValidationError("Cannot reopen a closed ticket.")
            raise serializers.ValidationError("Cannot modify a closed ticket.")

        allowed_transitions = {
            'open': {'open', 'assigned', 'in_progress', 'awaiting_client', 'resolved', 'closed'},
            'assigned': {'assigned', 'in_progress', 'awaiting_client', 'resolved', 'open', 'closed'},
            'in_progress': {'in_progress', 'awaiting_client', 'resolved', 'assigned', 'open', 'closed'},
            'awaiting_client': {'awaiting_client', 'resolved', 'in_progress', 'assigned', 'open', 'closed'},
            'resolved': {'resolved', 'closed', 'awaiting_client', 'in_progress', 'assigned', 'open'},
            'closed': {'closed'},
        }

        allowed = allowed_transitions.get(current_status, {current_status})
        if new_status not in allowed:
            raise serializers.ValidationError(
                f"Invalid status transition from {current_status} to {new_status}."
            )

        if new_status in ('resolved', 'closed'):
            resolution_notes = attrs.get('resolution_notes', instance.resolution_notes)
            if not resolution_notes or not resolution_notes.strip():
                if new_status == 'closed':
                    attrs['resolution_notes'] = "Closed by Administrator."
                else:
                    raise serializers.ValidationError("Resolution notes are required before resolving this ticket.")

        return attrs


class ClientProjectSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True, default='New Project')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    milestones = ProjectMilestoneSerializer(many=True, read_only=True)
    deliverables = SprintDeliverableSerializer(many=True, read_only=True)
    current_milestone = serializers.SerializerMethodField()
    next_milestone = serializers.SerializerMethodField()

    class Meta:
        model = ClientProject
        fields = (
            'id', 'title', 'description', 'status', 'status_display',
            'progress_percentage', 'delivery_lead_name', 'start_date', 'target_completion_date',
            'milestones', 'deliverables', 'current_milestone', 'next_milestone',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if 'name' in data and not data.get('title'):
                data['title'] = data['name']
        return super().to_internal_value(data)

    def get_current_milestone(self, obj):
        milestones = list(obj.milestones.all())
        curr = next((m for m in milestones if m.is_current), None)
        if not curr:
            curr = next((m for m in milestones if m.status == 'in_progress'), None)
        return ProjectMilestoneSerializer(curr).data if curr else None

    def get_next_milestone(self, obj):
        import datetime
        milestones = list(obj.milestones.all())
        upcoming = [m for m in milestones if m.status == 'upcoming']
        if upcoming:
            upcoming.sort(key=lambda m: (m.planned_date or datetime.date.max, m.created_at))
            return ProjectMilestoneSerializer(upcoming[0]).data
        return None


class ClientRequestSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True, default='New Request')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True, allow_null=True)

    class Meta:
        model = ClientRequest
        fields = (
            'id', 'project', 'project_title', 'title', 'category', 'description', 'priority', 'status', 'status_display',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if 'subject' in data and not data.get('title'):
                data['title'] = data['subject']
            if 'topic' in data and not data.get('title'):
                data['title'] = data['topic']
        return super().to_internal_value(data)


class ConsultationRequestSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True, default='Consultation Meeting')
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True, allow_null=True)

    class Meta:
        model = ConsultationRequest
        fields = (
            'id', 'project', 'project_title', 'request_type', 'request_type_display',
            'title', 'description', 'preferred_date', 'scheduled_at', 'meeting_link',
            'status', 'status_display', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'status', 'scheduled_at', 'meeting_link', 'created_at', 'updated_at')

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if 'subject' in data and not data.get('title'):
                data['title'] = data['subject']
            if 'topic' in data and not data.get('title'):
                data['title'] = data['topic']
        return super().to_internal_value(data)


class ClientDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True, allow_null=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = ClientDocument
        fields = (
            'id', 'project', 'project_title', 'title', 'document_type',
            'document_type_display', 'file_url', 'file_size', 'download_url', 'uploaded_at'
        )
        read_only_fields = ('id', 'uploaded_at', 'download_url')

    def get_download_url(self, obj):
        return f"/api/v1/documents/{obj.id}/download/"


class ClientNotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = ClientNotification
        fields = (
            'id', 'title', 'message', 'notification_type', 'notification_type_display',
            'is_read', 'link', 'created_at'
        )
        read_only_fields = ('id', 'created_at')