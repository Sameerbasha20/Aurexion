from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.portal.models import SupportTicket

User = get_user_model()


class SupportTicketSecurityTestCase(APITestCase):
    """
    Phase 3 Security Verification suite.

    Verifies that Support Ticket APIs enforce authentication, RBAC and
    object-level authorization entirely on the backend:

    - unauthenticated requests -> 401
    - authenticated but wrong role -> 403
    - authenticated, right role, wrong object -> 403
    - list endpoints never leak tickets outside the caller's scope
    - privilege escalation attempts are rejected
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

        self.sales_user = User.objects.create_user(
            username='sales_user', password='SalesUs@10', email='sales@test.com'
        )
        self.sales_user.profile.role = 'sales_executive'
        self.sales_user.profile.save()

        self.admin_user = User.objects.create_user(
            username='admin_user', password='AdminUs@10', email='admin@test.com'
        )
        self.admin_user.profile.role = 'administrator'
        self.admin_user.profile.save()

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

        self.client_list_url = reverse('client-ticket-list')
        self.support_list_url = reverse('support-ticket-list')
        self.admin_list_url = reverse('admin-ticket-list')

    # ------------------------------------------------------------------
    # 1. Authentication
    # ------------------------------------------------------------------

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            reverse('login'),
            {'username': 'client_a', 'password': 'ClientA@10'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        self.assertEqual(response.data['user']['role'], 'client_user')

    def test_login_invalid_credentials_rejected(self):
        response = self.client.post(
            reverse('login'),
            {'username': 'client_a', 'password': 'WrongPass@10'},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_authenticated_authorized_operation_allowed(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.client_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # 2. Client User authorization
    # ------------------------------------------------------------------

    def test_client_can_create_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.client_list_url,
            {'subject': 'New issue', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = SupportTicket.objects.get(subject='New issue')
        self.assertEqual(ticket.client_user, self.client_a)
        self.assertEqual(ticket.status, 'open')

    def test_client_can_list_own_tickets(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.client_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.ticket_a.id, ids)
        self.assertNotIn(self.ticket_b.id, ids)

    def test_client_can_retrieve_own_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        url = reverse('client-ticket-detail', args=[self.ticket_a.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.ticket_a.id)

    def test_client_can_update_own_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        url = reverse('client-ticket-detail', args=[self.ticket_a.id])
        response = self.client.patch(url, {'subject': 'Updated by A'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket_a.refresh_from_db()
        self.assertEqual(self.ticket_a.subject, 'Updated by A')

    # ------------------------------------------------------------------
    # 3. Support Executive authorization
    # ------------------------------------------------------------------

    def test_support_can_list_assigned_tickets(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.get(self.support_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.assigned_to_a.id, ids)
        self.assertNotIn(self.assigned_to_b.id, ids)

    def test_support_can_retrieve_assigned_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        url = reverse('support-ticket-detail', args=[self.assigned_to_a.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_support_can_update_assigned_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        url = reverse('support-ticket-detail', args=[self.assigned_to_a.id])
        response = self.client.patch(url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assigned_to_a.refresh_from_db()
        self.assertEqual(self.assigned_to_a.status, 'in_progress')

    # ------------------------------------------------------------------
    # 4. Horizontal access violation
    # ------------------------------------------------------------------

    def test_client_a_cannot_retrieve_client_b_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        url = reverse('client-ticket-detail', args=[self.ticket_b.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_a_cannot_update_client_b_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        url = reverse('client-ticket-detail', args=[self.ticket_b.id])
        response = self.client.patch(url, {'subject': 'Hijacked'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.ticket_b.refresh_from_db()
        self.assertEqual(self.ticket_b.subject, 'Ticket B')

    def test_client_b_cannot_retrieve_client_a_ticket(self):
        self.client.force_authenticate(user=self.client_b)
        url = reverse('client-ticket-detail', args=[self.ticket_a.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_b_cannot_update_client_a_ticket(self):
        self.client.force_authenticate(user=self.client_b)
        url = reverse('client-ticket-detail', args=[self.ticket_a.id])
        response = self.client.patch(url, {'subject': 'Hijacked'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_list_never_exposes_other_clients_tickets(self):
        self.client.force_authenticate(user=self.client_b)
        response = self.client.get(self.client_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.ticket_b.id, ids)
        self.assertNotIn(self.ticket_a.id, ids)
        self.assertNotIn(self.assigned_to_a.id, ids)

    def test_support_cannot_retrieve_other_executives_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        url = reverse('support-ticket-detail', args=[self.assigned_to_b.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_cannot_update_other_executives_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        url = reverse('support-ticket-detail', args=[self.assigned_to_b.id])
        response = self.client.patch(url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_list_never_exposes_other_executives_tickets(self):
        self.client.force_authenticate(user=self.support_b)
        response = self.client.get(self.support_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.assigned_to_b.id, ids)
        self.assertNotIn(self.assigned_to_a.id, ids)

    def test_support_cannot_update_unassigned_ticket(self):
        self.client.force_authenticate(user=self.support_a)
        url = reverse('support-ticket-detail', args=[self.ticket_a.id])
        response = self.client.patch(url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # 5. Privilege escalation
    # ------------------------------------------------------------------

    def test_client_cannot_access_support_executive_api(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.support_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_cannot_access_administrator_api(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.get(self.admin_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_executive_cannot_access_administrator_api(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.get(self.admin_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_cannot_elevate_status_when_creating_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        response = self.client.post(
            self.client_list_url,
            {
                'subject': 'Trying to escalate',
                'category': 'bug',
                'priority': 'high',
                'status': 'closed',
                'resolution_notes': 'Sneaky',
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = SupportTicket.objects.get(subject='Trying to escalate')
        self.assertEqual(ticket.status, 'open')
        self.assertEqual(ticket.resolution_notes, '')

    def test_client_cannot_elevate_status_when_updating_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        url = reverse('client-ticket-detail', args=[self.ticket_a.id])
        response = self.client.patch(url, {'status': 'closed', 'resolution_notes': 'Sneaky'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket_a.refresh_from_db()
        self.assertEqual(self.ticket_a.status, 'open')

    def test_unauthorized_role_cannot_access_support_api(self):
        self.client.force_authenticate(user=self.sales_user)
        response = self.client.get(self.support_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # 6. Unauthorized update
    # ------------------------------------------------------------------

    def test_unauthenticated_update_returns_401(self):
        url = reverse('client-ticket-detail', args=[self.ticket_a.id])
        response = self.client.patch(url, {'subject': 'x'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_role_cannot_update_ticket(self):
        self.client.force_authenticate(user=self.sales_user)
        url = reverse('support-ticket-detail', args=[self.assigned_to_a.id])
        response = self.client.patch(url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_closing_ticket_requires_resolution_notes(self):
        self.client.force_authenticate(user=self.support_a)
        url = reverse('support-ticket-detail', args=[self.assigned_to_a.id])
        response = self.client.patch(url, {'status': 'closed', 'resolution_notes': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assigned_to_a.refresh_from_db()
        self.assertNotEqual(self.assigned_to_a.status, 'closed')

    # ------------------------------------------------------------------
    # 7. Unauthorized retrieval
    # ------------------------------------------------------------------

    def test_unauthenticated_retrieve_returns_401(self):
        url = reverse('client-ticket-detail', args=[self.ticket_a.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_role_cannot_retrieve_ticket(self):
        self.client.force_authenticate(user=self.sales_user)
        url = reverse('support-ticket-detail', args=[self.assigned_to_a.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # 8. Unauthenticated request
    # ------------------------------------------------------------------

    def test_unauthenticated_list_returns_401(self):
        response = self.client.get(self.client_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_support_list_returns_401(self):
        response = self.client.get(self.support_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_admin_list_returns_401(self):
        response = self.client.get(self.admin_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_create_returns_401(self):
        response = self.client.post(
            self.client_list_url,
            {'subject': 'x', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_support_executive_cannot_use_client_create_api(self):
        self.client.force_authenticate(user=self.support_a)
        response = self.client.post(
            self.client_list_url,
            {'subject': 'x', 'category': 'bug', 'priority': 'high'},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_cannot_use_support_update_on_own_unassigned_ticket(self):
        self.client.force_authenticate(user=self.client_a)
        url = reverse('support-ticket-detail', args=[self.ticket_a.id])
        response = self.client.patch(url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # Administrator RBAC integration
    # ------------------------------------------------------------------

    def test_admin_can_list_all_tickets(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.admin_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.ticket_a.id, ids)
        self.assertIn(self.ticket_b.id, ids)

    def test_admin_can_retrieve_any_ticket(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-ticket-detail', args=[self.ticket_b.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.ticket_b.id)

    def test_admin_can_update_any_ticket(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-ticket-detail', args=[self.ticket_b.id])
        response = self.client.patch(
            url, {'status': 'assigned', 'assigned_to': self.support_a.id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket_b.refresh_from_db()
        self.assertEqual(self.ticket_b.status, 'assigned')
        self.assertEqual(self.ticket_b.assigned_to, self.support_a)
