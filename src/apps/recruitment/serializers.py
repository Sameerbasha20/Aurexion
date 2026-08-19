from rest_framework import serializers
from .models import JobVacancy, CandidateApplication
from .validators import validate_resume

class JobVacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobVacancy
        fields = ['job_id', 'title', 'department', 'location', 'experience', 'skills', 'responsibilities', 'status', 'created_at']
        read_only_fields = fields

class ApplySerializer(serializers.Serializer):
    job_id = serializers.CharField(max_length=50)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    resume = serializers.FileField(validators=[validate_resume])

class AdminJobVacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobVacancy
        fields = '__all__'

class AdminCandidateApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateApplication
        fields = '__all__'
        read_only_fields = ['tracking_code', 'resume_storage_path']

class ApplicationStageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateApplication
        fields = ['stage']

from .models import ApplicationNote
class ApplicationNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = ApplicationNote
        fields = ['id', 'note', 'author_name', 'created_at']
        read_only_fields = ['id', 'author_name', 'created_at']
