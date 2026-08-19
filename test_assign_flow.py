import os, sys
from pathlib import Path
sys.path.insert(0, str(Path('.').resolve() / 'src'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import Client
from django.contrib.auth.models import User
import json

client = Client()

# Create sales executive user if not exists
sales_user, _ = User.objects.get_or_create(username='sales1', defaults={'email': 'sales1@test.com', 'first_name': 'Sales', 'last_name': 'User'})
sales_user.set_password('test123')
sales_user.save()
from apps.authentication.models import UserProfile
profile, _ = UserProfile.objects.get_or_create(user=sales_user)
profile.role = 'sales_executive'
profile.save()

# Create BDM user
bdm_user, _ = User.objects.get_or_create(username='bdm1', defaults={'email': 'bdm1@test.com', 'first_name': 'BDM', 'last_name': 'User'})
bdm_user.set_password('test123')
bdm_user.save()
profile, _ = UserProfile.objects.get_or_create(user=bdm_user)
profile.role = 'bdm'
profile.save()

# Submit RFP as public
client.logout()
rfp_data = {'name': 'Test Client', 'email': 'client@test.com', 'phone': '1234567890', 'company': 'Test Corp', 'description': 'RFP test', 'source': 'rfp_form', 'industry': 'Web App'}
resp = client.post('/api/v1/public/leads/', data=json.dumps(rfp_data), content_type='application/json')
lead = resp.json()
print('RFP Submitted:', lead['reference_id'], 'assigned_to:', lead['assigned_to'])

# Use admin (superuser) for BDM dashboard access
admin_user = User.objects.filter(is_superuser=True).first()
client.force_login(admin_user)
resp = client.get('/api/v1/bdm/dashboard/')
dashboard = resp.json()
print('BDM Dashboard form submissions:', len(dashboard.get('recent_form_submissions', [])))

# Admin (as BDM) assigns to sales
resp = client.post('/api/v1/leads/' + str(lead['id']) + '/assign/', data=json.dumps({'assigned_to': sales_user.id}), content_type='application/json')
print('Assign Status:', resp.status_code)

# Sales logs in and checks leads
client.force_login(sales_user)
resp = client.get('/api/v1/leads/')
leads = resp.json()
lead_list = leads if isinstance(leads, list) else leads.get('results', [])
print('Sales CRM Dashboard leads:', len(lead_list))
for l in lead_list:
    print('  -', l['reference_id'], l['name'])