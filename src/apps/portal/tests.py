from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, APITestCase
from apps.portal.models import SupportTicket
from apps.portal.serializers import (
    ClientTicketCreateSerializer,
    ClientTicketUpdateSerializer,
    SupportExecutiveTicketUpdateSerializer,
    AdministratorTicketUpdateSerializer,
    SupportTicketListSerializer,
    SupportTicketDetailSerializer,
)
from apps.portal.services import SupportTicketService

User = get_user_model()


class SupportTicketSerializerTests(TestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            username='testclient',
            email='client@test.com',
            password='TestPass123!'
        )
        self.client_user.profile.role = 'client_user'
        self.client_user.profile.save()

        self.support_user = User.objects.create_user(
            username='testsupport',
            email='support@test.com',
            password='TestPass123!'
        )
        self.support_user.profile.role = 'support_executive'
        self.support_user.profile.save()

        self.admin_user = User.objects.create_user(
            username='testadmin',
            email='admin@test.com',
            password='TestPass123!'
        )
        self.admin_user.profile.role = 'administrator'
        self.admin_user.profile.save()

    def test_client_create_serializer_valid(self):
        data = {
            'subject': 'Test ticket subject',
            'category': 'bug',
            'priority': 'high'
        }
        serializer = ClientTicketCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_client_create_serializer_missing_subject(self):
        data = {'category': 'bug', 'priority': 'high'}
        serializer = ClientTicketCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('subject', serializer.errors)

    def test_client_create_serializer_empty_subject(self):
        data = {'subject': '   ', 'category': 'bug', 'priority': 'high'}
        serializer = ClientTicketCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('subject', serializer.errors)

    def test_client_create_serializer_subject_too_long(self):
        data = {'subject': 'x' * 256, 'category': 'bug', 'priority': 'high'}
        serializer = ClientTicketCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('subject', serializer.errors)

    def test_client_create_serializer_invalid_category(self):
        data = {'subject': 'Test', 'category': 'invalid', 'priority': 'high'}
        serializer = ClientTicketCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('category', serializer.errors)

    def test_client_create_serializer_invalid_priority(self):
        data = {'subject': 'Test', 'category': 'bug', 'priority': 'invalid'}
        serializer = ClientTicketCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('priority', serializer.errors)

    def test_client_update_serializer_valid(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            subject='Original subject',
            category='bug',
            priority='high'
        )
        data = {'subject': 'Updated subject', 'category': 'enhancement', 'priority': 'medium'}
        serializer = ClientTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_client_update_serializer_closed_ticket(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            subject='Original',
            category='bug',
            priority='high',
            status='closed',
            resolution_notes='Done'
        )
        data = {'subject': 'Updated'}
        serializer = ClientTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_support_update_serializer_valid(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            assigned_to=self.support_user,
            subject='Original',
            category='bug',
            priority='high',
            status='assigned'
        )
        data = {'status': 'in_progress', 'resolution_notes': 'Working on it'}
        serializer = SupportExecutiveTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_support_update_serializer_invalid_assigned_to(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            subject='Original',
            category='bug',
            priority='high'
        )
        data = {'assigned_to': self.client_user.id}
        serializer = SupportExecutiveTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('assigned_to', serializer.errors)

    def test_support_update_serializer_closed_ticket_reopen(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            assigned_to=self.support_user,
            subject='Original',
            category='bug',
            priority='high',
            status='closed',
            resolution_notes='Done'
        )
        data = {'status': 'open'}
        serializer = SupportExecutiveTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_support_update_serializer_close_without_notes(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            assigned_to=self.support_user,
            subject='Original',
            category='bug',
            priority='high'
        )
        data = {'status': 'closed', 'resolution_notes': ''}
        serializer = SupportExecutiveTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_admin_update_serializer_valid(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            subject='Original',
            category='bug',
            priority='high'
        )
        data = {'client_user': self.client_user.id, 'assigned_to': self.support_user.id, 'status': 'assigned'}
        serializer = AdministratorTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_admin_update_serializer_invalid_client_user(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            subject='Original',
            category='bug',
            priority='high'
        )
        data = {'client_user': self.support_user.id}
        serializer = AdministratorTicketUpdateSerializer(ticket, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('client_user', serializer.errors)

    def test_list_serializer_output(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            assigned_to=self.support_user,
            subject='Test subject',
            category='bug',
            priority='high'
        )
        serializer = SupportTicketListSerializer(ticket)
        data = serializer.data
        self.assertEqual(data['ticket_id'], ticket.ticket_id)
        self.assertEqual(data['subject'], 'Test subject')
        self.assertEqual(data['client_username'], 'testclient')
        self.assertEqual(data['assigned_username'], 'testsupport')

    def test_detail_serializer_output(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            assigned_to=self.support_user,
            subject='Test subject',
            category='bug',
            priority='high',
            resolution_notes='Fixed'
        )
        serializer = SupportTicketDetailSerializer(ticket)
        data = serializer.data
        self.assertEqual(data['ticket_id'], ticket.ticket_id)
        self.assertEqual(data['resolution_notes'], 'Fixed')
        self.assertEqual(data['client_user_id'], self.client_user.id)
        self.assertEqual(data['assigned_to_id'], self.support_user.id)


class SupportTicketServiceTests(TestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            username='testclient',
            email='client@test.com',
            password='TestPass123!'
        )
        self.client_user.profile.role = 'client_user'
        self.client_user.profile.save()

        self.support_user = User.objects.create_user(
            username='testsupport',
            email='support@test.com',
            password='TestPass123!'
        )
        self.support_user.profile.role = 'support_executive'
        self.support_user.profile.save()

        self.admin_user = User.objects.create_user(
            username='testadmin',
            email='admin@test.com',
            password='TestPass123!'
        )
        self.admin_user.profile.role = 'administrator'
        self.admin_user.profile.save()

        self.other_client = User.objects.create_user(
            username='otherclient',
            email='other@test.com',
            password='TestPass123!'
        )
        self.other_client.profile.role = 'client_user'
        self.other_client.profile.save()

    def test_create_ticket(self):
        ticket = SupportTicketService.create_ticket(
            client_user=self.client_user,
            subject='Test subject',
            category='bug',
            priority='high'
        )
        self.assertIsNotNone(ticket.ticket_id)
        self.assertEqual(ticket.client_user, self.client_user)
        self.assertEqual(ticket.subject, 'Test subject')
        self.assertEqual(ticket.category, 'bug')
        self.assertEqual(ticket.priority, 'high')
        self.assertEqual(ticket.status, 'open')
        self.assertTrue(ticket.ticket_id.startswith('TKT-'))

    def test_get_client_tickets(self):
        t1 = SupportTicketService.create_ticket(self.client_user, 'Ticket 1', 'bug', 'high')
        t2 = SupportTicketService.create_ticket(self.client_user, 'Ticket 2', 'enhancement', 'medium')
        SupportTicketService.create_ticket(self.other_client, 'Other ticket', 'bug', 'low')

        tickets = SupportTicketService.get_client_tickets(self.client_user)
        self.assertEqual(tickets.count(), 2)
        self.assertEqual(tickets[0].ticket_id, t2.ticket_id)
        self.assertEqual(tickets[1].ticket_id, t1.ticket_id)

    def test_get_client_tickets_filtered(self):
        t1 = SupportTicketService.create_ticket(self.client_user, 'Open ticket', 'bug', 'high')
        t2 = SupportTicketService.create_ticket(self.client_user, 'Closed ticket', 'bug', 'high')
        t2.status = 'closed'
        t2.resolution_notes = 'Done'
        t2.save()

        tickets = SupportTicketService.get_client_tickets(self.client_user, status='open')
        self.assertEqual(tickets.count(), 1)

    def test_get_support_tickets(self):
        t1 = SupportTicketService.create_ticket(self.client_user, 'Ticket 1', 'bug', 'high')
        t1.assigned_to = self.support_user
        t1.save()

        t2 = SupportTicketService.create_ticket(self.client_user, 'Ticket 2', 'enhancement', 'medium')
        t2.assigned_to = self.support_user
        t2.save()

        tickets = SupportTicketService.get_support_tickets(self.support_user)
        self.assertEqual(tickets.count(), 2)

    def test_get_ticket_by_id(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Test', 'bug', 'high')
        found = SupportTicketService.get_ticket_by_id(ticket.ticket_id)
        self.assertEqual(found, ticket)

    def test_get_ticket_by_id_not_found(self):
        found = SupportTicketService.get_ticket_by_id('TKT-2026-99999')
        self.assertIsNone(found)

    def test_update_ticket_as_client_success(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')
        updated = SupportTicketService.update_ticket_as_client(
            ticket, self.client_user, {'subject': 'Updated', 'priority': 'medium'}
        )
        self.assertEqual(updated.subject, 'Updated')
        self.assertEqual(updated.priority, 'medium')

    def test_update_ticket_as_client_wrong_owner(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')
        with self.assertRaises(PermissionError):
            SupportTicketService.update_ticket_as_client(
                ticket, self.other_client, {'subject': 'Hacked'}
            )

    def test_update_ticket_as_client_closed_ticket(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')
        ticket.status = 'closed'
        ticket.resolution_notes = 'Done'
        ticket.save()
        with self.assertRaises(PermissionError):
            SupportTicketService.update_ticket_as_client(
                ticket, self.client_user, {'subject': 'Updated'}
            )

    def test_update_ticket_as_support_success(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')
        ticket.assigned_to = self.support_user
        ticket.save()

        factory = APIRequestFactory()
        request = factory.post('/fake/')
        request.user = self.support_user

        updated = SupportTicketService.update_ticket_as_support(
            ticket, self.support_user, {'status': 'in_progress'}, request=request
        )
        self.assertEqual(updated.status, 'in_progress')

    def test_update_ticket_as_support_wrong_assignee(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')
        ticket.assigned_to = self.support_user
        ticket.save()

        other_support = User.objects.create_user(
            username='othersupport',
            email='other@support.com',
            password='TestPass123!'
        )
        other_support.profile.role = 'support_executive'
        other_support.profile.save()

        with self.assertRaises(PermissionError):
            SupportTicketService.update_ticket_as_support(
                ticket, other_support, {'status': 'in_progress'}
            )

    def test_update_ticket_as_admin_success(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')

        factory = APIRequestFactory()
        request = factory.post('/fake/')
        request.user = self.admin_user

        updated = SupportTicketService.update_ticket_as_admin(
            ticket, self.admin_user, {'status': 'assigned', 'assigned_to': self.support_user}, request=request
        )
        self.assertEqual(updated.status, 'assigned')
        self.assertEqual(updated.assigned_to, self.support_user)

    def test_close_ticket_success(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')

        factory = APIRequestFactory()
        request = factory.post('/fake/')
        request.user = self.support_user

        closed = SupportTicketService.close_ticket(
            ticket, self.support_user, 'Issue resolved', request=request
        )
        self.assertEqual(closed.status, 'closed')
        self.assertEqual(closed.resolution_notes, 'Issue resolved')
        self.assertIsNotNone(closed.closed_at)

    def test_close_ticket_without_notes(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')
        with self.assertRaises(ValueError):
            SupportTicketService.close_ticket(ticket, self.support_user, '')

    def test_assign_ticket_success(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')

        factory = APIRequestFactory()
        request = factory.post('/fake/')
        request.user = self.admin_user

        assigned = SupportTicketService.assign_ticket(
            ticket, self.support_user, self.admin_user, request=request
        )
        self.assertEqual(assigned.assigned_to, self.support_user)
        self.assertEqual(assigned.status, 'assigned')

    def test_assign_ticket_invalid_role(self):
        ticket = SupportTicketService.create_ticket(self.client_user, 'Original', 'bug', 'high')
        with self.assertRaises(ValueError):
            SupportTicketService.assign_ticket(ticket, self.client_user, self.admin_user)


class SupportTicketModelTests(TestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            username='testclient',
            email='client@test.com',
            password='TestPass123!'
        )
        self.client_user.profile.role = 'client_user'
        self.client_user.profile.save()

        self.support_user = User.objects.create_user(
            username='testsupport',
            email='support@test.com',
            password='TestPass123!'
        )
        self.support_user.profile.role = 'support_executive'
        self.support_user.profile.save()

    def test_ticket_id_generation(self):
        t1 = SupportTicket.objects.create(client_user=self.client_user, subject='T1', category='bug', priority='high')
        t2 = SupportTicket.objects.create(client_user=self.client_user, subject='T2', category='bug', priority='high')
        self.assertTrue(t1.ticket_id.startswith('TKT-'))
        self.assertTrue(t2.ticket_id.startswith('TKT-'))
        self.assertNotEqual(t1.ticket_id, t2.ticket_id)

    def test_closed_at_set_on_close(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            subject='Test',
            category='bug',
            priority='high',
            status='closed',
            resolution_notes='Done'
        )
        self.assertIsNotNone(ticket.closed_at)

    def test_reverse_relationships(self):
        t1 = SupportTicket.objects.create(client_user=self.client_user, subject='T1', category='bug', priority='high')
        t2 = SupportTicket.objects.create(client_user=self.client_user, subject='T2', category='bug', priority='high')
        t1.assigned_to = self.support_user
        t1.save()

        self.assertEqual(self.client_user.support_tickets.count(), 2)
        self.assertEqual(self.support_user.assigned_tickets.count(), 1)

    def test_client_user_protect_on_delete(self):
        ticket = SupportTicket.objects.create(client_user=self.client_user, subject='Test', category='bug', priority='high')
        with self.assertRaises(Exception):
            self.client_user.delete()

    def test_assigned_to_set_null_on_delete(self):
        ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            assigned_to=self.support_user,
            subject='Test',
            category='bug',
            priority='high'
        )
        self.support_user.delete()
        ticket.refresh_from_db()
        self.assertIsNone(ticket.assigned_to)


class SupportTicketWorkflowTests(APITestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            username='wf_client',
            email='wf_client@test.com',
            password='TestPass123!'
        )
        self.client_user.profile.role = 'client_user'
        self.client_user.profile.save()

        self.support_user = User.objects.create_user(
            username='wf_support',
            email='wf_support@test.com',
            password='TestPass123!'
        )
        self.support_user.profile.role = 'support_executive'
        self.support_user.profile.save()

        self.admin_user = User.objects.create_user(
            username='wf_admin',
            email='wf_admin@test.com',
            password='TestPass123!'
        )
        self.admin_user.profile.role = 'administrator'
        self.admin_user.profile.save()

        self.ticket = SupportTicket.objects.create(
            client_user=self.client_user,
            assigned_to=self.support_user,
            subject='Workflow Test Ticket',
            category='bug',
            priority='high',
            status='open'
        )

    def test_1_open_to_assigned(self):
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'assigned'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'assigned')

    def test_2_assigned_to_in_progress(self):
        self.ticket.status = 'assigned'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'in_progress'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'in_progress')

    def test_3_in_progress_to_awaiting_client(self):
        self.ticket.status = 'in_progress'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'awaiting_client'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'awaiting_client')

    def test_4_awaiting_client_to_resolved_with_notes(self):
        self.ticket.status = 'awaiting_client'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        payload = {'status': 'resolved', 'resolution_notes': 'Issue fixed by patch.'}
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'resolved')
        self.assertEqual(self.ticket.resolution_notes, 'Issue fixed by patch.')

    def test_5_awaiting_client_to_resolved_without_notes(self):
        self.ticket.status = 'awaiting_client'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        payload = {'status': 'resolved', 'resolution_notes': '   '}
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'awaiting_client')

    def test_6_open_to_closed_fails(self):
        self.ticket.status = 'open'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'closed'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_7_assigned_to_closed_fails(self):
        self.ticket.status = 'assigned'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'closed'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_8_in_progress_to_closed_fails(self):
        self.ticket.status = 'in_progress'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'closed'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_9_awaiting_client_to_closed_fails(self):
        self.ticket.status = 'awaiting_client'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'closed'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_10_resolved_to_closed(self):
        self.ticket.status = 'resolved'
        self.ticket.resolution_notes = 'Pre-existing resolution note'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'closed'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'closed')

    def test_11_resolved_to_closed_while_notes_exist(self):
        self.ticket.status = 'resolved'
        self.ticket.resolution_notes = 'Resolution notes preserved'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'closed'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'closed')
        self.assertEqual(self.ticket.resolution_notes, 'Resolution notes preserved')

    def test_12_closed_ticket_retains_resolution_notes(self):
        self.ticket.status = 'resolved'
        self.ticket.resolution_notes = 'Permanent resolution details'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', {'status': 'closed'}, format='json')
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'closed')
        self.assertEqual(self.ticket.resolution_notes, 'Permanent resolution details')

    def test_13_admin_resolving_ticket_with_notes(self):
        self.ticket.status = 'awaiting_client'
        self.ticket.save()
        self.client.force_authenticate(user=self.admin_user)
        payload = {'status': 'resolved', 'resolution_notes': 'Resolved by admin'}
        response = self.client.patch(f'/api/v1/support/admin/tickets/{self.ticket.id}/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'resolved')
        self.assertEqual(self.ticket.resolution_notes, 'Resolved by admin')

    def test_14_support_executive_resolving_ticket_with_notes(self):
        self.ticket.status = 'awaiting_client'
        self.ticket.save()
        self.client.force_authenticate(user=self.support_user)
        payload = {'status': 'resolved', 'resolution_notes': 'Resolved by support executive'}
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'resolved')
        self.assertEqual(self.ticket.resolution_notes, 'Resolved by support executive')

    def test_15_unauthorized_user_attempting_same_operation(self):
        self.ticket.status = 'awaiting_client'
        self.ticket.save()
        self.client.force_authenticate(user=self.client_user)
        payload = {'status': 'resolved', 'resolution_notes': 'Client attempt'}
        response = self.client.patch(f'/api/v1/support/tickets/{self.ticket.id}/', payload, format='json')
        self.assertIn(response.status_code, (401, 403))