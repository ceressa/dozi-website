// ========================================
// INTERACTIVE FEATURES
// ========================================
// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, observerOptions);

// Observe all fade-in sections
document.querySelectorAll('.fade-in-section').forEach(el => {
    observer.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// SCREENSHOT CAROUSEL
// ========================================
let currentSlideIndex = 1;
showSlide(currentSlideIndex);

function moveCarousel(n) {
    showSlide(currentSlideIndex += n);
}

function currentSlide(n) {
    showSlide(currentSlideIndex = n);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');

    if (n > slides.length) { currentSlideIndex = 1; }
    if (n < 1) { currentSlideIndex = slides.length; }

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (slides[currentSlideIndex - 1]) {
        slides[currentSlideIndex - 1].classList.add('active');
    }
    if (dots[currentSlideIndex - 1]) {
        dots[currentSlideIndex - 1].classList.add('active');
    }
}

// Auto-advance carousel every 5 seconds
setInterval(() => {
    moveCarousel(1);
}, 5000);

// ========================================
// FAQ ACCORDION
// ========================================
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// ========================================
// STICKY CTA BUTTON
// ========================================
window.addEventListener('scroll', () => {
    const stickyCTA = document.getElementById('stickyCTA');
    const heroSection = document.querySelector('.hero');

    if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

        if (window.scrollY > heroBottom) {
            stickyCTA.classList.add('show');
        } else {
            stickyCTA.classList.remove('show');
        }
    }
});

// ========================================
// COOKIE CONSENT BANNER
// ========================================
function checkCookieConsent() {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
        setTimeout(() => {
            document.getElementById('cookieBanner').classList.add('show');
        }, 1000);
    }
}

function acceptCookies() {
    localStorage.setItem('cookie_consent', 'all');
    localStorage.setItem('analytics_cookies', 'true');
    localStorage.setItem('functional_cookies', 'true');
    document.getElementById('cookieBanner').classList.remove('show');
    console.log('All cookies accepted');
}

function rejectCookies() {
    localStorage.setItem('cookie_consent', 'essential');
    localStorage.setItem('analytics_cookies', 'false');
    localStorage.setItem('functional_cookies', 'false');
    document.getElementById('cookieBanner').classList.remove('show');
    console.log('Only essential cookies accepted');
}

function showCookieSettings() {
    document.getElementById('cookieModal').classList.add('show');
}

function closeCookieSettings() {
    document.getElementById('cookieModal').classList.remove('show');
}

function saveCookieSettings() {
    const analytics = document.getElementById('analyticsCookies').checked;
    const functional = document.getElementById('functionalCookies').checked;

    localStorage.setItem('cookie_consent', 'custom');
    localStorage.setItem('analytics_cookies', analytics);
    localStorage.setItem('functional_cookies', functional);

    document.getElementById('cookieBanner').classList.remove('show');
    document.getElementById('cookieModal').classList.remove('show');

    console.log('Cookie preferences saved:', { analytics, functional });
}

// Check consent on page load
checkCookieConsent();


// ========================================
// LOADING ANIMATION
// ========================================
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1500); // Animation runs for at least 1.5s
    }
});

// ========================================
// MULTI-LANGUAGE SUPPORT
// ========================================
const translations = {
    tr: {
        features: 'Özellikler',
        testimonials: 'Yorumlar',
        faq: 'SSS',
        download: 'İndir',
        privacy: 'Gizlilik',
        account: 'Hesap',
        heroTitle: 'Sağlıklı Yaşam Asistanınız 💧',
        heroSubtitle: 'İlaç takibini kolaylaştıran, sağlığınızı kontrol altında tutan sevimli sağlık asistanı',
        heroBadge1: '✓ 10,000+ Mutlu Kullanıcı',
        heroBadge2: '✓ KVKK Uyumlu',
        heroBadge3: '✓ Ücretsiz',
        downloadBtn: 'Hemen İndir',
        featuresBtn: 'Özellikleri Keşfet',
        featuresTitle: 'Neden Dozi? ✨',
        featuresDesc: 'Sağlığınız için her şey bir arada!',
        feature1Title: 'Akıllı Hatırlatmalar',
        feature1Desc: 'İlaçlarınızı zamanında almanız için özelleştirilebilir bildirimler ve sevimli sesli uyarılar',
        feature2Title: 'Kolay Takip',
        feature2Desc: 'İlaçlarınızı, dozlarınızı ve stok durumunuzu tek ekranda görün ve kolayca yönetin',
        feature3Title: 'Bulut Yedekleme',
        feature3Desc: 'Verileriniz güvenle bulutta saklanır ve tüm cihazlarınızda senkronize olur',
        feature4Title: 'Aile Takibi',
        feature4Desc: 'Sevdiklerinizin ilaç uyumunu uzaktan kontrol edin ve destek olun',
        feature5Title: 'Oyunlaştırma',
        feature5Desc: 'Streak sistemi ve başarı rozetleri ile motivasyonunuzu yüksek tutun',
        feature6Title: 'Çoklu Profil',
        feature6Desc: 'Tüm aile üyelerinizin ilaçlarını tek uygulamada yönetin',
        stat1: 'Mutlu Kullanıcı 😊',
        stat2: 'Gönderilen Hatırlatma 📬',
        stat3: 'Memnuniyet Oranı ⭐',
        stat4: 'Uygulama Puanı',
        testimonialsTitle: 'Kullanıcılarımız Ne Diyor? 💬',
        testimonialsDesc: 'Binlerce mutlu kullanıcımızdan bazıları',
        downloadTitle: 'Hemen İndirin! 🎉',
        downloadDesc: 'Dozi\'yi bugün indirin ve sağlıklı yaşam yolculuğunuza başlayın!',
        downloadNow: 'Şimdi İndir',
        pricingTitle: 'Ücretsiz mi, Premium mi? 💎',
        pricingDesc: 'Size en uygun planı seçin!',
        freePlan: 'Ücretsiz',
        premiumPlan: 'Premium',
        month: '/ay',
        mostPopular: 'En Popüler',
        roadmapTitle: 'Yol Haritamız 🗺️',
        roadmapDesc: 'Yakında gelecek heyecan verici özellikler!',
        completed: 'Tamamlandı',
        inProgress: 'Geliştiriliyor',
        planned: 'Planlandı',
        footerLinks: 'Hızlı Bağlantılar',
        footerLegal: 'Yasal',
        footerContact: 'İletişim',
        cookieTitle: 'Çerez Kullanımı',
        cookieText: 'Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz.',
        cookieAccept: 'Tümünü Kabul Et',
        cookieReject: 'Tümünü Reddet',
        cookieSettings: 'Ayarla'
    },
    en: {
        features: 'Features',
        testimonials: 'Testimonials',
        faq: 'FAQ',
        download: 'Download',
        privacy: 'Privacy',
        account: 'Account',
        heroTitle: 'Your Healthy Life Assistant 💧',
        heroSubtitle: 'The cute health assistant that makes medication tracking easy and keeps your health under control',
        heroBadge1: '✓ 10,000+ Happy Users',
        heroBadge2: '✓ GDPR Compliant',
        heroBadge3: '✓ Free',
        downloadBtn: 'Download Now',
        featuresBtn: 'Explore Features',
        featuresTitle: 'Why Dozi? ✨',
        featuresDesc: 'Everything for your health in one place!',
        feature1Title: 'Smart Reminders',
        feature1Desc: 'Customizable notifications and cute voice alerts to help you take your meds on time',
        feature2Title: 'Easy Tracking',
        feature2Desc: 'View and manage your medications, doses, and stock status on a single screen',
        feature3Title: 'Cloud Backup',
        feature3Desc: 'Your data is safely stored in the cloud and synced across all your devices',
        feature4Title: 'Family Tracking',
        feature4Desc: 'Remotely monitor and support your loved ones medication adherence',
        feature5Title: 'Gamification',
        feature5Desc: 'Keep your motivation high with streak system and achievement badges',
        feature6Title: 'Multi-Profile',
        feature6Desc: 'Manage medications for all family members in a single app',
        stat1: 'Happy Users 😊',
        stat2: 'Reminders Sent 📬',
        stat3: 'Satisfaction Rate ⭐',
        stat4: 'App Rating',
        testimonialsTitle: 'What Our Users Say? 💬',
        testimonialsDesc: 'Some of our thousands of happy users',
        downloadTitle: 'Download Now! 🎉',
        downloadDesc: 'Download Dozi today and start your healthy life journey!',
        downloadNow: 'Download Now',
        pricingTitle: 'Free or Premium? 💎',
        pricingDesc: 'Choose the plan that suits you best!',
        freePlan: 'Free',
        premiumPlan: 'Premium',
        month: '/mo',
        mostPopular: 'Most Popular',
        roadmapTitle: 'Our Roadmap 🗺️',
        roadmapDesc: 'Exciting features coming soon!',
        completed: 'Completed',
        inProgress: 'In Progress',
        planned: 'Planned',
        footerLinks: 'Quick Links',
        footerLegal: 'Legal',
        footerContact: 'Contact',
        cookieTitle: 'Cookie Usage',
        cookieText: 'We use cookies to improve your experience on our website.',
        cookieAccept: 'Accept All',
        cookieReject: 'Reject All',
        cookieSettings: 'Settings'
    }
};

function switchLanguage(lang) {
    localStorage.setItem('selected_language', lang);

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === lang) {
            btn.classList.add('active');
        }
    });

    // Simple text replacement
    if (lang === 'en') {
        document.documentElement.lang = 'en';
    } else {
        document.documentElement.lang = 'tr';
    }

    // Replace all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Check saved language on load
window.addEventListener('load', () => {
    const savedLang = localStorage.getItem('selected_language') || 'tr';
    if (savedLang === 'en') {
        switchLanguage('en');
    }
});
