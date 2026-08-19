"""
Comprehensive authentication enforcement tests for Aurexion API.
Tests that protected endpoints properly reject unauthenticated/invalid requests.
"""
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

from apps.authentication.models import UserProfile


class JWTAuthenticationEnforcementTestCase(APITestCase):
    """
    Tests to verify that protected endpoints properly enforce JWT authentication.

    Test cases for EVERY protected endpoint:
    - No Authorization header -> 401
    - Invalid JWT -> 401
    - Expired JWT -> 401
    - Valid JWT -> 200/201/204
    - Valid JWT but wrong role/permission -> 403
    """

    @classmethod
    def setUpTestData(cls):
        # Create users with different roles
        cls.super_admin = User.objects.create_user(
            username='sa_test', password='SuperP@ss10', email='sa@test.com'
        )
        cls.super_admin.profile.role = 'super_admin'
        cls.super_admin.profile.save()

        cls.admin = User.objects.create_user(
            username='admin_test', password='AdminP@ss10', email='admin@test.com'
        )
        cls.admin.profile.role = 'administrator'
        cls.admin.profile.save()

        cls.bdm = User.objects.create_user(
            username='bdm_test', password='BdmP@ss10', email='bdm@test.com'
        )
        cls.bdm.profile.role = 'bdm'
        cls.bdm.profile.save()

        cls.sales = User.objects.create_user(
            username='sales_test', password='SalesP@ss10', email='sales@test.com'
        )
        cls.sales.profile.role = 'sales_executive'
        cls.sales.profile.save()

        cls.client_user = User.objects.create_user(
            username='client_test', password='ClientP@ss10', email='client@test.com'
        )
        cls.client_user.profile.role = 'client_user'
        cls.client_user.profile.save()

        cls.hr = User.objects.create_user(
            username='hr_test', password='HrP@ss10', email='hr@test.com'
        )
        cls.hr.profile.role = 'hr_manager'
        cls.hr.profile.save()

        cls.content = User.objects.create_user(
            username='content_test', password='ContentP@ss10', email='content@test.com'
        )
        cls.content.profile.role = 'content_manager'
        cls.content.profile.save()

        cls.support = User.objects.create_user(
            username='support_test', password='SupportP@ss10', email='support@test.com'
        )
        cls.support.profile.role = 'support_executive'
        cls.support.profile.save()

    def setUp(self):
        cache.clear()
        self.login_url = reverse('login')
        self.bdm_dashboard_url = reverse('bdm-dashboard')

    def get_tokens(self, user_obj):
        """Get access and refresh tokens for a user."""
        refresh = RefreshToken.for_user(user_obj)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }

    def set_auth_header(self, access_token):
        """Set Authorization header for subsequent requests."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    def clear_auth_header(self):
        """Clear Authorization header."""
        self.client.credentials()

    def test_protected_endpoints_require_authentication(self):
        """
        Test that all protected endpoints return 401 without authentication.
        """
        protected_endpoints = [
            ('GET', reverse('me')),
            ('GET', reverse('user-list')),
            ('GET', reverse('audit-log-list')),
            ('GET', self.bdm_dashboard_url),
            ('GET', '/api/v1/leads/'),
            ('GET', '/api/v1/cms/admin/service/'),
            ('GET', '/api/v1/cms/admin/case-studies/'),
            ('GET', '/api/v1/cms/admin/industry/'),
            ('GET', '/api/v1/cms/admin/categories/'),
            ('GET', '/api/v1/cms/admin/blog/'),
            ('GET', '/api/v1/roles/'),
            ('GET', '/api/v1/support/my-tickets/'),
            ('GET', '/api/v1/support/tickets/'),
            ('GET', '/api/v1/support/admin/tickets/'),
            ('GET', '/api/v1/tickets/'),
            ('GET', '/api/v1/careers/admin/jobs/'),
            ('GET', '/api/v1/careers/admin/applications/'),
        ]

        for method, url in protected_endpoints:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method.lower())(url)
                self.assertEqual(
                    response.status_code,
                    status.HTTP_401_UNAUTHORIZED,
                    f"{method} {url} should return 401 without auth, got {response.status_code}"
                )

    def test_protected_endpoints_reject_invalid_token(self):
        """
        Test that protected endpoints return 401 with invalid JWT.
        """
        self.set_auth_header('Bearer invalid-token-that-is-not-valid')

        protected_endpoints = [
            ('GET', reverse('me')),
            ('GET', reverse('user-list')),
            ('GET', '/api/v1/leads/'),
        ]

        for method, url in protected_endpoints:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method.lower())(url)
                self.assertEqual(
                    response.status_code,
                    status.HTTP_401_UNAUTHORIZED,
                    f"{method} {url} should return 401 with invalid token, got {response.status_code}"
                )

    def test_protected_endpoints_reject_expired_token(self):
        """
        Test that protected endpoints return 401 with expired JWT.
        """
        # Create an access token that expired 1 hour ago
        expired = AccessToken()
        expired.set_exp(lifetime=-timedelta(hours=1))
        expired['user_id'] = self.client_user.pk
        self.set_auth_header(str(expired))

        response = self.client.get(reverse('me'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_valid_token_works_for_authorized_user(self):
        """
        Test that valid JWT works for authorized users.
        """
        tokens = self.get_tokens(self.admin)
        self.set_auth_header(tokens['access'])

        # Admin should access user list
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Admin should access me endpoint
        response = self.client.get(reverse('me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_valid_token_rejected_for_unauthorized_role(self):
        """
        Test that valid JWT returns 403 for users with insufficient permissions.
        """
        # Client user should NOT access user management
        tokens = self.get_tokens(self.client_user)
        self.set_auth_header(tokens['access'])

        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Sales should NOT access BDM dashboard
        tokens = self.get_tokens(self.sales)
        self.set_auth_header(tokens['access'])

        response = self.client.get(self.bdm_dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Client should NOT access admin CMS
        tokens = self.get_tokens(self.client_user)
        self.set_auth_header(tokens['access'])

        response = self.client.get('/api/v1/cms/admin/service/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_super_admin_access_all(self):
        """
        Test that super_admin can access all protected endpoints.
        """
        tokens = self.get_tokens(self.super_admin)
        self.set_auth_header(tokens['access'])

        endpoints = [
            ('GET', reverse('me')),
            ('GET', reverse('user-list')),
            ('GET', reverse('audit-log-list')),
            ('GET', self.bdm_dashboard_url),
            ('GET', '/api/v1/leads/'),
            ('GET', '/api/v1/cms/admin/service/'),
            ('GET', '/api/v1/roles/'),
            ('GET', '/api/v1/support/admin/tickets/'),
        ]

        for method, url in endpoints:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method.lower())(url)
                self.assertIn(
                    response.status_code,
                    [status.HTTP_200_OK, status.HTTP_201_CREATED],
                    f"{method} {url} should be accessible by super_admin, got {response.status_code}"
                )

    def test_administrator_access(self):
        """
        Test administrator role permissions.
        """
        tokens = self.get_tokens(self.admin)
        self.set_auth_header(tokens['access'])

        # Admin can access user management
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Admin CANNOT access audit logs (super_admin only)
        response = self.client.get(reverse('audit-log-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_bdm_access(self):
        """
        Test BDM role permissions.
        """
        tokens = self.get_tokens(self.bdm)
        self.set_auth_header(tokens['access'])

        # BDM can access CRM leads
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # BDM can access BDM dashboard
        response = self.client.get(self.bdm_dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # BDM cannot access user management
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_hr_manager_access(self):
        """
        Test HR Manager role permissions.
        """
        tokens = self.get_tokens(self.hr)
        self.set_auth_header(tokens['access'])

        # HR can access recruitment admin
        response = self.client.get('/api/v1/careers/admin/jobs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get('/api/v1/careers/admin/applications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # HR cannot access user management
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_content_manager_access(self):
        """
        Test Content Manager role permissions.
        """
        tokens = self.get_tokens(self.content)
        self.set_auth_header(tokens['access'])

        # Content manager can access CMS admin
        response = self.client.get('/api/v1/cms/admin/service/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get('/api/v1/cms/admin/blog/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Content manager cannot access user management
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_executive_access(self):
        """
        Test Support Executive role permissions.
        """
        tokens = self.get_tokens(self.support)
        self.set_auth_header(tokens['access'])

        # Support can access support tickets
        response = self.client.get('/api/v1/support/tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Support cannot access admin tickets
        response = self.client.get('/api/v1/support/admin/tickets/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Support cannot access user management
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_user_access(self):
        """
        Test Client User role permissions.
        """
        tokens = self.get_tokens(self.client_user)
        self.set_auth_header(tokens['access'])

        # Client can access own tickets
        response = self.client.get('/api/v1/support/my-tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Client can access unified tickets endpoint
        response = self.client.get('/api/v1/tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Client cannot access admin endpoints
        response = self.client.get('/api/v1/support/admin/tickets/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_public_endpoints_accessible_without_auth(self):
        """
        Test that public endpoints are accessible without authentication.
        """
        public_endpoints = [
            ('GET', '/api/v1/careers/jobs/'),
            ('GET', '/api/v1/careers/jobs/test-job-id/'),
            ('POST', '/api/v1/careers/apply/'),
            ('GET', '/api/v1/cms/public/services/test-slug/'),
            ('GET', '/api/v1/cms/public/industries/test-slug/'),
            ('GET', '/api/v1/cms/public/case-studies/'),
            ('GET', '/api/v1/cms/public/blog/'),
            ('POST', '/api/v1/public/leads/'),
            ('GET', '/'),  # health check
        ]

        for method, url in public_endpoints:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method.lower())(url)
                # Should not be 401 (might be 400, 404, 405, 200, etc. but not 401)
                self.assertNotEqual(
                    response.status_code,
                    status.HTTP_401_UNAUTHORIZED,
                    f"{method} {url} should be public, got 401"
                )

    def test_token_refresh_endpoint(self):
        """
        Test token refresh endpoint behavior.
        """
        # No auth required for token refresh (it uses refresh token in cookie)
        tokens = self.get_tokens(self.client_user)

        # 1. Valid refresh token should work
        self.client.cookies['refresh_token'] = tokens['refresh']
        response = self.client.post(
            reverse('token_refresh'),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('access', response.data)
        self.assertIn('access_token', response.cookies)

        # 2. Invalid refresh token should fail
        self.client.cookies['refresh_token'] = 'invalid-refresh-token'
        response = self.client.post(
            reverse('token_refresh'),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 3. Missing refresh token should fail
        self.client.cookies.clear()
        response = self.client.post(
            reverse('token_refresh'),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_endpoint_no_auth_required(self):
        """
        Test that login endpoint works without authentication.
        """
        response = self.client.post(self.login_url, {
            'username': 'client_test',
            'password': 'ClientP@ss10'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)


class PublicEndpointVerificationTestCase(APITestCase):
    """
    Verify that endpoints intended to be public are actually accessible without auth.
    """

    def test_careers_public_endpoints(self):
        """Test careers public endpoints."""
        # List jobs
        response = self.client.get('/api/v1/careers/jobs/')
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Apply endpoint (POST only)
        response = self.client.post('/api/v1/careers/apply/', {})
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cms_public_endpoints(self):
        """Test CMS public endpoints."""
        response = self.client.get('/api/v1/cms/public/case-studies/')
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get('/api/v1/cms/public/blog/')
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_crm_public_lead_create(self):
        """Test CRM public lead creation."""
        response = self.client.post('/api/v1/public/leads/', {
            'name': 'Test User',
            'email': 'test@example.com',
            'phone': '1234567890',
            'source': 'contact_form'
        })
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.json())