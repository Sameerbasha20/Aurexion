from rest_framework import status
from rest_framework.test import APITestCase

from apps.crm.models import Lead
from tests.crm.helpers import create_lead, make_user

LEADS_URL = "/api/v1/leads/"
DASHBOARD_URL = "/api/v1/bdm/dashboard/"

# Roles that are denied any CRM / BDM access.
NON_CRM_ROLES = [
    "client_user",
    "hr_manager",
    "content_manager",
    "support_executive",
]

# Roles with full CRM / BDM dashboard access.
FULL_ACCESS_ROLES = ["super_admin", "administrator", "bdm"]


class CrmRoleAccessMatrixTests(APITestCase):
    """
    Ensures the RBAC matrix for the CRM and BDM dashboard is correct across
    every application role.
    """

    def setUp(self):
        self.bdm = make_user("matrix_bdm", "bdm")
        self.sales = make_user("matrix_sales", "sales_executive")
        self.lead = create_lead(self.bdm, name="Matrix Lead", assigned_to=self.sales)

    def test_non_crm_roles_cannot_list_leads(self):
        for role in NON_CRM_ROLES:
            user = make_user(f"matrix_{role}", role)
            self.client.force_authenticate(user=user)
            response = self.client.get(LEADS_URL)
            self.assertEqual(
                response.status_code,
                status.HTTP_403_FORBIDDEN,
                f"{role} should be forbidden from listing leads",
            )

    def test_sales_can_list_but_sees_only_assigned(self):
        other_sales = make_user("matrix_other_sales", "sales_executive")
        self.client.force_authenticate(user=self.sales)
        response = self.client.get(LEADS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Matrix Lead")
        self.client.force_authenticate(user=other_sales)
        response = self.client.get(LEADS_URL)
        self.assertEqual(response.data["count"], 0)

    def test_full_access_roles_can_list_all_leads(self):
        for role in FULL_ACCESS_ROLES:
            user = make_user(f"matrix_full_{role}", role)
            self.client.force_authenticate(user=user)
            response = self.client.get(LEADS_URL)
            self.assertEqual(
                response.status_code,
                status.HTTP_200_OK,
                f"{role} should be able to list leads",
            )

    def test_only_pipeline_creators_can_create(self):
        for role in NON_CRM_ROLES + ["sales_executive"]:
            user = make_user(f"matrix_create_{role}", role)
            self.client.force_authenticate(user=user)
            response = self.client.post(LEADS_URL, {"name": "Nope"})
            self.assertEqual(
                response.status_code,
                status.HTTP_403_FORBIDDEN,
                f"{role} should not create leads",
            )
        for role in FULL_ACCESS_ROLES:
            user = make_user(f"matrix_create_ok_{role}", role)
            self.client.force_authenticate(user=user)
            response = self.client.post(LEADS_URL, {"name": "Yes"})
            self.assertEqual(
                response.status_code,
                status.HTTP_201_CREATED,
                f"{role} should create leads",
            )

    def test_dashboard_restricted_to_full_access_roles(self):
        for role in NON_CRM_ROLES + ["sales_executive"]:
            user = make_user(f"matrix_dash_{role}", role)
            self.client.force_authenticate(user=user)
            response = self.client.get(DASHBOARD_URL)
            self.assertEqual(
                response.status_code,
                status.HTTP_403_FORBIDDEN,
                f"{role} should be forbidden from the BDM dashboard",
            )
        for role in FULL_ACCESS_ROLES:
            user = make_user(f"matrix_dash_ok_{role}", role)
            self.client.force_authenticate(user=user)
            response = self.client.get(DASHBOARD_URL)
            self.assertEqual(
                response.status_code,
                status.HTTP_200_OK,
                f"{role} should access the BDM dashboard",
            )


class UnauthenticatedAccessTests(APITestCase):
    def test_unauthenticated_list(self):
        self.assertEqual(self.client.get(LEADS_URL).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_detail(self):
        self.assertEqual(self.client.get(f"{LEADS_URL}1/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_create(self):
        self.assertEqual(
            self.client.post(LEADS_URL, {"name": "X"}).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_status(self):
        self.assertEqual(
            self.client.post(f"{LEADS_URL}1/transition/", {"status": "contacted"}).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_assign(self):
        self.assertEqual(
            self.client.post(f"{LEADS_URL}1/assign/", {"assigned_to": 1}).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_export(self):
        self.assertEqual(self.client.get(f"{LEADS_URL}export/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_dashboard(self):
        self.assertEqual(self.client.get(DASHBOARD_URL).status_code, status.HTTP_401_UNAUTHORIZED)


class InputValidationSecurityTests(APITestCase):
    def setUp(self):
        self.bdm = make_user("sec_bdm", "bdm")
        self.client.force_authenticate(user=self.bdm)

    def test_sql_injection_in_search_is_neutralized(self):
        create_lead(self.bdm, name="Safe Corp")
        payload = "1' OR '1'='1"
        response = self.client.get(LEADS_URL, {"search": payload})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(response.data["count"], Lead.objects.count())
        for result in response.data["results"]:
            self.assertIn(payload, result["name"] + result["company"] + result["reference_id"])

    def test_xss_in_company_name_is_stored_not_executed(self):
        payload = "<script>alert(1)</script>"
        lead = create_lead(self.bdm, name="XSS Co", company=payload)
        lead.refresh_from_db()
        self.assertEqual(lead.company, payload)

    def test_oversized_payload_rejected(self):
        response = self.client.post(LEADS_URL, {"name": "A" * 300})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_priority_rejected(self):
        response = self.client.post(LEADS_URL, {"name": "Bad Priority", "priority": "nope"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_rejected(self):
        response = self.client.post(LEADS_URL, {"name": "Bad Email", "email": "not-an-email"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
