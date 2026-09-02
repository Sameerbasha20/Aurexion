from rest_framework import status
from rest_framework.test import APITestCase

class CareersApplyContractTestCase(APITestCase):
    """
    Contract tests for the careers apply endpoint.
    """

    def test_apply_endpoint_rejects_json(self):
        """
        Test that POSTing JSON to the apply endpoint returns 415 Unsupported Media Type.
        The endpoint strictly requires multipart/form-data due to file uploads.
        """
        payload = {
            "job_id": "JOB-123",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "1234567890"
        }
        response = self.client.post('/api/v1/careers/apply/', payload, format='json')
        
        self.assertEqual(
            response.status_code, 
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            "Expected 415 Unsupported Media Type when sending JSON to the apply endpoint."
        )
