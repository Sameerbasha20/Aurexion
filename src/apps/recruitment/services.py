import secrets
import string
from django.db import IntegrityError, transaction
from .models import CandidateApplication

def generate_tracking_code():
    """Generates a tracking code suffix (AUR-APP-XXXX) using cryptographically secure secrets."""
    suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
    return f"AUR-APP-{suffix}"

def create_candidate_application(job_vacancy, first_name, last_name, email, phone, resume_storage_path):
    """
    Creates a CandidateApplication, handling tracking code collisions automatically via retries.
    """
    max_retries = 5
    for attempt in range(max_retries):
        tracking_code = generate_tracking_code()
        try:
            with transaction.atomic():
                application = CandidateApplication.objects.create(
                    tracking_code=tracking_code,
                    job_vacancy=job_vacancy,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    phone=phone,
                    resume_storage_path=resume_storage_path
                )
                return application
        except IntegrityError:
            # If we hit the max retries, raise the error.
            if attempt == max_retries - 1:
                raise
            continue
