import os
import re
import urllib.request
from pathlib import Path
from PIL import Image

def main():
    repo = Path('.').resolve()
    dest_dir = repo / 'webp_images'
    dest_dir.mkdir(exist_ok=True)

    # 1. Find all image URLs across codebase
    url_pattern = re.compile(r'https://images\.unsplash\.com/[^\s\'\"\`\<\>\)\,\;]+')
    
    found_urls = {}
    
    for p in repo.rglob('*'):
        if any(part in p.parts for part in ['node_modules', '.git', 'dist', 'coverage', '.pytest_cache', '__pycache__', '.system_generated', '.venv', 'venv', 'webp_images']):
            continue
        if p.is_file():
            try:
                content = p.read_text(encoding='utf-8', errors='ignore')
                for match in url_pattern.findall(content):
                    clean_url = match.rstrip(',;"\')')
                    if clean_url not in found_urls:
                        found_urls[clean_url] = []
                    found_urls[clean_url].append(str(p.relative_to(repo)))
            except Exception:
                pass

    print(f'Found {len(found_urls)} unique Unsplash image URLs across codebase.')

    # 2. Download and convert each to WebP
    opener = urllib.request.build_opener()
    opener.addheaders = [('User-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')]
    urllib.request.install_opener(opener)

    downloaded_count = 0
    converted_count = 0

    for idx, (url, ref_files) in enumerate(found_urls.items(), 1):
        photo_match = re.search(r'photo-([a-zA-Z0-9\-]+)', url)
        photo_id = photo_match.group(1) if photo_match else f'unsplash_{idx}'
        
        filename_stem = f'unsplash_{photo_id[:16]}'
        dest_webp = dest_dir / f'{filename_stem}.webp'
        
        if dest_webp.exists():
            print(f'[{idx}/{len(found_urls)}] Already exists: {dest_webp.name}')
            continue
            
        print(f'[{idx}/{len(found_urls)}] Downloading {url}...')
        temp_file = dest_dir / f'temp_{idx}.jpg'
        try:
            urllib.request.urlretrieve(url, temp_file)
            downloaded_count += 1
            
            with Image.open(temp_file) as img:
                img.save(dest_webp, 'WEBP', quality=85, method=6)
            converted_count += 1
            
            if temp_file.exists():
                temp_file.unlink()
            print(f'  -> Saved WebP: {dest_webp.name} ({dest_webp.stat().st_size} bytes, {img.size[0]}x{img.size[1]})')
        except Exception as e:
            print(f'  -> Failed to download/convert {url}: {e}')
            if temp_file.exists():
                temp_file.unlink()

    print(f'\nFinished downloading and converting: {converted_count} new WebP images.')
    print(f'\nTotal files in {dest_dir}:')
    all_files = list(dest_dir.glob('*.webp'))
    print(f'Total WebP files in webp_images/: {len(all_files)}')

if __name__ == '__main__':
    main()
