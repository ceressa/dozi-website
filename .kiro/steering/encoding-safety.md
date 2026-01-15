# Encoding Safety Rules

## ⛔ KRİTİK KURALLAR

### HTML/Web Dosyaları İçin
- ❌ **ASLA PowerShell veya Python script ile HTML dosyalarını otomatik güncelleme**
- ❌ **ASLA karakter değiştirme scriptleri çalıştırma** (örn: sed, awk, PowerShell replace)
- ❌ **ASLA encoding dönüşümü yapan araçlar kullanma**
- ✅ **Sadece manuel düzenleme veya doğrudan fsWrite/strReplace kullan**
- ✅ **HTML dosyaları için encoding sorunlarına yol açabilecek hiçbir işlem yapma**

### Neden?
PowerShell ve bazı script dilleri Türkçe karakterleri (ı, ç, ü, ö, ğ, ş, İ, Ç, Ş, Ğ, Ü, Ö) ve emoji'leri yanlış encode edebilir. Bu karakterler bozuk semboller (�, ????) olarak görünür.

### Güvenli Yöntemler
1. **Manuel düzenleme**: Dosyayı doğrudan editörde aç ve düzenle
2. **fsWrite**: Kiro'nun dosya yazma aracını kullan
3. **strReplace**: Kiro'nun string değiştirme aracını kullan (küçük değişiklikler için)

### Örnek: YANLIŞ ❌
```powershell
# ASLA YAPMA!
(Get-Content index.html) -replace 'eski', 'yeni' | Set-Content index.html
```

### Örnek: DOĞRU ✅
```
# Kiro araçlarını kullan
fsWrite veya strReplace ile düzenle
```

## Diğer Dosya Türleri
- **Kotlin/Java**: Güvenli (UTF-8 native)
- **JSON**: Dikkatli ol, script yerine fsWrite kullan
- **Markdown**: Genelde güvenli ama yine de dikkatli ol
- **XML**: Android resource dosyaları güvenli

## Özet
**HTML ve web dosyalarında Türkçe karakter varsa, script kullanma. Manuel düzenle veya Kiro araçlarını kullan.**
