from django.db.models import Count, Exists, OuterRef, Case, When, IntegerField, Sum
from django.db import models
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.models import AuditLog, User
from apps.bdm.serializers import BdmDashboardSerializer
from apps.crm.models import Lead, LeadFollowUp
from apps.administration.permissions import BaseRolePermission
from django.core.cache import cache


class CanViewBdmDashboard(BaseRolePermission):
    """BDM dashboard is available to BDM, Administrator and Super Admin roles."""
    allowed_roles = ["super_admin", "administrator", "bdm"]



@extend_schema(
    tags=["BDM"],
    summary="BDM dashboard metrics",
    description="Real-time pipeline metrics aggregated from PostgreSQL CRM data.",
    responses=BdmDashboardSerializer,
)

class BdmDashboardView(APIView):
    """
    BDM dashboard: live metrics aggregated from Lead/FollowUp tables with a short 15s cache.
    """

    permission_classes = [CanViewBdmDashboard]
    serializer_class = BdmDashboardSerializer

    def get(self, request):
        cache_key = "bdm_dashboard_metrics"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

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

        # Overdue follow-ups - single fast lookup on the LeadFollowUp table
        overdue_followups = LeadFollowUp.objects.filter(
            status__in=LeadFollowUp.OPEN_STATUSES,
            scheduled_at__lt=now
        ).values("lead_id").distinct().count()

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

        # Compute Sales Team Workload
        sales_execs = User.objects.filter(
            models.Q(profile__role="sales_executive") | models.Q(profile__role="SALES_EXECUTIVE")
        ).select_related("profile").annotate(
            active_count=Count("assigned_leads", filter=~models.Q(assigned_leads__status=Lead.Status.LOST))
        ).order_by("-active_count")

        team_workload = [
            {
                "id": u.id,
                "username": u.username,
                "name": u.get_full_name() or u.username,
                "role": getattr(getattr(u, "profile", None), "role", "sales_executive"),
                "active_leads_count": u.active_count,
            }
            for u in sales_execs
        ]

        # Query WON Leads / Clients
        won_leads_qs = (
            Lead.objects.filter(status=Lead.Status.WON)
            .select_related("assigned_to")
            .order_by("-updated_at")[:15]
        )
        won_clients = [
            {
                "id": lead.id,
                "reference_id": lead.reference_id,
                "name": lead.name,
                "email": lead.email,
                "phone": lead.phone,
                "company": lead.company or "Individual Client",
                "source": lead.source,
                "industry": lead.industry,
                "description": lead.description or "",
                "value": float(getattr(lead, "value", 0.0) or 0.0),
                "assigned_to_name": lead.assigned_to.get_full_name() or lead.assigned_to.username if lead.assigned_to else "Unassigned",
                "client_onboarded": getattr(lead, "client_onboarded", False),
                "created_at": lead.created_at,
                "updated_at": lead.updated_at,
            }
            for lead in won_leads_qs
        ]

        pending_client_onboardings = Lead.objects.filter(status=Lead.Status.WON, client_onboarded=False).count()

        # Count pending RFPs (new/unassigned from rfp_form source)
        pending_rfp_count = Lead.objects.filter(
            source="rfp_form",
            status=Lead.Status.NEW,
        ).count()

        response_data = {
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
            "team_workload": team_workload,
            "won_clients": won_clients,
            "pending_client_onboardings": pending_client_onboardings,
            "pending_rfp_count": pending_rfp_count,
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
        }

        cache.set(cache_key, response_data, timeout=120)
        return Response(response_data)
