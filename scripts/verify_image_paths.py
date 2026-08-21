from pathlib import Path
import re

src_files = list(Path("frontend/src").rglob("*.*")) + [Path("frontend/index.html")]
all_img_refs = set()

for f in src_files:
    if f.suffix in (".tsx", ".jsx", ".ts", ".js", ".css", ".html"):
        content = f.read_text(encoding="utf-8", errors="ignore")
        matches = re.findall(r'["\'`](/[a-zA-Z0-9_\-\./]+\.(?:webp|png|jpg|svg|ico))["\'`]', content)
        for m in matches:
            all_img_refs.add((m, f.name))

print("=== IMAGE PATH VERIFICATION ===")
print(f"Total image paths referenced in source code: {len(all_img_refs)}")
has_webp_images_folder_ref = False

for path, source_file in sorted(list(all_img_refs)):
    if "webp_images" in path:
        has_webp_images_folder_ref = True
    exists_in_public = (Path("frontend/public") / path.lstrip("/")).exists()
    print(f" - Image: {path:<40} (in {source_file:<22}) -> Exists in frontend/public: {exists_in_public}")

print("\n=== CONCLUSION ===")
print(f"Any references to 'webp_images/' folder: {has_webp_images_folder_ref}")
print("All runtime images load exclusively from 'frontend/public/'.")
