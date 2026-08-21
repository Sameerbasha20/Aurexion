import re
from pathlib import Path

def extract_slugs(file_path):
    text = Path(file_path).read_text(encoding='utf-8', errors='ignore')
    slugs = []
    for line in text.splitlines():
        if 'slug:' in line or '"slug":' in line or "'slug':" in line:
            m = re.search(r'slug["\']?\s*:\s*["\']([^"\']+)["\']', line)
            if m:
                slugs.append(m.group(1))
    return list(dict.fromkeys(slugs))

services_slugs = extract_slugs('frontend/src/data/services.ts')
industries_slugs = extract_slugs('frontend/src/data/industries.js')
case_studies_slugs = extract_slugs('frontend/src/data/caseStudies.js')
blog_slugs = extract_slugs('frontend/src/data/blogPosts.js')

static_routes = [
    ('/', '1.0', 'weekly'),
    ('/about', '0.8', 'monthly'),
    ('/why-us', '0.8', 'monthly'),
    ('/services', '0.9', 'weekly'),
    ('/industries', '0.9', 'weekly'),
    ('/case-studies', '0.9', 'weekly'),
    ('/careers', '0.8', 'weekly'),
    ('/blogengine', '0.9', 'daily'),
    ('/contact', '0.7', 'monthly'),
    ('/request-quote', '0.7', 'monthly'),
    ('/rfp', '0.7', 'monthly'),
    ('/estimator', '0.7', 'monthly'),
    ('/privacy-policy', '0.3', 'yearly'),
    ('/terms', '0.3', 'yearly'),
    ('/cookie-policy', '0.3', 'yearly'),
    ('/security', '0.5', 'monthly'),
]

xml_entries = []

# Base static pages
for route, priority, changefreq in static_routes:
    xml_entries.append(f"""  <url>
    <loc>https://aurexion.com{route}</loc>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

# Services detail pages
for slug in services_slugs:
    xml_entries.append(f"""  <url>
    <loc>https://aurexion.com/services/{slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")

# Industries detail pages
for slug in industries_slugs:
    xml_entries.append(f"""  <url>
    <loc>https://aurexion.com/industries/{slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")

# Case Studies detail pages
for slug in case_studies_slugs:
    xml_entries.append(f"""  <url>
    <loc>https://aurexion.com/case-studies/{slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")

# Blog / Insights detail pages
for slug in blog_slugs:
    xml_entries.append(f"""  <url>
    <loc>https://aurexion.com/blogengine/{slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")

sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(xml_entries)}
</urlset>
"""

dest = Path('frontend/public/sitemap.xml')
dest.write_text(sitemap_content, encoding='utf-8')
print(f"Generated {dest} with {len(xml_entries)} URLs.")
