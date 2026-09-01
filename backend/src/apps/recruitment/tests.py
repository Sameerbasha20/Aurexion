from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class ApplyForJobContractTests(APITestCase):
    def test_apply_for_job_json_returns_415(self):
        """
        Ensure that sending a JSON payload to the apply endpoint 
        returns a 415 Unsupported Media Type.
        The endpoint strictly expects multipart/form-data.
        """
        url = reverse('public-apply')
        data = {
            'job_id': 'JOB-123',
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'phone': '1234567890'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
