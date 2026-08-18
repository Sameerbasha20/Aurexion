import uuid
import logging
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework import viewsets
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from .models import JobVacancy, ApplicationNote, CandidateApplication
from .serializers import (
    JobVacancySerializer, ApplySerializer,
    AdminJobVacancySerializer, AdminCandidateApplicationSerializer, 
    ApplicationStageUpdateSerializer, ApplicationNoteSerializer
)
from .services import create_candidate_application
from .storage import upload_resume, delete_resume, generate_signed_url
from .permissions import IsHRManagerOrSuperAdmin
from .tasks import send_application_acknowledgement

logger = logging.getLogger(__name__)

class ApplyRateThrottle(AnonRateThrottle):
    rate = '60/min'

@extend_schema_view(
    get=extend_schema(
        tags=['Careers (Public)'],
        summary="List Active Job Vacancies",
        description="Retrieves a list of all currently active job postings. Supports filtering.",
        parameters=[
            OpenApiParameter('department', type=OpenApiTypes.STR, description='Filter by department name'),
            OpenApiParameter('location', type=OpenApiTypes.STR, description='Filter by location'),
            OpenApiParameter('experience', type=OpenApiTypes.STR, description='Filter by experience level'),
            OpenApiParameter('search', type=OpenApiTypes.STR, description='Search by job title'),
        ]
    )
)
@method_decorator(cache_page(60 * 15), name='dispatch')
class PublicJobVacancyListView(generics.ListAPIView):
    """
    Public API: GET /api/v1/careers/jobs/
    Lists all ACTIVE job vacancies with optional filtering.
    """
    serializer_class = JobVacancySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = JobVacancy.objects.filter(status=JobVacancy.Status.ACTIVE).order_by('-created_at')
        
        # Filtering
        department = self.request.query_params.get('department')
        location = self.request.query_params.get('location')
        experience = self.request.query_params.get('experience')
        search = self.request.query_params.get('search')
        
        if department:
            queryset = queryset.filter(department__icontains=department)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if experience:
            queryset = queryset.filter(experience__icontains=experience)
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        return queryset

@extend_schema_view(
    get=extend_schema(
        tags=['Careers (Public)'],
        summary="Get Job Vacancy Details",
        description="Retrieves full details for a specific active job posting by its ID."
    )
)
class PublicJobVacancyDetailView(generics.RetrieveAPIView):
    """
    Public API: GET /api/v1/careers/jobs/{id}/
    Retrieves a specific ACTIVE job vacancy.
    """
    queryset = JobVacancy.objects.filter(status=JobVacancy.Status.ACTIVE)
    serializer_class = JobVacancySerializer
    permission_classes = [AllowAny]
    lookup_field = 'job_id'

@extend_schema_view(
    post=extend_schema(
        tags=['Careers (Public)'],
        summary="Submit Candidate Application",
        description="Submit a job application with a resume file upload (PDF/DOCX max 5MB).",
        request=ApplySerializer,
    )
)
class ApplyForJobView(APIView):
    """
    Public API: POST /api/v1/careers/apply/
    Allows candidates to submit an application and upload their resume.
    """
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)
    throttle_classes = [ApplyRateThrottle]
    
    def post(self, request):
        serializer = ApplySerializer(data=request.data)
        
        if serializer.is_valid():
            job_id = serializer.validated_data['job_id']
            # Rejects CLOSED vacancies even if they try to supply the ID
            job = get_object_or_404(JobVacancy, job_id=job_id, status=JobVacancy.Status.ACTIVE)
            
            resume_file = serializer.validated_data['resume']
            
            # Generate a safe filename and folder
            ext = resume_file.name.split('.')[-1].lower()
            application_uuid = uuid.uuid4().hex
            safe_filename = f"{uuid.uuid4().hex}.{ext}"
            
            storage_path = f"applications/{application_uuid}/{safe_filename}"
            
            # 1. Upload to Supabase Storage First
            try:
                # Read the actual bytes from the InMemoryUploadedFile
                file_bytes = resume_file.read()
                upload_resume(storage_path, file_bytes, resume_file.content_type)
            except Exception as e:
                logger.error("Resume upload to storage failed for application", exc_info=e)
                return Response({'error': 'Resume upload failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 2. Persist Application in PostgreSQL Database
            try:
                application = create_candidate_application(
                    job_vacancy=job,
                    first_name=serializer.validated_data['first_name'],
                    last_name=serializer.validated_data['last_name'],
                    email=serializer.validated_data['email'],
                    phone=serializer.validated_data['phone'],
                    resume_storage_path=storage_path
                )
                
                logger.info(f"AUDIT_EVENT: action=APPLICATION_RECEIVED target={application.tracking_code} actor=CANDIDATE job_id={job.job_id}")
                
                # Trigger the asynchronous email acknowledgement task (non-blocking)
                try:
                    send_application_acknowledgement.delay(application.tracking_code)
                except Exception as task_err:
                    # Celery/broker may not be running in dev — log and continue
                    logger.warning(f"TASK_SKIPPED: Could not queue acknowledgement email: {task_err}")
                
                return Response({
                    'message': 'Application submitted successfully.',
                    'tracking_code': application.tracking_code
                }, status=status.HTTP_201_CREATED)

                
            except Exception as e:
                # 3. Cleanup orphaned storage object if database persistence fails
                delete_resume(storage_path)
                return Response({'error': 'Failed to save application. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ------------------------------------------------------------
# HR APIs
# ------------------------------------------------------------

@extend_schema_view(
    list=extend_schema(tags=['Careers (HR Admin)'], summary="List all jobs (including closed)"),
    retrieve=extend_schema(tags=['Careers (HR Admin)'], summary="Get job details"),
    create=extend_schema(tags=['Careers (HR Admin)'], summary="Create a new job vacancy"),
    update=extend_schema(tags=['Careers (HR Admin)'], summary="Update a job vacancy completely"),
    partial_update=extend_schema(tags=['Careers (HR Admin)'], summary="Update a job vacancy partially"),
    destroy=extend_schema(tags=['Careers (HR Admin)'], summary="Delete a job vacancy"),
)
class AdminJobVacancyViewSet(viewsets.ModelViewSet):
    """
    HR API: CRUD operations for Job Vacancies.
    """
    queryset = JobVacancy.objects.all().order_by('-created_at')
    serializer_class = AdminJobVacancySerializer
    permission_classes = [IsHRManagerOrSuperAdmin]
    lookup_field = 'job_id'

@extend_schema_view(
    list=extend_schema(tags=['Careers (HR Admin)'], summary="List all applications"),
    retrieve=extend_schema(tags=['Careers (HR Admin)'], summary="Get application details"),
)
class AdminCandidateApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    HR API: View and manage Candidate Applications.
    """
    queryset = CandidateApplication.objects.all().select_related('job_vacancy').order_by('-created_at')
    serializer_class = AdminCandidateApplicationSerializer
    permission_classes = [IsHRManagerOrSuperAdmin]
    lookup_field = 'tracking_code'

    @extend_schema(tags=['Careers (HR Admin)'], summary="Update application stage", request=ApplicationStageUpdateSerializer)
    @action(detail=True, methods=['patch'])
    def stage(self, request, tracking_code=None):
        """HR API: Update application stage"""
        application = self.get_object()
        old_stage = application.stage
        
        serializer = ApplicationStageUpdateSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"AUDIT_EVENT: action=APPLICATION_STAGE_UPDATED target={application.tracking_code} actor={request.user.username} old_stage={old_stage} new_stage={application.stage}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(tags=['Careers (HR Admin)'], summary="Get secure resume download URL")
    @action(detail=True, methods=['get'])
    def resume(self, request, tracking_code=None):
        """HR API: Securely download resume via signed URL"""
        application = self.get_object()
        try:
            url = generate_signed_url(application.resume_storage_path, expires_in=60)
            return Response({'download_url': url})
        except Exception as e:
            logger.error("Failed to generate signed resume URL", exc_info=e)
            return Response({'error': 'Could not generate a download link. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(tags=['Careers (HR Admin)'], summary="Manage internal ATS notes", request=ApplicationNoteSerializer)
    @action(detail=True, methods=['get', 'post'])
    def notes(self, request, tracking_code=None):
        """HR API: Manage internal ATS notes"""
        application = self.get_object()
        
        if request.method == 'GET':
            notes = application.notes.all().select_related('author').order_by('-created_at')
            serializer = ApplicationNoteSerializer(notes, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            serializer = ApplicationNoteSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(application=application, author=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
