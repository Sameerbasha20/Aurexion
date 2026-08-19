from django.contrib.auth.models import User
from django.test import TestCase

from apps.crm.models import Lead, LeadFollowUp, LeadNote
from tests.crm.helpers import create_lead, make_user


class LeadModelBDMTests(TestCase):
    def setUp(self):
        self.bdm = make_user("bdm_model", "bdm")
        self.sales = make_user("sales_model", "sales_executive")

    def test_lead_creation_defaults(self):
        lead = create_lead(self.bdm, name="Default Corp")
        self.assertEqual(lead.status, Lead.Status.NEW)
        self.assertEqual(lead.priority, Lead.Priority.MEDIUM)
        self.assertEqual(lead.lost_reason, "")
        self.assertEqual(lead.created_by, self.bdm)

    def test_lead_str_representation(self):
        lead = create_lead(self.bdm, name="Str Corp")
        self.assertIn(lead.reference_id, str(lead))
        self.assertIn("Str Corp", str(lead))

    def test_lead_ordering(self):
        first = create_lead(self.bdm, name="First")
        second = create_lead(self.bdm, name="Second")
        latest = Lead.objects.first()
        self.assertIn(latest.pk, (first.pk, second.pk))

    def test_lead_assignment_relationship(self):
        lead = create_lead(self.bdm, assigned_to=self.sales)
        self.assertEqual(lead.assigned_to, self.sales)
        self.assertIn(lead, self.sales.assigned_leads.all())

    def test_follow_up_creation_relationship(self):
        lead = create_lead(self.bdm)
        followup = LeadFollowUp.objects.create(
            lead=lead, created_by=self.bdm, scheduled_at="2026-01-01T10:00:00Z"
        )
        self.assertEqual(lead.follow_ups.count(), 1)
        self.assertEqual(followup.lead, lead)

    def test_note_creation_relationship(self):
        lead = create_lead(self.bdm)
        note = LeadNote.objects.create(lead=lead, created_by=self.bdm, content="hello")
        self.assertEqual(lead.notes.count(), 1)
        self.assertEqual(note.lead, lead)

    def test_lead_survives_creator_deletion(self):
        lead = create_lead(self.bdm)
        self.bdm.delete()
        lead.refresh_from_db()
        self.assertIsNone(lead.created_by)

    def test_lost_reason_is_blank_by_default(self):
        lead = create_lead(self.bdm)
        self.assertEqual(lead.lost_reason, "")
