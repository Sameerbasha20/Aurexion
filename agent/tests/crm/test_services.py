from django.test import TestCase
from rest_framework.exceptions import ValidationError

from apps.authentication.models import AuditLog
from apps.crm.models import Lead, LeadFollowUp, LeadNote
from apps.crm.services import (
    LeadStateTransitionError,
    add_note,
    assign_lead,
    change_lead_stage,
    complete_followup,
    create_lead,
    generate_reference,
    mark_lead_lost,
    qualify_lead,
    schedule_followup,
)
from tests.crm.helpers import create_lead, make_user


class ReferenceGenerationTests(TestCase):
    def test_reference_format(self):
        reference = generate_reference()
        self.assertTrue(reference.startswith("AUR-LEAD-"))
        self.assertEqual(len(reference), len("AUR-LEAD-") + 8)

    def test_references_unique_in_service(self):
        bdm = make_user("bdm_ref", "bdm")
        lead1 = create_lead(bdm)
        lead2 = create_lead(bdm)
        self.assertNotEqual(lead1.reference_id, lead2.reference_id)


class CreateLeadServiceTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_create", "bdm")
        self.sales = make_user("sales_create", "sales_executive")
        self.client_user = make_user("client_create", "client_user")
        self.inactive = make_user("inactive_create", "bdm", is_active=False)

    def test_create_lead_sets_reference_and_creator(self):
        lead = create_lead(self.bdm, name="Test Org")
        self.assertTrue(lead.reference_id.startswith("AUR-LEAD-"))
        self.assertEqual(lead.created_by, self.bdm)
        self.assertEqual(lead.status, Lead.Status.NEW)

    def test_create_lead_assigns_to_active_sales(self):
        lead = create_lead(self.bdm, name="Test Org", assigned_to=self.sales)
        self.assertEqual(lead.assigned_to, self.sales)

    def test_create_lead_rejects_inactive_assignee(self):
        with self.assertRaises(ValidationError):
            create_lead(self.bdm, name="Test Org", assigned_to=self.inactive)

    def test_create_lead_rejects_client_role_assignee(self):
        with self.assertRaises(ValidationError):
            create_lead(self.bdm, name="Test Org", assigned_to=self.client_user)

    def test_create_lead_audits_event(self):
        lead = create_lead(self.bdm, name="Audit Org")
        entry = AuditLog.objects.filter(module="crm", action="LEAD_CREATED", object_id=str(lead.id)).first()
        self.assertIsNotNone(entry)
        self.assertEqual(entry.user, self.bdm)
        self.assertIn(lead.reference_id, entry.repr)


class LifecycleServiceTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_lifecycle", "bdm")
        self.lead = create_lead(self.bdm)

    def test_full_win_pathway(self):
        lead = self.lead
        for status in [
            Lead.Status.CONTACTED,
            Lead.Status.QUALIFIED,
            Lead.Status.PROPOSAL_SUBMITTED,
            Lead.Status.NEGOTIATION,
            Lead.Status.WON,
        ]:
            lead = change_lead_stage(lead=lead, new_status=status, actor=self.bdm)
        self.assertEqual(lead.status, Lead.Status.WON)

    def test_invalid_transition_raises_conflict(self):
        with self.assertRaises(LeadStateTransitionError):
            change_lead_stage(lead=self.lead, new_status=Lead.Status.WON, actor=self.bdm)

    def test_lost_from_contacted(self):
        change_lead_stage(lead=self.lead, new_status=Lead.Status.CONTACTED, actor=self.bdm)
        lead = mark_lead_lost(lead=self.lead, actor=self.bdm, reason="Competitor won")
        self.assertEqual(lead.status, Lead.Status.LOST)
        self.assertEqual(lead.lost_reason, "Competitor won")

    def test_lost_requires_reason(self):
        with self.assertRaises(ValidationError):
            mark_lead_lost(lead=self.lead, actor=self.bdm, reason="   ")

    def test_qualify_requires_contacted(self):
        with self.assertRaises(LeadStateTransitionError):
            qualify_lead(lead=self.lead, actor=self.bdm)

    def test_terminal_states_cannot_transition(self):
        lead = self.lead
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


class AssignmentServiceTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_assign", "bdm")
        self.sales1 = make_user("sales_assign_1", "sales_executive")
        self.sales2 = make_user("sales_assign_2", "sales_executive")
        self.lead = create_lead(self.bdm)

    def test_assign_lead(self):
        assign_lead(lead=self.lead, target_user=self.sales1, actor=self.bdm)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.assigned_to, self.sales1)
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="LEAD_ASSIGNED", object_id=str(self.lead.id)).exists()
        )

    def test_reassign_records_reassign_action(self):
        assign_lead(lead=self.lead, target_user=self.sales1, actor=self.bdm)
        assign_lead(lead=self.lead, target_user=self.sales2, actor=self.bdm)
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="LEAD_REASSIGNED", object_id=str(self.lead.id)).exists()
        )

    def test_assign_rejects_inactive_user(self):
        inactive = make_user("inactive_assign", "bdm", is_active=False)
        with self.assertRaises(ValidationError):
            assign_lead(lead=self.lead, target_user=inactive, actor=self.bdm)

    def test_assign_rejects_non_pipeline_role(self):
        hr = make_user("hr_assign", "hr_manager")
        with self.assertRaises(ValidationError):
            assign_lead(lead=self.lead, target_user=hr, actor=self.bdm)


class FollowUpServiceTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_followup", "bdm")
        self.sales = make_user("sales_followup", "sales_executive")
        self.lead = create_lead(self.bdm)

    def test_schedule_followup_updates_next_follow_up_at(self):
        schedule_followup(
            lead=self.lead,
            actor=self.bdm,
            scheduled_at="2026-02-01T09:00:00Z",
            follow_up_type="phone",
        )
        self.lead.refresh_from_db()
        self.assertIsNotNone(self.lead.next_follow_up_at)

    def test_complete_followup_sets_completed_at_and_last_contacted(self):
        followup = schedule_followup(
            lead=self.lead,
            actor=self.bdm,
            scheduled_at="2026-02-01T09:00:00Z",
            follow_up_type="email",
        )
        complete_followup(followup=followup, actor=self.sales)
        followup.refresh_from_db()
        self.lead.refresh_from_db()
        self.assertEqual(followup.status, LeadFollowUp.Status.COMPLETED)
        self.assertIsNotNone(followup.completed_at)
        self.assertEqual(self.lead.last_contacted_at, followup.completed_at)

    def test_next_follow_up_cleared_when_all_completed(self):
        followup = schedule_followup(
            lead=self.lead,
            actor=self.bdm,
            scheduled_at="2026-02-01T09:00:00Z",
            follow_up_type="phone",
        )
        complete_followup(followup=followup, actor=self.sales)
        self.lead.refresh_from_db()
        self.assertIsNone(self.lead.next_follow_up_at)


class NoteServiceTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_note", "bdm")
        self.sales = make_user("sales_note", "sales_executive")
        self.lead = create_lead(self.bdm)

    def test_add_note_records_author(self):
        note = add_note(lead=self.lead, author=self.sales, content="Following up")
        self.assertEqual(note.created_by, self.sales)
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="NOTE_ADDED", object_id=str(self.lead.id)).exists()
        )
