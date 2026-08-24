from django.core.exceptions import ValidationError

ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
]

def validate_magic_bytes(file_obj):
    # Pure python magic byte check
    file_obj.seek(0)
    header = file_obj.read(4)
    file_obj.seek(0)
    
    # PDF magic bytes: %PDF (0x25 50 44 46)
    # ZIP/DOCX magic bytes: PK.. (0x50 4B 03 04)
    if header != b'%PDF' and header != b'PK\x03\x04':
        raise ValidationError("Security Warning: File signature is not allowed. Only PDF, DOCX, and ZIP files are allowed.")

    try:
        import magic
        sample = file_obj.read(2048)
        file_obj.seek(0)
        mime_type = magic.from_buffer(sample, mime=True)
        if mime_type not in ALLOWED_MIME_TYPES:
            raise ValidationError(f"Security Warning: File type '{mime_type}' is not allowed.")
    except Exception:
        # Fallback to extension check if python-magic is not installed/configured
        name = getattr(file_obj, 'name', '').lower()
        ext = name.split('.')[-1]
        if ext not in ['pdf', 'docx', 'zip']:
            raise ValidationError("Security Warning: File type is not allowed.")
