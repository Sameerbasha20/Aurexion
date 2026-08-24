from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import AuditLog
from apps.portal.models import SupportTicket

User = get_user_model()


class SupportAuditIntegrationTestCase(APITestCase):
    """
    Phase 5 Audit Logging Integration tests.

    Verifies that Support operations write events to the existing AuditLog
    infrastructure via `log_audit_event` (single audit system), that previous
    and updated state is captured, and that audit records cannot be read,
    modified or deleted by ordinary users.
    """

    def setUp(self):
        cache.clear()

        self.client_a = User.objects.create_user(
            username='client_a', password='ClientA@10', email='a@test.com'
        )
        self.client_a.profile.role = 'client_user'
        self.client_a.profile.save()

        self.client_b = User.objects.create_user(
            username='client_b', password='ClientB@10', email='b@test.com'
        )
        self.client_b.profile.role = 'client_user'
        self.client_b.profile.save()

        self.support_a = User.objects.create_user(
            username='support_a', password='SupportA@10', email='sa@test.com'
        )
        self.support_a.profile.role = 'support_executive'
        self.support_a.profile.save()

        self.sales_user = User.objects.create_user(
            username='sales_user', password='SalesUs@10', email='sales@test.com'
        )
        self.sales_user.profile.role = 'sales_executive'
        self.sales_user.profile.save()

        self.super_admin = User.objects.create_user(
            username='super_admin', password='SuperAd@10', email='super@test.com'
        )
        self.super_admin.profile.role = 'super_admin'
        self.super_admin.profile.save()

        self.ticket_a = SupportTicket.objects.create(
            client_user=self.client_a, subject='Ticket A', category='bug', priority='high'
        )
        self.ticket_b = SupportTicket.objects.create(
            client_user=self.client_b, subject='Ticket B', category='bug', priority='high'
        )
        self.assigned_to_a = SupportTicket.objects.create(
            client_user=self.client_a,
            assigned_to=self.support_a,
            subject='Assigned to A',
            category='enhancement',
            priority='medium',
        )

        self.tickets_url = reverse('ticket-list')
        self.detail_url = lambda pk: reverse('ticket-detail', args=[pk])
        self.audit_list_url = reverse('audit-log-list')

    def _latest_audit(self, action=None):
        queryset = AuditLog.objects.filter(module='portal')
        if action:
            queryset = queryset.filter(action=action)
        return queryset.order_by('-timestamp').first()

    # ------------------------------------------------------------------
    # create -> audit verified
    # ------------------------------------------------------------------

    def test_create_ticket_creates_audit_event(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.tickets_url,
            {'subject': 'Audited issue', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        audit = self._latest_audit('CREATE')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.client_a)
        self.assertEqual(audit.action, 'CREATE')
        self.assertEqual(audit.module, 'portal')
        self.assertEqual(audit.object_id, str(response.data['id']))
        self.assertEqual(audit.updated_state['status'], 'open')
        self.assertEqual(audit.updated_state['subject'], 'Audited issue')
        self.assertIn('Created ticket', audit.repr)
        self.assertIsNone(audit.previous_state)

    # ------------------------------------------------------------------
    # update (subject) -> audit verified
    # ------------------------------------------------------------------

    def test_update_subject_creates_audit_event(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(
            self.detail_url(self.ticket_a.id), {'subject': 'Renamed'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        audit = self._latest_audit('UPDATE')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.client_a)
        self.assertEqual(audit.object_id, str(self.ticket_a.id))
        self.assertEqual(audit.previous_state['subject'], 'Ticket A')
        self.assertEqual(audit.updated_state['subject'], 'Renamed')

    # ------------------------------------------------------------------
    # status update -> audit verified
    # ------------------------------------------------------------------

    def test_status_update_creates_audit_event(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(self.assigned_to_a.id), {'status': 'in_progress'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        audit = self._latest_audit('UPDATE')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.previous_state['status'], 'open')
        self.assertEqual(audit.updated_state['status'], 'in_progress')

    # ------------------------------------------------------------------
    # priority update -> audit verified
    # ------------------------------------------------------------------

    def test_priority_update_creates_audit_event(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(self.assigned_to_a.id), {'priority': 'critical'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        audit = self._latest_audit('UPDATE')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.previous_state['priority'], 'medium')
        self.assertEqual(audit.updated_state['priority'], 'critical')

    # ------------------------------------------------------------------
    # resolution update -> audit verified
    # ------------------------------------------------------------------

    def test_resolution_update_creates_audit_event(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(self.assigned_to_a.id),
            {'resolution_notes': 'Root cause fixed in v2.3'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        audit = self._latest_audit('UPDATE')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.previous_state['resolution_notes'], '')
        self.assertEqual(audit.updated_state['resolution_notes'], 'Root cause fixed in v2.3')

    # ------------------------------------------------------------------
    # unauthorized operations -> ACCESS_DENIED audit where applicable
    # ------------------------------------------------------------------

    def test_cross_client_retrieve_creates_access_denied_audit(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.detail_url(self.ticket_b.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        audit = self._latest_audit('ACCESS_DENIED')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.client_a)
        self.assertEqual(audit.module, 'portal')
        self.assertEqual(audit.object_id, str(self.ticket_b.id))
        self.assertIn('denied', audit.repr)

    def test_cross_client_update_creates_access_denied_audit(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(
            self.detail_url(self.ticket_b.id), {'subject': 'Hijack'}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        audit = self._latest_audit('ACCESS_DENIED')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.client_a)

    def test_unauthorized_role_creates_access_denied_audit(self):
        self.client.force_authenticate(user=self.sales_user)
        response = self.client.get(self.tickets_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        audit = self._latest_audit('ACCESS_DENIED')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.sales_user)
        self.assertIn('sales_executive', audit.repr)

    def test_support_executive_create_denied_is_audited(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.post(
            self.tickets_url,
            {'subject': 'x', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        audit = self._latest_audit('ACCESS_DENIED')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.support_a)

    def test_unauthenticated_request_is_not_audited(self):
        AuditLog.objects.all().delete()
        response = self.client.get(self.tickets_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(AuditLog.objects.filter(module='portal').count(), 0)

    def test_access_denied_audit_does_not_leak_request_body(self):
        secret = 'HACKER-SECRET-PAYLOAD'
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(
            self.detail_url(self.ticket_b.id),
            {'resolution_notes': secret},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        audit = self._latest_audit('ACCESS_DENIED')
        self.assertIsNotNone(audit)
        self.assertNotIn(secret, audit.repr)
        self.assertNotIn(secret, audit.previous_state or {})
        self.assertNotIn(secret, audit.updated_state or {})

    # ------------------------------------------------------------------
    # audit records are not writable/readable by ordinary users
    # ------------------------------------------------------------------

    def test_ordinary_user_cannot_list_audit_logs(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.audit_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ordinary_user_cannot_read_audit_detail(self):
        audit = AuditLog.objects.create(
            user=self.client_a, action='CREATE', module='portal',
            repr='seed audit event',
        )
        self.client.force_authenticate(user=self.client_a)
        url = reverse('audit-log-detail', args=[audit.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ordinary_user_cannot_modify_audit_records(self):
        audit = AuditLog.objects.create(
            user=self.client_a, action='CREATE', module='portal',
            repr='seed audit event',
        )
        self.client.force_authenticate(user=self.client_a)
        url = reverse('audit-log-detail', args=[audit.id])
        response = self.client.patch(url, {'repr': 'tampered'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        audit.refresh_from_db()
        self.assertEqual(audit.repr, 'seed audit event')

    def test_ordinary_user_cannot_delete_audit_records(self):
        audit = AuditLog.objects.create(
            user=self.client_a, action='CREATE', module='portal',
            repr='seed audit event',
        )
        self.client.force_authenticate(user=self.client_a)
        url = reverse('audit-log-detail', args=[audit.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(AuditLog.objects.filter(id=audit.id).exists())

    def test_super_admin_can_read_audit_logs(self):
        self.client.force_authenticate(user=self.super_admin)
        response = self.client.get(self.audit_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_audit_logs_are_read_only_even_for_super_admin(self):
        audit = AuditLog.objects.create(
            user=self.super_admin, action='CREATE', module='portal',
            repr='seed audit event',
        )
        self.client.force_authenticate(user=self.super_admin)
        url = reverse('audit-log-detail', args=[audit.id])
        response = self.client.patch(url, {'repr': 'tampered'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        audit.refresh_from_db()
        self.assertEqual(audit.repr, 'seed audit event')

    # ------------------------------------------------------------------
    # audit events record actor identity + request metadata
    # ------------------------------------------------------------------

    def test_audit_event_captures_actor_and_metadata(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.tickets_url,
            {'subject': 'Metadata check', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        audit = self._latest_audit('CREATE')
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.client_a)
        self.assertIsNotNone(audit.timestamp)
        self.assertEqual(audit.module, 'portal')
        self.assertIn('Created ticket', audit.repr)

    def test_update_audit_after_successful_operation_only(self):
        # A failed (403) attempt must not create an UPDATE event for that ticket.
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(
            self.detail_url(self.ticket_b.id), {'subject': 'Hijack'}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        update_audits = AuditLog.objects.filter(
            module='portal', action='UPDATE', object_id=str(self.ticket_b.id)
        )
        self.assertEqual(update_audits.count(), 0)
