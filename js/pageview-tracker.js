// Dozi Website - Page View Tracker
// Firestore'a sayfa görüntülenmelerini kaydeder (Cloud Function üzerinden)

(function() {
    'use strict';

    // Sayfa görüntüleme verilerini topla
    function collectPageViewData() {
        var userAgent = navigator.userAgent;

        // Basit bot detection
        if (/bot|crawler|spider|crawling/i.test(userAgent)) return null;

        var path = window.location.pathname;

        // Sayfa kategorisi
        var category = 'home';
        if (path.includes('/blog/') || path.includes('/blog')) category = 'blog';
        else if (path.includes('/en/') || path.includes('/en')) category = 'english';
        else if (path.includes('/legal/')) category = 'legal';
        else if (path.includes('/faq') || path.includes('/sss')) category = 'faq';
        else if (path.includes('/privacy') || path.includes('/gizlilik')) category = 'legal';

        // Session ID
        var sid = sessionStorage.getItem('dozi_sid');
        if (!sid) {
            sid = Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
            sessionStorage.setItem('dozi_sid', sid);
        }

        // Referrer - sadece harici kaynaklar
        var referrer = document.referrer || 'direct';
        try {
            if (referrer !== 'direct') {
                var h = new URL(referrer).hostname;
                if (h && h.indexOf('dozi.app') !== -1) referrer = 'direct';
                else referrer = h || 'direct';
            }
        } catch(e) { referrer = 'direct'; }

        // UTM parametreleri
        var params = new URLSearchParams(window.location.search);

        return {
            path: path,
            title: document.title,
            category: category,
            referrer: referrer,
            timestamp: new Date().toISOString(),
            userAgent: userAgent,
            language: navigator.language || 'unknown',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            sessionId: sid,
            utmSource: params.get('utm_source') || '',
            utmMedium: params.get('utm_medium') || '',
            utmCampaign: params.get('utm_campaign') || ''
        };
    }

    // Firestore'a kaydet (Cloud Function üzerinden)
    async function trackPageView() {
        var data = collectPageViewData();
        if (!data) return;

        try {
            await fetch('https://europe-west3-dozi-cd7cc.cloudfunctions.net/trackPageView', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            // Sessizce basarisiz ol
        }
    }

    // Sayfa yüklendiğinde track et
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }
})();
