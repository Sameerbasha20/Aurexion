from django.contrib.auth.models import User
from rest_framework import serializers

from apps.authentication.models import AuditLog
from apps.crm.models import Lead, LeadFollowUp, LeadNote


class LeadSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)
    follow_up_count = serializers.IntegerField(read_only=True, default=0)
    note_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Lead
        fields = [
            "id",
            "reference_id",
            "name",
            "email",
            "phone",
            "company",
            "website",
            "industry",
            "source",
            "description",
            "status",
            "status_display",
            "priority",
            "priority_display",
            "lost_reason",
            "assigned_to",
            "assigned_to_name",
            "created_by",
            "created_by_name",
            "last_contacted_at",
            "next_follow_up_at",
            "follow_up_count",
            "note_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference_id",
            "status",
            "status_display",
            "priority_display",
            "assigned_to_name",
            "created_by",
            "created_by_name",
            "follow_up_count",
            "note_count",
            "created_at",
            "updated_at",
            "last_contacted_at",
        ]


class LeadCreateSerializer(LeadSerializer):
    """Write serializer for creating leads (status/reference are server-managed)."""

    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    class Meta(LeadSerializer.Meta):
        fields = [
            "name",
            "email",
            "phone",
            "company",
            "website",
            "industry",
            "source",
            "description",
            "priority",
            "assigned_to",
            "next_follow_up_at",
        ]


class LeadUpdateSerializer(LeadSerializer):
    """Write serializer for updating leads (status/assignment via dedicated actions)."""

    class Meta(LeadSerializer.Meta):
        fields = [
            "name",
            "email",
            "phone",
            "company",
            "website",
            "industry",
            "source",
            "description",
            "priority",
            "next_follow_up_at",
        ]


class LeadAssignSerializer(serializers.Serializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=True,
    )


class LeadStatusTransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Lead.Status.choices)


class LeadLostSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={"blank": "A reason is required when a lead is marked as lost."},
    )


class LeadFollowUpSerializer(serializers.ModelSerializer):
    follow_up_type_display = serializers.CharField(source="get_follow_up_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)

    class Meta:
        model = LeadFollowUp
        fields = [
            "id",
            "lead",
            "assigned_to",
            "assigned_to_name",
            "created_by",
            "created_by_name",
            "follow_up_type",
            "follow_up_type_display",
            "scheduled_at",
            "status",
            "status_display",
            "notes",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "lead",
            "assigned_to_name",
            "created_by",
            "created_by_name",
            "follow_up_type_display",
            "status_display",
            "completed_at",
            "created_at",
            "updated_at",
        ]


class LeadFollowUpCreateSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = LeadFollowUp
        fields = ["assigned_to", "follow_up_type", "scheduled_at", "notes"]
        read_only_fields = []


class LeadFollowUpUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadFollowUp
        fields = ["follow_up_type", "scheduled_at", "status", "notes"]


class LeadNoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)

    class Meta:
        model = LeadNote
        fields = ["id", "content", "created_by", "created_by_name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_by", "created_by_name", "created_at", "updated_at"]


class PublicLeadCreateSerializer(serializers.ModelSerializer):
    """Public serializer for form submissions (estimator, RFP, contact forms)."""
    subject = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = Lead
        fields = [
            "name",
            "email",
            "phone",
            "company",
            "website",
            "industry",
            "source",
            "description",
            "subject",
            "priority",
        ]

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required for form submissions.")
        return value

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value.strip()

    def validate(self, attrs):
        subject = attrs.pop("subject", None)
        if subject:
            desc = attrs.get("description", "")
            attrs["description"] = f"Subject: {subject}\n\n{desc}" if desc else f"Subject: {subject}"
        return attrs


class LeadActivitySerializer(serializers.ModelSerializer):
    actor = serializers.CharField(source="user.username", read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = ["id", "action", "module", "object_id", "repr", "actor", "ip_address", "user_agent", "timestamp"]
        read_only_fields = fields
