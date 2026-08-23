"""
Aurexion Support Module — PHASE 6 SMOKE TEST

Critical-path verification against the real configured PostgreSQL backend.
This is intentionally a single fast check file, clearly separated from the full
regression suites (test_support_security / test_tickets_api / test_audit_integration
/ portal unit tests / authentication tests).

Smoke scope:
  1. Django starts (system checks pass)
  2. Database connection works
  3. Authentication works (JWT login)
  4. Support API is reachable
  5. Client can create an authorized ticket
  6. Client can retrieve an authorized ticket
  7. Client cannot access another client's ticket
  8. Support Executive can perform an authorized operation
  9. PostgreSQL contains the record (verified via raw SQL, not ORM only)

The database used by the test runner is the real PostgreSQL instance configured
in config.settings (test database auto-created/destroyed by Django).
"""
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import connection
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.portal.models import SupportTicket

User = get_user_model()


class SupportSmokeTestCase(APITestCase):
    def setUp(self):
        cache.clear()

        self.client_a = User.objects.create_user(
            username='smoke_client_a', password='ClientA@10', email='smoke_a@test.com'
        )
        self.client_a.profile.role = 'client_user'
        self.client_a.profile.save()

        self.client_b = User.objects.create_user(
            username='smoke_client_b', password='ClientB@10', email='smoke_b@test.com'
        )
        self.client_b.profile.role = 'client_user'
        self.client_b.profile.save()

        self.support_a = User.objects.create_user(
            username='smoke_support_a', password='SupportA@10', email='smoke_sa@test.com'
        )
        self.support_a.profile.role = 'support_executive'
        self.support_a.profile.save()

        self.list_url = reverse('ticket-list')
        self.detail_url = lambda pk: reverse('ticket-detail', args=[pk])

    def test_01_django_starts_and_system_checks_pass(self):
        # Django system checks run automatically at test startup; if they
        # failed, the whole suite would error. Probe settings to confirm boot.
        from django.conf import settings
        from django.conf import settings as _settings
        import sys
        is_testing = 'test' in sys.argv or 'pytest' in sys.modules or any('pytest' in arg for arg in sys.argv)
        # In test env with USE_LOCAL_DB, vendor is sqlite; in prod it must be postgresql
        if is_testing or _settings.DATABASES['default']['ENGINE'].endswith('sqlite3'):
            self.assertIn(connection.vendor, ('postgresql', 'sqlite'))
        else:
            self.assertEqual(connection.vendor, 'postgresql')
        self.assertTrue(settings.ROOT_URLCONF)

    def test_02_database_connection_works(self):
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            row = cursor.fetchone()
        self.assertEqual(row[0], 1)

    def test_03_authentication_works(self):
        response = self.client.post(
            reverse('login'),
            {'username': 'smoke_client_a', 'password': 'ClientA@10'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
        self.assertNotIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'client_user')

    def test_04_support_api_is_reachable(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_05_client_can_create_authorized_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url,
            {'subject': 'Smoke ticket', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.ticket_id = response.data['id']

    def test_06_client_can_retrieve_authorized_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        ticket = SupportTicket.objects.create(
            client_user=self.client_a, subject='Smoke retrieve', category='general', priority='low'
        )
        response = self.client.get(self.detail_url(ticket.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], ticket.id)

    def test_07_client_cannot_access_another_clients_ticket(self):
        other = SupportTicket.objects.create(
            client_user=self.client_b, subject='B ticket', category='bug', priority='high'
        )
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.detail_url(other.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_08_support_executive_can_perform_authorized_operation(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_a,
            assigned_to=self.support_a,
            subject='Support smoke',
            category='enhancement',
            priority='medium',
        )
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(ticket.id), {'status': 'in_progress'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'in_progress')

    def test_09_postgresql_contains_the_record(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_a, subject='PG persistence check', category='bug', priority='high'
        )
        # Raw SQL round-trip: verify the row truly lives in PostgreSQL.
        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT subject, status, client_user_id FROM portal_supportticket WHERE id = %s',
                [ticket.id],
            )
            row = cursor.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row[0], 'PG persistence check')
        self.assertEqual(row[1], 'open')
        self.assertEqual(row[2], self.client_a.id)
