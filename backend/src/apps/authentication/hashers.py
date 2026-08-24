from django.contrib.auth.hashers import PBKDF2PasswordHasher


class FastPBKDF2PasswordHasher(PBKDF2PasswordHasher):
    """
    Custom PBKDF2 Password Hasher tuned for optimal balance of OWASP security 
    and fast login response times (< 100ms).
    """
    iterations = 100000
