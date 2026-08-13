import os
import sys

import django
from dotenv import load_dotenv

# ---------------------------------------------------------
# Project setup
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# Add both the project root and the src directory to Python path
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

# Load environment variables
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, ".env"))

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

django.setup()

# ---------------------------------------------------------
# Imports after Django initialization
# ---------------------------------------------------------

from django.contrib.auth import get_user_model
from config import config
from apps.administration.models import Role, ModulePermission

User = get_user_model()

# ---------------------------------------------------------
# Module administrators configurations
# ---------------------------------------------------------

MODULE_ADMINS = [
    {
        "module": "Super Admin",
        "username": "super_admin",
        "password": "SuperAdmin@2026",
        "email": "superadmin@aurexion.com",
        "role": "super_admin",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "module": "Administrator",
        "username": config.ADMINISTRATOR_USERNAME,
        "password": config.ADMINISTRATOR_PASSWORD,
        "email": config.ADMINISTRATOR_EMAIL,
        "role": "administrator",
        "is_staff": True,
        "is_superuser": False,
    },
    {
        "module": "Business Development Manager",
        "username": config.BUSINESS_DEV_MANAGER_USERNAME,
        "password": config.BUSINESS_DEV_MANAGER_PASSWORD,
        "email": config.BUSINESS_DEV_MANAGER_EMAIL,
        "role": "bdm",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "module": "Sales Executive",
        "username": config.SALES_EXECUTIVE_USERNAME,
        "password": config.SALES_EXECUTIVE_PASSWORD,
        "email": config.SALES_EXECUTIVE_EMAIL,
        "role": "sales_executive",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "module": "HR Manager",
        "username": config.HR_MANAGER_USERNAME,
        "password": config.HR_MANAGER_PASSWORD,
        "email": config.HR_MANAGER_EMAIL,
        "role": "hr_manager",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "module": "Content Manager",
        "username": config.CONTENT_MANAGER_USERNAME,
        "password": config.CONTENT_MANAGER_PASSWORD,
        "email": config.CONTENT_MANAGER_EMAIL,
        "role": "content_manager",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "module": "Support Executive",
        "username": config.SUPPORT_EXECUTIVE_USERNAME,
        "password": config.SUPPORT_EXECUTIVE_PASSWORD,
        "email": config.SUPPORT_EXECUTIVE_EMAIL,
        "role": "support_executive",
        "is_staff": False,
        "is_superuser": False,
    },
]

ROLES_METADATA = [
    {
        'code': 'super_admin',
        'name': 'Super Admin',
        'description': 'Full access to all modules and configurations',
        'permissions': {
            'authentication': (True, True, True, True),
            'recruitment': (True, True, True, True),
            'cms': (True, True, True, True),
            'crm': (True, True, True, True),
            'portal': (True, True, True, True),
            'rbac': (True, True, True, True),
        }
    },
    {
        'code': 'administrator',
        'name': 'Administrator',
        'description': 'Administrative settings, users and roles management',
        'permissions': {
            'authentication': (True, True, True, True),
            'rbac': (True, True, True, True),
            'recruitment': (True, True, True, False),
            'cms': (True, True, True, True),
            'crm': (True, True, True, True),
            'portal': (True, True, True, True),
        }
    },
    {
        'code': 'bdm',
        'name': 'Business Development Manager',
        'description': 'Manages clients, leads and contracts',
        'permissions': {
            'crm': (True, True, True, True),
            'portal': (True, True, True, False),
        }
    },
    {
        'code': 'sales_executive',
        'name': 'Sales Executive',
        'description': 'Handles sales leads and pipelines',
        'permissions': {
            'crm': (True, True, True, False),
        }
    },
    {
        'code': 'hr_manager',
        'name': 'HR Manager',
        'description': 'ATS, recruitment, and candidate tracking',
        'permissions': {
            'recruitment': (True, True, True, True),
        }
    },
    {
        'code': 'content_manager',
        'name': 'Content Manager',
        'description': 'Manages website content, pages and media',
        'permissions': {
            'cms': (True, True, True, True),
        }
    },
    {
        'code': 'support_executive',
        'name': 'Support Executive',
        'description': 'Client support, tickets and helpdesk',
        'permissions': {
            'crm': (False, True, True, False),
            'portal': (True, True, True, False),
            'cms': (False, True, False, False),
        }
    },
    {
        'code': 'client_user',
        'name': 'Client User',
        'description': 'Standard client portal user',
        'permissions': {
            'portal': (True, True, True, False),
        }
    }
]

# ---------------------------------------------------------
# Helpers & Execution
# ---------------------------------------------------------

def seed_roles_and_permissions():
    print("Seeding Roles and Module Permissions...")
    for role_data in ROLES_METADATA:
        role, created = Role.objects.get_or_create(
            code=role_data['code'],
            defaults={
                'name': role_data['name'],
                'description': role_data['description']
            }
        )
        if not created:
            role.name = role_data['name']
            role.description = role_data['description']
            role.save()
            
        # Seed permissions
        permissions = role_data['permissions']
        for module, (c, r, u, d) in permissions.items():
            ModulePermission.objects.update_or_create(
                role=role,
                module=module,
                defaults={
                    'can_create': c,
                    'can_read': r,
                    'can_update': u,
                    'can_delete': d
                }
            )
    print("Roles and permissions seeded.")

def create_or_update_admin(module_config):
    module = module_config["module"]
    username = module_config["username"]
    password = module_config["password"]
    email = module_config["email"]
    role = module_config["role"]
    is_staff = module_config["is_staff"]
    is_superuser = module_config["is_superuser"]

    if not username or not password or not email:
        raise RuntimeError(
            f"Missing required configuration/environment variable for module: {module}. "
            "Please check your .env file."
        )

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "is_staff": is_staff,
            "is_superuser": is_superuser,
            "is_active": True,
        },
    )

    # Keep account details synchronized with config
    user.email = email
    user.is_staff = is_staff
    user.is_superuser = is_superuser
    user.is_active = True

    # Always reset password from config
    user.set_password(password)
    user.save()

    # Update associated UserProfile role
    profile = user.profile
    profile.role = role
    profile.save()

    if created:
        print(f"[CREATED] {module} admin: {username} (Role: {role})")
    else:
        print(f"[UPDATED] {module} admin: {username} (Role: {role})")

# ---------------------------------------------------------
# Main
# ---------------------------------------------------------

def main():
    print("=" * 60)
    print("AUREXION MODULE ADMIN INITIALIZATION & ROLE SYNCHRONIZATION")
    print("=" * 60)

    # Seed roles and permissions first
    seed_roles_and_permissions()

    for module_config in MODULE_ADMINS:
        create_or_update_admin(module_config)

    print("=" * 60)
    print("Module administrators initialized and synchronized successfully.")
    print("=" * 60)

if __name__ == "__main__":
    main()