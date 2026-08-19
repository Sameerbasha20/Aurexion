import logging
from celery import shared_task
from .models import CandidateApplication

logger = logging.getLogger(__name__)

@shared_task
def send_application_acknowledgement(tracking_code):
    """
    Asynchronously sends an acknowledgement email to the candidate upon successful application.
    """
    try:
        application = CandidateApplication.objects.select_related('job_vacancy').get(tracking_code=tracking_code)
        
        # Simulate sending an email (in production, use Django's send_mail)
        logger.info(f"EMAIL_SENT: Acknowledgement sent to {application.email} for Job '{application.job_vacancy.title}' (Tracking Code: {tracking_code})")
        
        return f"Acknowledgement sent to {application.email}"
    except CandidateApplication.DoesNotExist:
        logger.error(f"EMAIL_FAILED: Could not find application with tracking code {tracking_code}")
        return False
