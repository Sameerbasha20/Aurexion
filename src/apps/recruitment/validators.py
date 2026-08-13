import os
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_resume(file):
    """
    Validates a resume file ensuring:
    1. It is under 5MB
    2. Has a .pdf or .docx extension
    3. Has a matching MIME type
    4. Has the correct magic bytes (prevents renamed executables)
    """
    # 1. Size validation (5 MB limit)
    max_size = 5 * 1024 * 1024
    if file.size > max_size:
        raise ValidationError(_("File size must be under 5MB."))
    
    # 2. Extension validation
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.pdf', '.docx']
    if ext not in valid_extensions:
        raise ValidationError(_("Unsupported file extension. Allowed extensions are: .pdf, .docx"))
    
    # 3. MIME type validation
    valid_mime_types = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if hasattr(file, 'content_type') and file.content_type not in valid_mime_types:
        raise ValidationError(_("Unsupported file type. Please upload a valid PDF or DOCX file."))
    
    # 4. Magic bytes validation (content sniffing)
    try:
        # Read first 4 bytes
        file.seek(0)
        header = file.read(4)
        file.seek(0) # Reset pointer
        
        # PDF magic number is %PDF (hex: 25 50 44 46)
        # DOCX is a zip file, magic number is PK (hex: 50 4B 03 04)
        if ext == '.pdf' and not header.startswith(b'%PDF'):
            raise ValidationError(_("The file appears to be corrupted or tampered with."))
        elif ext == '.docx' and not header.startswith(b'PK\x03\x04'):
            raise ValidationError(_("The file appears to be corrupted or tampered with."))
    except Exception as e:
        raise ValidationError(_("Could not verify file contents."))
