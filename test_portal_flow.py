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

print("=== SUPPORT TICKET PRD E2E VERIFICATION SUITE ===")

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
for username in ['e2e_client_a', 'e2e_client_b', 'e2e_support_exec']:
    existing_user = User.objects.filter(username=username).first()
    if existing_user:
        SupportTicket.objects.filter(client_user=existing_user).delete()
        SupportTicket.objects.filter(assigned_to=existing_user).delete()
        ClientDocument.objects.filter(client_user=existing_user).delete()
        ConsultationRequest.objects.filter(client_user=existing_user).delete()
        ClientNotification.objects.filter(client_user=existing_user).delete()
        ClientProject.objects.filter(client_user=existing_user).delete()
        existing_user.delete()

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

# TEST 1: CLIENT CREATES TICKET
test_client.force_login(client_a)
ticket_payload = {
    'subject': 'Test Support Issue',
    'category': 'bug',
    'priority': 'high'
}
resp = test_client.post('/api/v1/support/my-tickets/', data=json.dumps(ticket_payload), content_type='application/json')
assert resp.status_code == 201
created = get_data(resp)
ticket_pk = created['id']
ticket_id = created['ticket_id']
assert ticket_id.startswith('TKT-')
assert created['subject'] == 'Test Support Issue'
assert created['category'] == 'bug'
assert created['priority'] == 'high'
assert created['status'] == 'open'
assert created['client_user'] == 'e2e_client_a'
print(f"TEST 1 — CLIENT CREATES TICKET: PASSED (Generated ID: {ticket_id}, status: open)")

# TEST 2: SUPPORT DASHBOARD STATS
test_client.force_login(support_exec)
resp = test_client.get('/api/v1/support/tickets/stats/')
assert resp.status_code == 200
stats1 = get_data(resp)
assert stats1['openAssigned'] >= 1
print(f"TEST 2 — SUPPORT DASHBOARD STATS: PASSED (Stats API returned DB counts: {stats1})")

# TEST 3: ASSIGN TICKET
assign_payload = {'assigned_to': support_exec.id, 'status': 'assigned'}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(assign_payload), content_type='application/json')
assert resp.status_code == 200
assigned_ticket = get_data(resp)
assert assigned_ticket['assigned_to_id'] == support_exec.id
assert assigned_ticket['status'] == 'assigned'

resp_stats2 = test_client.get('/api/v1/support/tickets/stats/')
stats2 = get_data(resp_stats2)
assert stats2['totalAssigned'] >= 1
print("TEST 3 — ASSIGN TICKET: PASSED (Ticket assigned to executive, status: assigned, totalAssigned stats updated)")

# TEST 4: IN PROGRESS
prog_payload = {'status': 'in_progress'}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(prog_payload), content_type='application/json')
assert resp.status_code == 200
assert get_data(resp)['status'] == 'in_progress'

resp_stats3 = test_client.get('/api/v1/support/tickets/stats/')
stats3 = get_data(resp_stats3)
assert stats3['inProgress'] >= 1
print("TEST 4 — IN PROGRESS: PASSED (Status changed to in_progress, inProgress stats updated)")

# TEST 5: PRIORITY UPDATE TO CRITICAL
prio_payload = {'priority': 'critical'}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(prio_payload), content_type='application/json')
assert resp.status_code == 200
assert get_data(resp)['priority'] == 'critical'

resp_stats4 = test_client.get('/api/v1/support/tickets/stats/')
stats4 = get_data(resp_stats4)
assert stats4['criticalPriority'] >= 1
print("TEST 5 — PRIORITY UPDATE TO CRITICAL: PASSED (Priority changed to critical, criticalPriority stats updated)")

# TEST 6: AWAITING CLIENT
awaiting_payload = {'status': 'awaiting_client'}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(awaiting_payload), content_type='application/json')
assert resp.status_code == 200
assert get_data(resp)['status'] == 'awaiting_client'

resp_stats5 = test_client.get('/api/v1/support/tickets/stats/')
stats5 = get_data(resp_stats5)
assert stats5['awaitingClient'] >= 1
print("TEST 6 — AWAITING CLIENT: PASSED (Status changed to awaiting_client, awaitingClient stats updated)")

# TEST 7: RESOLVED
resolved_payload = {'status': 'resolved'}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(resolved_payload), content_type='application/json')
assert resp.status_code == 200
assert get_data(resp)['status'] == 'resolved'
print("TEST 7 — RESOLVED: PASSED (Status changed to resolved)")

# TEST 8: CLOSED WITHOUT NOTES (MUST FAIL)
close_bad_payload = {'status': 'closed', 'resolution_notes': ''}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(close_bad_payload), content_type='application/json')
assert resp.status_code == 400
assert 'resolution_notes' in resp.json() or 'resolution_notes' in str(resp.content)
print("TEST 8 — CLOSED WITHOUT NOTES: PASSED (Backend rejected close request with HTTP 400 Bad Request)")

# TEST 9: CLOSED WITH NOTES (MUST SUCCEED)
close_good_payload = {
    'status': 'closed',
    'resolution_notes': 'Root cause analyzed: memory pool leak. Patched garbage collection policy and verified fix.'
}
resp = test_client.patch(f'/api/v1/support/tickets/{ticket_pk}/', data=json.dumps(close_good_payload), content_type='application/json')
assert resp.status_code == 200
closed_res = get_data(resp)
assert closed_res['status'] == 'closed'
assert closed_res['resolution_notes'] == 'Root cause analyzed: memory pool leak. Patched garbage collection policy and verified fix.'
assert closed_res['closed_at'] is not None
print("TEST 9 — CLOSED WITH NOTES: PASSED (Ticket closed with technical resolution notes, closed_at set)")

# TEST 10: DATA PERSISTENCE
test_client.force_login(client_a)
resp = test_client.get(f'/api/v1/support/my-tickets/{ticket_pk}/')
assert resp.status_code == 200
persisted = get_data(resp)
assert persisted['status'] == 'closed'
assert persisted['resolution_notes'] == 'Root cause analyzed: memory pool leak. Patched garbage collection policy and verified fix.'
print("TEST 10 — DATA PERSISTENCE: PASSED (All ticket fields and resolution notes remain persisted)")

print()
print("=== ALL SUPPORT TICKET PRD E2E VERIFICATION TESTS PASSED SUCCESSFULLY ===")
