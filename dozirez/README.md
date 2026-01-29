# DoziRez - Eczane Rezervasyon Portalı

Modern, kullanıcı dostu eczane rezervasyon yönetim sistemi.

## 📍 URL
**Production:** https://dozi.app/dozirez/

## 🎯 Özellikler

### Landing Page (`index.html`)
- Modern hero section
- Özellik kartları (6 adet)
- İstatistik gösterimi
- "Nasıl Çalışır?" bölümü
- CTA section
- Responsive tasarım

### Login Page (`login.html`)
- Eczane ID + Şifre girişi
- "Beni Hatırla" özelliği
- Şifremi unuttum linki
- Session yönetimi (24 saat)
- Firebase Authentication entegrasyonu

### Dashboard (`dashboard.html`)
- **Sidebar Navigation:**
  - Genel Bakış
  - Rezervasyonlar (badge ile bekleyen sayısı)
  - İstatistikler
  - Ayarlar
  - Çıkış Yap

- **Genel Bakış Sayfası:**
  - 4 istatistik kartı (Toplam, Tamamlanan, Bekleyen, Ort. Yanıt Süresi)
  - Son 5 rezervasyon tablosu
  - Trend göstergeleri

- **Rezervasyonlar Sayfası:**
  - Tüm rezervasyonlar listesi
  - Durum filtreleme (Tümü, Bekleyen, Onaylanan, Hazır, Tamamlanan)
  - Detay modal
  - Durum güncelleme butonları

- **Rezervasyon Detay Modal:**
  - Müşteri bilgileri
  - İlaç bilgileri
  - Durum badge
  - Hızlı işlem butonları (Onayla, Hazır, Tamamla)

## 🎨 Tasarım

### Renk Paleti
- **Primary:** `#40E0D0` (Turquoise)
- **Secondary:** `#4A90E2` (Blue)
- **Accent:** `#FF6B9D` (Pink)
- **Success:** `#10B981` (Green)
- **Warning:** `#FFD93D` (Yellow)
- **Purple:** `#8B7FFF`

### Tipografi
- Font: System fonts (Apple, Segoe UI, Roboto)
- Başlıklar: 800 weight
- Body: 400-600 weight

### Animasyonlar
- Floating blobs (background)
- Hover effects
- Modal slide-up
- Page transitions
- Loading states

## 🔧 Teknik Detaylar

### Dosya Yapısı
```
dozirez/
├── index.html          # Landing page
├── login.html          # Giriş sayfası
├── dashboard.html      # Dashboard
├── styles.css          # Ana CSS (shared)
├── login.css           # Login özel CSS
├── dashboard.css       # Dashboard özel CSS
├── login.js            # Login logic
├── dashboard.js        # Dashboard logic
└── README.md           # Bu dosya
```

### Firebase Functions

#### 1. `pharmacyLogin`
```javascript
POST /pharmacyLogin
Body: { pharmacyId, password }
Response: { success, token, pharmacyId, pharmacyName }
```

#### 2. `getPharmacyReservations`
```javascript
GET /getPharmacyReservations?pharmacyId=XXX
Headers: { Authorization: Bearer TOKEN }
Response: { stats, reservations[] }
```

#### 3. `updateReservationStatus`
```javascript
POST /updateReservationStatus
Headers: { Authorization: Bearer TOKEN }
Body: { reservationId, status, pharmacyId }
Response: { success }
```

### Session Management
- **Storage:** localStorage (remember me) veya sessionStorage
- **Duration:** 24 saat
- **Data:** `{ pharmacyId, pharmacyName, token, timestamp }`

### Status Flow
```
PENDING → CONFIRMED → READY → COMPLETED
         ↓
      REJECTED/CANCELLED
```

### Auto Refresh
- Dashboard her 2 dakikada bir otomatik yenilenir
- Bekleyen rezervasyon sayısı sidebar badge'de gösterilir

## 📱 Responsive Breakpoints
- **Desktop:** > 968px
- **Tablet:** 640px - 968px
- **Mobile:** < 640px

## 🔒 Güvenlik
- HTTPS only
- Token-based authentication
- Session timeout (24h)
- KVKK uyumlu
- XSS koruması

## 🚀 Deployment
1. Dosyaları `dozi.app/dozirez/` klasörüne yükle
2. Firebase Functions'ları deploy et
3. Firestore rules'ı güncelle
4. Test et

## 📊 Demo Data
Development için demo data kullanılıyor:
- 5 örnek rezervasyon
- Örnek istatistikler
- Tüm status tipleri

## 🔗 Bağlantılar
- **Ana Sayfa:** https://dozi.app/
- **Eczacılara:** https://dozi.app/eczacilara.html
- **DoziRez:** https://dozi.app/dozirez/
- **Login:** https://dozi.app/dozirez/login.html
- **Dashboard:** https://dozi.app/dozirez/dashboard.html

## 📝 TODO
- [ ] İstatistikler sayfası
- [ ] Ayarlar sayfası
- [ ] Bildirim sistemi
- [ ] Export (CSV/PDF)
- [ ] Gelişmiş filtreleme
- [ ] Arama özelliği
- [ ] Grafik/Chart entegrasyonu
- [ ] Email/SMS bildirimleri
- [ ] Mobil app entegrasyonu

## 🐛 Known Issues
- Demo data kullanılıyor (Firebase Functions henüz deploy edilmedi)
- Şifremi unuttum fonksiyonu placeholder
- Ayarlar ve İstatistikler sayfaları boş

## 📞 İletişim
- **Email:** info@dozi.app
- **Website:** https://dozi.app
