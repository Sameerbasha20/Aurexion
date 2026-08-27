from rest_framework import viewsets, serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
import logging
from django.db import DatabaseError

logger = logging.getLogger(__name__)

from apps.administration.models import Role, ModulePermission
from apps.administration.serializers import RoleSerializer, ModulePermissionSerializer
from apps.administration.permissions import IsSuperAdmin, IsAdministrator
from apps.authentication.audit import log_audit_event
from apps.authentication.models import UserProfile, AuditLog
from apps.crm.models import Lead, LeadStatus
from apps.portal.models import SupportTicket


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related('permissions').all()
    serializer_class = RoleSerializer
    permission_classes = [IsSuperAdmin]

    def perform_create(self, serializer):
        role = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='CREATE',
            module='administration',
            object_id=role.id,
            repr_str=f"Created role: {role.name} ({role.code})",
            updated_state=RoleSerializer(role).data,
            request=self.request
        )

    def perform_update(self, serializer):
        role = self.get_object()
        prev_state = RoleSerializer(role).data
        
        # Save first
        updated_role = serializer.save()
        
        # Validate security constraints
        if updated_role.code == 'super_admin':
            for perm in updated_role.permissions.all():
                if perm.module in ['administration', 'authentication'] and not (perm.can_create and perm.can_read and perm.can_update and perm.can_delete):
                    raise serializers.ValidationError("Super Admin must have full permissions (CRUD) for 'administration' and 'authentication' modules.")
        
        from django.core.cache import cache
        cache.clear()

        log_audit_event(
            user=self.request.user,
            action='UPDATE',
            module='administration',
            object_id=updated_role.id,
            repr_str=f"Updated role: {updated_role.name} ({updated_role.code})",
            previous_state=prev_state,
            updated_state=RoleSerializer(updated_role).data,
            request=self.request
        )

    def perform_destroy(self, instance):
        role_id = instance.id
        role_name = instance.name
        role_code = instance.code
        prev_state = RoleSerializer(instance).data
        
        if role_code in ['super_admin', 'administrator']:
            raise serializers.ValidationError(f"Cannot delete system role: {role_name}")
            
        instance.delete()
        log_audit_event(
            user=self.request.user,
            action='DELETE',
            module='administration',
            object_id=role_id,
            repr_str=f"Deleted role: {role_name} ({role_code})",
            previous_state=prev_state,
            request=self.request
        )


class AdminDashboardView(APIView):
    """
    Endpoint: GET /api/v1/admin/dashboard/
    Provides high-level operational statistics and activity feeds for the Administrator Dashboard.
    """
    permission_classes = [IsAdministrator]

    def get(self, request, *args, **kwargs):
        role = request.user.profile.role if hasattr(request.user, 'profile') else None
        if role not in ['super_admin', 'administrator'] and not request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Administrators can access this dashboard.")

        from django.core.cache import cache
        cache_key = "admin_dashboard_metrics"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        from django.db.models.functions import TruncDate
        from django.db.models import Count, Q

        # 1. User metrics (single pass aggregate)
        user_agg = User.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(is_active=True)),
            clients=Count('id', filter=Q(profile__role__iexact='client_user') | Q(profile__role__iexact='client')),
            sales_executives=Count('id', filter=Q(profile__role__iexact='sales_executive') | Q(profile__role__iexact='sales')),
            bdms=Count('id', filter=Q(profile__role__iexact='bdm') | Q(profile__role__iexact='business_development_manager')),
            administrators=Count('id', filter=Q(profile__role__iexact='administrator') | Q(profile__role__iexact='admin') | Q(profile__role__iexact='super_admin') | Q(is_superuser=True)),
        )

        # 2. Lead metrics (single pass aggregate)
        lead_agg = Lead.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(status__in=[
                LeadStatus.NEW, LeadStatus.UNDER_REVIEW, LeadStatus.CONTACTED,
                LeadStatus.QUALIFIED, LeadStatus.PROPOSAL_SUBMITTED, LeadStatus.NEGOTIATION,
            ])),
            won=Count('id', filter=Q(status=LeadStatus.WON)),
            lost=Count('id', filter=Q(status=LeadStatus.LOST)),
            pending=Count('id', filter=Q(status=LeadStatus.NEW)),
        )

        # 3. Support ticket metrics
        try:
            open_tickets = SupportTicket.objects.exclude(status__in=['resolved', 'closed', 'RESOLVED', 'CLOSED']).count()
            critical_tickets = SupportTicket.objects.filter(priority__iexact='critical').exclude(status__in=['resolved', 'closed', 'RESOLVED', 'CLOSED']).count()
        except DatabaseError as e:
            logger.exception("Failed to aggregate support ticket metrics")
            open_tickets = 0
            critical_tickets = 0

        # 4. Dynamic Activity Chart data (Audit Logs aggregated by date)
        daily_activities = (
            AuditLog.objects
            .annotate(date=TruncDate('timestamp'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('-date')[:7]
        )
        daily_activities = list(reversed(daily_activities))
        activity_chart = [
            {
                "date": item['date'].strftime('%b %d') if item['date'] else "N/A",
                "activityCount": item['count']
            }
            for item in daily_activities
        ]

        # 5. Dynamic Lead Pipeline Distribution Chart data
        pipeline_dist = (
            Lead.objects
            .values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )
        pipeline_chart = [
            {
                "status": item['status'].replace('_', ' ').title() if item['status'] else "Unknown",
                "count": item['count']
            }
            for item in pipeline_dist
        ]

        # 6. Recent activities (Audit Log)
        recent_activities = []
        logs = AuditLog.objects.select_related('user').all().order_by('-timestamp')[:8]
        for log in logs:
            recent_activities.append({
                'id': log.id,
                'timestamp': log.timestamp.isoformat(),
                'operator': log.user.username if log.user else 'System',
                'action': log.action,
                'module': log.module.upper(),
                'details': log.repr or f"{log.action} on {log.module}"
            })

        # 7. Recent leads
        recent_leads = []
        leads = Lead.objects.select_related('assigned_to').all().order_by('-created_at')[:6]
        for l in leads:
            recent_leads.append({
                'id': l.id,
                'reference_id': l.reference_id,
                'name': l.name,
                'company': l.company,
                'email': l.email,
                'status': l.status,
                'status_display': l.get_status_display(),
                'priority': l.priority,
                'assigned_to': l.assigned_to.username if l.assigned_to else None,
                'created_at': l.created_at.isoformat()
            })

        data = {
            'users': {
                'total': user_agg['total'],
                'active': user_agg['active'],
                'clients': user_agg['clients'],
                'sales_executives': user_agg['sales_executives'],
                'bdms': user_agg['bdms'],
                'administrators': user_agg['administrators'],
            },
            'leads': {
                'total': lead_agg['total'],
                'active': lead_agg['active'],
                'won': lead_agg['won'],
                'lost': lead_agg['lost'],
                'pending': lead_agg['pending'],
            },
            'support': {
                'open': open_tickets,
                'critical': critical_tickets,
            },
            'activity_chart': activity_chart,
            'pipeline_chart': pipeline_chart,
            'recent_activities': recent_activities,
            'recent_leads': recent_leads,
        }
        cache.set(cache_key, data, timeout=15)
        return Response(data, status=status.HTTP_200_OK)


class UserRoleChoicesView(APIView):
    """
    Endpoint: GET /api/v1/users/roles/ (or /api/v1/roles/choices/)
    Returns the dynamically registered roles in system for selection UI.
    """
    permission_classes = [IsAdministrator]

    def get(self, request, *args, **kwargs):
        roles = []
        # Return DB Role objects if customized, else return UserProfile.ROLE_CHOICES
        db_roles = Role.objects.all()
        if db_roles.exists():
            for r in db_roles:
                roles.append({'code': r.code, 'name': r.name})
        else:
            for code, name in UserProfile.ROLE_CHOICES:
                roles.append({'code': code, 'name': name})
        return Response(roles, status=status.HTTP_200_OK)

