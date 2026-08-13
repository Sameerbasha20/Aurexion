from django.test import TestCase
from rest_framework.exceptions import ValidationError

from apps.authentication.models import AuditLog
from apps.crm.models import Lead
from apps.crm.services import (
    LeadStateTransitionError,
    assign_lead,
    change_lead_stage,
    create_lead,
    generate_reference,
    mark_lead_lost,
    reopen_lost_lead,
)
from tests.crm.helpers import create_lead, make_user


class BdmServiceTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_service", "bdm")
        self.sales = make_user("sales_service", "sales_executive")

    def test_reference_format(self):
        reference = generate_reference()
        self.assertTrue(reference.startswith("AUR-LEAD-"))
        self.assertEqual(len(reference), len("AUR-LEAD-") + 8)

    def test_reference_uniqueness(self):
        lead1 = create_lead(self.bdm)
        lead2 = create_lead(self.bdm)
        self.assertNotEqual(lead1.reference_id, lead2.reference_id)

    def test_create_lead_success(self):
        lead = create_lead(self.bdm, name="New Client")
        self.assertTrue(lead.reference_id.startswith("AUR-LEAD-"))
        self.assertEqual(lead.name, "New Client")
        self.assertEqual(lead.status, Lead.Status.NEW)

    def test_create_lead_with_assignment(self):
        lead = create_lead(self.bdm, name="Assigned", assigned_to=self.sales)
        self.assertEqual(lead.assigned_to, self.sales)

    def test_create_lead_generates_audit_log(self):
        lead = create_lead(self.bdm)
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="LEAD_CREATED", object_id=str(lead.id)).exists()
        )

    def test_assign_lead_and_audit(self):
        lead = create_lead(self.bdm)
        assign_lead(lead=lead, target_user=self.sales, actor=self.bdm)
        lead.refresh_from_db()
        self.assertEqual(lead.assigned_to, self.sales)
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="LEAD_ASSIGNED", object_id=str(lead.id)).exists()
        )

    def test_valid_transition_new_to_contacted(self):
        lead = create_lead(self.bdm)
        change_lead_stage(lead=lead, new_status=Lead.Status.CONTACTED, actor=self.bdm)
        self.assertEqual(lead.status, Lead.Status.CONTACTED)

    def test_invalid_transition_new_to_won(self):
        lead = create_lead(self.bdm)
        with self.assertRaises(LeadStateTransitionError):
            change_lead_stage(lead=lead, new_status=Lead.Status.WON, actor=self.bdm)

    def test_full_pipeline_to_won(self):
        lead = create_lead(self.bdm)
        for status in [
            Lead.Status.CONTACTED,
            Lead.Status.QUALIFIED,
            Lead.Status.PROPOSAL_SUBMITTED,
            Lead.Status.NEGOTIATION,
            Lead.Status.WON,
        ]:
            lead = change_lead_stage(lead=lead, new_status=status, actor=self.bdm)
        self.assertEqual(lead.status, Lead.Status.WON)

    def test_won_is_terminal(self):
        lead = create_lead(self.bdm)
        for status in [
            Lead.Status.CONTACTED,
            Lead.Status.QUALIFIED,
            Lead.Status.PROPOSAL_SUBMITTED,
            Lead.Status.NEGOTIATION,
            Lead.Status.WON,
        ]:
            lead = change_lead_stage(lead=lead, new_status=status, actor=self.bdm)
        with self.assertRaises(LeadStateTransitionError):
            change_lead_stage(lead=lead, new_status=Lead.Status.LOST, actor=self.bdm)

    def test_lost_requires_reason(self):
        lead = create_lead(self.bdm)
        with self.assertRaises(ValidationError):
            mark_lead_lost(lead=lead, actor=self.bdm, reason="")

    def test_lost_with_reason(self):
        lead = create_lead(self.bdm)
        mark_lead_lost(lead=lead, actor=self.bdm, reason="Budget withdrawn")
        self.assertEqual(lead.status, Lead.Status.LOST)
        self.assertEqual(lead.lost_reason, "Budget withdrawn")

    def test_lost_creates_audit_log(self):
        lead = create_lead(self.bdm)
        mark_lead_lost(lead=lead, actor=self.bdm, reason="No response")
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="LEAD_LOST", object_id=str(lead.id)).exists()
        )

    def test_reopen_lost_lead(self):
        lead = create_lead(self.bdm)
        mark_lead_lost(lead=lead, actor=self.bdm, reason="Cold")
        reopen_lost_lead(lead=lead, actor=self.bdm)
        self.assertEqual(lead.status, Lead.Status.NEW)
        self.assertEqual(lead.lost_reason, "")

    def test_reopen_non_lost_lead_raises(self):
        lead = create_lead(self.bdm)
        with self.assertRaises(LeadStateTransitionError):
            reopen_lost_lead(lead=lead, actor=self.bdm)

    def test_status_change_creates_audit_log(self):
        lead = create_lead(self.bdm)
        change_lead_stage(lead=lead, new_status=Lead.Status.CONTACTED, actor=self.bdm)
        self.assertTrue(
            AuditLog.objects.filter(
                module="crm", action="LEAD_STATUS_CHANGED", object_id=str(lead.id)
            ).exists()
        )
