import os
import sys
from pathlib import Path
import django

# Add 'src' directory to Python path (like manage.py does)
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
import json

client = Client()

# Simulate RFP form submission (same data structure as frontend)
rfp_data = {
    'name': 'John Anderson',
    'email': 'j.anderson@company.com',
    'phone': '+1 (555) 000-0000',
    'company': 'Acme Corporation',
    'description': 'We need a custom ERP system for our manufacturing operations with inventory management.',
    'source': 'rfp_form',
    'industry': 'Enterprise Software / ERP'
}

response = client.post('/api/v1/public/leads/', data=json.dumps(rfp_data), content_type='application/json')
print('RFP Submit Status:', response.status_code)
lead = response.json()
print('Created Lead:', lead['reference_id'], lead['source'])

# Now check BDM dashboard
from django.contrib.auth.models import User
user = User.objects.filter(is_superuser=True).first()
client.force_login(user)
response = client.get('/api/v1/bdm/dashboard/')
dashboard = response.json()
print()
print('BDM Dashboard recent_form_submissions:')
for sub in dashboard['recent_form_submissions']:
    print(f"  - {sub['source_display']}: {sub['name']} ({sub['email']}) - {sub['reference_id']}")