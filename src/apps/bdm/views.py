from django.db.models import Count, Exists, OuterRef, Case, When, IntegerField, Sum
from django.db import models
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.models import AuditLog
from apps.bdm.serializers import BdmDashboardSerializer
from apps.crm.models import Lead, LeadFollowUp
from apps.administration.permissions import BaseRolePermission


class CanViewBdmDashboard(BaseRolePermission):
    """BDM dashboard is available to BDM, Administrator and Super Admin roles."""
    allowed_roles = ["super_admin", "administrator", "bdm"]


def _open_overdue_followup_subquery():
    return LeadFollowUp.objects.filter(
        lead=OuterRef("pk"),
        status__in=LeadFollowUp.OPEN_STATUSES,
        scheduled_at__lt=timezone.now(),
    )


@extend_schema(
    tags=["BDM"],
    summary="BDM dashboard metrics",
    description="Real-time pipeline metrics aggregated from PostgreSQL CRM data.",
    responses=BdmDashboardSerializer,
)
class BdmDashboardView(APIView):
    """
    BDM dashboard: every metric is computed from the live Lead/FollowUp tables.
    No static or mock values are returned.
    Optimized with conditional aggregation to reduce query count.
    """

    permission_classes = [CanViewBdmDashboard]
    serializer_class = BdmDashboardSerializer

    def get(self, request):
        now = timezone.now()

        # Single query with conditional aggregation for all lead metrics
        agg = Lead.objects.aggregate(
            total_leads=Count("id"),
            assigned_leads=Count("id", filter=models.Q(assigned_to__isnull=False)),
            unassigned_leads=Count("id", filter=models.Q(assigned_to__isnull=True)),
            new_leads=Count("id", filter=models.Q(status=Lead.Status.NEW)),
            qualified_leads=Count("id", filter=models.Q(status=Lead.Status.QUALIFIED)),
            active_opportunities=Count("id", filter=models.Q(status__in=Lead.OPPORTUNITY_STATUSES)),
            won_leads=Count("id", filter=models.Q(status=Lead.Status.WON)),
            lost_leads=Count("id", filter=models.Q(status=Lead.Status.LOST)),
        )

        closed = agg["won_leads"] + agg["lost_leads"]
        conversion_rate = round((agg["won_leads"] / closed) * 100, 2) if closed else 0.0

        # Overdue follow-ups - single query with Exists
        overdue_followups = Lead.objects.filter(Exists(_open_overdue_followup_subquery())).count()

        # Pipeline summary - single grouped query
        pipeline_summary = (
            Lead.objects.values("status")
            .annotate(total=Count("id"))
            .order_by("status")
        )

        # Recent activities - limited to 10
        recent_activities = (
            AuditLog.objects.filter(module="crm")
            .select_related("user")
            .order_by("-timestamp")[:10]
        )

        # Recent public form submissions (RFP, contact, estimator, quote)
        form_sources = ["rfp_form", "contact_form", "request_quote", "estimator", "website_form"]
        recent_form_submissions = (
            Lead.objects.filter(source__in=form_sources)
            .select_related("assigned_to")
            .order_by("-created_at")[:10]
        )

        return Response({
            "total_leads": agg["total_leads"],
            "assigned_leads": agg["assigned_leads"],
            "unassigned_leads": agg["unassigned_leads"],
            "new_leads": agg["new_leads"],
            "qualified_leads": agg["qualified_leads"],
            "active_opportunities": agg["active_opportunities"],
            "overdue_follow_ups": overdue_followups,
            "won_leads": agg["won_leads"],
            "lost_leads": agg["lost_leads"],
            "conversion_rate": conversion_rate,
            "pipeline_summary": [
                {"status": item["status"], "total": item["total"]} for item in pipeline_summary
            ],
            "recent_activities": [
                {
                    "id": item.id,
                    "action": item.action,
                    "repr": item.repr,
                    "actor": item.user.username if item.user else None,
                    "timestamp": item.timestamp,
                }
                for item in recent_activities
            ],
            "recent_form_submissions": [
                {
                    "id": lead.id,
                    "reference_id": lead.reference_id,
                    "name": lead.name,
                    "email": lead.email,
                    "phone": lead.phone,
                    "company": lead.company,
                    "source": lead.source,
                    "source_display": lead.source.replace("_", " ").title(),
                    "industry": lead.industry,
                    "description": lead.description if lead.description else "",
                    "created_at": lead.created_at,
                    "status": lead.status,
                    "assigned_to": lead.assigned_to_id,
                    "assigned_to_name": lead.assigned_to.username if lead.assigned_to else None,
                }
                for lead in recent_form_submissions
            ],
        })
