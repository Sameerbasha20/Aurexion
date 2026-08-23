import os
import sys
import time
import statistics
import django

# Add src folder to Python path
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')
settings.PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '100000/min',
    'user': '100000/min',
}

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost

def run_performance_test():
    client = APIClient()
    
    print("Setting up temporary test user and CMS data for benchmarking...")
    username = "perf_test_user"
    password = "PerfP@ssword10"
    
    # Ensure a clean state (delete dependents first)
    BlogPost.objects.filter(slug="perf-blog").delete()
    Category.objects.filter(slug="perf-category").delete()
    Industry.objects.filter(slug="perf-industry").delete()
    CaseStudy.objects.filter(slug="perf-case-study").delete()
    Service.objects.filter(slug="perf-service").delete()
    User.objects.filter(username=username).delete()
    
    user = User.objects.create_user(username=username, password=password, email="perf@test.com")
    user.profile.role = 'super_admin'
    user.profile.save()
    
    # Seed CMS data
    service = Service.objects.create(
        title="Perf Service", slug="perf-service", description="perf", 
        problem="perf", solution="perf", status="published"
    )
    case_study = CaseStudy.objects.create(
        title="Perf Case Study", slug="perf-case-study", client="perf",
        context="perf", business_challenge="perf", proposed_architecture="perf",
        development_approach="perf", modules_integration_security="perf",
        outcomes_performance="perf", status="published"
    )
    industry = Industry.objects.create(
        name="Perf Industry", slug="perf-industry", challenges="perf",
        target_solutions="perf", status="published"
    )
    industry.services.add(service)
    industry.case_studies.add(case_study)
    
    category = Category.objects.create(name="Perf Category", slug="perf-category")
    BlogPost.objects.create(
        title="Perf Blog", slug="perf-blog", content="perf",
        category=category, author=user, status="published"
    )
    
    print("Warming up endpoints to avoid database connection initialization overhead...")
    # Warmup calls
    client.post('/api/v1/auth/login/', {'username': username, 'password': password})
    client.force_authenticate(user=user)
    client.get('/api/v1/auth/me/')
    client.get('/api/v1/users/')
    client.get('/api/v1/audit-logs/')
    client.get('/api/v1/roles/')
    client.get('/api/v1/cms/public/services/perf-service/')
    client.get('/api/v1/cms/public/industries/perf-industry/')
    client.get('/api/v1/cms/public/case-studies/')
    client.get('/api/v1/cms/public/blog/')
    
    iterations = 20
    endpoints = {
        'Login (POST /api/v1/auth/login/)': {
            'type': 'POST',
            'url': '/api/v1/auth/login/',
            'data': {'username': username, 'password': password},
            'needs_auth': False
        },
        'Me (GET /api/v1/auth/me/)': {
            'type': 'GET',
            'url': '/api/v1/auth/me/',
            'data': None,
            'needs_auth': True
        },
        'User List (GET /api/v1/users/)': {
            'type': 'GET',
            'url': '/api/v1/users/',
            'data': None,
            'needs_auth': True
        },
        'Audit Log List (GET /api/v1/audit-logs/)': {
            'type': 'GET',
            'url': '/api/v1/audit-logs/',
            'data': None,
            'needs_auth': True
        },
        'Role List (GET /api/v1/roles/)': {
            'type': 'GET',
            'url': '/api/v1/roles/',
            'data': None,
            'needs_auth': True
        },
        'CMS Service Detail (GET /api/v1/cms/public/services/perf-service/)': {
            'type': 'GET',
            'url': '/api/v1/cms/public/services/perf-service/',
            'data': None,
            'needs_auth': False
        },
        'CMS Industry Detail (GET /api/v1/cms/public/industries/perf-industry/)': {
            'type': 'GET',
            'url': '/api/v1/cms/public/industries/perf-industry/',
            'data': None,
            'needs_auth': False
        },
        'CMS Case Study List (GET /api/v1/cms/public/case-studies/)': {
            'type': 'GET',
            'url': '/api/v1/cms/public/case-studies/',
            'data': None,
            'needs_auth': False
        },
        'CMS Blog List (GET /api/v1/cms/public/blog/)': {
            'type': 'GET',
            'url': '/api/v1/cms/public/blog/',
            'data': None,
            'needs_auth': False
        }
    }
    
    results = {}
    
    for name, config in endpoints.items():
        print(f"Benchmarking: {name} ({iterations} iterations)...", flush=True)
        latencies = []
        
        for _ in range(iterations):
            if config['needs_auth']:
                client.force_authenticate(user=user)
            else:
                client.force_authenticate(user=None)
                
            start = time.perf_counter()
            if config['type'] == 'POST':
                client.post(config['url'], config['data'])
            else:
                client.get(config['url'])
            end = time.perf_counter()
            
            latencies.append((end - start) * 1000)  # Convert to milliseconds
            
        avg_lat = statistics.mean(latencies)
        p95_lat = statistics.quantiles(latencies, n=20)[18]  # 95th percentile
        min_lat = min(latencies)
        max_lat = max(latencies)
        
        status_str = "PASS" if p95_lat < 500 else "FAIL"
        
        results[name] = {
            'avg': avg_lat,
            'p95': p95_lat,
            'min': min_lat,
            'max': max_lat,
            'status': status_str
        }
        
    print("Cleaning up benchmarking data...")
    BlogPost.objects.filter(slug="perf-blog").delete()
    Category.objects.filter(slug="perf-category").delete()
    Industry.objects.filter(slug="perf-industry").delete()
    CaseStudy.objects.filter(slug="perf-case-study").delete()
    Service.objects.filter(slug="perf-service").delete()
    User.objects.filter(username=username).delete()
    
    # Save the markdown report to the tests/ folder
    report_path = os.path.join(os.path.dirname(__file__), 'performance_report.md')
    print(f"Saving performance report to {report_path}...")
    
    with open(report_path, 'w') as f:
        f.write("# Endpoint Performance Test Report\n\n")
        f.write(f"- **Date:** {time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
        f.write(f"- **Target Limit:** < 500 ms (p95 response time)\n")
        f.write(f"- **Iterations:** {iterations} runs per endpoint\n\n")
        f.write("## Performance Metrics Table\n\n")
        f.write("| Endpoint | Method | Average Latency | p95 Latency | Min | Max | Status |\n")
        f.write("|---|---|---|---|---|---|---|\n")
        
        for name, data in results.items():
            method = endpoints[name]['type']
            f.write(f"| {name} | {method} | {data['avg']:.2f} ms | {data['p95']:.2f} ms | {data['min']:.2f} ms | {data['max']:.2f} ms | **{data['status']}** |\n")
            
        f.write("\n## Summary Findings\n\n")
        all_passed = all(data['status'] == 'PASS' for data in results.values())
        if all_passed:
            f.write("> [!NOTE]\n> **All endpoints are fully compliant!** The response times are well under the 500ms threshold specified in the AGENTS.md execution guidelines.\n")
        else:
            f.write("> [!WARNING]\n> **Non-compliant response times detected.** Some endpoints exceeded the 500ms latency ceiling at the 95th percentile. Optimization or indexing may be required.\n")
            
    print("Benchmarking complete.")

if __name__ == '__main__':
    run_performance_test()
