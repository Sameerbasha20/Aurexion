import os
import sys
import django

# Setup Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.cms.models import Industry, Service
from django.utils.text import slugify

# 18 Industries from the frontend
INDUSTRIES = [
    "Banking",
    "Financial Services (BFSI)",
    "Insurance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "E-commerce",
    "Logistics & Supply Chain",
    "Real Estate",
    "Construction",
    "Hospitality",
    "Travel",
    "Automotive",
    "Telecommunications",
    "Professional Services",
    "Government / Public Sector",
    "Startups",
]

# 33 Services from the frontend categorized by their vertical
SERVICES = [
    # Core Engineering
    "Custom Software Development",
    "Enterprise Application Engineering",
    "Python Microservices",
    "Legacy System Modernization",
    "Microservices Architecture",

    # AI & Data Science
    "Artificial Intelligence Solutions",
    "Machine Learning Engineering",
    "Generative AI Platform Integration",
    "Data Engineering",
    "Data Analytics",
    "Business Intelligence (BI)",

    # Cloud & Infrastructure
    "Cloud Architecture & Modernization",
    "Cloud Migration",
    "DevOps & CI/CD Automation",
    "Cybersecurity & Threat Governance",
    "Managed Infrastructure",

    # Enterprise Products
    "Custom ERP Development",
    "Enterprise CRM Solutions",
    "HRMS Platforms",
    "FinTech Solutions",
    "HealthTech Platforms",
    "EdTech & LMS Solutions",
    "Logistics & Supply Chain Tech",

    # Digital Platforms
    "E-commerce Platforms",
    "Cross-Platform Mobile Applications",
    "REST API Development & Integrations",
    "Robotic Process Automation (RPA)",
    "SaaS Product Engineering",

    # Quality & Advisory
    "Software Testing & QA Automation",
    "UI/UX Engineering",
    "Strategic Technology Consulting",
    "Dedicated Development Team Allocation",
    "Managed Application Maintenance",
]

def seed_industries():
    print(f"Seeding {len(INDUSTRIES)} industries...")
    for index, name in enumerate(INDUSTRIES, 1):
        slug = slugify(name)
        if not slug:
            slug = f"industry-{index}"
            
        industry, created = Industry.objects.get_or_create(
            slug=slug,
            defaults={
                "name": name,
                "challenges": f"Challenges faced in the {name} industry.",
                "target_solutions": f"Solutions designed for the {name} industry.",
                "status": "published"
            }
        )
        if created:
            print(f"[CREATED INDUSTRY] {index}. {name} (Slug: {slug})")
        else:
            industry.name = name
            industry.status = "published"
            industry.save()
            print(f"[UPDATED INDUSTRY] {index}. {name} (Slug: {slug})")

def seed_services():
    print(f"\nSeeding {len(SERVICES)} services...")
    for index, title in enumerate(SERVICES, 1):
        slug = slugify(title)
        if not slug:
            slug = f"service-{index}"
            
        # Set some typical technologies in tech stack depending on name
        tech_stack = ["Python", "JavaScript", "Docker"]
        if "AI" in title or "Machine Learning" in title or "Data" in title:
            tech_stack = ["Python", "TensorFlow", "PyTorch", "Pandas"]
        elif "Cloud" in title or "DevOps" in title or "Infrastructure" in title:
            tech_stack = ["AWS", "Terraform", "Kubernetes", "Docker"]
        elif "Mobile" in title:
            tech_stack = ["React Native", "Flutter", "iOS", "Android"]
        elif "React" in title or "API" in title or "REST" in title:
            tech_stack = ["Node.js", "Django", "FastAPI", "PostgreSQL"]

        service, created = Service.objects.get_or_create(
            slug=slug,
            defaults={
                "title": title,
                "description": f"High-quality {title} service offered by Aurexion Technologies to transform business processes.",
                "problem": f"Identifying bottlenecks and pain points in legacy/inefficient setups relating to {title}.",
                "solution": f"Deploying modern, scalable, and robust modules tailored for {title}.",
                "tech_stack": tech_stack,
                "is_featured": index <= 6,  # Feature first 6 services
                "status": "published"
            }
        )
        if created:
            print(f"[CREATED SERVICE] {index}. {title} (Slug: {slug})")
        else:
            service.title = title
            service.tech_stack = tech_stack
            service.status = "published"
            service.save()
            print(f"[UPDATED SERVICE] {index}. {title} (Slug: {slug})")

def main():
    seed_industries()
    seed_services()
    print("\nAll seeding operations completed successfully!")

if __name__ == "__main__":
    main()
