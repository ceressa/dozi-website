#!/usr/bin/env python3
"""
Extract CSS and JavaScript from index.html to separate files
"""

import re

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract CSS (between <style> and </style>)
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if css_match:
    css_content = css_match.group(1).strip()
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    print("✅ CSS extracted to css/styles.css")
else:
    print("❌ No CSS found")

# Extract JavaScript (between <script> and </script> at the end)
js_match = re.search(r'<script>(.*?)</script>\s*</body>', content, re.DOTALL)
if js_match:
    js_content = js_match.group(1).strip()
    with open('js/scripts.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("✅ JavaScript extracted to js/scripts.js")
else:
    print("❌ No JavaScript found")

# Replace inline CSS with link
content_no_css = re.sub(
    r'<style>.*?</style>',
    '<link rel="stylesheet" href="css/styles.css">',
    content,
    flags=re.DOTALL
)

# Replace inline JS with script tag
content_final = re.sub(
    r'<script>(.*?)</script>\s*</body>',
    '<script src="js/scripts.js"></script>\n</body>',
    content_no_css,
    flags=re.DOTALL
)

# Write cleaned index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content_final)

print("✅ index.html cleaned and updated")
print("\n🎉 Refactoring complete!")
print("   - CSS moved to: css/styles.css")
print("   - JS moved to: js/scripts.js")
print("   - index.html updated with external links")
