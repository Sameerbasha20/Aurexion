import json

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.portal.models import SupportTicket
from apps.recruitment.storage import _validate_storage_path


class StoragePathValidationTestCase(APITestCase):
    """Defense-in-depth: storage object keys must stay within the bucket."""

    def test_accepts_safe_paths(self):
        _validate_storage_path("applications/abc123/resume.pdf")

    def test_rejects_traversal(self):
        for bad in (
            "applications/../resume.pdf",
            "applications/%2e%2e/resume.pdf",
            "../resume.pdf",
            "applications//resume.pdf",
            "/etc/passwd",
            "applications/..\\resume.pdf",
            "applications/./resume.pdf",
            "",
        ):
            with self.subTest(bad=bad):
                with self.assertRaises(ValueError):
                    _validate_storage_path(bad)


class OversizedInputHandlingTestCase(APITestCase):
    """Oversized/malformed payloads must be rejected with 4xx, never 500."""

    def test_oversized_multipart_upload_returns_400(self):
        oversized = SimpleUploadedFile(
            "resume.pdf",
            b"%PDF-" + b"0" * (6 * 1024 * 1024),
            content_type="application/pdf",
        )
        data = {
            "job_id": "JOB-1",
            "first_name": "Test",
            "last_name": "User",
            "email": "candidate@example.com",
            "phone": "1234567890",
            "resume": oversized,
        }
        response = self.client.post(reverse("public-apply"), data, format="multipart")
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn(response.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE))

    def test_oversized_json_body_returns_400(self):
        payload = json.dumps({"username": "u" * (6 * 1024 * 1024), "password": "p"})
        response = self.client.post(
            reverse("login"), payload, content_type="application/json"
        )
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SQLInjectionProbeTestCase(APITestCase):
    """Injection payloads must be handled safely (parameterized/ORM queries)."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="client_probe", password="ClientP@ss10"
        )
        self.user.profile.role = "client_user"
        self.user.profile.save()

    def test_injection_in_job_detail_lookup_returns_404(self):
        url = "/api/v1/careers/jobs/'%20OR%20'1'%3D'1/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_injection_in_public_search_returns_200(self):
        url = "/api/v1/careers/jobs/?search='%20OR%20'1'%3D'1"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_injection_in_login_returns_400_not_500(self):
        response = self.client.post(
            reverse("login"),
            {"username": "' OR '1'='1", "password": "' OR '1'='1"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ticket_id_generation_uses_parameterized_query(self):
        client = User.objects.create_user(
            username="ticket_client", password="ClientP@ss10"
        )
        client.profile.role = "client_user"
        client.profile.save()
        for _ in range(2):
            SupportTicket.objects.create(
                ticket_id=SupportTicket.generate_ticket_id(),
                client_user=client,
                subject="resume % ' OR 1=1 -- upload",
                category="bug",
                priority="low",
                status="open",
            )
        ids = list(
            SupportTicket.objects.filter(client_user=client).values_list(
                "ticket_id", flat=True
            )
        )
        self.assertEqual(len(ids), len(set(ids)))
        self.assertTrue(all(tid.startswith("TKT-") for tid in ids))


class ErrorHandlerTestCase(APITestCase):
    """Unhandled routes return generic JSON errors, not HTML/stack traces."""

    @override_settings(DEBUG=False)
    def test_unknown_api_path_returns_json_404(self):
        response = self.client.get("/api/v1/no-such-endpoint/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response["Content-Type"].split(";")[0], "application/json")
        self.assertIn("detail", response.json())

    @override_settings(DEBUG=False)
    def test_unknown_path_returns_json_404(self):
        response = self.client.get("/no-such-path/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response["Content-Type"].split(";")[0], "application/json")
        self.assertIn("detail", response.json())
