# DoziRez Login Troubleshooting Guide

## 🔍 Problem: Giriş Yapamıyorum

### Test Adımları

#### 1. Test Sayfasını Kullan
1. Şu sayfayı aç: https://dozi.app/dozirez/test-login.html
2. "Test 1: API Endpoint Erişimi" butonuna tıkla
   - ✅ Başarılı: Endpoint erişilebilir
   - ❌ Hata: API endpoint'e erişim sorunu var
3. "Test 2: Login İşlemi" butonuna tıkla
   - ✅ Başarılı: Giriş yapabiliyorsun, dashboard'a yönlendirileceksin
   - ❌ Hata: Şifre veya API sorunu var

#### 2. Browser Console Kontrolü
1. Login sayfasını aç: https://dozi.app/dozirez/login.html
2. F12 tuşuna bas (Developer Tools)
3. "Console" sekmesine git
4. Giriş yapmayı dene
5. Hata mesajlarını kontrol et:
   - **CORS Error**: Firebase Functions CORS ayarı sorunu
   - **Network Error**: İnternet bağlantısı sorunu
   - **401 Unauthorized**: Şifre yanlış
   - **404 Not Found**: API endpoint bulunamadı

#### 3. Network Tab Kontrolü
1. F12 > Network sekmesi
2. Giriş yapmayı dene
3. "pharmacyLogin" isteğini bul
4. Status Code'u kontrol et:
   - **200**: Başarılı (ama JS hatası olabilir)
   - **401**: Şifre yanlış
   - **500**: Sunucu hatası
   - **Failed**: CORS veya network sorunu

### Bilinen Sorunlar ve Çözümler

#### Sorun 1: Cache Problemi
**Belirti**: Eski kod çalışıyor, yeni değişiklikler görünmüyor

**Çözüm**:
1. Ctrl + Shift + R (Hard Refresh)
2. Veya: F12 > Network > "Disable cache" işaretle
3. Veya: Incognito/Private mode'da dene

#### Sorun 2: CORS Hatası
**Belirti**: Console'da "CORS policy" hatası

**Çözüm**:
Firebase Functions'ı yeniden deploy et:
```bash
cd C:\Users\Ufuk\AndroidStudioProjects\Dozi
firebase deploy --only functions:pharmacyLogin
```

#### Sorun 3: JWT Secret Eksik
**Belirti**: Token oluşturulamıyor

**Çözüm**:
```bash
firebase functions:config:set jwt.secret="your-super-secret-key-here"
firebase deploy --only functions
```

#### Sorun 4: Şifre Hash Uyumsuzluğu
**Belirti**: Doğru şifreyi giriyorum ama giriş yapamıyorum

**Çözüm**:
Şifreyi sıfırla:
```bash
cd C:\Users\Ufuk\AndroidStudioProjects\Dozi
node scripts/change-pharmacy-password.js
```

### Test Credentials

**Pilot Eczane:**
- Eczane ID: `PILOT001`
- Şifre: `Dozi2025!`
- Email: pilot@dozi.app

### API Endpoints

**Production:**
- Login: `https://us-central1-dozi-cd7cc.cloudfunctions.net/pharmacyLogin`
- Get Reservations: `https://us-central1-dozi-cd7cc.cloudfunctions.net/getPharmacyReservations`
- Update Status: `https://us-central1-dozi-cd7cc.cloudfunctions.net/updateReservationStatus`

### Manuel Test (curl)

**Windows PowerShell:**
```powershell
$body = @{
    pharmacyId = "PILOT001"
    password = "Dozi2025!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://us-central1-dozi-cd7cc.cloudfunctions.net/pharmacyLogin" -Method POST -Body $body -ContentType "application/json"
```

**Başarılı Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "pharmacyId": "PILOT001",
  "pharmacyName": "Sağlık Eczanesi",
  "expiresIn": 86400
}
```

### Hala Çalışmıyor mu?

1. **Test script'i çalıştır:**
   ```bash
   cd C:\Users\Ufuk\AndroidStudioProjects\Dozi
   node scripts/test-pharmacy-login.js
   ```

2. **Firestore'u kontrol et:**
   - Firebase Console > Firestore
   - `pharmacies/PILOT001` dokümanını kontrol et
   - `passwordHash` field'ı var mı?
   - `status` = "ACTIVE" mi?

3. **Firebase Functions loglarını kontrol et:**
   ```bash
   firebase functions:log --only pharmacyLogin
   ```

4. **Destek:**
   - Email: info@dozi.app
   - Hata mesajını ve console loglarını ekle

## 🎯 Hızlı Çözüm Checklist

- [ ] Test sayfasını dene: https://dozi.app/dozirez/test-login.html
- [ ] Browser cache'i temizle (Ctrl + Shift + R)
- [ ] Incognito mode'da dene
- [ ] Console'da hata var mı kontrol et (F12)
- [ ] Network tab'de request başarılı mı kontrol et
- [ ] Test script'i çalıştır: `node scripts/test-pharmacy-login.js`
- [ ] Şifreyi sıfırla: `node scripts/change-pharmacy-password.js`
- [ ] Firebase Functions'ı yeniden deploy et

## 📞 İletişim

Sorun devam ederse:
- Email: info@dozi.app
- Konu: "DoziRez Login Sorunu"
- Ekle: Console hataları, Network tab screenshot
