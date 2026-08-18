from rest_framework import serializers

from apps.crm.models import Lead


class BdmPipelineSummarySerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Lead.Status.choices)
    total = serializers.IntegerField()


class BdmRecentActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    action = serializers.CharField()
    repr = serializers.CharField()
    actor = serializers.CharField(allow_null=True)
    timestamp = serializers.DateTimeField()


class BdmFormSubmissionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    reference_id = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(allow_blank=True, default="")
    company = serializers.CharField(allow_blank=True)
    source = serializers.CharField()
    source_display = serializers.CharField()
    industry = serializers.CharField(allow_blank=True)
    description = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()
    status = serializers.CharField()
    assigned_to = serializers.IntegerField(allow_null=True)
    assigned_to_name = serializers.CharField(allow_null=True)


class BdmDashboardSerializer(serializers.Serializer):
    """Response shape of the BDM dashboard endpoint."""

    total_leads = serializers.IntegerField()
    assigned_leads = serializers.IntegerField()
    unassigned_leads = serializers.IntegerField()
    new_leads = serializers.IntegerField()
    qualified_leads = serializers.IntegerField()
    active_opportunities = serializers.IntegerField()
    overdue_follow_ups = serializers.IntegerField()
    won_leads = serializers.IntegerField()
    lost_leads = serializers.IntegerField()
    conversion_rate = serializers.FloatField()
    pipeline_summary = BdmPipelineSummarySerializer(many=True)
    recent_activities = BdmRecentActivitySerializer(many=True)
    recent_form_submissions = BdmFormSubmissionSerializer(many=True)
