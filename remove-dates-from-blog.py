#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Blog sayfalarından tarihleri kaldır
"""

import re
import glob

def remove_dates_from_file(filepath):
    """Bir dosyadan tarihleri kaldır"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Tarih pattern'i: 📅 XX Ocak 2026 gibi
    # Meta span içindeki tarih kısmını kaldır
    pattern = r'<span>📅[^<]+</span><span>'
    replacement = r'<span>'
    
    new_content = re.sub(pattern, replacement, content)
    
    # Değişiklik var mı kontrol et
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Updated: {filepath}")
        return True
    else:
        print(f"⏭️  No changes: {filepath}")
        return False

def main():
    # Blog klasöründeki tüm HTML dosyalarını bul
    blog_files = glob.glob('blog/*.html')
    
    updated_count = 0
    for filepath in blog_files:
        if remove_dates_from_file(filepath):
            updated_count += 1
    
    print(f"\n✨ Toplam {updated_count} dosya güncellendi")

if __name__ == '__main__':
    main()
