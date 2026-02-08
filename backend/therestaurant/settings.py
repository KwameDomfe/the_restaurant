"""
Django settings for therestaurant project.

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.2/ref/settings/

"""

import os
from pathlib import Path
from dotenv import load_dotenv

# from decouple import config
# import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env so values like DJANGO_DEBUG
# take effect when running locally without exporting env vars.
load_dotenv(BASE_DIR / '.env')

### Custom User Model
AUTH_USER_MODEL = 'accounts.CustomUser'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = (
    os.environ.get('DJANGO_SECRET_KEY')
    or os.environ.get('SECRET_KEY')
    or '@1s6de1mlt#f(+41gum05#%@yzxxq$!xd8ghh_&-7*sz@qv1n#'
)

# SECURITY WARNING: don't run with debug turned on in production!
# Accept either DJANGO_DEBUG or DEBUG (from .env). Treat common truthy values as True.
# Default to False for production safety
DEBUG = str(os.environ.get('DJANGO_DEBUG', os.environ.get('DEBUG', 'False'))).lower() in (
    '1', 'true', 'yes', 'on'
)

# Fail loudly if SECRET_KEY is not set in production
if not SECRET_KEY and not DEBUG:
    raise ValueError("SECRET_KEY (or DJANGO_SECRET_KEY) environment variable must be set in production")

# Always allow localhost for local development
ALLOWED_HOSTS = ['localhost', '127.0.0.1','https://whale-app-ro8kj.ondigitalocean.app/']

# Accept either DJANGO_ALLOWED_HOSTS or ALLOWED_HOSTS (comma-separated)
allowed_hosts_env = os.environ.get('DJANGO_ALLOWED_HOSTS') or os.environ.get('ALLOWED_HOSTS')
if allowed_hosts_env:
    ALLOWED_HOSTS += [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]
elif not DEBUG:
    # Avoid failing build/collectstatic when env var is missing
    ALLOWED_HOSTS += ['*']

### Security Settings for Production
if not DEBUG:
    # Force HTTPS
    SECURE_SSL_REDIRECT = True
    
    # HSTS Settings (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Cookie Security
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # Additional Security Headers
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    
    # Proxy settings for platforms like Digital Ocean App Platform
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

### Application definition

DEFAULT_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
    'djoser',
    'channels',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_json_widget',
]

THIRD_PARTY_API_SERVICES = [
    
]

LOCAL_APPS = [
    'accounts',
    'restaurants',
    'orders',
    'social',
]

INSTALLED_APPS = (
    DEFAULT_APPS + 
    THIRD_PARTY_APPS + 
    THIRD_PARTY_API_SERVICES + 
    LOCAL_APPS
)

### Middleware configuration
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'therestaurant.urls'

### Templates configuration with context processors for auth and messages
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'therestaurant.wsgi.application'


### Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

POSTGRES_DB = os.environ.get("POSTGRES_DB")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
POSTGRES_USER = os.environ.get("POSTGRES_USER")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST")
POSTGRES_PORT = os.environ.get("POSTGRES_PORT")

POSTGRES_READY = (
    POSTGRES_DB is not None
    and POSTGRES_PASSWORD is not None
    and POSTGRES_USER is not None
    and POSTGRES_HOST is not None
    and POSTGRES_PORT is not None
)

if POSTGRES_READY:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": POSTGRES_DB,
            "USER": POSTGRES_USER,
            "PASSWORD": POSTGRES_PASSWORD,
            "HOST": POSTGRES_HOST,
            "PORT": POSTGRES_PORT,
            "OPTIONS": {
                "sslmode": "require",
            },# Ensure SSL is used when connecting to managed DB services
            # Many providers (including DigitalOcean) require or recommend SSL.
            # Persist connections for better performance (seconds)
            "CONN_MAX_AGE": 600,
        }
    }
### Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


### Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


### Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

### Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

### REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'The Restaurant API',
    'DESCRIPTION': 'API for The Restaurant project',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    # Available themes:
    # - 'drf-spectacular-sidecar'
    # - 'cerulean'
    # - 'cosmo'
    # - 'darkly'
    # - 'flatly'
    # - 'journal'
    # - 'litera'
    # - 'lumen'
    # - 'lux'
    # - 'materia'
    # - 'minty'
    # - 'pulse'
    # - 'sandstone'
    # - 'simplex'
    # - 'sketchy'
    # - 'slate'
    # - 'solar'
    # - 'spacelab'
    # - 'superhero'
    # - 'united'
    # - 'yeti'
    'SWAGGER_UI_DIST': 'drf-spectacular-sidecar',  # Use sidecar package
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
    },
}

### CORS Configuration
if DEBUG:
    # Development: Allow all origins for easier testing
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # Production: Only allow specific origins
    CORS_ALLOW_ALL_ORIGINS = False
    
    # Get allowed origins from environment variable
    cors_origins_env = os.environ.get('CORS_ALLOWED_ORIGINS', '')
    if cors_origins_env:
        CORS_ALLOWED_ORIGINS = [
            origin.strip() for origin in cors_origins_env.split(',') if origin.strip()
        ]
    else:
        # Default production origins - CHANGE THESE to your actual domains
        CORS_ALLOWED_ORIGINS = [
            "https://your-frontend-domain.com",
            "https://www.your-frontend-domain.com",
        ]

CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for mobile compatibility
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

### JWT Configuration
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

### Media files Configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

### Email Configuration
if DEBUG:
    # Development: Print emails to console
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    # Production: Use SMTP
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'The Restaurant <noreply@therestaurant.com>')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

### Channels Configuration
ASGI_APPLICATION = 'therestaurant.asgi.application'

### Redis Configuration for Channels
REDIS_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379')

if DEBUG:
    # Development: Use local Redis
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [('127.0.0.1', 6379)],
            },
        },
    }
else:
    # Production: Use Redis from environment variable
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [REDIS_URL],
            },
        },
    }

### Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': os.environ.get('DJANGO_LOG_LEVEL', 'INFO' if not DEBUG else 'DEBUG'),
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.environ.get('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}
