from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.password_validation import validate_password

from apps.authentication.models import AuditLog, UserProfile

class PasswordValidationTestCase(APITestCase):
    """
    Unit tests to verify custom password strength rules:
    - Minimum 10 characters
    - Must contain at least one number
    - Must contain at least one symbol
    """
    def test_compliant_password(self):
        # Valid password (length 10+, has number, has symbol)
        try:
            validate_password("SecureP@ss10")
        except ValidationError:
            self.fail("validate_password raised ValidationError unexpectedly for a compliant password.")

    def test_short_password(self):
        # Short password (length < 10, but has digit and symbol)
        with self.assertRaises(ValidationError) as context:
            validate_password("P@ss1")
        self.assertTrue(any("too short" in str(err).lower() or "10 characters" in str(err) for err in context.exception.messages))

    def test_missing_number(self):
        # Missing number
        with self.assertRaises(ValidationError) as context:
            validate_password("SecureP@ssword")
        self.assertTrue(any("number" in str(err).lower() for err in context.exception.messages))

    def test_missing_symbol(self):
        # Missing symbol
        with self.assertRaises(ValidationError) as context:
            validate_password("SecurePassword10")
        self.assertTrue(any("symbol" in str(err).lower() for err in context.exception.messages))


class AuthenticationAPITestCase(APITestCase):
    """
    Integration tests for authentication APIs (login, profile, lockout, and audit logs).
    """
    def setUp(self):
        cache.clear()
        
        # Create Super Admin
        self.super_admin = User.objects.create_user(username='super_admin_test', password='SuperP@ss10', email='sa@test.com')
        self.super_admin.profile.role = 'super_admin'
        self.super_admin.profile.save()

        # Create Standard Admin
        self.admin_user = User.objects.create_user(username='admin_test', password='AdminP@ss10', email='admin@test.com')
        self.admin_user.profile.role = 'administrator'
        self.admin_user.profile.save()

        # Create Client User
        self.client_user = User.objects.create_user(username='client_test', password='ClientP@ss10', email='client@test.com')
        self.client_user.profile.role = 'client_user'
        self.client_user.profile.save()

        self.login_url = reverse('login')
        self.me_url = reverse('me')
        self.users_url = reverse('user-list')
        self.audit_logs_url = reverse('audit-log-list')

    def test_successful_login(self):
        response = self.client.post(self.login_url, {
            'username': 'client_test',
            'password': 'ClientP@ss10'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'client_user')

        # Check that LOGIN_SUCCESS audit log was created
        audit = AuditLog.objects.filter(action='LOGIN_SUCCESS', user=self.client_user).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.module, 'authentication')
        self.assertIn('Successful login', audit.repr)

    def test_failed_login_creates_audit_log(self):
        response = self.client.post(self.login_url, {
            'username': 'client_test',
            'password': 'WrongPassword10'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify LOGIN_FAILURE audit log is registered
        audit = AuditLog.objects.filter(action='LOGIN_FAILURE').first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.client_user)
        self.assertIn('Invalid credentials', audit.repr)

    def test_login_throttling_lockout(self):
        # 5 failed attempts
        for _ in range(5):
            response = self.client.post(self.login_url, {
                'username': 'client_test',
                'password': 'WrongPassword10'
            })
            
        # The 6th attempt should block with 429 Too Many Requests
        response = self.client.post(self.login_url, {
            'username': 'client_test',
            'password': 'ClientP@ss10' # correct password, but locked
        })
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn("Too many failed", response.data['detail'])

    def test_me_endpoint_requires_auth(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticate
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'client_test')
        self.assertEqual(response.data['role'], 'client_user')


class RBACPermissionsAPITestCase(APITestCase):
    """
    Tests to check RBAC rules, permissions access control, and privilege escalation protection.
    """
    def setUp(self):
        cache.clear()
        
        self.super_admin = User.objects.create_user(username='sa', password='SuperP@ss10', email='sa@test.com')
        self.super_admin.profile.role = 'super_admin'
        self.super_admin.profile.save()

        self.admin = User.objects.create_user(username='admin', password='AdminP@ss10', email='admin@test.com')
        self.admin.profile.role = 'administrator'
        self.admin.profile.save()

        self.client_user = User.objects.create_user(username='client', password='ClientP@ss10', email='client@test.com')
        self.client_user.profile.role = 'client_user'
        self.client_user.profile.save()

        self.users_url = reverse('user-list')
        self.audit_logs_url = reverse('audit-log-list')

    def test_client_cannot_access_user_list(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_user_list(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_cannot_access_audit_logs(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.audit_logs_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_super_admin_can_access_audit_logs(self):
        self.client.force_authenticate(user=self.super_admin)
        response = self.client.get(self.audit_logs_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_privilege_escalation_block_create_super_admin(self):
        # Admin trying to create a super_admin
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.users_url, {
            'username': 'new_sa',
            'email': 'new_sa@test.com',
            'role': 'super_admin',
            'password': 'SecureP@ss10'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("assign the Super Admin role", str(response.data.get('detail', '')))

    def test_privilege_escalation_block_update_to_super_admin(self):
        # Admin trying to elevate a client user to super_admin
        self.client.force_authenticate(user=self.admin)
        url = reverse('user-detail', args=[self.client_user.id])
        response = self.client.put(url, {
            'username': 'client',
            'email': 'client@test.com',
            'role': 'super_admin'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_privilege_escalation_block_admin_delete_super_admin(self):
        # Admin trying to delete a super_admin
        self.client.force_authenticate(user=self.admin)
        url = reverse('user-detail', args=[self.super_admin.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_audit_logs_for_user_crud(self):
        # Super Admin creating a user
        self.client.force_authenticate(user=self.super_admin)
        
        # 1. Create User
        response = self.client.post(self.users_url, {
            'username': 'created_user',
            'email': 'created@test.com',
            'role': 'client_user',
            'password': 'SecureP@ss10'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user_id = response.data['id']
        
        audit_create = AuditLog.objects.filter(action='CREATE', object_id=str(created_user_id)).first()
        self.assertIsNotNone(audit_create)
        self.assertEqual(audit_create.module, 'authentication')
        self.assertIn("Created user account", audit_create.repr)

        # 2. Update User
        url = reverse('user-detail', args=[created_user_id])
        response = self.client.put(url, {
            'username': 'updated_user',
            'email': 'updated@test.com',
            'role': 'sales_executive'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        audit_update = AuditLog.objects.filter(action='UPDATE', object_id=str(created_user_id)).first()
        self.assertIsNotNone(audit_update)
        self.assertEqual(audit_update.previous_state['username'], 'created_user')
        self.assertEqual(audit_update.updated_state['username'], 'updated_user')

        # 3. Delete User
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        audit_delete = AuditLog.objects.filter(action='DELETE', object_id=str(created_user_id)).first()
        self.assertIsNotNone(audit_delete)
        self.assertEqual(audit_delete.previous_state['username'], 'updated_user')
