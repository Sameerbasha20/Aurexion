from rest_framework import serializers
from apps.portal.models import SupportTicket, ClientProject, ClientRequest, ClientDocument
from django.contrib.auth import get_user_model

User = get_user_model()


class SupportTicketListSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client_user.username', read_only=True)
    assigned_username = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)

    class Meta:
        model = SupportTicket
        fields = (
            'id', 'ticket_id', 'subject', 'category', 'priority', 'status',
            'client_username', 'assigned_username', 'created_at', 'updated_at'
        )
        read_only_fields = fields


class SupportTicketDetailSerializer(serializers.ModelSerializer):
    client_user = serializers.StringRelatedField(read_only=True)
    assigned_to = serializers.StringRelatedField(read_only=True, allow_null=True)
    client_user_id = serializers.IntegerField(source='client_user.id', read_only=True)
    assigned_to_id = serializers.IntegerField(source='assigned_to.id', read_only=True, allow_null=True)

    class Meta:
        model = SupportTicket
        fields = (
            'id', 'ticket_id', 'client_user', 'client_user_id', 'assigned_to', 'assigned_to_id',
            'subject', 'category', 'priority', 'status', 'resolution_notes',
            'created_at', 'updated_at', 'closed_at'
        )
        read_only_fields = (
            'id', 'ticket_id', 'client_user', 'client_user_id', 'assigned_to', 'assigned_to_id',
            'created_at', 'updated_at', 'closed_at'
        )


class ClientTicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ('subject', 'category', 'priority')
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
        fields = ('subject', 'category', 'priority', 'resolution_notes')
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
        fields = ('subject', 'category', 'priority', 'status', 'assigned_to', 'resolution_notes')
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
            if not hasattr(value, 'profile') or value.profile.role != 'support_executive':
                raise serializers.ValidationError("Assigned user must have support_executive role.")
        return value

    def validate(self, attrs):
        instance = self.instance
        new_status = attrs.get('status', instance.status if instance else 'open')

        if instance and instance.status == 'closed' and new_status != 'closed':
            raise serializers.ValidationError("Cannot reopen a closed ticket.")

        if new_status == 'closed':
            resolution_notes = attrs.get('resolution_notes', instance.resolution_notes if instance else '')
            if attrs.get('resolution_notes') == '':
                raise serializers.ValidationError("Resolution notes are required to close a ticket.")
            elif not resolution_notes or not resolution_notes.strip():
                attrs['resolution_notes'] = 'Resolved and closed'

        return attrs


class AdministratorTicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ('subject', 'category', 'priority', 'status', 'assigned_to', 'resolution_notes', 'client_user')
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
            if not hasattr(value, 'profile') or value.profile.role != 'support_executive':
                raise serializers.ValidationError("Assigned user must have support_executive role.")
        return value

    def validate_client_user(self, value):
        if value is not None:
            if not hasattr(value, 'profile') or value.profile.role != 'client_user':
                raise serializers.ValidationError("Client user must have client_user role.")
        return value

    def validate(self, attrs):
        instance = self.instance
        new_status = attrs.get('status', instance.status if instance else 'open')
        if instance and instance.status == 'closed' and new_status != 'closed':
            raise serializers.ValidationError("Cannot reopen a closed ticket.")
        if new_status == 'closed':
            resolution_notes = attrs.get('resolution_notes', instance.resolution_notes if instance else '')
            if attrs.get('resolution_notes') == '':
                raise serializers.ValidationError("Resolution notes are required to close a ticket.")
            elif not resolution_notes or not resolution_notes.strip():
                attrs['resolution_notes'] = 'Resolved and closed'
        return attrs


class ClientProjectSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ClientProject
        fields = (
            'id', 'title', 'description', 'status', 'status_display',
            'progress_percentage', 'start_date', 'target_completion_date',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ClientRequestSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ClientRequest
        fields = (
            'id', 'title', 'category', 'description', 'priority', 'status', 'status_display',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')


class ClientDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True, allow_null=True)

    class Meta:
        model = ClientDocument
        fields = (
            'id', 'project', 'project_title', 'title', 'document_type',
            'document_type_display', 'file_url', 'file_size', 'uploaded_at'
        )
        read_only_fields = ('id', 'uploaded_at')