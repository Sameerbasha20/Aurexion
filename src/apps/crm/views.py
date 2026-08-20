import csv
import io

from django.db.models import Count, Exists, OuterRef, Subquery, IntegerField
import django.db.models
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from apps.authentication.audit import get_model_state, log_audit_event
from apps.authentication.models import AuditLog
from apps.crm.models import Lead, LeadFollowUp, LeadNote, EstimatorSubmission
from apps.crm.permissions import CanAccessLead, CanAssignLead, CanCreateLead, CanDeleteLead
from apps.crm.serializers import (
    LeadActivitySerializer,
    LeadAssignSerializer,
    LeadCreateSerializer,
    LeadFollowUpCreateSerializer,
    LeadFollowUpSerializer,
    LeadFollowUpUpdateSerializer,
    LeadLostSerializer,
    LeadNoteSerializer,
    LeadSerializer,
    LeadStatusTransitionSerializer,
    LeadUpdateSerializer,
    PublicLeadCreateSerializer,
)
from apps.crm.services import (
    add_note,
    assign_lead,
    change_lead_stage,
    complete_followup,
    create_lead,
    delete_followup,
    delete_note,
    mark_lead_lost,
    mark_lead_won,
    qualify_lead,
    reopen_lost_lead,
    schedule_followup,
    schedule_meeting_and_notify,
    update_followup,
    update_note,
)

EXPORT_FIELDS = [
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
    "priority",
    "lost_reason",
    "assigned_to",
    "created_by",
    "last_contacted_at",
    "next_follow_up_at",
    "created_at",
    "updated_at",
]


def _lead_csv_rows(queryset):
    """Stream CSV rows from a lead queryset without loading it into memory."""
    yield "\ufeff" + ",".join(EXPORT_FIELDS) + "\r\n"
    for lead in queryset.iterator(chunk_size=500):
        values = []
        for field in EXPORT_FIELDS:
            value = getattr(lead, field, None)
            if field in ("assigned_to", "created_by"):
                value = getattr(value, "username", None) if value else None
            values.append(str(value) if value is not None else "")
        buffer = io.StringIO()
        csv.writer(buffer).writerow(values)
        yield buffer.getvalue()


def _open_overdue_followup_subquery():
    return LeadFollowUp.objects.filter(
        lead=OuterRef("pk"),
        status__in=LeadFollowUp.OPEN_STATUSES,
        scheduled_at__lt=timezone.now(),
    )


@extend_schema_view(
    list=extend_schema(tags=["CRM Leads"], summary="List leads with filtering, search and pagination"),
    retrieve=extend_schema(tags=["CRM Leads"], summary="Retrieve a lead"),
    create=extend_schema(tags=["CRM Leads"], summary="Create a lead"),
    partial_update=extend_schema(tags=["CRM Leads"], summary="Partially update a lead"),
    destroy=extend_schema(tags=["CRM Leads"], summary="Delete a lead"),
    follow_ups=extend_schema(
        tags=["CRM Follow-ups"],
        summary="List or create follow-ups for a lead",
        request=LeadFollowUpCreateSerializer,
        responses=LeadFollowUpSerializer,
    ),
    follow_up_detail=extend_schema(
        tags=["CRM Follow-ups"],
        summary="Update or delete a follow-up",
        request=LeadFollowUpUpdateSerializer,
        responses=LeadFollowUpSerializer,
    ),
    notes=extend_schema(
        tags=["CRM Notes"],
        summary="List or create notes for a lead",
        request=LeadNoteSerializer,
        responses=LeadNoteSerializer,
    ),
    note_detail=extend_schema(
        tags=["CRM Notes"],
        summary="Update or delete a note",
        request=LeadNoteSerializer,
        responses=LeadNoteSerializer,
    ),
)
class LeadViewSet(viewsets.ModelViewSet):
    """
    CRM Lead management.

    - Roles: BDM/Administrator/Super Admin full access; Sales Executives see
      only their assigned leads (object-level scoping enforced in get_queryset).
    - Status is a controlled lifecycle; transitions happen through the
      `transition`, `qualify`, `won`, `lost` actions (never free-form PATCH).
    - All sensitive operations are written to the AuditLog (module='crm').
    """

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["reference_id", "name", "company", "email", "phone"]
    ordering_fields = [
        "created_at",
        "updated_at",
        "next_follow_up_at",
        "priority",
        "status",
        "name",
        "company",
    ]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return LeadCreateSerializer
        if self.action in ("update", "partial_update"):
            return LeadUpdateSerializer
        return LeadSerializer

    def get_permissions(self):
        if self.action == "create":
            return [CanCreateLead()]
        if self.action == "destroy":
            return [CanDeleteLead()]
        if self.action == "assign":
            return [CanAssignLead()]
        return [CanAccessLead()]

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Count
        
        queryset = Lead.objects.select_related("created_by", "assigned_to").annotate(
            follow_up_count=Count("follow_ups", distinct=True),
            note_count=Count("notes", distinct=True),
        )

        role = getattr(getattr(user, "profile", None), "role", None)
        if role == "sales_executive":
            queryset = queryset.filter(assigned_to=user)
        elif user.is_superuser or role in ("super_admin", "administrator", "bdm"):
            pass
        else:
            queryset = queryset.none()

        queryset = self._apply_filters(queryset)
        return queryset

    def _apply_filters(self, queryset):
        params = self.request.query_params

        status_value = params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        priority = params.get("priority")
        if priority:
            queryset = queryset.filter(priority=priority)

        source = params.get("source")
        if source:
            queryset = queryset.filter(source__icontains=source)

        industry = params.get("industry")
        if industry:
            queryset = queryset.filter(industry__icontains=industry)

        assigned_to = params.get("assigned_to")
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        created_from = params.get("created_from")
        if created_from:
            queryset = queryset.filter(created_at__date__gte=created_from)

        created_to = params.get("created_to")
        if created_to:
            queryset = queryset.filter(created_at__date__lte=created_to)

        updated_from = params.get("updated_from")
        if updated_from:
            queryset = queryset.filter(updated_at__date__gte=updated_from)

        updated_to = params.get("updated_to")
        if updated_to:
            queryset = queryset.filter(updated_at__date__lte=updated_to)

        next_follow_up_from = params.get("next_follow_up_from")
        if next_follow_up_from:
            queryset = queryset.filter(next_follow_up_at__date__gte=next_follow_up_from)

        next_follow_up_to = params.get("next_follow_up_to")
        if next_follow_up_to:
            queryset = queryset.filter(next_follow_up_at__date__lte=next_follow_up_to)

        overdue = params.get("overdue")
        if overdue and overdue.lower() == "true":
            queryset = queryset.filter(Exists(_open_overdue_followup_subquery()))

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = create_lead(actor=request.user, request=request, **serializer.validated_data)
        output = LeadSerializer(lead, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        previous_state = get_model_state(instance)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        for field, value in serializer.validated_data.items():
            setattr(instance, field, value)
        instance.save(update_fields=list(serializer.validated_data.keys()) + ["updated_at"])

        log_audit_event(
            user=request.user,
            action="LEAD_UPDATED",
            module="crm",
            object_id=instance.id,
            repr_str=f"Lead {instance.reference_id} updated",
            previous_state=previous_state,
            updated_state=get_model_state(instance),
            request=request,
        )
        output = LeadSerializer(instance, context=self.get_serializer_context())
        return Response(output.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        lead_id = instance.id
        reference = instance.reference_id
        instance.delete()

        log_audit_event(
            user=request.user,
            action="LEAD_DELETED",
            module="crm",
            object_id=lead_id,
            repr_str=f"Lead {reference} deleted",
            request=request,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(tags=["CRM Leads"], request=LeadAssignSerializer, responses=LeadSerializer)
    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        """Assign (or reassign) a lead to an active BDM/Sales user."""
        lead = self.get_object()
        serializer = LeadAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = assign_lead(
            lead=lead,
            target_user=serializer.validated_data["assigned_to"],
            actor=request.user,
            request=request,
        )
        return Response(LeadSerializer(lead, context=self.get_serializer_context()).data)

    @extend_schema(tags=["CRM Leads"], request=LeadStatusTransitionSerializer, responses=LeadSerializer)
    @action(detail=True, methods=["post"])
    def transition(self, request, pk=None):
        """Transition a lead to any valid lifecycle state (409 on invalid)."""
        lead = self.get_object()
        serializer = LeadStatusTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = change_lead_stage(
            lead=lead,
            new_status=serializer.validated_data["status"],
            actor=request.user,
            request=request,
        )
        return Response(LeadSerializer(lead, context=self.get_serializer_context()).data)

    @extend_schema(tags=["CRM Leads"], responses=LeadSerializer)
    @action(detail=True, methods=["post"])
    def qualify(self, request, pk=None):
        """Qualify a lead (valid from CONTACTED)."""
        lead = self.get_object()
        lead = qualify_lead(lead=lead, actor=request.user, request=request)
        return Response(LeadSerializer(lead, context=self.get_serializer_context()).data)

    @extend_schema(tags=["CRM Leads"], responses=LeadSerializer)
    @action(detail=True, methods=["post"])
    def won(self, request, pk=None):
        """Mark a lead as WON."""
        lead = self.get_object()
        lead = mark_lead_won(lead=lead, actor=request.user, request=request)
        return Response(LeadSerializer(lead, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"], url_path="schedule-meeting")
    def schedule_meeting(self, request, pk=None):
        """Schedule a meeting with client, record follow-up, and dispatch email notification."""
        lead = self.get_object()
        scheduled_at = request.data.get("scheduled_at")
        follow_up_type = request.data.get("follow_up_type", "meeting")
        meeting_link = request.data.get("meeting_link", "")
        notes = request.data.get("notes", "")

        if not scheduled_at:
            return Response({"scheduled_at": ["A scheduled date and time is required."]}, status=status.HTTP_400_BAD_REQUEST)

        followup = schedule_meeting_and_notify(
            lead=lead,
            scheduled_at=scheduled_at,
            follow_up_type=follow_up_type,
            meeting_link=meeting_link,
            notes=notes,
            actor=request.user,
            request=request,
        )

        return Response({
            "message": f"Meeting scheduled and email dispatched to {lead.email or lead.name}.",
            "followup_id": followup.id,
            "scheduled_at": followup.scheduled_at,
            "meeting_link": meeting_link,
            "lead": LeadSerializer(lead, context=self.get_serializer_context()).data,
        })

    @extend_schema(tags=["CRM Leads"], request=LeadLostSerializer, responses=LeadSerializer)
    @action(detail=True, methods=["post"])
    def lost(self, request, pk=None):
        """Mark a lead as LOST (a reason is required)."""
        lead = self.get_object()
        serializer = LeadLostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = mark_lead_lost(lead=lead, actor=request.user, reason=serializer.validated_data["reason"], request=request)
        return Response(LeadSerializer(lead, context=self.get_serializer_context()).data)

    @extend_schema(tags=["CRM Leads"], responses=LeadSerializer)
    @action(detail=True, methods=["post"])
    def reopen(self, request, pk=None):
        """Reopen a LOST lead back into the active pipeline (status NEW)."""
        lead = self.get_object()
        lead = reopen_lost_lead(lead=lead, actor=request.user, request=request)
        return Response(LeadSerializer(lead, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["get", "post"], url_path="follow-ups")
    def follow_ups(self, request, pk=None):
        """List or create follow-ups for a lead."""
        lead = self.get_object()
        if request.method == "GET":
            queryset = lead.follow_ups.select_related("assigned_to", "created_by").all()
            serializer = LeadFollowUpSerializer(queryset, many=True, context=self.get_serializer_context())
            return Response(serializer.data)

        serializer = LeadFollowUpCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        followup = schedule_followup(
            lead=lead,
            actor=request.user,
            request=request,
            **serializer.validated_data,
        )
        output = LeadFollowUpSerializer(followup, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch", "delete"], url_path=r"follow-ups/(?P<followup_id>\d+)")
    def follow_up_detail(self, request, pk=None, followup_id=None):
        """Update or delete a specific follow-up."""
        lead = self.get_object()
        followup = get_object_or_404(lead.follow_ups, pk=followup_id)

        if request.method == "DELETE":
            delete_followup(followup=followup, actor=request.user, request=request)
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = LeadFollowUpUpdateSerializer(followup, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if data.get("status") == LeadFollowUp.Status.COMPLETED:
            followup = complete_followup(followup=followup, actor=request.user, request=request)
        else:
            followup = update_followup(followup=followup, actor=request.user, request=request, **data)
        output = LeadFollowUpSerializer(followup, context=self.get_serializer_context())
        return Response(output.data)

    @extend_schema(tags=["CRM Follow-ups"], responses=LeadFollowUpSerializer)
    @action(detail=True, methods=["post"], url_path=r"follow-ups/(?P<followup_id>\d+)/complete")
    def follow_up_complete(self, request, pk=None, followup_id=None):
        """Complete a follow-up and refresh the lead's last_contacted_at."""
        lead = self.get_object()
        followup = get_object_or_404(lead.follow_ups, pk=followup_id)
        followup = complete_followup(followup=followup, actor=request.user, request=request)
        output = LeadFollowUpSerializer(followup, context=self.get_serializer_context())
        return Response(output.data)

    @action(detail=True, methods=["get", "post"], url_path="notes")
    def notes(self, request, pk=None):
        """List or create notes for a lead."""
        lead = self.get_object()
        if request.method == "GET":
            queryset = lead.notes.select_related("created_by").all()
            serializer = LeadNoteSerializer(queryset, many=True, context=self.get_serializer_context())
            return Response(serializer.data)

        serializer = LeadNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = add_note(
            lead=lead,
            author=request.user,
            content=serializer.validated_data["content"],
            request=request,
        )
        output = LeadNoteSerializer(note, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch", "delete"], url_path=r"notes/(?P<note_id>\d+)")
    def note_detail(self, request, pk=None, note_id=None):
        """Update or delete a note (author or administrator)."""
        lead = self.get_object()
        note = get_object_or_404(lead.notes, pk=note_id)

        if request.method == "DELETE":
            delete_note(note=note, actor=request.user, request=request)
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = LeadNoteSerializer(note, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        note = update_note(
            note=note,
            actor=request.user,
            content=serializer.validated_data["content"],
            request=request,
        )
        output = LeadNoteSerializer(note, context=self.get_serializer_context())
        return Response(output.data)

    @extend_schema(tags=["CRM Activities"], responses=LeadActivitySerializer(many=True))
    @action(detail=True, methods=["get"])
    def activities(self, request, pk=None):
        """Activity history for a lead (derived from the AuditLog)."""
        lead = self.get_object()
        queryset = (
            AuditLog.objects.filter(module="crm", object_id=str(lead.id))
            .select_related("user")
            .order_by("-timestamp")[:50]
        )
        serializer = LeadActivitySerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @extend_schema(tags=["CRM Leads"], summary="Export filtered leads as CSV")
    @action(detail=False, methods=["get"])
    def export(self, request):
        """Stream a CSV export of the currently filtered leads (audited)."""
        queryset = self.filter_queryset(self.get_queryset()).order_by("created_at")
        total = queryset.count()

        log_audit_event(
            user=request.user,
            action="EXPORT",
            module="crm",
            repr_str=f"Exported {total} leads",
            request=request,
        )

        response = StreamingHttpResponse(_lead_csv_rows(queryset), content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="leads_export.csv"'
        return response


class PublicLeadCreateView(APIView):
    """
    Public endpoint for form submissions (estimator, RFP, contact forms).
    No authentication required. Creates a lead with status NEW and source from form.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        tags=["Public Forms"],
        summary="Submit a lead from public form",
        request=PublicLeadCreateSerializer,
        responses={201: LeadSerializer},
        auth=[]
    )
    def post(self, request):
        serializer = PublicLeadCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create lead with system user as creator (or None)
        from django.contrib.auth.models import User
        system_user = User.objects.filter(is_superuser=True).first()

        # Pass validated_data directly - source is already in it
        lead = create_lead(
            actor=system_user,
            request=request,
            **serializer.validated_data,
        )

        # Notify BDM (in a real app, this could be a signal or async task)
        # For now, we just return the created lead
        return Response(LeadSerializer(lead, context={'request': request}).data, status=status.HTTP_201_CREATED)


class EstimatorCalculateView(APIView):
    """
    BUG-05 Fix: Interactive Requirement Estimator calculation API endpoint.
    Accepts project scope, platform scale, user scale, and compliance requirements,
    calculates effort hours and budget range, and saves EstimatorSubmission record.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        tags=["Estimator"],
        summary="Calculate interactive project requirement estimate and create submission record",
        responses={201: dict},
        auth=[]
    )
    def post(self, request):
        data = request.data or {}
        scope = data.get("project_scope", [])
        if isinstance(scope, str):
            scope = [scope]
        platform = data.get("platform_scale", "medium")
        user_scale = data.get("user_scale", "10k")
        compliance = data.get("compliance_requirements", [])
        if isinstance(compliance, str):
            compliance = [compliance]

        base_hours = max(len(scope), 1) * 80
        multiplier = 1.5 if str(platform).lower() == "large" else 1.0
        if any(str(c).lower() in [str(x).lower() for x in compliance] for c in ["hipaa", "soc2", "gdpr"]):
            multiplier += 0.3
        
        hours = int(base_hours * multiplier)
        min_budget = hours * 65
        max_budget = hours * 95

        submission = EstimatorSubmission.objects.create(
            project_scope=scope,
            platform_scale=platform,
            user_scale=user_scale,
            compliance_requirements=compliance,
            engineering_effort_hours=hours,
            indicative_budget_min=min_budget,
            indicative_budget_max=max_budget
        )

        return Response({
            "submission_id": submission.id,
            "engineering_effort_hours": hours,
            "indicative_budget_min": str(min_budget),
            "indicative_budget_max": str(max_budget),
            "disclaimer": "This estimate represents a preliminary requirement assessment and does not constitute a binding legal proposal."
        }, status=status.HTTP_201_CREATED)


from rest_framework.throttling import AnonRateThrottle
from apps.crm.serializers import RFPEnquirySerializer

class RFPSubmitView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AnonRateThrottle]

    @extend_schema(
        tags=["Public Forms"],
        summary="Submit Request for Proposal (RFP)",
        request=RFPEnquirySerializer,
        responses={201: dict},
        auth=[]
    )
    def post(self, request):
        serializer = RFPEnquirySerializer(data=request.data)
        if serializer.is_valid():
            rfp = serializer.save()
            
            # Automatically create a corresponding CRM Lead
            create_lead(
                actor=None,
                name=rfp.full_name,
                email=rfp.work_email,
                phone=rfp.phone,
                company=rfp.company_name,
                industry=rfp.project_type,
                source="rfp_form",
                description=rfp.project_description,
                rfp_enquiry=rfp,
                request=request
            )

            return Response({
                "message": "RFP submitted successfully.",
                "reference_id": rfp.reference_id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


