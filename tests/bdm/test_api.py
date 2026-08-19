import csv
import io

from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import AuditLog
from apps.crm.models import Lead
from tests.crm.helpers import create_lead, make_user

LEADS_URL = "/api/v1/leads/"
DASHBOARD_URL = "/api/v1/bdm/dashboard/"


class BaseBdmAPITestCase(APITestCase):
    def setUp(self):
        self.super_admin = make_user("super_admin_bdm_api", "super_admin")
        self.admin = make_user("admin_bdm_api", "administrator")
        self.bdm = make_user("bdm_bdm_api", "bdm")
        self.sales = make_user("sales_bdm_api", "sales_executive")
        self.client_user = make_user("client_bdm_api", "client_user")

    def auth(self, user):
        self.client.force_authenticate(user=user)


class BdmDashboardAPITests(BaseBdmAPITestCase):
    def test_dashboard_returns_stats(self):
        from apps.crm.services import mark_lead_lost, mark_lead_won

        won = create_lead(self.bdm, name="Pipeline Lead", status=Lead.Status.NEGOTIATION)
        mark_lead_won(lead=won, actor=self.bdm)
        lost = create_lead(self.bdm, name="Truly Lost")
        mark_lead_lost(lead=lost, actor=self.bdm, reason="competitor")
        create_lead(self.bdm, name="Fresh Lead")

        self.auth(self.bdm)
        response = self.client.get(DASHBOARD_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["won_leads"], 1)
        self.assertEqual(response.data["lost_leads"], 1)
        self.assertEqual(response.data["total_leads"], 3)
        self.assertIn("pipeline_summary", response.data)
        self.assertIn("recent_activities", response.data)

    def test_dashboard_stats_are_live(self):
        self.auth(self.bdm)
        before = self.client.get(DASHBOARD_URL).data["total_leads"]
        create_lead(self.bdm, name="Just Added")
        after = self.client.get(DASHBOARD_URL).data["total_leads"]
        self.assertEqual(after, before + 1)

    def test_dashboard_accessible_to_admin(self):
        self.auth(self.admin)
        response = self.client.get(DASHBOARD_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_dashboard_accessible_to_super_admin(self):
        self.auth(self.super_admin)
        response = self.client.get(DASHBOARD_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_dashboard_denied_to_sales(self):
        self.auth(self.sales)
        self.assertEqual(self.client.get(DASHBOARD_URL).status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_denied_to_client(self):
        self.auth(self.client_user)
        self.assertEqual(self.client.get(DASHBOARD_URL).status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_denied_to_unauthenticated(self):
        self.assertEqual(self.client.get(DASHBOARD_URL).status_code, status.HTTP_401_UNAUTHORIZED)


class BdmLeadAPITests(BaseBdmAPITestCase):
    def test_bdm_can_create_lead(self):
        self.auth(self.bdm)
        response = self.client.post(LEADS_URL, {"name": "Bdm Org"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["reference_id"].startswith("AUR-LEAD-"))
        self.assertEqual(response.data["status"], Lead.Status.NEW)

    def test_retrieve_existing_lead(self):
        lead = create_lead(self.bdm, name="Find Me")
        self.auth(self.bdm)
        response = self.client.get(f"{LEADS_URL}{lead.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reference_id"], lead.reference_id)

    def test_retrieve_nonexistent_lead(self):
        self.auth(self.bdm)
        self.assertEqual(self.client.get(f"{LEADS_URL}999999/").status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update(self):
        lead = create_lead(self.bdm, name="Old Name")
        self.auth(self.bdm)
        response = self.client.patch(f"{LEADS_URL}{lead.id}/", {"name": "New Name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")

    def test_lost_with_reason(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.post(f"{LEADS_URL}{lead.id}/lost/", {"reason": "Budget"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.LOST)

    def test_lost_without_reason(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        self.assertEqual(
            self.client.post(f"{LEADS_URL}{lead.id}/lost/").status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_reopen_lost_lead(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        self.client.post(f"{LEADS_URL}{lead.id}/lost/", {"reason": "Cold"})
        response = self.client.post(f"{LEADS_URL}{lead.id}/reopen/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.NEW)

    def test_filter_by_status_and_source(self):
        create_lead(self.bdm, name="Online Lead", source="website")
        create_lead(self.bdm, name="Referral Lead", source="referral")
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"source": "website"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Online Lead")

    def test_search_by_company(self):
        create_lead(self.bdm, name="Alpha", company="Searchable Corp")
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"search": "Searchable"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["company"], "Searchable Corp")

    def test_pagination(self):
        for i in range(5):
            create_lead(self.bdm, name=f"Paged {i}")
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"page_size": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["count"], 5)


class BdmExportTests(BaseBdmAPITestCase):
    def test_export_csv(self):
        lead = create_lead(self.bdm, name="Exportable", company="Export Inc")
        self.auth(self.bdm)
        response = self.client.get(f"{LEADS_URL}export/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/csv")
        payload = b"".join(response.streaming_content).decode("utf-8-sig")
        self.assertIn(lead.reference_id, payload)
        self.assertIn("Export Inc", payload)

    def test_export_creates_audit_log(self):
        self.auth(self.bdm)
        self.client.get(f"{LEADS_URL}export/")
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="EXPORT", user=self.bdm).exists()
        )

    def test_export_with_filter(self):
        create_lead(self.bdm, name="Keep Me", source="referral")
        create_lead(self.bdm, name="Drop Me", source="cold_call")
        self.auth(self.bdm)
        response = self.client.get(f"{LEADS_URL}export/", {"source": "referral"})
        payload = b"".join(response.streaming_content).decode("utf-8-sig")
        self.assertIn("Keep Me", payload)
        self.assertNotIn("Drop Me", payload)
