from django.db.models import Count, Exists, OuterRef
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.models import AuditLog
from apps.bdm.serializers import BdmDashboardSerializer
from apps.crm.models import Lead, LeadFollowUp
from apps.rbac.permissions import BaseRolePermission


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
    """

    permission_classes = [CanViewBdmDashboard]
    serializer_class = BdmDashboardSerializer

    def get(self, request):
        lead_base = Lead.objects.all()
        now = timezone.now()

        closed = lead_base.filter(status__in=(Lead.Status.WON, Lead.Status.LOST)).count()
        won = lead_base.filter(status=Lead.Status.WON).count()
        lost = lead_base.filter(status=Lead.Status.LOST).count()
        conversion_rate = round((won / closed) * 100, 2) if closed else 0.0

        overdue_followups = lead_base.filter(Exists(_open_overdue_followup_subquery())).count()

        pipeline_summary = (
            lead_base.values("status")
            .annotate(total=Count("id"))
            .order_by("status")
        )

        recent_activities = (
            AuditLog.objects.filter(module="crm")
            .select_related("user")
            .order_by("-timestamp")[:10]
        )

        return Response({
            "total_leads": lead_base.count(),
            "assigned_leads": lead_base.filter(assigned_to__isnull=False).count(),
            "unassigned_leads": lead_base.filter(assigned_to__isnull=True).count(),
            "new_leads": lead_base.filter(status=Lead.Status.NEW).count(),
            "qualified_leads": lead_base.filter(status=Lead.Status.QUALIFIED).count(),
            "active_opportunities": lead_base.filter(status__in=Lead.OPPORTUNITY_STATUSES).count(),
            "overdue_follow_ups": overdue_followups,
            "won_leads": won,
            "lost_leads": lost,
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
        })
