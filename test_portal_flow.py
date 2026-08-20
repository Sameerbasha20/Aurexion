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

print("=== PORTAL & SUPPORT E2E VERIFICATION TEST ===")

from apps.portal.models import ClientProject, ClientDocument, SupportTicket

# Clean up test data if existing
SupportTicket.objects.all().delete()
ClientDocument.objects.all().delete()
ClientProject.objects.all().delete()
for username in ['test_client_a', 'test_client_b', 'test_support_exec']:
    User.objects.filter(username=username).delete()

client_a = User.objects.create_user(username='test_client_a', email='client_a@test.com', password='Password123!')
client_a.profile.role = 'client_user'
client_a.profile.save()

client_b = User.objects.create_user(username='test_client_b', email='client_b@test.com', password='Password123!')
client_b.profile.role = 'client_user'
client_b.profile.save()

support_exec = User.objects.create_user(username='test_support_exec', email='support@test.com', password='Password123!')
support_exec.profile.role = 'support_executive'
support_exec.profile.save()

from apps.portal.models import ClientProject, ClientDocument, SupportTicket

# Create Projects for Client A and Client B
proj_a = ClientProject.objects.create(
    client_user=client_a,
    title='Client A Enterprise Portal',
    description='Full stack web development',
    status='in_progress',
    progress_percentage=65
)

proj_b = ClientProject.objects.create(
    client_user=client_b,
    title='Client B E-commerce Site',
    description='Online store development',
    status='planning',
    progress_percentage=20
)

# Create Documents for Client A and Client B
doc_a = ClientDocument.objects.create(
    client_user=client_a,
    project=proj_a,
    title='Client A Contract.pdf',
    document_type='contract',
    file_url='https://example.com/contract_a.pdf',
    file_size='2.4 MB'
)

doc_b = ClientDocument.objects.create(
    client_user=client_b,
    project=proj_b,
    title='Client B Scope.pdf',
    document_type='specification',
    file_url='https://example.com/scope_b.pdf',
    file_size='1.1 MB'
)

test_client = Client()

# Helper to unpack DRF standard JSON response
def get_data(response):
    payload = response.json()
    if isinstance(payload, dict) and 'data' in payload:
        return payload['data']
    return payload

# TEST 1: Client A Projects
test_client.force_login(client_a)
resp = test_client.get('/api/v1/projects/')
assert resp.status_code == 200
projects_a = get_data(resp)
if isinstance(projects_a, dict) and 'results' in projects_a:
    projects_a = projects_a['results']
assert len(projects_a) == 1
assert projects_a[0]['title'] == 'Client A Enterprise Portal'
print("1. Client Projects API: PASSED (Client A sees only own 1 project)")

# TEST 2: Client A Documents
resp = test_client.get('/api/v1/documents/')
assert resp.status_code == 200
docs_a = get_data(resp)
if isinstance(docs_a, dict) and 'results' in docs_a:
    docs_a = docs_a['results']
assert len(docs_a) == 1
assert docs_a[0]['title'] == 'Client A Contract.pdf'
print("2. Client Documents API: PASSED (Client A sees only own 1 document)")

# TEST 3: Client A creates support ticket
ticket_payload = {
    'subject': 'Database Connection Latency Issue',
    'category': 'infrastructure',
    'priority': 'critical'
}
resp = test_client.post('/api/v1/support/my-tickets/', data=json.dumps(ticket_payload), content_type='application/json')
assert resp.status_code == 201
created_ticket = get_data(resp)
ticket_id = created_ticket['ticket_id']
pk_id = created_ticket['id']
assert created_ticket['subject'] == 'Database Connection Latency Issue'
assert created_ticket['status'] == 'open'
assert created_ticket['created_at'] is not None
print(f"3. Ticket Creation: PASSED (Generated ID: {ticket_id}, created_at timestamp persisted)")

# TEST 4: Client B isolation (cannot see Client A's ticket/project/doc)
test_client.force_login(client_b)
resp = test_client.get('/api/v1/support/my-tickets/')
tickets_b = get_data(resp)
if isinstance(tickets_b, dict) and 'results' in tickets_b:
    tickets_b = tickets_b['results']
assert len(tickets_b) == 0
print("4. Client Data Isolation: PASSED (Client B cannot see Client A's ticket)")

# TEST 5: Support Executive Queue & Assignment Workflow
test_client.force_login(support_exec)
resp = test_client.get('/api/v1/support/tickets/')
assert resp.status_code == 200
exec_tickets = get_data(resp)
if isinstance(exec_tickets, dict) and 'results' in exec_tickets:
    exec_tickets = exec_tickets['results']
assert len(exec_tickets) >= 1
target_tkt = next(t for t in exec_tickets if t['ticket_id'] == ticket_id)
assert target_tkt['status'] == 'open'
print("5. Support Executive Queue: PASSED (Executive sees unassigned ticket in queue)")

# Assign ticket to support executive and update status to in_progress
update_payload = {
    'assigned_to': support_exec.id,
    'status': 'in_progress'
}
resp = test_client.patch(f'/api/v1/support/tickets/{pk_id}/', data=json.dumps(update_payload), content_type='application/json')
assert resp.status_code == 200
updated_ticket = get_data(resp)
assert updated_ticket['status'] == 'in_progress'
assert updated_ticket['assigned_to_id'] == support_exec.id
print("6. Ticket Assignment & Status Update: PASSED (Assigned to executive, status updated to in_progress)")

# Close ticket with resolution notes
close_payload = {
    'status': 'closed',
    'resolution_notes': 'Optimized database connection pooling and indexed latency query.'
}
resp = test_client.patch(f'/api/v1/support/tickets/{pk_id}/', data=json.dumps(close_payload), content_type='application/json')
assert resp.status_code == 200
closed_ticket = get_data(resp)
assert closed_ticket['status'] == 'closed'
assert closed_ticket['resolution_notes'] == 'Optimized database connection pooling and indexed latency query.'
print("7. Ticket Resolution & Closure: PASSED (Status closed with resolution notes)")

# Client A verifies updated closed status and resolution notes
test_client.force_login(client_a)
resp = test_client.get(f'/api/v1/support/my-tickets/{pk_id}/')
assert resp.status_code == 200
client_view = get_data(resp)
assert client_view['status'] == 'closed'
assert client_view['resolution_notes'] == 'Optimized database connection pooling and indexed latency query.'
print("8. Client Verification: PASSED (Client A sees closed status and resolution notes)")

print()
print("=== ALL PORTAL & SUPPORT VERIFICATION TESTS PASSED SUCCESSFULLY ===")
