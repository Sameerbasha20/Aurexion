import os
import sys
import django

# Setup Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.cms.models import Industry
from django.utils.text import slugify

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

def seed_industries():
    print(f"Seeding {len(INDUSTRIES)} industries into the database...")
    for index, name in enumerate(INDUSTRIES, 1):
        slug = slugify(name)
        # Avoid duplicate slug conflicts if any
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
            print(f"[CREATED] {index}. {name} (Slug: {slug})")
        else:
            # Update fields if already exists
            industry.name = name
            industry.status = "published"
            industry.save()
            print(f"[UPDATED] {index}. {name} (Slug: {slug})")
            
    print("Successfully finished seeding industries!")

if __name__ == "__main__":
    seed_industries()
