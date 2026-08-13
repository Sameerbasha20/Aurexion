from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.cache import cache

from apps.administration.models import Role, ModulePermission
from apps.authentication.models import AuditLog

class RBACAPITestCase(APITestCase):
    def setUp(self):
        cache.clear()
        
        # Seed basic roles and permissions (mimicking seed script)
        self.super_admin_role = Role.objects.create(code='super_admin', name='Super Admin')
        self.admin_role = Role.objects.create(code='administrator', name='Administrator')
        self.hr_role = Role.objects.create(code='hr_manager', name='HR Manager')
        
        # Add module permissions
        for mod in ['authentication', 'recruitment', 'cms', 'crm', 'portal', 'administration']:
            ModulePermission.objects.create(role=self.super_admin_role, module=mod,
                                           can_create=True, can_read=True, can_update=True, can_delete=True)
                                           
        ModulePermission.objects.create(role=self.hr_role, module='recruitment',
                                       can_create=True, can_read=True, can_update=True, can_delete=True)
        
        # Create users
        self.sa_user = User.objects.create_user(username='sa_test', password='SuperP@ss10', email='sa@test.com')
        self.sa_user.profile.role = 'super_admin'
        self.sa_user.profile.save()
        
        self.admin_user = User.objects.create_user(username='admin_test', password='AdminP@ss10', email='admin@test.com')
        self.admin_user.profile.role = 'administrator'
        self.admin_user.profile.save()
        
        self.hr_user = User.objects.create_user(username='hr_test', password='HrP@ssword10', email='hr@test.com')
        self.hr_user.profile.role = 'hr_manager'
        self.hr_user.profile.save()
        
        # URLs
        self.roles_url = reverse('role-list')
        self.sa_role_url = reverse('role-detail', kwargs={'pk': self.super_admin_role.id})
        self.hr_role_url = reverse('role-detail', kwargs={'pk': self.hr_role.id})

    def test_super_admin_can_list_roles(self):
        self.client.force_authenticate(user=self.sa_user)
        response = self.client.get(self.roles_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_non_super_admin_cannot_list_roles(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.roles_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.hr_user)
        response = self.client.get(self.roles_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_role_permissions_and_audit(self):
        self.client.force_authenticate(user=self.sa_user)
        
        # Read current permissions
        response = self.client.get(self.hr_role_url)
        hr_data = response.data
        
        # Modify hr_manager recruitment permission to read-only
        hr_data['permissions'] = [
            {
                'module': 'recruitment',
                'can_create': False,
                'can_read': True,
                'can_update': False,
                'can_delete': False
            }
        ]
        
        response = self.client.put(self.hr_role_url, hr_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify changes in DB
        hr_perm = ModulePermission.objects.get(role=self.hr_role, module='recruitment')
        self.assertFalse(hr_perm.can_create)
        self.assertTrue(hr_perm.can_read)
        self.assertFalse(hr_perm.can_update)
        
        # Verify Audit Log entry was created
        audit = AuditLog.objects.filter(action='UPDATE', module='administration', object_id=str(self.hr_role.id)).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user, self.sa_user)
        self.assertIn('Updated role', audit.repr)
        self.assertEqual(audit.previous_state['permissions'][0]['can_create'], True)
        self.assertEqual(audit.updated_state['permissions'][0]['can_create'], False)

    def test_lockout_prevention_constraint(self):
        self.client.force_authenticate(user=self.sa_user)
        response = self.client.get(self.sa_role_url)
        sa_data = response.data
        
        # Attempt to remove read permission from 'administration' for super_admin
        for perm in sa_data['permissions']:
            if perm['module'] == 'administration':
                perm['can_read'] = False
                
        response = self.client.put(self.sa_role_url, sa_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Super Admin must have full permissions", str(response.data))

    def test_delete_system_roles_forbidden(self):
        self.client.force_authenticate(user=self.sa_user)
        
        # Try to delete super_admin role
        response = self.client.delete(self.sa_role_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot delete system role", str(response.data))
        
        # Try to delete hr_manager (non-system role in our deletion list logic)
        response = self.client.delete(self.hr_role_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_dynamic_permission_enforcement(self):
        # By default, hr_user has recruitment write permission
        self.client.force_authenticate(user=self.hr_user)
        
        # Let's verify our custom recruitment checks
        from apps.recruitment.permissions import IsHRManagerOrSuperAdmin
        from unittest.mock import MagicMock
        
        view = MagicMock()
        request = MagicMock()
        request.user = self.hr_user
        request.method = 'POST'
        
        perm_check = IsHRManagerOrSuperAdmin()
        self.assertTrue(perm_check.has_permission(request, view))
        
        # Now strip hr_user of recruitment write permission
        self.client.force_authenticate(user=self.sa_user)
        response = self.client.get(self.hr_role_url)
        hr_data = response.data
        for p in hr_data['permissions']:
            if p['module'] == 'recruitment':
                p['can_create'] = False
                p['can_update'] = False
                
        response = self.client.put(self.hr_role_url, hr_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Re-check recruitment write permissions for hr_user
        request.method = 'POST'
        self.assertFalse(perm_check.has_permission(request, view))
        
        # Read permission should still be True
        request.method = 'GET'
        self.assertTrue(perm_check.has_permission(request, view))
