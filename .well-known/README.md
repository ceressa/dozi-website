# Digital Asset Links Configuration

Bu klasör Android App Links doğrulaması için gerekli dosyaları içerir.

## assetlinks.json

Google Play App Links doğrulaması için kullanılır.

### SHA256 Fingerprint Nasıl Alınır?

1. **Play Console'a git:** https://play.google.com/console
2. **Uygulamayı seç:** Dozi
3. **Release > Setup > App Integrity** bölümüne git
4. **App signing** sekmesinde **SHA-256 certificate fingerprint** değerini kopyala
5. Bu değeri `assetlinks.json` dosyasındaki `sha256_cert_fingerprints` array'ine ekle

### Doğrulama

Dosyanın doğru çalıştığını kontrol etmek için:

```bash
# Manuel test
curl https://www.dozi.app/.well-known/assetlinks.json

# Google'ın test aracı
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.dozi.app&relation=delegate_permission/common.handle_all_urls
```

### Önemli Notlar

- `android:autoVerify="true"` olan tüm intent-filter'lar için assetlinks.json gereklidir
- Dosya **redirect olmadan** erişilebilir olmalıdır
- Content-Type: `application/json` olmalıdır
- HTTPS zorunludur

### Sorun Giderme

**"Alan adı yönlendirmesiz erişimi başarısız oldu" hatası:**
- GitHub Pages CNAME dosyasında `www.dozi.app` olduğundan emin olun
- `dozi.app` (apex) kullanmayın, çünkü redirect oluyor
- AndroidManifest'te sadece `www.dozi.app` host kullanın

**"Parmak izi doğrulaması başarısız oldu" hatası:**
- Play Console'dan doğru SHA256 fingerprint'i aldığınızdan emin olun
- Upload key değil, App signing key kullanın
- Fingerprint'te `:` karakterleri olmalı (örn: `28:1B:65:...`)

## Güncelleme Sonrası

1. Değişiklikleri GitHub'a push edin
2. GitHub Pages'in deploy olmasını bekleyin (~1-2 dakika)
3. Google Ads'de deep link doğrulamasını yeniden çalıştırın
4. Play Console'da App Links Assistant ile test edin
