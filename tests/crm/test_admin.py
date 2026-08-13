from django.contrib import admin
from django.contrib.messages.storage.cookie import CookieStorage
from django.test import RequestFactory, TestCase
from apps.crm.models import Lead, LeadFollowUp, LeadNote
from apps.crm.admin import LeadAdmin, LeadFollowUpAdmin, LeadNoteAdmin
from tests.crm.helpers import create_lead, make_user


class CrmAdminSiteTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.superuser = make_user("admin_user", "super_admin")
        self.superuser.is_staff = True
        self.superuser.is_superuser = True
        self.superuser.save()
        self.client.force_login(self.superuser)

    def test_crm_models_registered_in_admin(self):
        self.assertTrue(admin.site.is_registered(Lead))
        self.assertTrue(admin.site.is_registered(LeadFollowUp))
        self.assertTrue(admin.site.is_registered(LeadNote))

    def test_lead_admin_custom_actions(self):
        lead1 = create_lead(self.superuser, name="Lead 1")
        lead2 = create_lead(self.superuser, name="Lead 2")

        request = self.factory.get("/")
        request.user = self.superuser
        setattr(request, "_messages", CookieStorage(request))

        lead_admin = LeadAdmin(Lead, admin.site)
        qs = Lead.objects.filter(id__in=[lead1.id, lead2.id])

        # Test mark as contacted
        lead_admin.mark_as_contacted(request, qs)
        lead1.refresh_from_db()
        self.assertEqual(lead1.status, Lead.Status.CONTACTED)

        # Test mark as qualified
        lead_admin.mark_as_qualified(request, qs)
        lead2.refresh_from_db()
        self.assertEqual(lead2.status, Lead.Status.QUALIFIED)

    def test_lead_note_short_content_preview(self):
        lead = create_lead(self.superuser, name="Note Lead")
        note = LeadNote.objects.create(
            lead=lead,
            created_by=self.superuser,
            content="This is a long note content used to test short_content preview functionality in django admin.",
        )
        note_admin = LeadNoteAdmin(LeadNote, admin.site)
        preview = note_admin.short_content(note)
        self.assertTrue(preview.endswith("..."))
        self.assertLessEqual(len(preview), 63)
