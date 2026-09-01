from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.cache import cache
from unittest.mock import patch

from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost
from apps.administration.models import Role, ModulePermission

class CMSAPITestCase(APITestCase):
    def setUp(self):
        cache.clear()
        CaseStudy.objects.all().delete()
        Service.objects.all().delete()
        Industry.objects.all().delete()
        Category.objects.all().delete()
        BlogPost.objects.all().delete()
        
        # Setup roles and users
        self.super_admin_role = Role.objects.create(code='super_admin', name='Super Admin')
        self.content_manager_role = Role.objects.create(code='content_manager', name='Content Manager')
        self.client_role = Role.objects.create(code='client_user', name='Client User')
        
        # Permissions
        ModulePermission.objects.create(role=self.super_admin_role, module='cms',
                                       can_create=True, can_read=True, can_update=True, can_delete=True)
        ModulePermission.objects.create(role=self.content_manager_role, module='cms',
                                       can_create=True, can_read=True, can_update=True, can_delete=True)
                                       
        self.sa_user = User.objects.create_user(username='sa_cms', password='SuperP@ss10', email='sa@cms.com')
        self.sa_user.profile.role = 'super_admin'
        self.sa_user.profile.save()

        self.cm_user = User.objects.create_user(username='cm_cms', password='CmP@ssword10', email='cm@cms.com')
        self.cm_user.profile.role = 'content_manager'
        self.cm_user.profile.save()

        self.client_user = User.objects.create_user(username='client_cms', password='ClientP@ss10', email='client@cms.com')
        self.client_user.profile.role = 'client_user'
        self.client_user.profile.save()

        # Seed initial service and case study
        self.service1 = Service.objects.create(
            title="Cloud Integration",
            slug="cloud-integration",
            description="Enterprise integration",
            problem="Legacy system blocks",
            solution="API gateways",
            tech_stack=["AWS", "Python"],
            status="published"
        )
        
        self.case_study1 = CaseStudy.objects.create(
            title="Fintech App Migration",
            slug="fintech-migration",
            client="Big Bank Corp",
            context="Scalability challenges",
            business_challenge="Transactions delay",
            proposed_architecture="Microservices",
            tech_stack=["Docker", "Go"],
            development_approach="Agile",
            modules_integration_security="OAuth2",
            outcomes_performance="10x speedup",
            confidential=True,
            status="published"
        )

        self.industry1 = Industry.objects.create(
            name="Finance & Banking",
            slug="finance-banking",
            challenges="Complex regulations",
            target_solutions="Automated validation",
            status="published"
        )
        self.industry1.services.add(self.service1)
        self.industry1.case_studies.add(self.case_study1)

        self.category1 = Category.objects.create(name="Engineering", slug="engineering")
        
        self.blog1 = BlogPost.objects.create(
            title="Building Scalable APIs",
            slug="building-scalable-apis",
            content="Use caching for high-load endpoints.",
            category=self.category1,
            tags=["django", "caching"],
            author=self.cm_user,
            status="published"
        )

    def test_content_manager_can_crud_service(self):
        self.client.force_authenticate(user=self.cm_user)
        
        # Create
        create_url = reverse('admin-service-list')
        response = self.client.post(create_url, {
            'title': 'SEO Optimization',
            'slug': 'seo-optimization',
            'description': 'Search engine visibility',
            'problem': 'Low ranking',
            'solution': 'Keywords optimization',
            'tech_stack': ['SEO', 'Google'],
            'status': 'published'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Update
        detail_url = reverse('admin-service-detail', kwargs={'slug': 'seo-optimization'})
        response = self.client.put(detail_url, {
            'title': 'SEO Optimization v2',
            'slug': 'seo-optimization',
            'description': 'Search engine visibility',
            'problem': 'Low ranking',
            'solution': 'Keywords optimization',
            'tech_stack': ['SEO', 'Google'],
            'status': 'published'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'SEO Optimization v2')

    def test_client_cannot_modify_cms(self):
        self.client.force_authenticate(user=self.client_user)
        create_url = reverse('admin-service-list')
        response = self.client.post(create_url, {
            'title': 'Hack attempt',
            'slug': 'hack'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_public_service_resolves_by_slug(self):
        url = reverse('public-service-detail', kwargs={'slug': 'cloud-integration'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Cloud Integration')

    def test_public_industry_resolves_with_relations(self):
        url = reverse('public-industry-detail', kwargs={'slug': 'finance-banking'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['services']), 1)
        self.assertEqual(len(response.data['case_studies']), 1)

    def test_public_industry_detail_caching(self):
        from django.core.cache import cache
        url = reverse('public-industry-detail', kwargs={'slug': 'finance-banking'})
        # Cold request populates cache
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cached_data = cache.get('cms_industry_detail_finance-banking')
        self.assertIsNotNone(cached_data)
        self.assertEqual(cached_data['name'], 'Finance & Banking')
        # Warm request serves cached response
        warm_response = self.client.get(url)
        self.assertEqual(warm_response.status_code, status.HTTP_200_OK)
        self.assertEqual(warm_response.data['name'], 'Finance & Banking')


    def test_confidentiality_redaction(self):
        # Public anonymous access
        url = reverse('public-case-studies-detail', kwargs={'slug': 'fintech-migration'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify client name is redacted/masked
        self.assertEqual(response.data['client'], "Confidential Client")

        # Authenticated CM user (staff role) gets full detail via admin endpoint
        self.client.force_authenticate(user=self.cm_user)
        admin_url = reverse('admin-case-studies-detail', kwargs={'slug': 'fintech-migration'})
        response = self.client.get(admin_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['client'], "Big Bank Corp")

    def test_case_studies_portfolio_filtering(self):
        url = reverse('public-case-studies-list')
        response = self.client.get(url, {'tech_stack': 'Go'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        response = self.client.get(url, {'tech_stack': 'Python'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_related_posts_suggestions(self):
        # Create second post under same category
        BlogPost.objects.create(
            title="Django Query Optimization",
            slug="django-query-opt",
            content="Select related reduces queries.",
            category=self.category1,
            author=self.cm_user,
            status="published"
        )
        
        url = reverse('public-blog-related', kwargs={'slug': 'building-scalable-apis'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['slug'], 'django-query-opt')

    @patch('django.core.cache.cache.clear')
    def test_cache_invalidated_on_save(self, mock_clear):
        # Verify signal calls cache.clear() when service is saved
        self.service1.title = "Cloud Integration Pro"
        self.service1.save()
        self.assertTrue(mock_clear.called)

    def test_admin_category_delete_by_slug(self):
        self.client.force_authenticate(user=self.cm_user)
        url = reverse('admin-categories-detail', kwargs={'slug': 'engineering'})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(slug='engineering').exists())

    def test_admin_blog_crud_by_slug(self):
        self.client.force_authenticate(user=self.cm_user)
        url = reverse('admin-blog-detail', kwargs={'slug': 'building-scalable-apis'})
        # GET
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Building Scalable APIs')

        # PATCH
        response = self.client.patch(url, {'title': 'Building Scalable APIs v2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Building Scalable APIs v2')

        # DELETE
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(BlogPost.objects.filter(slug='building-scalable-apis').exists())

    def test_admin_industry_crud_by_slug(self):
        self.client.force_authenticate(user=self.cm_user)
        
        # Test validation for required fields
        create_url = reverse('admin-industry-list')
        response_invalid = self.client.post(create_url, {
            'name': 'Retail'
            # Missing challenges and target_solutions
        }, format='json')
        self.assertEqual(response_invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('challenges', response_invalid.data)
        self.assertIn('target_solutions', response_invalid.data)

        # Test successful creation
        response_valid = self.client.post(create_url, {
            'name': 'Retail',
            'challenges': 'Inventory management',
            'target_solutions': 'Automated tracking'
        }, format='json')
        self.assertEqual(response_valid.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_valid.data['slug'], 'retail')

        url = reverse('admin-industry-detail', kwargs={'slug': 'finance-banking'})
        # GET
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Finance & Banking')

        # PATCH
        response = self.client.patch(url, {'name': 'Finance & Banking v2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Finance & Banking v2')

        # DELETE
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Industry.objects.filter(slug='finance-banking').exists())

    def test_admin_service_delete_by_slug(self):
        self.client.force_authenticate(user=self.cm_user)
        # Test alias route /api/v1/cms/admin/service/{slug}/
        url_alias = reverse('admin-service-alias-detail', kwargs={'slug': 'cloud-integration'})
        response = self.client.delete(url_alias)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(slug='cloud-integration').exists())

    def test_admin_case_study_delete_by_slug(self):
        self.client.force_authenticate(user=self.cm_user)
        # Plural route /api/v1/cms/admin/case-studies/{slug}/
        url_plural = reverse('admin-case-studies-detail', kwargs={'slug': 'fintech-migration'})
        response = self.client.delete(url_plural)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CaseStudy.objects.filter(slug='fintech-migration').exists())



