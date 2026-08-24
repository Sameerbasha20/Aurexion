import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.administration.models import Role, ModulePermission


@pytest.mark.django_db
class TestDashboardAuthenticationIntegration:
    """
    Comprehensive integration test suite validating:
    - Phase 7: Login -> Dashboard flow with HttpOnly cookies
    - Phase 8: Logout & session invalidation
    - Phase 9: Security checks (no tokens in JSON, cookies HttpOnly)
    - Phase 10: 401 unauthenticated, 200 authenticated, 401 after logout
    - Phase 11: 403 for unauthorized roles (RBAC)
    - Phase 12: All dashboard endpoints
    """

    @pytest.fixture(autouse=True)
    def setup_roles_and_users(self):
        # Create standard roles
        roles_data = [
            ('super_admin', 'Super Administrator'),
            ('administrator', 'Administrator'),
            ('bdm', 'Business Development Manager'),
            ('sales_executive', 'Sales Executive'),
            ('hr_manager', 'HR Manager'),
            ('content_manager', 'Content Manager'),
            ('support_executive', 'Support Executive'),
            ('client_user', 'Client User'),
        ]
        self.roles = {}
        for code, name in roles_data:
            role, _ = Role.objects.get_or_create(code=code, defaults={'name': name})
            self.roles[code] = role

        # Seed module permissions for roles
        modules = ['administration', 'authentication', 'bdm', 'cms', 'crm', 'portal', 'recruitment']
        for role in self.roles.values():
            for mod in modules:
                ModulePermission.objects.get_or_create(
                    role=role,
                    module=mod,
                    defaults={
                        'can_create': True,
                        'can_read': True,
                        'can_update': True,
                        'can_delete': True if role.code in ['super_admin', 'administrator'] else False
                    }
                )

        # Create test users
        self.users = {}
        passwords = {
            'super_admin': 'SuperP@ss10',
            'administrator': 'AdminP@ss10',
            'bdm': 'BdmP@ssw0rd10',
            'sales_executive': 'SalesP@ss10',
            'hr_manager': 'HrManagerP@ss10',
            'content_manager': 'ContentP@ss10',
            'support_executive': 'SupportP@ss10',
            'client_user': 'ClientP@ss10',
        }
        self.passwords = passwords

        for role_code, pwd in passwords.items():
            username = f"test_{role_code}"
            user = User.objects.filter(username=username).first()
            if not user:
                user = User.objects.create_user(
                    username=username,
                    email=f"{username}@aurexion.com",
                    password=pwd
                )
            user.profile.role = role_code
            user.profile.save()
            self.users[role_code] = user

    def test_unauthenticated_requests_return_401(self):
        """TEST A: Requesting protected dashboard endpoints without authentication returns 401."""
        client = APIClient()
        endpoints = [
            '/api/v1/auth/me/',
            '/api/v1/admin/dashboard/',
            '/api/v1/bdm/dashboard/',
            '/api/v1/leads/',
            '/api/v1/support/tickets/',
            '/api/v1/support/tickets/stats/',
            '/api/v1/support/my-tickets/',
            '/api/v1/projects/',
            '/api/v1/milestones/',
            '/api/v1/notifications/',
            '/api/v1/cms/admin/services/',
            '/api/v1/careers/admin/jobs/',
        ]
        for ep in endpoints:
            response = client.get(ep)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED, f"Expected 401 for unauthenticated {ep}, got {response.status_code}"
            assert response.data.get('status') == 401 or 'credentials were not provided' in str(response.data).lower() or 'detail' in response.data

    def test_login_flow_and_cookie_security(self):
        """Verify login sets HttpOnly cookies and returns 200 without exposing tokens in JSON."""
        client = APIClient()
        response = client.post('/api/v1/auth/login/', {
            'username': 'test_bdm',
            'password': self.passwords['bdm']
        })
        assert response.status_code == status.HTTP_200_OK
        # Verify tokens are in cookies
        assert 'access_token' in response.cookies
        assert 'refresh_token' in response.cookies
        assert response.cookies['access_token']['httponly'] is True
        assert response.cookies['refresh_token']['httponly'] is True
        # Verify tokens are NOT in JSON body
        assert 'access' not in response.data
        assert 'refresh' not in response.data
        assert 'tokens' not in response.data
        assert response.data['user']['username'] == 'test_bdm'
        assert response.data['user']['role'] == 'bdm'

    def test_authenticated_dashboard_flow_bdm(self):
        """TEST B: Login as BDM and access BDM dashboard via cookie."""
        client = APIClient()
        login_resp = client.post('/api/v1/auth/login/', {
            'username': 'test_bdm',
            'password': self.passwords['bdm']
        })
        assert login_resp.status_code == status.HTTP_200_OK

        # Cookies are retained in APIClient session
        me_resp = client.get('/api/v1/auth/me/')
        assert me_resp.status_code == status.HTTP_200_OK
        assert me_resp.data['username'] == 'test_bdm'

        dashboard_resp = client.get('/api/v1/bdm/dashboard/')
        assert dashboard_resp.status_code == status.HTTP_200_OK
        assert 'total_leads' in dashboard_resp.data

    def test_logout_invalidates_session(self):
        """TEST C: Logout clears cookies and subsequent protected calls return 401."""
        client = APIClient()
        login_resp = client.post('/api/v1/auth/login/', {
            'username': 'test_bdm',
            'password': self.passwords['bdm']
        })
        assert login_resp.status_code == status.HTTP_200_OK

        # Verify access before logout
        assert client.get('/api/v1/bdm/dashboard/').status_code == status.HTTP_200_OK

        # Perform logout
        logout_resp = client.post('/api/v1/auth/logout/')
        assert logout_resp.status_code == status.HTTP_200_OK

        # Verify subsequent access fails with 401
        after_logout = client.get('/api/v1/bdm/dashboard/')
        assert after_logout.status_code == status.HTTP_401_UNAUTHORIZED

    def test_rbac_forbidden_cross_role_access(self):
        """Verify role-based access control returns 403 Forbidden for unauthorized modules."""
        # Client user attempting to access BDM Dashboard
        client = APIClient()
        client.post('/api/v1/auth/login/', {
            'username': 'test_client_user',
            'password': self.passwords['client_user']
        })

        # Client user can access their own tickets and projects
        assert client.get('/api/v1/support/my-tickets/').status_code == status.HTTP_200_OK
        assert client.get('/api/v1/projects/').status_code == status.HTTP_200_OK

        # Client user CANNOT access BDM dashboard -> 403 Forbidden
        bdm_resp = client.get('/api/v1/bdm/dashboard/')
        assert bdm_resp.status_code == status.HTTP_403_FORBIDDEN

        # Client user CANNOT access Admin dashboard -> 403 Forbidden
        admin_resp = client.get('/api/v1/admin/dashboard/')
        assert admin_resp.status_code == status.HTTP_403_FORBIDDEN

    def test_all_role_dashboards_matrix(self):
        """Verify dashboard matrix for each role."""
        role_endpoints_map = [
            ('administrator', '/api/v1/admin/dashboard/', status.HTTP_200_OK),
            ('bdm', '/api/v1/bdm/dashboard/', status.HTTP_200_OK),
            ('content_manager', '/api/v1/cms/admin/services/', status.HTTP_200_OK),
            ('sales_executive', '/api/v1/leads/', status.HTTP_200_OK),
            ('hr_manager', '/api/v1/careers/admin/jobs/', status.HTTP_200_OK),
            ('support_executive', '/api/v1/support/tickets/stats/', status.HTTP_200_OK),
            ('client_user', '/api/v1/support/my-tickets/', status.HTTP_200_OK),
        ]

        for role_code, endpoint, expected_status in role_endpoints_map:
            client = APIClient()
            login_resp = client.post('/api/v1/auth/login/', {
                'username': f"test_{role_code}",
                'password': self.passwords[role_code]
            })
            assert login_resp.status_code == status.HTTP_200_OK, f"Login failed for role {role_code}"

            ep_resp = client.get(endpoint)
            assert ep_resp.status_code == expected_status, f"Role {role_code} failed on {endpoint}, got {ep_resp.status_code}"

    def test_token_refresh_flow(self):
        """Verify token refresh via cookies and body payload."""
        client = APIClient()
        login_resp = client.post('/api/v1/auth/login/', {
            'username': 'test_bdm',
            'password': self.passwords['bdm']
        })
        assert login_resp.status_code == status.HTTP_200_OK

        # Cookie-based refresh
        refresh_resp = client.post('/api/v1/auth/token/refresh/')
        assert refresh_resp.status_code == status.HTTP_200_OK
        assert 'access_token' in refresh_resp.cookies

        # Subsequent dashboard request with refreshed cookie
        dash_resp = client.get('/api/v1/bdm/dashboard/')
        assert dash_resp.status_code == status.HTTP_200_OK
