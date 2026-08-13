"""
Aurexion Support Module — PHASE 6 PERFORMANCE BENCHMARK

Runs against the REAL configured PostgreSQL backend (config.settings -> .env).
No mocks, no SQLite. Measures actual wall-clock response time for the four
Support REST endpoints and separates application time from database time.

Endpoints measured:
  1. POST   /api/v1/tickets/
  2. GET    /api/v1/tickets/
  3. GET    /api/v1/tickets/{id}/
  4. PATCH  /api/v1/tickets/{id}/

Also inspects:
  - DB query count per request
  - N+1 behaviour on the list endpoint (query count vs ticket count)
  - select_related usage (constant query count = no N+1)
  - model indexes

Run:
    python tests/support_performance_test.py
"""
import os
import sys
import time
import statistics
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.portal.models import SupportTicket

if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

User = get_user_model()

ITERATIONS = 50
TARGET_MS = 500.0

results = {}


def percentile(data, p):
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * p
    f = int(k)
    c = int(k) + 1 if f + 1 < len(sorted_data) else f
    return sorted_data[f] + (sorted_data[c] - sorted_data[f]) * (k - f)


def db_time_taken(start_idx):
    queries = connection.queries[start_idx:]
    total = 0.0
    for q in queries:
        try:
            total += float(q.get('time', 0))
        except (TypeError, ValueError):
            pass
    return total


def measure(label, func, needs_tickets=None):
    latencies = []
    db_times = []
    query_counts = []
    statuses = set()
    for i in range(ITERATIONS):
        del connection.queries[:]
        t0 = time.perf_counter()
        resp, payload = func(i)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0)
        db_times.append(db_time_taken(0) * 1000.0)
        query_counts.append(len(connection.queries))
        statuses.add(getattr(resp, 'status_code', None))
    del connection.queries[:]
    avg = statistics.mean(latencies)
    results[label] = {
        'avg': avg,
        'min': min(latencies),
        'max': max(latencies),
        'p50': percentile(latencies, 0.50),
        'p95': percentile(latencies, 0.95),
        'p99': percentile(latencies, 0.99),
        'db_avg': statistics.mean(db_times),
        'app_avg': avg - statistics.mean(db_times),
        'q_avg': statistics.mean(query_counts),
        'q_max': max(query_counts),
        'n': len(latencies),
        'statuses': sorted(str(s) for s in statuses if s),
        'pass': avg < TARGET_MS,
    }
    print(
        f"  {label}: avg={avg:7.2f}ms  min={min(latencies):7.2f}  max={max(latencies):7.2f}  "
        f"p50={percentile(latencies, 0.50):7.2f}  p95={percentile(latencies, 0.95):7.2f}  "
        f"p99={percentile(latencies, 0.99):7.2f}  db={statistics.mean(db_times):6.2f}ms  "
        f"q={statistics.mean(query_counts):.1f}  -> {'PASS' if avg < TARGET_MS else 'FAIL'}"
    )
    return payload


def main():
    print(f"Backend: {connection.vendor} {connection.get_connection_params().get('host')}")
    print(f"Target: < {TARGET_MS} ms average response time")
    settings.DEBUG = True  # enable connection.queries
    connection.force_debug_cursor = True
    del connection.queries[:]

    client = APIClient()

    # ---------------------------------------------------------------
    # Setup real users + login (real JWT flow, default password hasher)
    # ---------------------------------------------------------------
    print("Setting up benchmark users...")
    SupportTicket.objects.filter(subject__startswith='[PERF6]').delete()
    User.objects.filter(username__startswith='perf6_').delete()

    client_user = User.objects.create_user(
        username='perf6_client', password='PerfP@ssword10', email='perf6_client@test.com'
    )
    client_user.profile.role = 'client_user'
    client_user.profile.save()

    support_user = User.objects.create_user(
        username='perf6_support', password='PerfP@ssword10', email='perf6_support@test.com'
    )
    support_user.profile.role = 'support_executive'
    support_user.profile.save()

    login_resp = client.post('/api/v1/auth/login/',
                             {'username': 'perf6_client', 'password': 'PerfP@ssword10'})
    if login_resp.status_code != 200:
        print("LOGIN FAILED", login_resp.status_code,
              getattr(login_resp, 'data', None) or login_resp.content[:200])
        sys.exit(1)
    access = login_resp.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

    list_url = '/api/v1/tickets/'

    # ---------------------------------------------------------------
    # Warm-up
    # ---------------------------------------------------------------
    print("Warming up (establish connections, cache)...")
    client.get(list_url)
    client.get(list_url)

    # ---------------------------------------------------------------
    # Query breakdown diagnostic for one POST (identify bottleneck)
    # ---------------------------------------------------------------
    del connection.queries[:]
    t0 = time.perf_counter()
    client.post(list_url, {'subject': '[PERF6] diagnostic', 'category': 'bug', 'priority': 'high'})
    wall = (time.perf_counter() - t0) * 1000.0
    print(f"Diagnostic POST wall time: {wall:.2f} ms; query log:")
    for q in connection.queries:
        print(f"  {float(q['time']) * 1000.0:8.2f} ms | {q['sql'][:110]}")
    SupportTicket.objects.filter(subject='[PERF6] diagnostic').delete()

    # ---------------------------------------------------------------
    # N+1 inspection: query count must be constant vs ticket count
    # ---------------------------------------------------------------
    print("N+1 inspection on GET list...")
    counts = {}
    for k in (1, 5, 15):
        SupportTicket.objects.filter(subject__startswith='[PERF6]').delete()
        for _ in range(k):
            SupportTicket.objects.create(
                client_user=client_user, subject=f'[PERF6] N+1 seed', category='bug', priority='medium'
            )
        with CaptureQueriesContext(connection) as ctx:
            client.get(list_url)
        counts[k] = len(ctx)
    print(f"  query count by ticket count {counts} -> "
          f"{'NO N+1 (constant)' if len(set(counts.values())) == 1 else 'N+1 PATTERN DETECTED'}")
    SupportTicket.objects.filter(subject__startswith='[PERF6]').delete()

    # A fixed ticket used by detail / patch / get-targets
    fixed = SupportTicket.objects.create(
        client_user=client_user,
        assigned_to=support_user,
        subject='[PERF6] fixed ticket',
        category='bug',
        priority='high',
    )

    # ---------------------------------------------------------------
    # 1. POST create ticket (each iteration creates one; cleaned later)
    # ---------------------------------------------------------------
    print(f"Benchmarking POST /api/v1/tickets/ ({ITERATIONS} iterations)...")

    def do_post(i):
        resp = client.post(list_url, {
            'subject': f'[PERF6] perf ticket {i}',
            'category': 'bug',
            'priority': 'high',
        })
        return resp, resp.data

    measure('POST /api/v1/tickets/', do_post)

    # ---------------------------------------------------------------
    # 2. GET list tickets
    # ---------------------------------------------------------------
    print(f"Benchmarking GET /api/v1/tickets/ ({ITERATIONS} iterations)...")
    measure('GET /api/v1/tickets/', lambda i: (client.get(list_url), None))

    # ---------------------------------------------------------------
    # 3. GET detail
    # ---------------------------------------------------------------
    detail_url = f'{list_url}{fixed.id}/'
    print(f"Benchmarking GET /api/v1/tickets/{{id}}/ ({ITERATIONS} iterations)...")
    measure('GET /api/v1/tickets/{id}/', lambda i: (client.get(detail_url), None))

    # ---------------------------------------------------------------
    # 4. PATCH update
    # ---------------------------------------------------------------
    print(f"Benchmarking PATCH /api/v1/tickets/{{id}}/ ({ITERATIONS} iterations)...")
    counter = {'i': 0}

    def do_patch(i):
        target_id = fixed.id if i == 0 else fixed.id
        resp = client.patch(f'{list_url}{target_id}/', {'priority': 'critical'})
        return resp, resp.data

    measure('PATCH /api/v1/tickets/{id}/', do_patch)

    # ---------------------------------------------------------------
    # Indexes
    # ---------------------------------------------------------------
    print("Model indexes:")
    for idx in SupportTicket._meta.indexes:
        print(f"  {idx.name}: fields={list(idx.fields)}")
    for field in ('ticket_id', 'created_at', 'client_user', 'assigned_to'):
        f = SupportTicket._meta.get_field(field)
        if f.db_index or f.unique:
            print(f"  field index: {field} (db_index={f.db_index}, unique={f.unique})")

    # ---------------------------------------------------------------
    # Summary + report
    # ---------------------------------------------------------------
    print()
    print("=" * 80)
    print(f"{'ENDPOINT':<32}{'AVG':>9}{'MIN':>9}{'MAX':>9}{'P50':>9}{'P95':>9}{'P99':>9}{'DB':>9}  VERDICT")
    print("=" * 80)
    lines = []
    for label, r in results.items():
        verdict = 'PASS' if r['pass'] else 'FAIL'
        print(f"{label:<32}{r['avg']:>9.2f}{r['min']:>9.2f}{r['max']:>9.2f}{r['p50']:>9.2f}{r['p95']:>9.2f}{r['p99']:>9.2f}{r['db_avg']:>9.2f}  {verdict}")
        lines.append((label, r, verdict))
    print("=" * 80)
    all_pass = all(r['pass'] for _, r, _ in lines)

    report_path = Path(__file__).resolve().parent / 'support_performance_report.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Support Module Performance Report\n\n")
        f.write(f"- **Date:** {time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
        f.write(f"- **Backend:** PostgreSQL ({connection.vendor})\n")
        f.write(f"- **Target:** average response < 500 ms\n")
        f.write(f"- **Iterations:** {ITERATIONS} per endpoint\n")
        f.write(f"- **N+1 check:** {counts}\n\n")
        f.write("| Endpoint | Avg | Min | Max | P50 | P95 | P99 | DB time avg | Query avg | Result |\n")
        f.write("|---|---|---|---|---|---|---|---|---|---|\n")
        for label, r, verdict in lines:
            f.write(f"| {label} | {r['avg']:.2f} ms | {r['min']:.2f} ms | {r['max']:.2f} ms | "
                    f"{r['p50']:.2f} ms | {r['p95']:.2f} ms | {r['p99']:.2f} ms | "
                    f"{r['db_avg']:.2f} ms | {r['q_avg']:.1f} | **{verdict}** |\n")
        f.write(f"\n**Overall: {'PASS' if all_pass else 'FAIL'}**\n")

    print(f"Report saved to {report_path}")

    # ---------------------------------------------------------------
    # Cleanup
    # ---------------------------------------------------------------
    print("Cleaning up benchmark data...")
    SupportTicket.objects.filter(subject__startswith='[PERF6]').delete()
    User.objects.filter(username__startswith='perf6_').delete()
    print("Done.")
    sys.exit(0 if all_pass else 1)


if __name__ == '__main__':
    main()
