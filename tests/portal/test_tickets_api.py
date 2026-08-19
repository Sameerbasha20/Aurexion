from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import AuditLog
from apps.portal.models import SupportTicket

User = get_user_model()


class TicketsRestAPITestCase(APITestCase):
    """
    Phase 4 API integration tests for the unified Support REST API:

        POST   /api/v1/tickets/
        GET    /api/v1/tickets/
        GET    /api/v1/tickets/{id}/
        PATCH  /api/v1/tickets/{id}/

    Covers success, validation failure, authentication, RBAC, object-level
    authorization, invalid IDs, cross-client access and persistence.
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

        self.support_b = User.objects.create_user(
            username='support_b', password='SupportB@10', email='sb@test.com'
        )
        self.support_b.profile.role = 'support_executive'
        self.support_b.profile.save()

        self.admin_user = User.objects.create_user(
            username='admin_user', password='AdminUs@10', email='admin@test.com'
        )
        self.admin_user.profile.role = 'administrator'
        self.admin_user.profile.save()

        self.sales_user = User.objects.create_user(
            username='sales_user', password='SalesUs@10', email='sales@test.com'
        )
        self.sales_user.profile.role = 'sales_executive'
        self.sales_user.profile.save()

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
        self.assigned_to_b = SupportTicket.objects.create(
            client_user=self.client_b,
            assigned_to=self.support_b,
            subject='Assigned to B',
            category='general',
            priority='low',
        )

        self.list_url = reverse('ticket-list')
        self.detail_url = lambda pk: reverse('ticket-detail', args=[pk])

    # ------------------------------------------------------------------
    # Authentication / unauthenticated requests -> 401
    # ------------------------------------------------------------------

    def test_unauthenticated_create_returns_401(self):
        response = self.client.post(
            self.list_url, {'subject': 'x', 'category': 'bug', 'priority': 'high'}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_list_returns_401(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_detail_returns_401(self):
        response = self.client.get(self.detail_url(self.ticket_a.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_update_returns_401(self):
        response = self.client.patch(self.detail_url(self.ticket_a.id), {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_jwt_token_login_success(self):
        response = self.client.post(
            reverse('login'), {'username': 'client_a', 'password': 'ClientA@10'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    # ------------------------------------------------------------------
    # CREATE: POST /api/v1/tickets/
    # ------------------------------------------------------------------

    def test_client_creates_ticket_success(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url,
            {'subject': 'New issue', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('ticket_id', response.data)
        self.assertEqual(response.data['subject'], 'New issue')
        self.assertEqual(response.data['status'], 'open')
        self.assertEqual(response.data['client_user_id'], self.client_a.id)

    def test_client_create_ticket_persists_to_database(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url,
            {'subject': 'Persisted issue', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = SupportTicket.objects.get(id=response.data['id'])
        self.assertEqual(ticket.subject, 'Persisted issue')
        self.assertEqual(ticket.client_user, self.client_a)
        self.assertEqual(ticket.status, 'open')
        self.assertTrue(ticket.ticket_id.startswith('TKT-'))

    def test_create_audit_log_created(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url,
            {'subject': 'Audited issue', 'category': 'bug', 'priority': 'high'},
        )
        audit = AuditLog.objects.filter(action='CREATE', module='portal').first()
        self.assertIsNotNone(audit)
        self.assertEqual(str(audit.object_id), str(response.data['id']))

    def test_create_validation_missing_subject_returns_400(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(self.list_url, {'category': 'bug', 'priority': 'high'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subject', response.data)

    def test_create_validation_empty_subject_returns_400(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url, {'subject': '   ', 'category': 'bug', 'priority': 'high'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_validation_invalid_category_returns_400(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url, {'subject': 'x', 'category': 'not-a-category', 'priority': 'high'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', response.data)

    def test_create_validation_invalid_priority_returns_400(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url, {'subject': 'x', 'category': 'bug', 'priority': 'urgent'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('priority', response.data)

    def test_support_executive_cannot_create_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.post(
            self.list_url,
            {'subject': 'x', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthorized_role_cannot_create_ticket(self):
        self.client.force_authenticate(user=self.sales_user)
        response = self.client.post(
            self.list_url,
            {'subject': 'x', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_cannot_set_status_when_creating(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.list_url,
            {
                'subject': 'Escalation attempt',
                'category': 'bug',
                'priority': 'high',
                'status': 'closed',
                'resolution_notes': 'Sneaky',
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = SupportTicket.objects.get(id=response.data['id'])
        self.assertEqual(ticket.status, 'open')
        self.assertEqual(ticket.resolution_notes, '')
        self.assertEqual(ticket.client_user, self.client_a)

    # ------------------------------------------------------------------
    # LIST: GET /api/v1/tickets/
    # ------------------------------------------------------------------

    def test_client_lists_only_own_tickets(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.ticket_a.id, ids)
        self.assertNotIn(self.ticket_b.id, ids)

    def test_support_lists_only_assigned_tickets(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.assigned_to_a.id, ids)
        self.assertNotIn(self.assigned_to_b.id, ids)

    def test_admin_lists_all_tickets(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.ticket_a.id, ids)
        self.assertIn(self.ticket_b.id, ids)
        self.assertIn(self.assigned_to_a.id, ids)

    # ------------------------------------------------------------------
    # DETAIL: GET /api/v1/tickets/{id}/
    # ------------------------------------------------------------------

    def test_client_retrieves_own_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.detail_url(self.ticket_a.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.ticket_a.id)
        self.assertEqual(response.data['client_user_id'], self.client_a.id)

    def test_support_retrieves_assigned_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.get(self.detail_url(self.assigned_to_a.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.assigned_to_a.id)

    def test_invalid_ticket_id_returns_404(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.detail_url('not-an-id'))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nonexistent_ticket_returns_404(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.detail_url(999999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ------------------------------------------------------------------
    # UPDATE: PATCH /api/v1/tickets/{id}/
    # ------------------------------------------------------------------

    def test_client_updates_own_ticket_and_persists(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(
            self.detail_url(self.ticket_a.id), {'subject': 'Updated subject'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket_a.refresh_from_db()
        self.assertEqual(self.ticket_a.subject, 'Updated subject')

    def test_client_update_cannot_change_status(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(
            self.detail_url(self.ticket_a.id), {'status': 'closed', 'priority': 'low'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket_a.refresh_from_db()
        self.assertEqual(self.ticket_a.status, 'open')
        self.assertEqual(self.ticket_a.priority, 'low')

    def test_client_update_validation_failure_returns_400(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(self.detail_url(self.ticket_a.id), {'subject': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_support_updates_assigned_ticket_and_persists(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(self.assigned_to_a.id),
            {'status': 'in_progress', 'resolution_notes': 'Investigating'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assigned_to_a.refresh_from_db()
        self.assertEqual(self.assigned_to_a.status, 'in_progress')
        self.assertEqual(self.assigned_to_a.resolution_notes, 'Investigating')

    def test_support_close_requires_resolution_notes(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(self.assigned_to_a.id),
            {'status': 'closed', 'resolution_notes': ''},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assigned_to_a.refresh_from_db()
        self.assertNotEqual(self.assigned_to_a.status, 'closed')

    def test_support_cannot_update_unassigned_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(self.ticket_a.id), {'status': 'in_progress'}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_updates_any_ticket_and_persists(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            self.detail_url(self.ticket_b.id),
            {'status': 'assigned', 'assigned_to': self.support_a.id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket_b.refresh_from_db()
        self.assertEqual(self.ticket_b.status, 'assigned')
        self.assertEqual(self.ticket_b.assigned_to, self.support_a)

    # ------------------------------------------------------------------
    # Cross-client access -> 403
    # ------------------------------------------------------------------

    def test_client_a_cannot_retrieve_client_b_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.detail_url(self.ticket_b.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_a_cannot_update_client_b_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.patch(self.detail_url(self.ticket_b.id), {'subject': 'Hijack'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.ticket_b.refresh_from_db()
        self.assertEqual(self.ticket_b.subject, 'Ticket B')

    def test_client_b_cannot_retrieve_client_a_ticket(self):
        self.client.force_authenticate(user=self.client_b)
        response = self.client.get(self.detail_url(self.ticket_a.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_a_cannot_retrieve_support_b_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.get(self.detail_url(self.assigned_to_b.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_a_cannot_update_support_b_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.patch(
            self.detail_url(self.assigned_to_b.id), {'status': 'in_progress'}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # Forbidden access / unauthorized roles -> 403
    # ------------------------------------------------------------------

    def test_unauthorized_role_cannot_list_tickets(self):
        self.client.force_authenticate(user=self.sales_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthorized_role_cannot_retrieve_ticket(self):
        self.client.force_authenticate(user=self.sales_user)
        response = self.client.get(self.detail_url(self.ticket_a.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthorized_role_cannot_update_ticket(self):
        self.client.force_authenticate(user=self.sales_user)
        response = self.client.patch(self.detail_url(self.ticket_a.id), {'subject': 'x'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_cannot_access_support_owned_route_for_another_client(self):
        self.client.force_authenticate(user=self.client_b)
        response = self.client.get(self.detail_url(self.assigned_to_a.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # Method restriction (PUT/DELETE not part of the API)
    # ------------------------------------------------------------------

    def test_put_and_delete_are_not_allowed(self):
        self.client.force_authenticate(user=self.admin_user)
        response_put = self.client.put(
            self.detail_url(self.ticket_a.id), {'subject': 'x'}
        )
        response_delete = self.client.delete(self.detail_url(self.ticket_a.id))
        self.assertEqual(response_put.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(response_delete.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
