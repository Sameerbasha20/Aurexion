from django.contrib.auth.models import User
from rest_framework import serializers

from apps.authentication.models import AuditLog
from apps.crm.models import Lead, LeadFollowUp, LeadNote, RFPEnquiry
from django.utils.html import strip_tags


class RFPEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = RFPEnquiry
        fields = '__all__'

    def validate_document_attachment(self, value):
        if value:
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size cannot exceed 10MB.")
            ext = value.name.split('.')[-1].lower()
            if ext not in ['pdf', 'docx', 'zip']:
                raise serializers.ValidationError("Only PDF, DOCX, and ZIP files are allowed.")
            
            from apps.crm.validators import validate_magic_bytes
            try:
                validate_magic_bytes(value)
            except Exception as e:
                raise serializers.ValidationError(str(e))
        return value


class LeadSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True, default=None)
    assigned_to_email = serializers.CharField(source="assigned_to.email", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)
    follow_up_count = serializers.SerializerMethodField()
    note_count = serializers.SerializerMethodField()

    def get_follow_up_count(self, obj):
        if hasattr(obj, 'follow_up_count'):
            return obj.follow_up_count
        if 'follow_ups' in getattr(obj, '_prefetched_objects_cache', {}):
            return len(obj.follow_ups.all())
        return obj.follow_ups.count()

    def get_note_count(self, obj):
        if hasattr(obj, 'note_count'):
            return obj.note_count
        if 'notes' in getattr(obj, '_prefetched_objects_cache', {}):
            return len(obj.notes.all())
        return obj.notes.count()
    rfp_enquiry_details = serializers.SerializerMethodField()

    def get_rfp_enquiry_details(self, obj):
        if not getattr(obj, 'rfp_enquiry_id', None):
            return None
        rfp = getattr(obj, 'rfp_enquiry', None)
        if not rfp:
            return None
        return {
            "id": rfp.id,
            "reference_id": rfp.reference_id,
            "full_name": rfp.full_name,
            "company_name": rfp.company_name,
            "work_email": rfp.work_email,
            "phone": rfp.phone,
            "designation": rfp.designation,
            "country": rfp.country,
            "project_type": rfp.project_type,
            "budget_range": rfp.budget_range,
            "project_description": rfp.project_description,
            "nda_required": rfp.nda_required,
            "created_at": rfp.created_at,
        }

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
            "value",
            "lost_reason",
            "client_onboarded",
            "assigned_to",
            "assigned_to_name",
            "assigned_to_email",
            "created_by",
            "created_by_name",
            "last_contacted_at",
            "next_follow_up_at",
            "follow_up_count",
            "note_count",
            "rfp_enquiry_details",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference_id",
            "status",
            "status_display",
            "priority_display",
            "client_onboarded",
            "assigned_to_name",
            "assigned_to_email",
            "created_by",
            "created_by_name",
            "follow_up_count",
            "note_count",
            "rfp_enquiry_details",
            "created_at",
            "updated_at",
            "last_contacted_at",
        ]

    def validate(self, attrs):
        for field in ['name', 'description', 'company', 'website', 'industry', 'source', 'subject']:
            if field in attrs and isinstance(attrs[field], str):
                attrs[field] = strip_tags(attrs[field])
        return super().validate(attrs)


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
            "meeting_link",
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
    follow_up_type = serializers.CharField(required=False, default="email")
    meeting_link = serializers.URLField(required=False, allow_blank=True)

    def validate_follow_up_type(self, value):
        if not value:
            return "email"
        val = str(value).lower()
        if "email" in val:
            return "email"
        if "meet" in val:
            return "meeting"
        if "phone" in val or "call" in val:
            return "phone"
        if "whatsapp" in val:
            return "whatsapp"
        if "linkedin" in val:
            return "linkedin"
        return "other"

    def validate(self, attrs):
        follow_up_type = attrs.get("follow_up_type", "")
        meeting_link = attrs.get("meeting_link", "")
        if "meet" in follow_up_type.lower() and not meeting_link:
            raise serializers.ValidationError({"meeting_link": "Meeting link is required for meeting type follow-ups."})
        return attrs

    class Meta:
        model = LeadFollowUp
        fields = ["assigned_to", "follow_up_type", "scheduled_at", "notes", "meeting_link"]
        read_only_fields = []


class LeadFollowUpUpdateSerializer(serializers.ModelSerializer):
    follow_up_type = serializers.CharField(required=False, default="email")
    meeting_link = serializers.URLField(required=False, allow_blank=True)

    def validate_follow_up_type(self, value):
        if not value:
            return "email"
        val = str(value).lower()
        if "email" in val:
            return "email"
        if "meet" in val:
            return "meeting"
        if "phone" in val or "call" in val:
            return "phone"
        if "whatsapp" in val:
            return "whatsapp"
        if "linkedin" in val:
            return "linkedin"
        return "other"

    def validate(self, attrs):
        follow_up_type = attrs.get("follow_up_type", "")
        meeting_link = attrs.get("meeting_link", "")
        if "meet" in follow_up_type.lower() and not meeting_link:
            raise serializers.ValidationError({"meeting_link": "Meeting link is required for meeting type follow-ups."})
        return attrs

    class Meta:
        model = LeadFollowUp
        fields = ["follow_up_type", "scheduled_at", "status", "notes", "meeting_link"]
        read_only_fields = []


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


class LeadWonSerializer(serializers.Serializer):
    value = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=0, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class LeadScheduleMeetingSerializer(serializers.Serializer):
    scheduled_at = serializers.DateTimeField(required=True)
    follow_up_type = serializers.CharField(required=False, default="meeting")
    meeting_link = serializers.URLField(required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")





