/**
 * 🚀 Dozi Launch Popup
 * Göz alıcı, modern ve etkileşimli popup
 */

// LocalStorage key
const POPUP_SHOWN_KEY = 'dozi_launch_popup_shown';
const POPUP_VERSION = '1.1'; // Versiyon değiştirince tekrar gösterir

// Popup gösterildi mi kontrol et
function shouldShowPopup() {
    const shown = localStorage.getItem(POPUP_SHOWN_KEY);
    console.log('🔍 Popup check - Stored version:', shown, 'Current version:', POPUP_VERSION);
    return shown !== POPUP_VERSION;
}

// Popup'ı göster
function showLaunchPopup() {
    console.log('🚀 showLaunchPopup called');
    
    if (!shouldShowPopup()) {
        console.log('⏭️ Popup already shown, skipping');
        return;
    }
    
    console.log('✅ Showing popup!');

    // Popup HTML'i oluştur
    const popupHTML = `
        <div class="launch-popup-overlay" id="launchPopupOverlay">
            <div class="launch-popup">
                <!-- Confetti animasyonu -->
                <div class="confetti-container">
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                    <div class="confetti"></div>
                </div>

                <!-- Kapat butonu -->
                <button class="launch-popup-close" onclick="closeLaunchPopup()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <!-- İçerik -->
                <div class="launch-popup-content">
                    <!-- Dozi karakteri -->
                    <div class="launch-popup-character">
                        <img src="dozi_happy5.webp" alt="Dozi" class="launch-character-img">
                        <div class="launch-character-glow"></div>
                    </div>

                    <!-- Başlık -->
                    <div class="launch-popup-badge">
                        <span class="launch-badge-icon">🎉</span>
                        <span>Artık Yayında!</span>
                    </div>

                    <h2 class="launch-popup-title">
                        <span class="launch-title-gradient">Dozi</span> Artık<br>
                        Google Play'de!
                    </h2>

                    <p class="launch-popup-description">
                        Yapay zeka destekli akıllı ilaç hatırlatıcınız hazır. 
                        <strong>Ücretsiz</strong> indirin, sağlıklı yaşamınıza başlayın!
                    </p>

                    <!-- Özellikler -->
                    <div class="launch-popup-features">
                        <div class="launch-feature">
                            <span class="launch-feature-icon">🤖</span>
                            <span>AI Asistan</span>
                        </div>
                        <div class="launch-feature">
                            <span class="launch-feature-icon">👨‍👩‍👧</span>
                            <span>Aile Takibi</span>
                        </div>
                        <div class="launch-feature">
                            <span class="launch-feature-icon">📱</span>
                            <span>Kolay Mod</span>
                        </div>
                    </div>

                    <!-- CTA Butonları -->
                    <div class="launch-popup-actions">
                        <a href="https://play.google.com/store/apps/details?id=com.bardino.dozi" 
                           class="launch-btn-primary" 
                           onclick="trackPopupClick('download')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                            </svg>
                            <span>Google Play'den İndir</span>
                        </a>
                        <button class="launch-btn-secondary" onclick="closeLaunchPopup()">
                            Daha Sonra
                        </button>
                    </div>

                    <!-- Sosyal medya -->
                    <div class="launch-popup-social">
                        <span class="launch-social-text">Bizi takip edin:</span>
                        <div class="launch-social-links">
                            <a href="https://www.instagram.com/doziapp" target="_blank" aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
                                </svg>
                            </a>
                            <a href="https://www.tiktok.com/@doziapp" target="_blank" aria-label="TikTok">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16.6,5.82C15.9,5.03 15.5,4 15.5,2.94V2H12.5V15.5C12.5,16.88 11.38,18 10,18C8.62,18 7.5,16.88 7.5,15.5C7.5,14.12 8.62,13 10,13C10.34,13 10.65,13.07 10.94,13.18V10.06C10.64,10.03 10.32,10 10,10C6.69,10 4,12.69 4,16C4,19.31 6.69,22 10,22C13.31,22 16,19.31 16,16V8.83C17.14,9.63 18.5,10.13 20,10.13V7.13C18.4,7.13 17.03,6.29 16.6,5.82Z"/>
                                </svg>
                            </a>
                            <a href="https://x.com/Doziapp" target="_blank" aria-label="X (Twitter)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a href="https://www.facebook.com/doziappilactakibi" target="_blank" aria-label="Facebook">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Body'ye ekle
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Animasyon için kısa gecikme
    setTimeout(() => {
        document.getElementById('launchPopupOverlay').classList.add('active');
    }, 100);

    // Analytics
    if (window.gtag) {
        gtag('event', 'popup_shown', {
            'event_category': 'engagement',
            'event_label': 'launch_popup'
        });
    }
}

// Popup'ı kapat
function closeLaunchPopup() {
    const overlay = document.getElementById('launchPopupOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }

    // LocalStorage'a kaydet
    localStorage.setItem(POPUP_SHOWN_KEY, POPUP_VERSION);

    // Analytics
    if (window.gtag) {
        gtag('event', 'popup_closed', {
            'event_category': 'engagement',
            'event_label': 'launch_popup'
        });
    }
}

// Click tracking
function trackPopupClick(action) {
    if (window.gtag) {
        gtag('event', 'popup_click', {
            'event_category': 'engagement',
            'event_label': action
        });
    }
    
    // Popup'ı kapat
    localStorage.setItem(POPUP_SHOWN_KEY, POPUP_VERSION);
}

// Overlay'e tıklanınca kapat
document.addEventListener('click', (e) => {
    if (e.target.id === 'launchPopupOverlay') {
        closeLaunchPopup();
    }
});

// ESC tuşu ile kapat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLaunchPopup();
    }
});

// Sayfa yüklendiğinde göster (2 saniye gecikme ile)
window.addEventListener('load', () => {
    console.log('📄 Page loaded, will show popup in 2 seconds...');
    setTimeout(showLaunchPopup, 2000);
});
