from django.db import IntegrityError, transaction
from django.test import TestCase

from apps.crm.models import Lead, LeadFollowUp, LeadNote
from tests.crm.helpers import create_lead, make_user


class LeadModelTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_tester", "bdm")
        self.sales = make_user("sales_tester", "sales_executive")

    def test_lead_defaults(self):
        lead = Lead.objects.create(reference_id="AUR-LEAD-TEST1", name="Default Co")
        self.assertEqual(lead.status, Lead.Status.NEW)
        self.assertEqual(lead.priority, Lead.Priority.MEDIUM)
        self.assertEqual(lead.reference_id, "AUR-LEAD-TEST1")

    def test_reference_id_unique_enforced(self):
        Lead.objects.create(reference_id="AUR-LEAD-TEST1", name="First")
        with self.assertRaises(IntegrityError), transaction.atomic():
            Lead.objects.create(reference_id="AUR-LEAD-TEST1", name="Duplicate")

    def test_invalid_status_rejected_by_check_constraint(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Lead.objects.create(reference_id="AUR-LEAD-TEST2", name="Bad", status="bogus")

    def test_invalid_priority_rejected_by_check_constraint(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Lead.objects.create(reference_id="AUR-LEAD-TEST3", name="Bad", priority="bogus")

    def test_follow_up_relation(self):
        lead = create_lead(self.bdm)
        followup = LeadFollowUp.objects.create(
            lead=lead,
            created_by=self.bdm,
            scheduled_at="2026-01-01T10:00:00Z",
        )
        self.assertEqual(lead.follow_ups.count(), 1)
        self.assertEqual(followup.lead, lead)

    def test_note_relation(self):
        lead = create_lead(self.bdm)
        note = LeadNote.objects.create(lead=lead, created_by=self.bdm, content="Call back later")
        self.assertEqual(lead.notes.count(), 1)
        self.assertEqual(note.created_by, self.bdm)

    def test_cascade_delete_follow_ups_and_notes(self):
        lead = create_lead(self.bdm)
        LeadFollowUp.objects.create(lead=lead, created_by=self.bdm, scheduled_at="2026-01-01T10:00:00Z")
        LeadNote.objects.create(lead=lead, created_by=self.bdm, content="note")
        lead.delete()
        self.assertEqual(LeadFollowUp.objects.count(), 0)
        self.assertEqual(LeadNote.objects.count(), 0)

    def test_terminal_statuses_are_terminal(self):
        self.assertIn(Lead.Status.WON, Lead.TERMINAL_STATUSES)
        self.assertIn(Lead.Status.LOST, Lead.TERMINAL_STATUSES)

    def test_opportunity_statuses(self):
        self.assertIn(Lead.Status.QUALIFIED, Lead.OPPORTUNITY_STATUSES)
        self.assertIn(Lead.Status.PROPOSAL_SUBMITTED, Lead.OPPORTUNITY_STATUSES)
        self.assertIn(Lead.Status.NEGOTIATION, Lead.OPPORTUNITY_STATUSES)
