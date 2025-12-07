"""
Dozi Index.html Hero Section Updater
Bu script index.html dosyasındaki hero bölümünü otomatik olarak günceller.
"""

import re

# Index.html dosyasını oku
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. H1 CSS'ini güncelle - animasyonlu gradient ekle
h1_old = r'\.hero-content h1 \{[^}]+\}'
h1_new = """.hero-content h1 {
            font-size: 4rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, var(--dozi-turquoise) 0%, var(--dozi-pink) 50%, var(--dozi-purple) 100%);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradient-shift 8s ease infinite;
        }

        @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }"""

content = re.sub(h1_old, h1_new, content, flags=re.DOTALL)

# 2. Hero content p CSS'ine subtitle ve badges ekle
p_insert_after = r'(\.hero-content h1[^}]+\}[^}]+\})'
subtitle_css = """

        .hero-content .subtitle {
            font-size: 1.4rem;
            color: var(--dozi-gray);
            margin-bottom: 1rem;
            font-weight: 500;
            line-height: 1.6;
        }"""

content = re.sub(p_insert_after, r'\1' + subtitle_css, content, flags=re.DOTALL)

# 3. Badges CSS ekle
badges_css = """

        .hero-badges {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(64, 224, 208, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            color: var(--dozi-dark);
            font-weight: 500;
            border: 1px solid rgba(64, 224, 208, 0.2);
            transition: all 0.3s;
        }

        .hero-badge:hover {
            background: rgba(64, 224, 208, 0.15);
            transform: translateY(-2px);
        }"""

# Badges CSS'i cta-buttons'dan önce ekle
content = content.replace('        .cta-buttons {', badges_css + '\n\n        .cta-buttons {')

# 4. Buton boyutlarını güncelle
content = content.replace('padding: 1rem 2.5rem;', 'padding: 1.2rem 3rem;')
content = content.replace('font-size: 1.1rem;', 'font-size: 1.15rem;')
content = content.replace('font-weight: 600;', 'font-weight: 700;', 1)  # Sadece ilk btn-primary

# 5. Mascot animasyonu ekle
mascot_css = """

        .mascot-container {
            position: relative;
            animation: float-mascot 6s ease-in-out infinite;
        }

        @keyframes float-mascot {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }"""

# mascot-container img'den önce ekle
content = content.replace('        .mascot-container img {', mascot_css + '\n\n        .mascot-container img {')

# 6. Mascot img CSS güncelle
content = content.replace('max-width: 400px;', 'max-width: 450px;')
content = content.replace('filter: drop-shadow(0 20px 40px rgba(64, 224, 208, 0.3));', 
                         'filter: drop-shadow(0 25px 50px rgba(64, 224, 208, 0.4));')

# 7. Pulse circles ekle
pulse_css = """

        .mascot-container::before,
        .mascot-container::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            z-index: -1;
        }

        .mascot-container::before {
            width: 120%;
            height: 120%;
            background: radial-gradient(circle, rgba(64, 224, 208, 0.1) 0%, transparent 70%);
            animation: pulse-circle 4s ease-in-out infinite;
        }

        .mascot-container::after {
            width: 140%;
            height: 140%;
            background: radial-gradient(circle, rgba(255, 107, 157, 0.08) 0%, transparent 70%);
            animation: pulse-circle 4s ease-in-out infinite 2s;
        }

        @keyframes pulse-circle {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }"""

# Scroll animations'dan önce ekle
content = content.replace('        /* ========================================\n           SCROLL ANIMATIONS', 
                         pulse_css + '\n\n        /* ========================================\n           SCROLL ANIMATIONS')

# 8. Hero HTML'i güncelle
hero_html_old = r'<section class="hero fade-in-section">.*?</section>'
hero_html_new = """<section class="hero fade-in-section">
        <div class="hero-container">
            <div class="hero-content">
                <h1>Sağlıklı Yaşam Asistanınız 💧</h1>
                <p class="subtitle">İlaç takibini kolaylaştıran, sağlığınızı kontrol altında tutan sevimli sağlık asistanı</p>
                
                <!-- Feature Badges -->
                <div class="hero-badges">
                    <span class="hero-badge">✓ 10,000+ Mutlu Kullanıcı</span>
                    <span class="hero-badge">✓ KVKK Uyumlu</span>
                    <span class="hero-badge">✓ Türkiye'de Geliştirildi</span>
                </div>
                
                <p>İlaçlarınızı zamanında almayı asla unutmayın! Akıllı hatırlatmalar, aile takibi ve daha fazlası ile sağlığınız artık kontrol altında. 💊</p>
                
                <div class="cta-buttons">
                    <a href="#download" class="btn-primary">
                        📱 Hemen İndir
                    </a>
                    <a href="#features" class="btn-secondary">
                        🔍 Daha Fazla Bilgi
                    </a>
                </div>
            </div>
            <div class="hero-image">
                <div class="mascot-container">
                    <img src="dozi_happy.png" alt="Dozi Maskot - Sağlıklı Yaşam Asistanı">
                </div>
            </div>
        </div>
    </section>"""

content = re.sub(hero_html_old, hero_html_new, content, flags=re.DOTALL)

# Güncellenmiş içeriği yaz
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Index.html başarıyla güncellendi!")
print("✨ Hero bölümü artık:")
print("   - Animasyonlu gradient başlık")
print("   - Yüzen maskot animasyonu")
print("   - Güven badge'leri")
print("   - Dekoratif pulse daireleri")
print("   - Daha büyük butonlar")
print("içeriyor!")
