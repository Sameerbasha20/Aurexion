import os
from pathlib import Path

# pyrefly: ignore [missing-import]

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables

load_dotenv(BASE_DIR / '.env')


def _env_flag(name, default=False):
    """Parse a boolean environment variable (1/true/yes/on)."""
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in ('1', 'true', 'yes', 'on')


DEBUG = _env_flag('DEBUG') or _env_flag('DJANGO_DEBUG')


def _resolve_secret_key(debug=False):
    """
    SECRET_KEY must come from the environment — never from a hardcoded value.
    """
    key = os.getenv('SECRET_KEY') or os.getenv('DJANGO_SECRET_KEY')
    if key:
        return key
    if debug:
        return 'dev-only-insecure-secret-key-do-not-use-in-production'
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY environment variable is mandatory for non-DEBUG environments!"
    )


SECRET_KEY = _resolve_secret_key(debug=DEBUG)

ALLOWED_HOSTS = [
    'aurexion.onrender.com',
    'localhost',
    '127.0.0.1',
    'testserver',
    'aurexion-one.vercel.app',
]
_env_hosts = os.getenv('ALLOWED_HOSTS', '')
if _env_hosts:
    for h in _env_hosts.split(','):
        h_clean = h.strip()
        if h_clean and h_clean not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(h_clean)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'apps.authentication',
    'apps.administration',
    'apps.cms',
    'apps.crm',
    'apps.portal',
    'apps.recruitment',
    'apps.bdm',
    'apps.core',
]

try:
    import whitenoise  # noqa: F401
    HAS_WHITENOISE = True
except ImportError:
    HAS_WHITENOISE = False

MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',
    'config.middleware.SecurityHeadersMiddleware',
    'django.middleware.security.SecurityMiddleware',
]
if HAS_WHITENOISE:
    MIDDLEWARE.append('whitenoise.middleware.WhiteNoiseMiddleware')

MIDDLEWARE.extend([
    'config.middleware.RequestBodySizeLimitMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
])

# CORS & CSRF Configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://aurexion-plum.vercel.app',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'https://aurexion-plum.vercel.app',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE =  DEBUG
# Lax in dev (same-site localhost:3000 ↔ localhost:8000 is same-site via eTLD+1), None in prod cross-site (vercel.app ↔ onrender.com)
# SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE') or ('Lax' if DEBUG else 'None')
SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE') or ('Lax' if not  DEBUG else 'None')



CSRF_COOKIE_HTTPONLY = False  # Let frontend read the csrf token cookie to pass in request headers
CSRF_COOKIE_SECURE = not DEBUG
#CSRF_COOKIE_SAMESITE = os.getenv('CSRF_COOKIE_SAMESITE') or ('Lax' if DEBUG else 'None')

CSRF_COOKIE_SAMESITE =  'None'


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
if not DEBUG:
    SECURE_SSL_REDIRECT = _env_flag('SECURE_SSL_REDIRECT', default=True)
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

ROOT_URLCONF = 'config.urls'

_templates_dir = (BASE_DIR / 'src' / 'templates') if (BASE_DIR / 'src' / 'templates').exists() else (BASE_DIR / 'templates')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [_templates_dir] if _templates_dir.exists() else [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

import sys
IS_TESTING = 'test' in sys.argv or 'pytest' in sys.modules or any('pytest' in arg for arg in sys.argv)

use_local = _env_flag('USE_LOCAL_DB', default=False) or IS_TESTING
if os.getenv('DB_ENGINE') and not use_local:
    db_host = os.getenv('DB_HOST', '')
    is_supabase = 'supabase' in str(db_host).lower()
    default_port = '6543' if is_supabase else '5432'
    
    conn_max_age = int(os.getenv('CONN_MAX_AGE', '600'))
    conn_health_checks = _env_flag('CONN_HEALTH_CHECKS', default=True)
    connect_timeout = int(os.getenv('DB_CONNECT_TIMEOUT', '10'))

    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DB_ENGINE'),
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT') or default_port,
            # Performance & Stability: reuse DB connections within workers for up to
            # CONN_MAX_AGE seconds to avoid TCP+TLS handshake on every request.
            # Supabase PgBouncer (port 6543, transaction-pooling mode) multiplexes
            # backend server connections safely.
            # CONN_HEALTH_CHECKS=True issues a lightweight ping prior to reuse,
            # preventing stale-connection errors when pooler drops idle sessions.
            'CONN_MAX_AGE': conn_max_age,
            'CONN_HEALTH_CHECKS': conn_health_checks,
            'OPTIONS': {
                'connect_timeout': connect_timeout,
            },
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
            'CONN_MAX_AGE': 60,
        }
    }

PASSWORD_HASHERS = [
    'apps.authentication.hashers.FastPBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'apps.authentication.validators.SymbolValidator',
    },
    {
        'NAME': 'apps.authentication.validators.NumberValidator',
    },
]

# Cache Configuration

import sys
IS_TESTING = 'test' in sys.argv or 'pytest' in sys.modules or any('pytest' in arg for arg in sys.argv)

if IS_TESTING:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'aurexion-cache-testing',
        }
    }
elif os.getenv('REDIS_URL'):
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.getenv('REDIS_URL'),
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'aurexion-cache-fallback',
        }
    }

# DRF Configuration

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'DEFAULT_RENDERER_CLASSES': (
        'apps.core.renderers.StandardResponseJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.authentication.authentication.CookieJWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/min' if DEBUG else '60/minute',
        'user': '1000/day',
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'config.exceptions.exception_handler',
}

# Request body limits — reject oversized/malformed payloads with 4xx instead
# of crashing. 5MB matches the intended resume upload limit.
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Aurexion Enterprise Platform API',
    'DESCRIPTION': 'API documentation for Aurexion Technologies platform.',
    'VERSION': '1.0.0',
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_DIST': 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5',
    'SWAGGER_UI_FAVICON_HREF': 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png',
    'ENUM_NAME_OVERRIDES': {
        'LeadStatusEnum': 'apps.crm.models.LeadStatus',
        'LeadPriorityEnum': 'apps.crm.models.LeadPriority',
        'LeadFollowUpStatusEnum': 'apps.crm.models.LeadFollowUpStatus',
        'LeadFollowUpTypeEnum': 'apps.crm.models.LeadFollowUpType',
        'JobStatusEnum': 'apps.recruitment.models.JobVacancy.Status',
        'ApplicationStageEnum': 'apps.recruitment.models.CandidateApplication.Stage',
    },
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

_static_dir = (BASE_DIR / 'src' / 'static') if (BASE_DIR / 'src' / 'static').exists() else (BASE_DIR / 'static')
STATICFILES_DIRS = [_static_dir] if _static_dir.exists() else []

if HAS_WHITENOISE:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
# Production media base URL: when set (e.g., https://aurexion.onrender.com or CDN), upload view returns absolute URL with that base.
# Falls back to request.build_absolute_uri() which respects X-Forwarded-Proto in production.
MEDIA_BASE_URL = os.getenv('MEDIA_BASE_URL', '').rstrip('/')

# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@aurexion.com')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# Client Portal Configuration

CLIENT_PORTAL_LOGIN_URL = os.getenv(
    'CLIENT_PORTAL_LOGIN_URL',
    'http://localhost:3000/login'
)


DEFAULT_CLIENT_PASSWORD = os.getenv('DEFAULT_CLIENT_PASSWORD', '')
# Project Info
PROJECT_NAME = os.getenv('PROJECT_NAME', 'Aurexion Enterprise Platform')
LAST_UPDATED = os.getenv('LAST_UPDATED', '2026-08-19')
