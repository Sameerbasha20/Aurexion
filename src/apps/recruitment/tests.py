from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import JobVacancy
from .validators import validate_resume
from .services import generate_tracking_code
from apps.authentication.models import UserProfile

User = get_user_model()

class ValidatorTests(TestCase):
    def test_resume_extension(self):
        # Test that txt files are rejected
        file = SimpleUploadedFile("test.txt", b"file_content", content_type="text/plain")
        with self.assertRaisesMessage(ValidationError, "Unsupported file extension"):
            validate_resume(file)

    def test_resume_magic_bytes(self):
        # Test that a fake PDF (e.g., renamed executable) is rejected due to magic bytes
        file = SimpleUploadedFile("fake.pdf", b"MZexecutable", content_type="application/pdf")
        with self.assertRaisesMessage(ValidationError, "Could not verify file contents"):
            validate_resume(file)

    def test_resume_valid_pdf(self):
        # Test that a valid PDF with correct magic bytes passes
        file = SimpleUploadedFile("real.pdf", b"%PDF-1.4...", content_type="application/pdf")
        validate_resume(file) # Should not raise exception

class ServiceTests(TestCase):
    def test_generate_tracking_code(self):
        code = generate_tracking_code()
        # Code should look like AUR-APP-XXXX
        self.assertTrue(code.startswith("AUR-APP-"))
        self.assertEqual(len(code), 12)

class APIPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.job = JobVacancy.objects.create(
            job_id="ENG-TEST", title="Test Job", department="IT", location="Remote", skills="Python", responsibilities="Code"
        )
        
        self.sales_user = User.objects.create_user(username='sales', password='pwd')
        self.sales_user.profile.role = 'sales_executive'
        self.sales_user.profile.save()
        
        self.hr_user = User.objects.create_user(username='hr', password='pwd')
        self.hr_user.profile.role = 'hr_manager'
        self.hr_user.profile.save()

    def test_public_jobs_accessible(self):
        # Public endpoints should be accessible without authentication
        response = self.client.get('/api/v1/careers/jobs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_jobs_unauthorized(self):
        # Admin endpoints should reject unauthenticated requests
        response = self.client.get('/api/v1/careers/admin/jobs/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_jobs_sales_forbidden(self):
        # Admin endpoints should reject non-HR/Admin roles (like Sales) with 403 Forbidden
        self.client.force_authenticate(user=self.sales_user)
        response = self.client.get('/api/v1/careers/admin/jobs/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_jobs_hr_allowed(self):
        # Admin endpoints should allow the HR Manager
        self.client.force_authenticate(user=self.hr_user)
        response = self.client.get('/api/v1/careers/admin/jobs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
