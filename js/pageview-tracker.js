// Dozi Website - Page View Tracker
// Firestore'a sayfa görüntülenmelerini kaydeder

(function() {
    'use strict';
    
    // Firebase config (public - sadece write izni var)
    const firebaseConfig = {
        apiKey: "AIzaSyBxHxH8H9H9H9H9H9H9H9H9H9H9H9H9H9H",
        authDomain: "dozi-app.firebaseapp.com",
        projectId: "dozi-app",
        storageBucket: "dozi-app.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:abcdef1234567890abcdef"
    };
    
    // Sayfa görüntüleme verilerini topla
    function collectPageViewData() {
        const path = window.location.pathname;
        const referrer = document.referrer || 'direct';
        const userAgent = navigator.userAgent;
        
        // Basit bot detection
        const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
        if (isBot) return null;
        
        // Sayfa kategorisi
        let category = 'home';
        if (path.includes('/blog/')) category = 'blog';
        else if (path.includes('/en/')) category = 'english';
        else if (path.includes('/legal/')) category = 'legal';
        
        // Sayfa başlığı
        const pageTitle = document.title;
        
        return {
            path: path,
            title: pageTitle,
            category: category,
            referrer: referrer,
            timestamp: new Date().toISOString(),
            userAgent: userAgent,
            language: navigator.language || 'unknown',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        };
    }
    
    // Firestore'a kaydet (Cloud Function üzerinden)
    async function trackPageView() {
        const data = collectPageViewData();
        if (!data) return; // Bot ise kaydetme
        
        try {
            // Cloud Function endpoint'ine POST
            const response = await fetch('https://us-central1-dozi-app.cloudfunctions.net/trackPageView', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                console.warn('PageView tracking failed:', response.status);
            }
        } catch (error) {
            // Sessizce başarısız ol - kullanıcı deneyimini etkileme
            console.warn('PageView tracking error:', error);
        }
    }
    
    // Sayfa yüklendiğinde track et
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }
})();
