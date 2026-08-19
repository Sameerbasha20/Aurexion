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


# Fail-safe default: DEBUG is opt-in and defaults to OFF. A misconfigured
# production deployment therefore can never silently fall back into debug
# mode, which would expose stack traces and configuration through Django's
# technical error pages. Supports both DEBUG and DJANGO_DEBUG env names.
DEBUG = _env_flag('DEBUG') or _env_flag('DJANGO_DEBUG')


def _resolve_secret_key(debug=False):
    """
    SECRET_KEY must come from the environment — never from a hardcoded value.

    In DEBUG mode a clearly-marked development key is acceptable so local
    development works without a .env file. In production (DEBUG off) the
    server refuses to start rather than signing tokens with a guessable key.
    """
    key = os.getenv('SECRET_KEY')
    if key:
        return key
    if debug:
        return 'dev-only-insecure-secret-key-do-not-use-in-production'
    raise ImproperlyConfigured(
        'SECRET_KEY is not set. Set SECRET_KEY in the environment or .env '
        'before starting the server.'
    )


SECRET_KEY = _resolve_secret_key(debug=DEBUG)

ALLOWED_HOSTS = [
    'aurexion.onrender.com',
    'localhost',
    '127.0.0.1',
    'testserver',
]

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

MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',
    'config.middleware.SecurityHeadersMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'config.middleware.RequestBodySizeLimitMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://aurexion-one.vercel.app',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'src' / 'templates'],
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

if os.getenv('DB_ENGINE'):
    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DB_ENGINE'),
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'CONN_MAX_AGE': 60,
            'CONN_HEALTH_CHECKS': True,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
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
elif os.getenv('REDIS_URL') or not DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
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
        'rest_framework_simplejwt.authentication.JWTAuthentication',
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
        'anon': '60/min',
        'user': '1000/min',
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
    'SERVE_PERMISSIONS': ['rest_framework.permissions.IsAuthenticated'],
    'SERVE_INCLUDE_SCHEMA': False,
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
STATICFILES_DIRS = [BASE_DIR / 'src' / 'static']
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

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
LAST_UPDATED = os.getenv('LAST_UPDATED', '2026-08-17')
