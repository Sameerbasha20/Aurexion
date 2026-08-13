import os
import urllib.request
import urllib.error
import json
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

# Deduce Supabase URL from DB_HOST
db_host = os.environ.get('DB_HOST', '')
if 'supabase.co' in db_host:
    project_ref = db_host.split('.')[1]
    SUPABASE_URL = f"https://{project_ref}.supabase.co"
else:
    SUPABASE_URL = os.environ.get('SUPABASE_URL')

# In this project, the SECRET_KEY is set to the Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', settings.SECRET_KEY)

# Defers the error check to function invocation to avoid Django import crashes during local dev/commands
import logging
logger = logging.getLogger(__name__)

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    logger.warning("Supabase URL and Service Role Key are not configured. Resume storage functions will fail.")

BUCKET_NAME = "candidate-resumes"

def _check_storage_configured():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ImproperlyConfigured("Supabase URL and Service Role Key are required for Resume Storage.")

def upload_resume(file_path, file_content, content_type):
    """
    Uploads a resume file to Supabase private storage.
    file_path: applications/<tracking_code>/<safe_filename>
    file_content: bytes
    """
    _check_storage_configured()
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{file_path}"
    
    req = urllib.request.Request(url, data=file_content, method='POST')
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_ROLE_KEY}')
    req.add_header('apikey', SUPABASE_SERVICE_ROLE_KEY)
    req.add_header('Content-Type', content_type)
    
    try:
        response = urllib.request.urlopen(req)
        return True
    except urllib.error.HTTPError as e:
        error_info = e.read().decode('utf-8')
        raise Exception(f"Supabase storage upload failed: {error_info}")

def generate_signed_url(file_path, expires_in=60):
    """
    Generates a short-lived signed URL for a file in Supabase storage.
    """
    _check_storage_configured()
    url = f"{SUPABASE_URL}/storage/v1/object/sign/{BUCKET_NAME}/{file_path}"
    
    data = json.dumps({"expiresIn": expires_in}).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_ROLE_KEY}')
    req.add_header('apikey', SUPABASE_SERVICE_ROLE_KEY)
    req.add_header('Content-Type', 'application/json')
    
    try:
        response = urllib.request.urlopen(req)
        response_data = json.loads(response.read().decode('utf-8'))
        return f"{SUPABASE_URL}{response_data.get('signedURL')}"
    except urllib.error.HTTPError as e:
        error_info = e.read().decode('utf-8')
        raise Exception(f"Failed to generate signed URL: {error_info}")

def delete_resume(file_path):
    """
    Deletes a file from Supabase storage (used for cleanup if DB save fails).
    """
    _check_storage_configured()
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{file_path}"
    
    req = urllib.request.Request(url, method='DELETE')
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_ROLE_KEY}')
    req.add_header('apikey', SUPABASE_SERVICE_ROLE_KEY)
    
    try:
        urllib.request.urlopen(req)
        return True
    except urllib.error.HTTPError:
        pass # Ignore delete failures during cleanup
