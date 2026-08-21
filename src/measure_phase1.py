#!/usr/bin/env python
"""
Phase 1 Performance Measurement Script.
Measures DB query count, response latency (P50/P95/P99), and error rates.
"""
import os
import sys
import time
import statistics
import uuid
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from django.db import connection
from django.test.utils import CaptureQueriesContext
from apps.administration.models import Role, ModulePermission
from apps.crm.models import Lead, LeadStatus, RFPEnquiry

User = get_user_model()

def measure_endpoint(client, name, method, path, payload=None, runs=10):
    query_counts = []
    latencies = []
    errors = 0

    for i in range(runs):
        start = time.perf_counter()
        with CaptureQueriesContext(connection) as ctx:
            if method == 'GET':
                resp = client.get(path)
            elif method == 'POST':
                resp = client.post(path, data=payload, content_type='application/json')
            elif method == 'PATCH':
                resp = client.patch(path, data=payload, content_type='application/json')
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        
        if resp.status_code >= 400:
            errors += 1
            print(f"    [FAIL] {method} {path} returned status {resp.status_code}: {resp.content[:200]}")
        else:
            latencies.append(elapsed_ms)
            query_counts.append(len(ctx))

    if not latencies:
        return {
            "name": name,
            "queries": 0,
            "p50": 0,
            "p95": 0,
            "p99": 0,
            "avg": 0,
            "errors": errors,
            "error_rate": "100%"
        }

    latencies_sorted = sorted(latencies)
    n = len(latencies_sorted)
    
    def get_percentile(p):
        idx = max(0, min(n - 1, int(n * p)))
        return latencies_sorted[idx]

    avg_queries = statistics.mean(query_counts) if query_counts else 0

    return {
        "name": name,
        "queries": round(avg_queries, 1),
        "p50": round(get_percentile(0.50), 2),
        "p95": round(get_percentile(0.95), 2),
        "p99": round(get_percentile(0.99), 2),
        "avg": round(statistics.mean(latencies), 2),
        "errors": errors,
        "error_rate": f"{(errors/runs)*100:.1f}%"
    }

def run_benchmarks():
    client = Client()
    unique_id = str(uuid.uuid4())[:8]

    # Create test super admin
    admin_user = User.objects.create_superuser(
        username=f'superadmin_{unique_id}',
        email=f'admin_{unique_id}@aurexion.com',
        password='TestPassword123!'
    )
    admin_user.profile.role = 'super_admin'
    admin_user.profile.save()

    # Create test BDM user
    bdm_user = User.objects.create_user(
        username=f'bdm_{unique_id}',
        email=f'bdm_{unique_id}@aurexion.com',
        password='TestPassword123!'
    )
    bdm_user.profile.role = 'bdm'
    bdm_user.profile.save()

    # Setup Role and ModulePermissions for BDM
    role_bdm, _ = Role.objects.get_or_create(code='bdm', defaults={'name': 'BDM'})
    for mod in ['crm', 'administration', 'portal', 'recruitment', 'bdm']:
        ModulePermission.objects.get_or_create(
            role=role_bdm,
            module=mod,
            defaults={'can_read': True, 'can_create': True, 'can_update': True, 'can_delete': True}
        )

    # Create test RFP enquiry and Lead
    rfp = RFPEnquiry.objects.create(
        full_name='Acme Client',
        company_name='Acme Corp',
        work_email='acme@example.com',
        phone='1234567890',
        designation='CTO',
        country='USA',
        project_type='Web Application',
        budget_range='$10k-$50k',
        project_description='Full enterprise cloud migration project'
    )
    from apps.crm.services import generate_reference
    test_lead = Lead.objects.create(
        reference_id=generate_reference(),
        name='Benchmark Lead',
        company='Benchmark Corp',
        email='lead@benchmark.com',
        status=LeadStatus.NEW,
        created_by=admin_user,
        assigned_to=bdm_user,
        rfp_enquiry=rfp
    )

    # Log in as BDM user (to test RBAC queries and non-super-admin flow)
    login_resp = client.post('/api/v1/auth/login/', {
        'username': f'bdm_{unique_id}',
        'password': 'TestPassword123!'
    }, content_type='application/json')
    
    assert login_resp.status_code == 200, f"Login failed: {login_resp.content}"

    print("\n==================================================")
    print("RUNNING BENCHMARKS (BDM User - Authenticated)")
    print("==================================================\n")

    benchmarks = []

    # 1. GET /api/v1/leads/
    b1 = measure_endpoint(client, "GET /api/v1/leads/", "GET", "/api/v1/leads/", runs=10)
    benchmarks.append(b1)

    # 2. GET /api/v1/leads/{id}/
    b2 = measure_endpoint(client, f"GET /api/v1/leads/{test_lead.id}/", "GET", f"/api/v1/leads/{test_lead.id}/", runs=10)
    benchmarks.append(b2)

    # 3. GET /api/v1/bdm/dashboard/ (Uncached / Cold)
    from django.core.cache import cache
    cache.delete("bdm_dashboard_metrics")
    b3_cold = measure_endpoint(client, "GET /api/v1/bdm/dashboard/ (Cold)", "GET", "/api/v1/bdm/dashboard/", runs=1)
    b3_warm = measure_endpoint(client, "GET /api/v1/bdm/dashboard/ (Warm)", "GET", "/api/v1/bdm/dashboard/", runs=10)
    benchmarks.append(b3_cold)
    benchmarks.append(b3_warm)

    # 4. POST /api/v1/leads/
    b4 = measure_endpoint(client, "POST /api/v1/leads/", "POST", "/api/v1/leads/", payload={
        "name": "New Bench Lead",
        "company": "Bench Corp",
        "email": "newbench@example.com"
    }, runs=5)
    benchmarks.append(b4)

    # Now log in as Super Admin for Admin Dashboard and Audit Logs
    client.post('/api/v1/auth/login/', {
        'username': f'superadmin_{unique_id}',
        'password': 'TestPassword123!'
    }, content_type='application/json')

    # 5. GET /api/v1/admin/dashboard/ (Cold & Warm)
    cache.delete("admin_dashboard_metrics")
    b5_cold = measure_endpoint(client, "GET /api/v1/admin/dashboard/ (Cold)", "GET", "/api/v1/admin/dashboard/", runs=1)
    b5_warm = measure_endpoint(client, "GET /api/v1/admin/dashboard/ (Warm)", "GET", "/api/v1/admin/dashboard/", runs=10)
    benchmarks.append(b5_cold)
    benchmarks.append(b5_warm)

    # 6. GET /api/v1/audit-logs/
    b6 = measure_endpoint(client, "GET /api/v1/audit-logs/", "GET", "/api/v1/audit-logs/", runs=10)
    benchmarks.append(b6)

    print("-" * 90)
    print(f"{'Endpoint':<42} | {'Queries':<7} | {'P50 (ms)':<8} | {'P95 (ms)':<8} | {'P99 (ms)':<8} | {'Errors':<6}")
    print("-" * 90)
    for b in benchmarks:
        print(f"{b['name']:<42} | {b['queries']:<7} | {b['p50']:<8.2f} | {b['p95']:<8.2f} | {b['p99']:<8.2f} | {b['error_rate']:<6}")
    print("-" * 90)

    return benchmarks

if __name__ == '__main__':
    run_benchmarks()
