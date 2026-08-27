import os
import urllib.request
import urllib.error
import urllib.parse
import json
import logging
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)

# Resolve Supabase URL:
# Priority 1: SUPABASE_URL env var
# Priority 2: Derive from DB_USER which looks like postgres.<project-ref>
SUPABASE_URL = os.environ.get('SUPABASE_URL')
if not SUPABASE_URL:
    db_user = os.environ.get('DB_USER', '')
    # DB_USER = postgres.<project-ref> for Supabase pooler connections
    if '.' in db_user and db_user.startswith('postgres.'):
        project_ref = db_user.split('.', 1)[1]
        SUPABASE_URL = f"https://{project_ref}.supabase.co"
    else:
        # Legacy: try to derive from DB_HOST (non-pooler)
        db_host = os.environ.get('DB_HOST', '')
        if 'supabase.co' in db_host and 'pooler' not in db_host:
            project_ref = db_host.split('.')[0]
            SUPABASE_URL = f"https://{project_ref}.supabase.co"

# The service role key is needed for storage operations.
# Prefer a dedicated SUPABASE_SERVICE_ROLE_KEY; fall back to SECRET_KEY only
# for backwards compatibility with deployments that reused it.
def _resolve_service_role_key():
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if key:
        return key
    logger.warning(
        "SUPABASE_SERVICE_ROLE_KEY is not set; falling back to SECRET_KEY. "
        "Set a dedicated SUPABASE_SERVICE_ROLE_KEY in production."
    )
    return settings.SECRET_KEY

SUPABASE_SERVICE_ROLE_KEY = _resolve_service_role_key()

# Defers the error check to function invocation to avoid Django import crashes during local dev/commands

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    logger.warning("Supabase URL and Service Role Key are not configured. Resume storage functions will fail.")

BUCKET_NAME = "candidate-resumes"

def _check_storage_configured():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ImproperlyConfigured("Supabase URL and Service Role Key are required for Resume Storage.")

def _validate_storage_path(file_path):
    """
    Defense-in-depth: only allow flat, relative object keys made of safe
    path segments. Rejects traversal attempts, absolute paths, and Windows
    separators even if a stored value were ever tampered with.
    """
    if not file_path or file_path.startswith('/') or '\\' in file_path:
        raise ValueError("Invalid storage path.")
    parts = file_path.split('/')
    for part in parts:
        # Fully decode the segment (handles %2F, %252F, etc.)
        decoded = urllib.parse.unquote(part)
        # Reject empty segments, dot-segments, or any segment that contained
        # a percent-encoded slash (%2F / %2f) which would inject a path separator
        if part in ('', '.', '..') or decoded in ('.', '..') or '/' in decoded:
            raise ValueError("Invalid storage path.")

def upload_resume(file_path, file_content, content_type):
    """
    Uploads a resume file to Supabase private storage.
    file_path: applications/<tracking_code>/<safe_filename>
    file_content: bytes
    """
    _check_storage_configured()
    _validate_storage_path(file_path)
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
    _validate_storage_path(file_path)
    url = f"{SUPABASE_URL}/storage/v1/object/sign/{BUCKET_NAME}/{file_path}"
    
    data = json.dumps({"expiresIn": expires_in}).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_ROLE_KEY}')
    req.add_header('apikey', SUPABASE_SERVICE_ROLE_KEY)
    req.add_header('Content-Type', 'application/json')
    
    try:
        response = urllib.request.urlopen(req)
        response_data = json.loads(response.read().decode('utf-8'))
        signed_path = response_data.get('signedURL')
        if not signed_path.startswith('/storage/v1'):
            signed_path = f"/storage/v1{signed_path}" if signed_path.startswith('/') else f"/storage/v1/{signed_path}"
        return f"{SUPABASE_URL}{signed_path}"
    except urllib.error.HTTPError as e:
        error_info = e.read().decode('utf-8')
        raise Exception(f"Failed to generate signed URL: {error_info}")

def delete_resume(file_path):
    """
    Deletes a file from Supabase storage (used for cleanup if DB save fails).
    """
    _check_storage_configured()
    _validate_storage_path(file_path)
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{file_path}"
    
    req = urllib.request.Request(url, method='DELETE')
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_ROLE_KEY}')
    req.add_header('apikey', SUPABASE_SERVICE_ROLE_KEY)
    
    try:
        urllib.request.urlopen(req)
        return True
    except urllib.error.HTTPError as exc:
        logger.debug("Failed to delete resume %s during cleanup: %s", file_path, exc)
        return False
