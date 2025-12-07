# Dozi Landing Page - Yeni Bölümler

Bu dosya, index.html'e eklenecek yeni bölümleri içerir. Her bölüm ayrı ayrı kopyalanıp yapıştırılabilir.

---

## 📊 1. KARŞILAŞTIRMA TABLOSU (Ücretsiz vs Premium)

**Nereye Eklenecek:** Stats bölümünden sonra, Testimonials'dan önce

```html
<!-- Comparison Table Section -->
<section class="comparison fade-in-section" id="pricing">
    <div class="section-header">
        <h2>Ücretsiz mi, Premium mu? 🤔</h2>
        <p>Size en uygun planı seçin</p>
    </div>
    <div class="comparison-container">
        <div class="comparison-table">
            <div class="plan-column free-plan">
                <div class="plan-header">
                    <h3>Ücretsiz</h3>
                    <div class="price">₺0<span>/ay</span></div>
                    <p>Temel özellikler</p>
                </div>
                <ul class="features-list">
                    <li class="included">✓ İlaç hatırlatmaları</li>
                    <li class="included">✓ Temel takip özellikleri</li>
                    <li class="included">✓ Tek profil</li>
                    <li class="included">✓ Yerel veri saklama</li>
                    <li class="excluded">✗ Bulut yedekleme</li>
                    <li class="excluded">✗ Aile takibi</li>
                    <li class="excluded">✗ Reçete OCR</li>
                    <li class="excluded">✗ Gelişmiş raporlar</li>
                </ul>
                <a href="#download" class="plan-button">Hemen Başla</a>
            </div>

            <div class="plan-column premium-plan featured">
                <div class="badge">En Popüler</div>
                <div class="plan-header">
                    <h3>Premium</h3>
                    <div class="price">₺29.99<span>/ay</span></div>
                    <p>Tüm özellikler</p>
                </div>
                <ul class="features-list">
                    <li class="included">✓ Tüm ücretsiz özellikler</li>
                    <li class="included">✓ Bulut yedekleme</li>
                    <li class="included">✓ Sınırsız aile üyesi</li>
                    <li class="included">✓ Reçete OCR tarama</li>
                    <li class="included">✓ Gelişmiş raporlar</li>
                    <li class="included">✓ Öncelikli destek</li>
                    <li class="included">✓ Reklamsız deneyim</li>
                    <li class="included">✓ Erken erişim özellikleri</li>
                </ul>
                <a href="#download" class="plan-button premium">Premium'a Geç</a>
            </div>
        </div>
    </div>
</section>
```

**CSS Eklemeleri:**

```css
/* ========================================
   COMPARISON TABLE
   ======================================== */
.comparison {
    padding: 6rem 2rem;
    background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(232,244,248,0.6) 100%);
}

.comparison-container {
    max-width: 1000px;
    margin: 0 auto;
}

.comparison-table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.plan-column {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.4s;
    position: relative;
}

.plan-column:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(64, 224, 208, 0.3);
}

.premium-plan {
    border: 3px solid var(--dozi-turquoise);
    transform: scale(1.05);
}

.badge {
    position: absolute;
    top: -15px;
    right: 20px;
    background: linear-gradient(135deg, var(--dozi-pink), var(--dozi-coral));
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
}

.plan-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid #f0f0f0;
}

.plan-header h3 {
    font-size: 1.8rem;
    color: var(--dozi-dark);
    margin-bottom: 1rem;
}

.price {
    font-size: 3rem;
    font-weight: 800;
    color: var(--dozi-turquoise);
    margin: 1rem 0;
}

.price span {
    font-size: 1.2rem;
    color: var(--dozi-gray);
    font-weight: 400;
}

.features-list {
    list-style: none;
    margin: 2rem 0;
}

.features-list li {
    padding: 0.75rem 0;
    font-size: 1rem;
}

.features-list .included {
    color: var(--dozi-dark);
}

.features-list .excluded {
    color: var(--dozi-gray);
    opacity: 0.5;
}

.plan-button {
    display: block;
    width: 100%;
    padding: 1rem;
    border-radius: 10px;
    text-align: center;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
    background: #f0f0f0;
    color: var(--dozi-dark);
}

.plan-button.premium {
    background: linear-gradient(135deg, var(--dozi-turquoise), var(--dozi-blue));
    color: white;
    box-shadow: 0 8px 20px rgba(64, 224, 208, 0.4);
}

.plan-button:hover {
    transform: translateY(-2px);
}

.plan-button.premium:hover {
    box-shadow: 0 12px 30px rgba(64, 224, 208, 0.5);
}
```

---

## 🏆 2. GÜVEN İŞARETLERİ (Trust Badges)

**Nereye Eklenecek:** Download bölümünden önce

```html
<!-- Trust Badges Section -->
<section class="trust-badges fade-in-section">
    <div class="trust-container">
        <div class="badge-item">
            <div class="badge-icon">🇹🇷</div>
            <h4>Türkiye'de Geliştirildi</h4>
            <p>Yerli ve milli teknoloji</p>
        </div>
        <div class="badge-item">
            <div class="badge-icon">🔒</div>
            <h4>KVKK Uyumlu</h4>
            <p>Verileriniz güvende</p>
        </div>
        <div class="badge-item">
            <div class="badge-icon">✓</div>
            <h4>SSL Sertifikalı</h4>
            <p>Güvenli bağlantı</p>
        </div>
        <div class="badge-item">
            <div class="badge-icon">⭐</div>
            <h4>4.8/5 Puan</h4>
            <p>10,000+ kullanıcı</p>
        </div>
    </div>
</section>
```

**CSS:**

```css
/* ========================================
   TRUST BADGES
   ======================================== */
.trust-badges {
    padding: 4rem 2rem;
    background: white;
}

.trust-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
}

.badge-item {
    text-align: center;
    padding: 1.5rem;
    transition: transform 0.3s;
}

.badge-item:hover {
    transform: translateY(-5px);
}

.badge-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.badge-item h4 {
    font-size: 1.1rem;
    color: var(--dozi-dark);
    margin-bottom: 0.5rem;
}

.badge-item p {
    color: var(--dozi-gray);
    font-size: 0.9rem;
}
```

---

## 📱 3. STICKY CTA BUTTON

**JavaScript Eklemesi (script bölümüne):**

```javascript
// Sticky CTA Button
window.addEventListener('scroll', () => {
    const stickyCTA = document.getElementById('sticky-cta');
    const downloadSection = document.getElementById('download');
    
    if (window.scrollY > 800 && !isInViewport(downloadSection)) {
        stickyCTA.classList.add('show');
    } else {
        stickyCTA.classList.remove('show');
    }
});

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
```

**HTML (body sonuna ekle):**

```html
<!-- Sticky CTA Button -->
<div id="sticky-cta" class="sticky-cta">
    <a href="#download" class="sticky-btn">
        📱 Hemen İndir
    </a>
</div>
```

**CSS:**

```css
/* ========================================
   STICKY CTA
   ======================================== */
.sticky-cta {
    position: fixed;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    transition: bottom 0.4s ease;
}

.sticky-cta.show {
    bottom: 30px;
}

.sticky-btn {
    display: inline-block;
    background: linear-gradient(135deg, var(--dozi-turquoise), var(--dozi-blue));
    color: white;
    padding: 1rem 3rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.1rem;
    box-shadow: 0 10px 40px rgba(64, 224, 208, 0.5);
    animation: pulse-glow 2s infinite;
}

.sticky-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 50px rgba(64, 224, 208, 0.6);
}

@keyframes pulse-glow {
    0%, 100% {
        box-shadow: 0 10px 40px rgba(64, 224, 208, 0.5);
    }
    50% {
        box-shadow: 0 10px 50px rgba(64, 224, 208, 0.8);
    }
}
```

---

## 📰 4. BLOG/HABERLER BÖLÜMÜ

**Nereye Eklenecek:** Testimonials'dan sonra

```html
<!-- Blog/News Section -->
<section class="blog fade-in-section" id="blog">
    <div class="section-header">
        <h2>Blog & Haberler 📰</h2>
        <p>Sağlık ipuçları ve uygulama güncellemeleri</p>
    </div>
    <div class="blog-grid">
        <article class="blog-card fade-in-section">
            <div class="blog-image">
                <img src="dozi_teach1.png" alt="İlaç Kullanım İpuçları">
                <div class="blog-category">Sağlık İpuçları</div>
            </div>
            <div class="blog-content">
                <h3>İlaçlarınızı Düzenli Kullanmanın 5 Altın Kuralı</h3>
                <p>İlaç tedavinizden maksimum fayda sağlamak için bilmeniz gerekenler...</p>
                <div class="blog-meta">
                    <span>📅 5 Aralık 2024</span>
                    <span>⏱️ 3 dk okuma</span>
                </div>
            </div>
        </article>

        <article class="blog-card fade-in-section">
            <div class="blog-image">
                <img src="dozi_perfect.png" alt="Yeni Özellikler">
                <div class="blog-category">Güncelleme</div>
            </div>
            <div class="blog-content">
                <h3>Dozi 2.0 Yayınlandı! 🎉</h3>
                <p>Yeni reçete OCR özelliği ve geliştirilmiş arayüz ile tanışın...</p>
                <div class="blog-meta">
                    <span>📅 1 Aralık 2024</span>
                    <span>⏱️ 2 dk okuma</span>
                </div>
            </div>
        </article>

        <article class="blog-card fade-in-section">
            <div class="blog-image">
                <img src="dozi_family.png" alt="Aile Sağlığı">
                <div class="blog-category">Kullanım Kılavuzu</div>
            </div>
            <div class="blog-content">
                <h3>Aile Üyelerinizin İlaçlarını Nasıl Takip Edersiniz?</h3>
                <p>Premium aile takibi özelliğini kullanma rehberi...</p>
                <div class="blog-meta">
                    <span>📅 28 Kasım 2024</span>
                    <span>⏱️ 4 dk okuma</span>
                </div>
            </div>
        </article>
    </div>
</section>
```

**CSS:**

```css
/* ========================================
   BLOG SECTION
   ======================================== */
.blog {
    padding: 6rem 2rem;
    background: white;
}

.blog-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
}

.blog-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.4s;
}

.blog-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(64, 224, 208, 0.3);
}

.blog-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.blog-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
}

.blog-card:hover .blog-image img {
    transform: scale(1.1);
}

.blog-category {
    position: absolute;
    top: 15px;
    right: 15px;
    background: linear-gradient(135deg, var(--dozi-turquoise), var(--dozi-blue));
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.blog-content {
    padding: 2rem;
}

.blog-content h3 {
    font-size: 1.3rem;
    color: var(--dozi-dark);
    margin-bottom: 1rem;
    line-height: 1.4;
}

.blog-content p {
    color: var(--dozi-gray);
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

.blog-meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    color: var(--dozi-gray);
}
```

---

## 🗺️ 5. ROADMAP BÖLÜMÜ

**Nereye Eklenecek:** Blog bölümünden sonra

```html
<!-- Roadmap Section -->
<section class="roadmap fade-in-section" id="roadmap">
    <div class="section-header">
        <h2>Yol Haritası 🗺️</h2>
        <p>Yakında gelecek özellikler</p>
    </div>
    <div class="roadmap-container">
        <div class="timeline">
            <div class="timeline-item completed">
                <div class="timeline-marker">✓</div>
                <div class="timeline-content">
                    <h3>Temel Özellikler</h3>
                    <p>İlaç hatırlatma, takip ve bildirimler</p>
                    <span class="timeline-date">Tamamlandı - Kasım 2024</span>
                </div>
            </div>

            <div class="timeline-item completed">
                <div class="timeline-marker">✓</div>
                <div class="timeline-content">
                    <h3>Premium Özellikler</h3>
                    <p>Bulut yedekleme, aile takibi, reçete OCR</p>
                    <span class="timeline-date">Tamamlandı - Aralık 2024</span>
                </div>
            </div>

            <div class="timeline-item active">
                <div class="timeline-marker">🔄</div>
                <div class="timeline-content">
                    <h3>Yapay Zeka Entegrasyonu</h3>
                    <p>İlaç etkileşimi uyarıları ve akıllı öneriler</p>
                    <span class="timeline-date">Geliştiriliyor - Ocak 2025</span>
                </div>
            </div>

            <div class="timeline-item upcoming">
                <div class="timeline-marker">📅</div>
                <div class="timeline-content">
                    <h3>Sağlık Entegrasyonları</h3>
                    <p>Google Fit, Apple Health bağlantısı</p>
                    <span class="timeline-date">Planlandı - Şubat 2025</span>
                </div>
            </div>

            <div class="timeline-item upcoming">
                <div class="timeline-marker">📅</div>
                <div class="timeline-content">
                    <h3>Doktor Paneli</h3>
                    <p>Doktorların hastaları takip edebileceği web paneli</p>
                    <span class="timeline-date">Planlandı - Mart 2025</span>
                </div>
            </div>
        </div>

        <div class="feedback-box">
            <h3>Öneriniz mi var? 💡</h3>
            <p>Hangi özellikleri görmek istersiniz? Bize bildirin!</p>
            <a href="mailto:feedback@dozi.app" class="feedback-button">Öneri Gönder</a>
        </div>
    </div>
</section>
```

**CSS:**

```css
/* ========================================
   ROADMAP SECTION
   ======================================== */
.roadmap {
    padding: 6rem 2rem;
    background: linear-gradient(180deg, rgba(232,244,248,0.4) 0%, rgba(255,255,255,0.9) 100%);
}

.roadmap-container {
    max-width: 900px;
    margin: 0 auto;
}

.timeline {
    position: relative;
    padding: 2rem 0;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 30px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--dozi-turquoise), var(--dozi-pink));
}

.timeline-item {
    position: relative;
    padding-left: 80px;
    margin-bottom: 3rem;
}

.timeline-marker {
    position: absolute;
    left: 0;
    width: 60px;
    height: 60px;
    background: white;
    border: 3px solid var(--dozi-turquoise);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 15px rgba(64, 224, 208, 0.3);
}

.timeline-item.completed .timeline-marker {
    background: linear-gradient(135deg, var(--dozi-turquoise), var(--dozi-blue));
    color: white;
    border-color: var(--dozi-turquoise);
}

.timeline-item.active .timeline-marker {
    background: linear-gradient(135deg, var(--dozi-pink), var(--dozi-coral));
    border-color: var(--dozi-pink);
    animation: pulse-marker 2s infinite;
}

.timeline-item.upcoming .timeline-marker {
    background: white;
    border-color: #ddd;
}

@keyframes pulse-marker {
    0%, 100% {
        box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
    }
    50% {
        box-shadow: 0 4px 25px rgba(255, 107, 157, 0.6);
    }
}

.timeline-content {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.timeline-content h3 {
    font-size: 1.3rem;
    color: var(--dozi-dark);
    margin-bottom: 0.5rem;
}

.timeline-content p {
    color: var(--dozi-gray);
    margin-bottom: 0.75rem;
}

.timeline-date {
    font-size: 0.9rem;
    color: var(--dozi-turquoise);
    font-weight: 600;
}

.feedback-box {
    background: linear-gradient(135deg, var(--dozi-turquoise), var(--dozi-blue));
    color: white;
    padding: 3rem;
    border-radius: 20px;
    text-align: center;
    margin-top: 3rem;
}

.feedback-box h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.feedback-box p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.feedback-button {
    display: inline-block;
    background: white;
    color: var(--dozi-turquoise);
    padding: 1rem 2.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.3s;
}

.feedback-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
```

---

## 📱 RESPONSIVE EKLEMELERI

Mevcut responsive bölümüne ekle:

```css
@media (max-width: 768px) {
    /* ... mevcut responsive kurallar ... */
    
    .comparison-table {
        grid-template-columns: 1fr;
    }
    
    .premium-plan {
        transform: scale(1);
    }
    
    .trust-container {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .blog-grid {
        grid-template-columns: 1fr;
    }
    
    .timeline::before {
        left: 20px;
    }
    
    .timeline-item {
        padding-left: 60px;
    }
    
    .timeline-marker {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
    }
    
    .sticky-btn {
        padding: 0.8rem 2rem;
        font-size: 1rem;
    }
}
```

---

## 🎯 KULLANIM TALİMATLARI

1. **CSS Eklemeleri:** Tüm CSS kodlarını `</style>` etiketinden önce ekleyin
2. **HTML Bölümleri:** Her bölümü belirtilen yere ekleyin
3. **JavaScript:** Script bölümüne sticky CTA kodunu ekleyin
4. **Görseller:** Blog kartlarında kullanılan görsellerin mevcut olduğundan emin olun

Her bölüm bağımsız çalışır, istediğiniz bölümleri seçerek ekleyebilirsiniz!
