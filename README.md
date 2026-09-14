# www.dozi.app -> med.bardino.app / bardino.app

Bu depo artik yalnizca www.dozi.app adresini (GitHub apex dozi.app'i buraya 301 ediyor)
yonlendirir. Dozi ilac sitesi https://med.bardino.app adresinde (kaynak: dozi-app-pages),
studyo sayfasi https://bardino.app adresinde (kaynak: bardino-site).

- Eski Dozi sayfalari ayni yoldaki med.bardino.app sayfasina gider (JS + meta refresh,
  noindex, canonical; sorgu ve # korunur). Ara adres yok, tek atlama.
- Dozi uygulamasinin actigi yasal adresler: /kvkk.html ve /legal/kvkk.html ->
  med.bardino.app/legal/kvkk.html; /legal/gdpr.html, /legal/kvkk-basvuru.html,
  /legal/gdpr-request.html, /privacy-policy.html, /terms-of-use.html ayni yola.
- Studyo sayfalari (/en/, /ar/, /pt/ ve gizlilik/kosul sayfalari) https://bardino.app/
  adresine, Turkce olanlar https://bardino.app/tr/ adresine gider.
- Kok sayfa: eczane QR kodlari https://dozi.app?utm_source=pharmacy&utm_campaign=ID&promo=KOD
  basili ve eskiden Dozi ana sayfasina iniyordu. Sorguda promo ya da utm_source=pharmacy
  varsa kok sayfa sorguyu koruyarak https://med.bardino.app/ adresine gider, yoksa
  https://bardino.app/tr/ adresine.
- Bilinmeyen yollar 404.html uzerinden yol ve sorgu korunarak med.bardino.app'e gider.
- .well-known/assetlinks.json bayt bayt korunur: Dozi Android uygulamasi https://www.dozi.app/app/*
  icin App Links dogrulamasini bu dosyadan yapar; yonlendirilirse dogrulama duser. CNAME bu
  yuzden www.dozi.app kalir.
- dozi/sw.js, dozi/firebase-messaging-sw.js ve dozi_brand.png bilerek duruyor: eski /dozi/ PWA'sini
  kurmus tarayicilar service worker guncellemesi ve bildirim ikonu icin bunlari hala cekiyor.
  SW sayfa gezinmesini once agdan aldigi icin stub'lar yine calisir.

Dozi uygulamasindaki www.dozi.app linkleri ve App Links yeni adrese gecip dozi.app
devredildiginde bu depo silinebilir.
