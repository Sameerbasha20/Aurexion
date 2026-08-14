import csv
import io

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import AuditLog
from apps.crm.models import Lead, LeadFollowUp, LeadNote
from apps.crm.services import mark_lead_won
from tests.crm.helpers import create_lead, make_user

LEADS_URL = "/api/v1/leads/"
DASHBOARD_URL = "/api/v1/bdm/dashboard/"


class BaseCrmAPITestCase(APITestCase):
    def setUp(self):
        self.super_admin = make_user("super_admin_api", "super_admin")
        self.admin = make_user("admin_api", "administrator")
        self.bdm = make_user("bdm_api", "bdm")
        self.sales = make_user("sales_api", "sales_executive")
        self.other_sales = make_user("other_sales_api", "sales_executive")
        self.hr = make_user("hr_api", "hr_manager")
        self.client_user = make_user("client_api", "client_user")

    def auth(self, user):
        self.client.force_authenticate(user=user)


class LeadCRUDPermissionTests(BaseCrmAPITestCase):
    def test_unauthenticated_list_returns_401(self):
        response = self.client.get(LEADS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_client_user_cannot_access_leads(self):
        self.auth(self.client_user)
        response = self.client.get(LEADS_URL)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_hr_cannot_access_leads(self):
        self.auth(self.hr)
        self.assertEqual(self.client.get(LEADS_URL).status_code, status.HTTP_403_FORBIDDEN)

    def test_bdm_can_list_all_leads(self):
        create_lead(self.bdm, name="Lead A")
        create_lead(self.bdm, name="Lead B")
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_admin_can_list_all_leads(self):
        create_lead(self.bdm, name="Lead A")
        self.auth(self.admin)
        self.assertEqual(self.client.get(LEADS_URL).status_code, status.HTTP_200_OK)

    def test_sales_sees_only_assigned_leads(self):
        create_lead(self.bdm, name="Owned", assigned_to=self.sales)
        create_lead(self.bdm, name="Not Owned")
        self.auth(self.sales)
        response = self.client.get(LEADS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Owned")

    def test_sales_cannot_retrieve_unassigned_lead(self):
        lead = create_lead(self.bdm, name="Secret")
        self.auth(self.sales)
        response = self.client.get(f"{LEADS_URL}{lead.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_sales_cannot_access_other_sales_lead(self):
        lead = create_lead(self.bdm, name="Colleague Lead", assigned_to=self.other_sales)
        self.auth(self.sales)
        self.assertEqual(self.client.get(f"{LEADS_URL}{lead.id}/").status_code, status.HTTP_404_NOT_FOUND)

    def test_sales_cannot_create_lead(self):
        self.auth(self.sales)
        response = self.client.post(LEADS_URL, {"name": "Nope"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_bdm_can_create_lead(self):
        self.auth(self.bdm)
        response = self.client.post(LEADS_URL, {"name": "New Org", "company": "Org Inc"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["reference_id"].startswith("AUR-LEAD-"))
        self.assertEqual(response.data["status"], Lead.Status.NEW)

    def test_create_lead_requires_name(self):
        self.auth(self.bdm)
        response = self.client.post(LEADS_URL, {"email": "x@example.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sales_cannot_delete_lead(self):
        lead = create_lead(self.bdm, assigned_to=self.sales)
        self.auth(self.sales)
        self.assertEqual(self.client.delete(f"{LEADS_URL}{lead.id}/").status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_lead(self):
        lead = create_lead(self.bdm)
        self.auth(self.admin)
        self.assertEqual(self.client.delete(f"{LEADS_URL}{lead.id}/").status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_lead_logs_audit(self):
        lead = create_lead(self.bdm)
        self.auth(self.admin)
        self.client.delete(f"{LEADS_URL}{lead.id}/")
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="LEAD_DELETED", object_id=str(lead.id)).exists()
        )


class LeadLifecycleAPITests(BaseCrmAPITestCase):
    def test_valid_transition(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.post(
            f"{LEADS_URL}{lead.id}/transition/", {"status": Lead.Status.CONTACTED}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.CONTACTED)

    def test_invalid_transition_returns_409(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.post(
            f"{LEADS_URL}{lead.id}/transition/", {"status": Lead.Status.WON}
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_invalid_status_value_returns_400(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.post(f"{LEADS_URL}{lead.id}/transition/", {"status": "bogus"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_won_endpoint_requires_negotiation(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        self.assertEqual(
            self.client.post(f"{LEADS_URL}{lead.id}/won/").status_code,
            status.HTTP_409_CONFLICT,
        )

    def test_lost_endpoint_allows_early_termination(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.post(f"{LEADS_URL}{lead.id}/lost/", {"reason": "Pricing mismatch"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.LOST)
        self.assertEqual(response.data["lost_reason"], "Pricing mismatch")

    def test_lost_endpoint_requires_reason(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.post(f"{LEADS_URL}{lead.id}/lost/", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        lead.refresh_from_db()
        self.assertEqual(lead.status, Lead.Status.NEW)

    def test_reopen_lost_lead(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        self.client.post(f"{LEADS_URL}{lead.id}/lost/", {"reason": "Budget cut"})
        response = self.client.post(f"{LEADS_URL}{lead.id}/reopen/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.NEW)
        self.assertEqual(response.data["lost_reason"], "")

    def test_reopen_non_lost_lead_returns_409(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.post(f"{LEADS_URL}{lead.id}/reopen/")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_patch_cannot_change_status(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.patch(f"{LEADS_URL}{lead.id}/", {"status": Lead.Status.WON, "priority": "high"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.NEW)
        self.assertEqual(response.data["priority"], "high")

    def test_qualify_endpoint_from_contacted(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        self.client.post(f"{LEADS_URL}{lead.id}/transition/", {"status": Lead.Status.CONTACTED})
        response = self.client.post(f"{LEADS_URL}{lead.id}/qualify/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.QUALIFIED)


class LeadAssignmentAPITests(BaseCrmAPITestCase):
    def test_assign_lead(self):
        lead = create_lead(self.bdm)
        self.auth(self.admin)
        response = self.client.post(f"{LEADS_URL}{lead.id}/assign/", {"assigned_to": self.sales.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["assigned_to"], self.sales.id)

    def test_sales_cannot_assign(self):
        lead = create_lead(self.bdm, assigned_to=self.sales)
        self.auth(self.sales)
        response = self.client.post(
            f"{LEADS_URL}{lead.id}/assign/", {"assigned_to": self.other_sales.id}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assign_to_client_user_rejected(self):
        lead = create_lead(self.bdm)
        self.auth(self.admin)
        response = self.client.post(
            f"{LEADS_URL}{lead.id}/assign/", {"assigned_to": self.client_user.id}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LeadNestedResourceAPITests(BaseCrmAPITestCase):
    def test_create_and_list_follow_ups(self):
        lead = create_lead(self.bdm, assigned_to=self.sales)
        self.auth(self.bdm)
        response = self.client.post(
            f"{LEADS_URL}{lead.id}/follow-ups/",
            {"follow_up_type": "phone", "scheduled_at": "2026-03-01T10:00:00Z", "notes": "Reminder"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        list_response = self.client.get(f"{LEADS_URL}{lead.id}/follow-ups/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

    def test_complete_follow_up_via_endpoint(self):
        lead = create_lead(self.bdm, assigned_to=self.sales)
        followup = LeadFollowUp.objects.create(
            lead=lead, created_by=self.bdm, follow_up_type="email", scheduled_at=timezone.now()
        )
        self.auth(self.sales)
        response = self.client.post(f"{LEADS_URL}{lead.id}/follow-ups/{followup.id}/complete/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        followup.refresh_from_db()
        self.assertEqual(followup.status, LeadFollowUp.Status.COMPLETED)

    def test_sales_cannot_access_other_lead_follow_ups(self):
        lead = create_lead(self.bdm)
        LeadFollowUp.objects.create(lead=lead, created_by=self.bdm, scheduled_at=timezone.now())
        self.auth(self.sales)
        response = self.client.get(f"{LEADS_URL}{lead.id}/follow-ups/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_and_update_own_note(self):
        lead = create_lead(self.bdm, assigned_to=self.sales)
        self.auth(self.sales)
        response = self.client.post(f"{LEADS_URL}{lead.id}/notes/", {"content": "First note"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        note_id = response.data["id"]
        patch = self.client.patch(f"{LEADS_URL}{lead.id}/notes/{note_id}/", {"content": "Updated note"})
        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        self.assertEqual(patch.data["content"], "Updated note")

    def test_sales_cannot_update_other_users_note(self):
        lead = create_lead(self.bdm, assigned_to=self.sales)
        note = LeadNote.objects.create(lead=lead, created_by=self.other_sales, content="Their note")
        self.auth(self.sales)
        response = self.client.patch(f"{LEADS_URL}{lead.id}/notes/{note.id}/", {"content": "Hacked"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_activities_endpoint_returns_history(self):
        lead = create_lead(self.bdm)
        self.auth(self.bdm)
        response = self.client.get(f"{LEADS_URL}{lead.id}/activities/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["action"], "LEAD_CREATED")


class LeadFilterAndSearchTests(BaseCrmAPITestCase):
    def setUp(self):
        super().setUp()
        self.lead_a = create_lead(self.bdm, name="Alpha", company="Company A", status=Lead.Status.NEW)
        self.lead_b = create_lead(self.bdm, name="Beta", company="Company B", status=Lead.Status.CONTACTED)
        self.lead_a.priority = Lead.Priority.HIGH
        self.lead_a.save()

    def test_filter_by_status(self):
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"status": "contacted"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["reference_id"], self.lead_b.reference_id)

    def test_filter_by_priority(self):
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"priority": "high"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["reference_id"], self.lead_a.reference_id)

    def test_search_by_company(self):
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"search": "Company B"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["reference_id"], self.lead_b.reference_id)

    def test_filter_by_assigned_to(self):
        create_lead(self.bdm, name="Assigned", assigned_to=self.sales)
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"assigned_to": self.sales.id})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Assigned")

    def test_overdue_filter(self):
        lead = create_lead(self.bdm, name="Overdue Lead")
        LeadFollowUp.objects.create(
            lead=lead,
            created_by=self.bdm,
            scheduled_at=timezone.now() - timezone.timedelta(days=1),
        )
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"overdue": "true"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Overdue Lead")

    def test_ordering(self):
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"ordering": "name"})
        names = [row["name"] for row in response.data["results"]]
        self.assertEqual(names, sorted(names))

    def test_pagination(self):
        for i in range(25):
            create_lead(self.bdm, name=f"Bulk {i}")
        self.auth(self.bdm)
        response = self.client.get(LEADS_URL, {"page_size": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["count"], 27)


class LeadExportTests(BaseCrmAPITestCase):
    def test_export_as_bdm_streams_csv(self):
        lead = create_lead(self.bdm, name="Export Co", company="Export Inc")
        self.auth(self.bdm)
        response = self.client.get(f"{LEADS_URL}export/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/csv")
        payload = b"".join(response.streaming_content)
        rows = list(csv.reader(io.StringIO(payload.decode("utf-8-sig"))))
        self.assertEqual(rows[0][0], "reference_id")
        self.assertTrue(any(row[0] == lead.reference_id for row in rows))
        self.assertTrue(
            AuditLog.objects.filter(module="crm", action="EXPORT", user=self.bdm).exists()
        )

    def test_export_requires_auth(self):
        response = self.client.get(f"{LEADS_URL}export/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_export_filtered_by_role(self):
        create_lead(self.bdm, name="Not Owned")
        self.auth(self.sales)
        response = self.client.get(f"{LEADS_URL}export/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(b"Not Owned", b"".join(response.streaming_content))


class BdmDashboardTests(BaseCrmAPITestCase):
    def test_dashboard_returns_real_metrics(self):
        create_lead(self.bdm, name="Won Lead", status=Lead.Status.NEGOTIATION)
        won = create_lead(self.bdm, name="Won", status=Lead.Status.NEGOTIATION)
        mark_lead_won(lead=won, actor=self.bdm)
        self.auth(self.bdm)
        response = self.client.get(DASHBOARD_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["won_leads"], 1)
        self.assertEqual(response.data["active_opportunities"], 1)
        self.assertGreaterEqual(response.data["total_leads"], 2)

    def test_dashboard_denied_for_sales(self):
        self.auth(self.sales)
        self.assertEqual(self.client.get(DASHBOARD_URL).status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_denied_for_unauthenticated(self):
        self.assertEqual(self.client.get(DASHBOARD_URL).status_code, status.HTTP_401_UNAUTHORIZED)
