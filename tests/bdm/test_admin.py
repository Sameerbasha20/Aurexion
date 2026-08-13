from django.contrib import admin
from django.contrib.messages.storage.cookie import CookieStorage
from django.test import RequestFactory, TestCase
from apps.bdm.models import BdmLead, BdmFollowUp
from apps.bdm.admin import BdmLeadAdmin, BdmFollowUpAdmin
from tests.crm.helpers import create_lead, make_user


class BdmAdminSiteTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.bdm_user = make_user("bdm_admin_user", "bdm")
        self.bdm_user.is_staff = True
        self.bdm_user.is_superuser = True
        self.bdm_user.save()
        self.client.force_login(self.bdm_user)

    def test_bdm_models_registered_in_admin(self):
        self.assertTrue(admin.site.is_registered(BdmLead))
        self.assertTrue(admin.site.is_registered(BdmFollowUp))

    def test_bdm_lead_admin_actions(self):
        lead1 = create_lead(self.bdm_user, name="BDM Lead 1")
        lead2 = create_lead(self.bdm_user, name="BDM Lead 2")

        request = self.factory.get("/")
        request.user = self.bdm_user
        setattr(request, "_messages", CookieStorage(request))

        bdm_admin = BdmLeadAdmin(BdmLead, admin.site)
        qs = BdmLead.objects.filter(id__in=[lead1.id, lead2.id])

        # Test mark as proposal submitted
        bdm_admin.mark_as_proposal_submitted(request, qs)
        lead1.refresh_from_db()
        self.assertEqual(lead1.status, BdmLead.Status.PROPOSAL_SUBMITTED)

        # Test mark as won
        bdm_admin.mark_as_won(request, qs)
        lead2.refresh_from_db()
        self.assertEqual(lead2.status, BdmLead.Status.WON)
