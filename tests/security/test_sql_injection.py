"""
PHASE 2 — SQL injection regression tests.

Guarantees that every user-controlled parameter that reaches the database is
handled by Django's ORM / parameterized queries. Injection payloads (boolean,
quote, UNION, comment-style, numeric) must be treated strictly as data across
the affected user- and career-related APIs identified by the ZAP baseline scan:

  GET  /api/v1/careers/jobs/             search/filter parameters
  GET  /api/v1/careers/jobs/{job_id}/    path lookup
  POST /api/v1/auth/login/               username/password
  POST /api/v1/support/my-tickets/       subject/category/priority fields
  GET  /api/v1/cms/public/blog/          category/tag filters
  GET  /api/v1/cms/public/case-studies/  tech_stack filter

Normal legitimate values must continue to behave exactly as before.
"""
import urllib.parse

from django.contrib.auth.models import User
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.portal.models import SupportTicket
from apps.recruitment.models import JobVacancy

INJECTION_PAYLOADS = (
    # boolean-based injection
    "' OR '1'='1",
    "\" OR \"1\"=\"1",
    "' OR 1=1 --",
    "1 OR 1=1",
    "' OR '1'='1' --",
    # quote injection
    "'",
    "''",
    "\"",
    "`",
    "\\'",
    "';--",
    "%27",
    # UNION-style input
    "' UNION SELECT NULL--",
    "' UNION ALL SELECT username, password FROM auth_user--",
    "1 UNION SELECT NULL, NULL, NULL",
    # comment-style SQL input
    "1'--",
    "'--",
    "1#",
    "/*comment*/",
    "'; /* comment */ DROP TABLE portal_supportticket--",
    # numeric / stacked injection
    "1; DROP TABLE portal_supportticket--",
    "1; SELECT pg_sleep(10)",
    "0 OR 1=1",
)


class CareersJobListInjectionTests(APITestCase):
    """Search/filter parameters on the public jobs list are treated as data."""

    def setUp(self):
        self.job = JobVacancy.objects.create(
            job_id="ENG-PAYLOAD-PROOF",
            title="Payload Proof Engineer",
            department="Engineering",
            location="Remote",
            experience="3+ years",
            skills="Python",
            responsibilities="Verify injection safety",
            status=JobVacancy.Status.ACTIVE,
        )

    def _query(self, **params):
        return self.client.get("/api/v1/careers/jobs/", params)

    def test_injection_payloads_never_match_legitimate_jobs(self):
        """A payload must never behave as a wildcard or tautology."""
        for field in ("search", "department", "location", "experience"):
            for payload in INJECTION_PAYLOADS:
                with self.subTest(field=field, payload=payload):
                    cache.clear()
                    response = self._query(**{field: payload})
                    self.assertNotEqual(
                        response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    ids = [item["job_id"] for item in response.data]
                    self.assertNotIn(self.job.job_id, ids)

    def test_legitimate_search_still_works(self):
        cache.clear()
        response = self._query(search="Payload Proof")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["job_id"] for item in response.data]
        self.assertIn(self.job.job_id, ids)

    def test_legitimate_filter_still_works(self):
        cache.clear()
        response = self._query(department="Engineering", location="Remote")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["job_id"] for item in response.data]
        self.assertIn(self.job.job_id, ids)

    def test_plain_list_is_unchanged(self):
        cache.clear()
        response = self._query()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["job_id"] == self.job.job_id for item in response.data))


class CareersJobDetailInjectionTests(APITestCase):
    """The job_id path lookup never resolves injection payloads."""

    def setUp(self):
        self.job = JobVacancy.objects.create(
            job_id="ENG-DETAIL-PROOF",
            title="Detail Proof Engineer",
            department="Engineering",
            location="Remote",
            experience="3+ years",
            skills="Python",
            responsibilities="Verify injection safety",
            status=JobVacancy.Status.ACTIVE,
        )

    def test_injection_payloads_return_404(self):
        for payload in INJECTION_PAYLOADS:
            with self.subTest(payload=payload):
                encoded = urllib.parse.quote(payload, safe="")
                response = self.client.get(f"/api/v1/careers/jobs/{encoded}/")
                self.assertNotEqual(
                    response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_legitimate_job_id_returns_200(self):
        response = self.client.get(f"/api/v1/careers/jobs/{self.job.job_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["job_id"], self.job.job_id)


class LoginInjectionTests(APITestCase):
    """Injection in login credentials is rejected, never treated as SQL."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="legit_user", password="LegitP@ss10"
        )

    def test_injection_username_never_authenticates(self):
        for payload in INJECTION_PAYLOADS:
            with self.subTest(payload=payload):
                cache.clear()
                response = self.client.post(
                    reverse("login"),
                    {"username": payload, "password": "Whatever@10"},
                    format="json",
                )
                self.assertNotEqual(
                    response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_injection_password_never_authenticates(self):
        for payload in INJECTION_PAYLOADS:
            with self.subTest(payload=payload):
                cache.clear()
                response = self.client.post(
                    reverse("login"),
                    {"username": "legit_user", "password": payload},
                    format="json",
                )
                self.assertNotEqual(
                    response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_legitimate_credentials_still_authenticate(self):
        cache.clear()
        response = self.client.post(
            reverse("login"),
            {"username": "legit_user", "password": "LegitP@ss10"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)


class SupportTicketInjectionTests(APITestCase):
    """Injection in ticket creation is stored as literal data."""

    def setUp(self):
        self.client_user = User.objects.create_user(
            username="sqlite_client", password="ClientP@ss10"
        )
        self.client_user.profile.role = "client_user"
        self.client_user.profile.save()
        self.client.force_authenticate(user=self.client_user)
        self.url = reverse("client-ticket-list")

    def test_injection_subject_is_stored_as_data(self):
        for payload in INJECTION_PAYLOADS:
            with self.subTest(payload=payload):
                response = self.client.post(
                    self.url,
                    {"subject": payload, "category": "bug", "priority": "high"},
                )
                self.assertNotEqual(
                    response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                ticket = SupportTicket.objects.get(subject=payload)
                self.assertEqual(ticket.subject, payload)
                self.assertTrue(ticket.ticket_id.startswith("TKT-"))
                self.assertEqual(
                    SupportTicket.objects.filter(subject=payload).count(), 1
                )

    def test_normal_subject_with_injection_siblings_is_stored_as_data(self):
        for i, payload in enumerate(INJECTION_PAYLOADS):
            with self.subTest(payload=payload):
                response = self.client.post(
                    self.url,
                    {
                        "subject": f"Normal subject {i}",
                        "category": "bug",
                        "priority": "high",
                    },
                )
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                ticket = SupportTicket.objects.get(subject=f"Normal subject {i}")
                self.assertTrue(ticket.ticket_id.startswith("TKT-"))
        ids = list(
            SupportTicket.objects.filter(client_user=self.client_user).values_list(
                "ticket_id", flat=True
            )
        )
        self.assertEqual(len(ids), len(set(ids)))

    def test_legitimate_ticket_creation_is_unchanged(self):
        response = self.client.post(
            self.url,
            {"subject": "Please reset my password", "category": "bug", "priority": "high"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["subject"], "Please reset my password")

    def test_injection_in_category_and_priority_is_rejected_not_500(self):
        for payload in ("' OR '1'='1", "1; DROP TABLE portal_supportticket--", "'"):
            with self.subTest(payload=payload):
                response = self.client.post(
                    self.url,
                    {"subject": "x", "category": payload, "priority": payload},
                )
                self.assertNotEqual(
                    response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                self.assertIn(
                    response.status_code,
                    (status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST),
                )


class TicketIdGenerationInjectionTests(APITestCase):
    """generate_ticket_id uses an ORM query and remains collision-free."""

    def setUp(self):
        SupportTicket.objects.all().delete()
        self.client_user = User.objects.create_user(
            username="ticket_gen_client", password="ClientP@ss10"
        )
        self.client_user.profile.role = "client_user"
        self.client_user.profile.save()

    def test_ids_are_sequential_unique_and_year_prefixed(self):
        for _ in range(3):
            SupportTicket.objects.create(
                ticket_id=SupportTicket.generate_ticket_id(),
                client_user=self.client_user,
                subject="plain subject",
                category="bug",
                priority="low",
            )
        ids = list(
            SupportTicket.objects.filter(client_user=self.client_user).values_list(
                "ticket_id", flat=True
            )
        )
        self.assertEqual(len(ids), len(set(ids)))
        self.assertTrue(all(tid.startswith("TKT-") for tid in ids))
        suffixes = sorted(int(tid.rsplit("-", 1)[1]) for tid in ids)
        self.assertEqual(suffixes, list(range(1, len(ids) + 1)))

    def test_like_style_characters_in_subject_do_not_affect_generation(self):
        for i, subject in enumerate(
            (
                "100% coverage needed",
                "100_%_special_%characters",
                "foo' OR 1=1 --",
                "resume % ' OR 1=1 -- upload",
            )
        ):
            ticket = SupportTicket.objects.create(
                ticket_id=SupportTicket.generate_ticket_id(),
                client_user=self.client_user,
                subject=subject,
                category="bug",
                priority="low",
            )
            self.assertTrue(ticket.ticket_id.startswith("TKT-"))
            self.assertNotIn("%", ticket.ticket_id.split("-", 1)[1])


class CmsFilterInjectionTests(APITestCase):
    """CMS public filter parameters are treated as data."""

    def test_case_study_tech_stack_injection_returns_200(self):
        for payload in INJECTION_PAYLOADS:
            with self.subTest(payload=payload):
                response = self.client.get(
                    "/api/v1/cms/public/case-studies/", {"tech_stack": payload}
                )
                self.assertNotEqual(
                    response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_blog_tag_and_category_injection_returns_200(self):
        for payload in INJECTION_PAYLOADS:
            with self.subTest(payload=payload):
                response = self.client.get(
                    "/api/v1/cms/public/blog/", {"tag": payload, "category": payload}
                )
                self.assertNotEqual(
                    response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                self.assertEqual(response.status_code, status.HTTP_200_OK)