from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.crm.models import EstimatorSubmission


class EstimatorCalculateApiTests(TestCase):
    """Unit and Integration tests for BUG-05 Estimator Calculation API."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/estimator/calculate/"
        self.crm_url = "/api/v1/crm/estimator/calculate/"

    def test_calculate_estimator_success(self):
        payload = {
            "project_scope": ["web_app", "mobile_app"],
            "platform_scale": "large",
            "user_scale": "50k",
            "compliance_requirements": ["hipaa", "gdpr"],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("submission_id", response.data)
        self.assertIn("engineering_effort_hours", response.data)
        self.assertIn("indicative_budget_min", response.data)
        self.assertIn("indicative_budget_max", response.data)
        self.assertIn("disclaimer", response.data)

        submission_id = response.data["submission_id"]
        submission = EstimatorSubmission.objects.get(id=submission_id)
        self.assertEqual(submission.platform_scale, "large")
        self.assertEqual(submission.user_scale, "50k")

    def test_crm_estimator_alias_route_success(self):
        payload = {
            "project_scope": ["backend_api"],
            "platform_scale": "medium",
            "user_scale": "10k",
            "compliance_requirements": [],
        }
        response = self.client.post(self.crm_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("submission_id", response.data)

