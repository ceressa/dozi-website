"""
Dozi Index.html Hero Section Updater - Fixed Version
Bu script index.html dosyasındaki hero bölümünü hatasız günceller.
"""

# Index.html dosyasını oku
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Yeni içerik
new_content = []
i = 0

while i < len(lines):
    line = lines[i]
    
    # 1. H1 CSS bloğunu bul ve değiştir
    if '.hero-content h1 {' in line:
        # H1 bloğunun sonunu bul
        new_content.append('        .hero-content h1 {\n')
        new_content.append('            font-size: 4rem;\n')
        new_content.append('            font-weight: 800;\n')
        new_content.append('            line-height: 1.1;\n')
        new_content.append('            margin-bottom: 1.5rem;\n')
        new_content.append('            background: linear-gradient(135deg, var(--dozi-turquoise) 0%, var(--dozi-pink) 50%, var(--dozi-purple) 100%);\n')
        new_content.append('            background-size: 200% 200%;\n')
        new_content.append('            -webkit-background-clip: text;\n')
        new_content.append('            -webkit-text-fill-color: transparent;\n')
        new_content.append('            background-clip: text;\n')
        new_content.append('            animation: gradient-shift 8s ease infinite;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        @keyframes gradient-shift {\n')
        new_content.append('            0%, 100% { background-position: 0% 50%; }\n')
        new_content.append('            50% { background-position: 100% 50%; }\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        .hero-content .subtitle {\n')
        new_content.append('            font-size: 1.4rem;\n')
        new_content.append('            color: var(--dozi-gray);\n')
        new_content.append('            margin-bottom: 1rem;\n')
        new_content.append('            font-weight: 500;\n')
        new_content.append('            line-height: 1.6;\n')
        new_content.append('        }\n')
        
        # Eski h1 bloğunu atla
        i += 1
        while i < len(lines) and '}' not in lines[i]:
            i += 1
        i += 1  # } satırını da atla
        continue
    
    # 2. hero-content p'den önce badges ekle
    elif '.hero-content p {' in line:
        # Önce badges CSS'i ekle
        new_content.append('\n')
        new_content.append('        .hero-badges {\n')
        new_content.append('            display: flex;\n')
        new_content.append('            gap: 1rem;\n')
        new_content.append('            flex-wrap: wrap;\n')
        new_content.append('            margin-bottom: 2rem;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        .hero-badge {\n')
        new_content.append('            display: inline-flex;\n')
        new_content.append('            align-items: center;\n')
        new_content.append('            gap: 0.5rem;\n')
        new_content.append('            background: rgba(64, 224, 208, 0.1);\n')
        new_content.append('            padding: 0.5rem 1rem;\n')
        new_content.append('            border-radius: 20px;\n')
        new_content.append('            font-size: 0.9rem;\n')
        new_content.append('            color: var(--dozi-dark);\n')
        new_content.append('            font-weight: 500;\n')
        new_content.append('            border: 1px solid rgba(64, 224, 208, 0.2);\n')
        new_content.append('            transition: all 0.3s;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        .hero-badge:hover {\n')
        new_content.append('            background: rgba(64, 224, 208, 0.15);\n')
        new_content.append('            transform: translateY(-2px);\n')
        new_content.append('        }\n')
        new_content.append('\n')
        # Şimdi p bloğunu ekle
        new_content.append(line)
        i += 1
        continue
    
    # 3. Buton padding ve font-size güncelle
    elif 'padding: 1rem 2.5rem;' in line and '.btn-primary' in ''.join(new_content[-20:]):
        new_content.append('            padding: 1.2rem 3rem;\n')
        i += 1
        continue
    elif 'font-size: 1.1rem;' in line and ('.btn-primary' in ''.join(new_content[-30:]) or '.btn-secondary' in ''.join(new_content[-30:])):
        new_content.append('            font-size: 1.15rem;\n')
        i += 1
        continue
    elif 'font-weight: 600;' in line and '.btn-primary' in ''.join(new_content[-30:]):
        new_content.append('            font-weight: 700;\n')
        i += 1
        continue
    
    # 4. Mascot container'dan önce animasyon ekle
    elif '.mascot-container img {' in line:
        new_content.append('\n')
        new_content.append('        .mascot-container {\n')
        new_content.append('            position: relative;\n')
        new_content.append('            animation: float-mascot 6s ease-in-out infinite;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        @keyframes float-mascot {\n')
        new_content.append('            0%, 100% { transform: translateY(0px); }\n')
        new_content.append('            50% { transform: translateY(-20px); }\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append(line)
        i += 1
        continue
    
    # 5. Mascot img CSS güncelle
    elif 'max-width: 400px;' in line and 'mascot' in ''.join(new_content[-10:]):
        new_content.append('            max-width: 450px;\n')
        i += 1
        continue
    elif 'filter: drop-shadow(0 20px 40px rgba(64, 224, 208, 0.3));' in line:
        new_content.append('            filter: drop-shadow(0 25px 50px rgba(64, 224, 208, 0.4));\n')
        new_content.append('            transition: filter 0.3s;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        .mascot-container:hover img {\n')
        new_content.append('            filter: drop-shadow(0 30px 60px rgba(64, 224, 208, 0.5));\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        .mascot-container::before,\n')
        new_content.append('        .mascot-container::after {\n')
        new_content.append('            content: \'\';\n')
        new_content.append('            position: absolute;\n')
        new_content.append('            border-radius: 50%;\n')
        new_content.append('            z-index: -1;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        .mascot-container::before {\n')
        new_content.append('            width: 120%;\n')
        new_content.append('            height: 120%;\n')
        new_content.append('            background: radial-gradient(circle, rgba(64, 224, 208, 0.1) 0%, transparent 70%);\n')
        new_content.append('            animation: pulse-circle 4s ease-in-out infinite;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        .mascot-container::after {\n')
        new_content.append('            width: 140%;\n')
        new_content.append('            height: 140%;\n')
        new_content.append('            background: radial-gradient(circle, rgba(255, 107, 157, 0.08) 0%, transparent 70%);\n')
        new_content.append('            animation: pulse-circle 4s ease-in-out infinite 2s;\n')
        new_content.append('        }\n')
        new_content.append('\n')
        new_content.append('        @keyframes pulse-circle {\n')
        new_content.append('            0%, 100% { transform: scale(1); opacity: 1; }\n')
        new_content.append('            50% { transform: scale(1.1); opacity: 0.8; }\n')
        i += 1
        continue
    
    # 6. Hero HTML güncelle
    elif '<h1>Sağlıklı Yaşam Asistanınız</h1>' in line:
        new_content.append('                <h1>Sağlıklı Yaşam Asistanınız 💧</h1>\n')
        new_content.append('                <p class="subtitle">İlaç takibini kolaylaştıran, sağlığınızı kontrol altında tutan sevimli sağlık asistanı</p>\n')
        new_content.append('                \n')
        new_content.append('                <!-- Feature Badges -->\n')
        new_content.append('                <div class="hero-badges">\n')
        new_content.append('                    <span class="hero-badge">✓ 10,000+ Mutlu Kullanıcı</span>\n')
        new_content.append('                    <span class="hero-badge">✓ KVKK Uyumlu</span>\n')
        new_content.append('                    <span class="hero-badge">✓ Türkiye\'de Geliştirildi</span>\n')
        new_content.append('                </div>\n')
        new_content.append('                \n')
        # Sonraki p etiketini bul ve değiştir
        i += 1
        while i < len(lines) and '<p>' not in lines[i]:
            i += 1
        if i < len(lines):
            new_content.append('                <p>İlaçlarınızı zamanında almayı asla unutmayın! Akıllı hatırlatmalar, aile takibi ve daha fazlası ile sağlığınız artık kontrol altında. 💊</p>\n')
            # Eski p bloğunu atla
            i += 1
            while i < len(lines) and '</p>' not in lines[i]:
                i += 1
            i += 1
        continue
    
    # 7. Buton metinlerini güncelle
    elif 'Hemen İndir 📱' in line:
        new_content.append('                        📱 Hemen İndir\n')
        i += 1
        continue
    elif 'Daha Fazla Bilgi' in line and 'btn-secondary' in ''.join(new_content[-10:]):
        new_content.append('                        🔍 Daha Fazla Bilgi\n')
        i += 1
        continue
    
    # 8. Mascot alt text güncelle
    elif 'alt="Dozi Maskot"' in line:
        new_content.append(line.replace('alt="Dozi Maskot"', 'alt="Dozi Maskot - Sağlıklı Yaşam Asistanı"'))
        i += 1
        continue
    
    else:
        new_content.append(line)
        i += 1

# Güncellenmiş içeriği yaz
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print("✅ Index.html başarıyla güncellendi!")
print("✨ Tüm hero iyileştirmeleri uygulandı!")
