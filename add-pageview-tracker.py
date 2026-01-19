#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tüm HTML sayfalarına pageview tracker ekle
"""

import re
import glob

def add_tracker_to_file(filepath):
    """Bir dosyaya pageview tracker ekle"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Zaten eklenmişse atla
    if 'pageview-tracker.js' in content:
        print(f"⏭️  Already has tracker: {filepath}")
        return False
    
    # Google Analytics script'inden sonra ekle
    pattern = r"(gtag\('config', 'AW-17862936779'\);\s*</script>)"
    
    # Blog sayfaları için path farklı
    if '/blog/' in filepath:
        tracker_script = r'\1\n    \n    <!-- Page View Tracker -->\n    <script src="../js/pageview-tracker.js" defer></script>'
    else:
        tracker_script = r'\1\n    \n    <!-- Page View Tracker -->\n    <script src="js/pageview-tracker.js" defer></script>'
    
    new_content = re.sub(pattern, tracker_script, content)
    
    # Değişiklik var mı kontrol et
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Added tracker: {filepath}")
        return True
    else:
        print(f"⚠️  Pattern not found: {filepath}")
        return False

def main():
    # Tüm HTML dosyalarını bul (blog ve root)
    html_files = []
    html_files.extend(glob.glob('blog/*.html'))
    html_files.extend(glob.glob('*.html'))
    html_files.extend(glob.glob('en/*.html'))
    html_files.extend(glob.glob('legal/*.html'))
    
    # index.html'i çıkar (zaten manuel ekledik)
    html_files = [f for f in html_files if 'index.html' not in f or 'blog' in f]
    
    updated_count = 0
    for filepath in html_files:
        if add_tracker_to_file(filepath):
            updated_count += 1
    
    print(f"\n✨ Toplam {updated_count} dosyaya tracker eklendi")

if __name__ == '__main__':
    main()
