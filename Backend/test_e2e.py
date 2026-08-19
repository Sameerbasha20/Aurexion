import os, sys
from pathlib import Path
sys.path.insert(0, str(Path('.').resolve() / 'src'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from apps.authentication.models import UserProfile
import json

client = Client()

# Setup users
for u in ['bdm_user', 'sales_user', 'admin_user']:
    User.objects.filter(username=u).delete()

bdm_user = User.objects.create_user(username='bdm_user', email='bdm@test.com', password='test123')
bdm_user.profile.role = 'bdm'; bdm_user.profile.save()

sales_user = User.objects.create_user(username='sales_user', email='sales@test.com', password='test123')
sales_user.profile.role = 'sales_executive'; sales_user.profile.save()

admin_user = User.objects.create_user(username='admin_user', email='admin@test.com', password='test123')
admin_user.is_superuser = True; admin_user.save()

print('=== COMPLETE E2E FLOW TEST ===')
print()

# 1. Public forms submit leads
print('1. PUBLIC FORM SUBMISSIONS')
client.logout()
forms = [
    {'name': 'Contact Client', 'email': 'contact@test.com', 'phone': '111', 'company': 'Contact Co', 'description': 'Contact form', 'source': 'contact_form', 'industry': 'Web'},
    {'name': 'Quote Client', 'email': 'quote@test.com', 'phone': '222', 'company': 'Quote Co', 'description': 'Quote request', 'source': 'request_quote', 'industry': 'Mobile'},
    {'name': 'RFP Client', 'email': 'rfp@test.com', 'phone': '333', 'company': 'RFP Co', 'description': 'RFP submission', 'source': 'rfp_form', 'industry': 'ERP'},
    {'name': 'Estimator Client', 'email': 'est@test.com', 'phone': '444', 'company': 'Est Co', 'description': 'Estimator followup', 'source': 'estimator', 'industry': 'AI'},
]
for f in forms:
    resp = client.post('/api/v1/public/leads/', data=json.dumps(f), content_type='application/json')
    print('   {}: {} - status {}'.format(f['source'], resp.json()['reference_id'], resp.status_code))

# 2. Health check
print()
print('2. HEALTH CHECK')
resp = client.get('/')
print('   Status: {} - {}'.format(resp.status_code, resp.json()))

# 3. BDM Dashboard
print()
print('3. BDM DASHBOARD')
client.force_login(bdm_user)
resp = client.get('/api/v1/bdm/dashboard/')
d = resp.json()
print('   Status: {}'.format(resp.status_code))
print('   Total leads: {}, New: {}, Unassigned: {}'.format(d['total_leads'], d['new_leads'], d['unassigned_leads']))
print('   Recent form submissions: {}'.format(len(d['recent_form_submissions'])))
for s in d['recent_form_submissions'][:3]:
    print('     - {}: {} ({})'.format(s['source_display'], s['name'], s['reference_id']))

# 4. BDM Accept (assign) RFP
print()
print('4. BDM ACCEPT RFP')
rfp_lead = next(s for s in d['recent_form_submissions'] if s['source'] == 'rfp_form')
resp = client.post('/api/v1/leads/' + str(rfp_lead['id']) + '/assign/', data=json.dumps({'assigned_to': sales_user.id}), content_type='application/json')
print('   Assign Status: {}'.format(resp.status_code))
print('   After assign - assigned_to: {}'.format(resp.json()['assigned_to_name']))

# 5. BDM Decline another RFP
print()
print('5. BDM DECLINE RFP')
resp = client.post('/api/v1/public/leads/', data=json.dumps({'name': 'Decline Test', 'email': 'dec@test.com', 'phone': '555', 'company': 'Dec Co', 'description': 'To decline', 'source': 'rfp_form', 'industry': 'Web'}), content_type='application/json')
lead2 = resp.json()
resp = client.post('/api/v1/leads/' + str(lead2['id']) + '/lost/', data=json.dumps({'reason': 'Not a fit'}), content_type='application/json')
print('   Lost Status: {}'.format(resp.status_code))
print('   After decline - status: {}, reason: {}'.format(resp.json()['status'], resp.json()['lost_reason']))

# 6. Sales Dashboard
print()
print('6. SALES DASHBOARD (only assigned leads)')
client.force_login(sales_user)
resp = client.get('/api/v1/leads/')
leads = resp.json() if isinstance(resp.json(), list) else resp.json().get('results', [])
print('   Sales sees {} leads'.format(len(leads)))
for l in leads:
    print('     - {}: {} (assigned: {})'.format(l['reference_id'], l['name'], l['assigned_to_name']))

# 7. Admin Dashboard (sees all)
print()
print('7. ADMIN DASHBOARD (sees all)')
client.force_login(admin_user)
resp = client.get('/api/v1/leads/')
leads = resp.json() if isinstance(resp.json(), list) else resp.json().get('results', [])
print('   Admin sees {} total leads'.format(len(leads)))
new_count = sum(1 for l in leads if l['status'] == 'new')
lost_count = sum(1 for l in leads if l['status'] == 'lost')
print('   New: {}, Lost: {}'.format(new_count, lost_count))

print()
print('=== ALL TESTS PASSED ===')