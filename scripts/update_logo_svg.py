import base64
from pathlib import Path

mark_png = Path('frontend/public/images/aurexion-mark.png').read_bytes()
b64_mark = base64.b64encode(mark_png).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,{b64_mark}" x="0" y="0" width="512" height="512" />
</svg>
'''
Path('frontend/public/logo.svg').write_text(svg_content, encoding='utf-8')
print('Updated logo.svg with high-resolution new logo!')
