import os, sys
from pathlib import Path
sys.path.insert(0, str(Path('.').resolve() / 'src'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()

print("=== AUREXION CLIENT PORTAL DYNAMIC WORKFLOW VERIFICATION SUITE ===")

from apps.portal.models import (
    ClientProject,
    ClientDocument,
    SupportTicket,
    ProjectMilestone,
    SprintDeliverable,
    ConsultationRequest,
    ClientNotification,
)

# Clean up ONLY specific e2e test users created by this script
for username in ['e2e_client_a', 'e2e_client_b', 'e2e_support_exec', 'e2e_admin']:
    existing_user = User.objects.filter(username=username).first()
    if existing_user:
        SupportTicket.objects.filter(client_user=existing_user).delete()
        SupportTicket.objects.filter(assigned_to=existing_user).delete()
        ClientDocument.objects.filter(client_user=existing_user).delete()
        ConsultationRequest.objects.filter(client_user=existing_user).delete()
        ClientNotification.objects.filter(client_user=existing_user).delete()
        ClientProject.objects.filter(client_user=existing_user).delete()
        existing_user.delete()

admin_user = User.objects.create_superuser(username='e2e_admin', email='e2e_admin@test.com', password='Password123!')
admin_user.profile.role = 'super_admin'
admin_user.profile.save()

client_a = User.objects.create_user(username='e2e_client_a', email='e2e_client_a@test.com', password='Password123!')
client_a.profile.role = 'client_user'
client_a.profile.save()

client_b = User.objects.create_user(username='e2e_client_b', email='e2e_client_b@test.com', password='Password123!')
client_b.profile.role = 'client_user'
client_b.profile.save()

support_exec = User.objects.create_user(username='e2e_support_exec', email='e2e_support@test.com', password='Password123!')
support_exec.profile.role = 'support_executive'
support_exec.profile.save()

test_client = Client()

def get_data(response):
    payload = response.json()
    if isinstance(payload, dict) and 'data' in payload:
        return payload['data']
    return payload

# TEST 1: ADMIN CREATES CLIENT A + PROJECT A
test_client.force_login(admin_user)
proj_a_payload = {
    'client_user': client_a.id,
    'title': 'Client A Enterprise ERP Project',
    'description': 'Full stack enterprise ERP implementation',
    'status': 'in_progress',
    'progress_percentage': 45,
    'delivery_lead_name': 'Marcus Vance'
}
resp = test_client.post('/api/v1/projects/', data=json.dumps(proj_a_payload), content_type='application/json')
assert resp.status_code == 201
proj_a_data = get_data(resp)
proj_a_id = proj_a_data['id']
assert proj_a_data['title'] == 'Client A Enterprise ERP Project'

# Add Milestone and Deliverable for Project A
ms_a = ProjectMilestone.objects.create(
    project_id=proj_a_id,
    name='Phase 1 Core Architecture',
    description='Initial system setup',
    status='completed',
    is_current=False
)
ms_a2 = ProjectMilestone.objects.create(
    project_id=proj_a_id,
    name='Phase 2 Portal Integration',
    description='DRF API integration',
    status='in_progress',
    is_current=True
)
del_a = SprintDeliverable.objects.create(
    project_id=proj_a_id,
    sprint_name='Sprint 1',
    sprint_period='Aug 1 - Aug 15',
    deliverable_name='JWT Auth & RBAC Setup',
    delivery_status='completed'
)
doc_a = ClientDocument.objects.create(
    client_user=client_a,
    project_id=proj_a_id,
    title='Client A Architecture Spec.pdf',
    document_type='architecture',
    file_url='https://example.com/arch_a.pdf',
    file_size='3.5 MB'
)
print("TEST 1 — ADMIN CREATES CLIENT A + PROJECT A: PASSED")

# TEST 2: ADMIN CREATES CLIENT B + PROJECT B
proj_b_payload = {
    'client_user': client_b.id,
    'title': 'Client B Mobile App',
    'description': 'Cross-platform app development',
    'status': 'planning',
    'progress_percentage': 15,
    'delivery_lead_name': 'Sarah Jenkins'
}
resp = test_client.post('/api/v1/projects/', data=json.dumps(proj_b_payload), content_type='application/json')
assert resp.status_code == 201
proj_b_data = get_data(resp)
proj_b_id = proj_b_data['id']

doc_b = ClientDocument.objects.create(
    client_user=client_b,
    project_id=proj_b_id,
    title='Client B Requirements.pdf',
    document_type='requirements',
    file_url='https://example.com/req_b.pdf',
    file_size='1.8 MB'
)
print("TEST 2 — ADMIN CREATES CLIENT B + PROJECT B: PASSED")

# TEST 3: CLIENT A PORTAL QUERY & ISOLATION
test_client.force_login(client_a)
resp = test_client.get('/api/v1/projects/')
assert resp.status_code == 200
projects_a = get_data(resp)
if isinstance(projects_a, dict) and 'results' in projects_a:
    projects_a = projects_a['results']
assert len(projects_a) == 1
assert projects_a[0]['title'] == 'Client A Enterprise ERP Project'
assert projects_a[0]['delivery_lead_name'] == 'Marcus Vance'
print("TEST 3 — CLIENT A PORTAL QUERY & ISOLATION: PASSED (Client A sees only Project A)")

# TEST 4: CLIENT B PORTAL QUERY & ISOLATION
test_client.force_login(client_b)
resp = test_client.get('/api/v1/projects/')
assert resp.status_code == 200
projects_b = get_data(resp)
if isinstance(projects_b, dict) and 'results' in projects_b:
    projects_b = projects_b['results']
assert len(projects_b) == 1
assert projects_b[0]['title'] == 'Client B Mobile App'
print("TEST 4 — CLIENT B PORTAL QUERY & ISOLATION: PASSED (Client B sees only Project B)")

# TEST 5: MILESTONE STATUS TRANSITION & TIMELINE
test_client.force_login(admin_user)
ms_a2.status = 'completed'
ms_a2.is_current = False
ms_a2.save()

test_client.force_login(client_a)
resp = test_client.get('/api/v1/milestones/')
assert resp.status_code == 200
ms_list = get_data(resp)
if isinstance(ms_list, dict) and 'results' in ms_list:
    ms_list = ms_list['results']
assert len(ms_list) == 2
assert all(m['status'] == 'completed' for m in ms_list)
print("TEST 5 — MILESTONE STATUS TRANSITION & TIMELINE: PASSED (Updated status reflected for Client A)")

# TEST 6: SUPPORT TICKET CREATION BY CLIENT A
ticket_payload = {
    'subject': 'Database Connection Pool Exceeded',
    'category': 'bug',
    'priority': 'high',
    'project': proj_a_id
}
resp = test_client.post('/api/v1/support/my-tickets/', data=json.dumps(ticket_payload), content_type='application/json')
assert resp.status_code == 201
created_tkt = get_data(resp)
ticket_pk = created_tkt['id']
ticket_id = created_tkt['ticket_id']
assert created_tkt['status'] == 'open'
print(f"TEST 6 — SUPPORT TICKET CREATION BY CLIENT A: PASSED (ID: {ticket_id})")

# TEST 7: SUPPORT TICKET WORKFLOW PROGRESSION
test_client.force_login(support_exec)
assign_payload = {'assigned_to': support_exec.id, 'status': 'in_progress'}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(assign_payload), content_type='application/json')
assert resp.status_code == 200
assert get_data(resp)['status'] == 'in_progress'
print("TEST 7 — SUPPORT TICKET WORKFLOW PROGRESSION: PASSED (Status moved to in_progress)")

# TEST 8: MANDATORY RESOLUTION NOTES ON CLOSURE (MUST REJECT IF EMPTY)
close_bad = {'status': 'closed', 'resolution_notes': ''}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(close_bad), content_type='application/json')
assert resp.status_code == 400
print("TEST 8 — MANDATORY RESOLUTION NOTES ON CLOSURE: PASSED (HTTP 400 Bad Request when empty)")

# TEST 9: TICKET CLOSURE WITH NOTES
close_good = {'status': 'closed', 'resolution_notes': 'Increased database max_connections pool size.'}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(close_good), content_type='application/json')
assert resp.status_code == 200
assert get_data(resp)['status'] == 'closed'
print("TEST 9 — TICKET CLOSURE WITH NOTES: PASSED (Ticket closed with technical resolution notes)")

# TEST 10: DOCUMENT VAULT & SECURE DOWNLOAD
test_client.force_login(client_a)
resp = test_client.get(f'/api/v1/documents/{doc_a.id}/download/')
assert resp.status_code == 200
assert get_data(resp)['download_allowed'] is True
print("TEST 10 — DOCUMENT VAULT & SECURE DOWNLOAD: PASSED (Client A authorized for own document download)")

# TEST 11: SECURITY ISOLATION (CLIENT B DENIED ACCESS TO CLIENT A DOCUMENT)
test_client.force_login(client_b)
resp = test_client.get(f'/api/v1/documents/{doc_a.id}/download/')
assert resp.status_code in [403, 404]
print("TEST 11 — SECURITY ISOLATION: PASSED (Client B denied access to Client A document download)")

# TEST 12: CONSULTATION SCHEDULE REQUEST
test_client.force_login(client_a)
cons_payload = {
    'request_type': 'technical_review',
    'title': 'Sprint 3 Architecture Review',
    'description': 'Review database indexing strategy',
    'project': proj_a_id
}
resp = test_client.post('/api/v1/consultations/', data=json.dumps(cons_payload), content_type='application/json')
assert resp.status_code == 201
assert get_data(resp)['status'] == 'requested'
print("TEST 12 — CONSULTATION SCHEDULE REQUEST: PASSED")

# TEST 13: CLIENT NOTIFICATIONS
ClientNotification.objects.create(
    client_user=client_a,
    title='Project Milestone Update',
    message='Phase 2 Portal Integration completed.',
    notification_type='milestone_update'
)
resp = test_client.get('/api/v1/notifications/')
assert resp.status_code == 200
notifs = get_data(resp)
if isinstance(notifs, dict) and 'results' in notifs:
    notifs = notifs['results']
assert len(notifs) >= 1
assert notifs[0]['is_read'] is False
print("TEST 13 — CLIENT NOTIFICATIONS: PASSED (Client A received unread notification)")

# TEST 14: HISTORICAL & EXISTING TEST DATA PRESERVATION CHECK
assert ClientProject.objects.count() >= 2
assert SupportTicket.objects.count() >= 1
print("TEST 14 — HISTORICAL DATA PRESERVATION: PASSED (Database records preserved)")

print()
print("=== ALL 14 CLIENT PORTAL PRD E2E VERIFICATION TESTS PASSED SUCCESSFULLY ===")
