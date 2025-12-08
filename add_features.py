#!/usr/bin/env python3
"""
Add remaining features to the refactored files
"""

# Cookie Banner CSS
cookie_css = """

/* ========================================
   COOKIE CONSENT BANNER
   ======================================== */
.cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transform: translateY(100%);
    transition: transform 0.4s ease-out;
}

.cookie-banner.show {
    transform: translateY(0);
}

.cookie-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
    align-items: center;
}

.cookie-icon {
    font-size: 3rem;
}

.cookie-text h3 {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    color: var(--dozi-dark);
}

.cookie-text p {
    margin: 0;
    color: var(--dozi-gray);
    font-size: 0.95rem;
}

.cookie-text a {
    color: var(--dozi-turquoise);
    text-decoration: underline;
}

.cookie-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.cookie-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.95rem;
}

.cookie-accept {
    background: linear-gradient(135deg, var(--dozi-turquoise) 0%, var(--dozi-blue) 100%);
    color: white;
}

.cookie-accept:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(64, 224, 208, 0.4);
}

.cookie-reject {
    background: #e9ecef;
    color: var(--dozi-dark);
}

.cookie-reject:hover {
    background: #dee2e6;
}

.cookie-customize {
    background: white;
    color: var(--dozi-turquoise);
    border: 2px solid var(--dozi-turquoise);
}

.cookie-customize:hover {
    background: var(--dozi-turquoise);
    color: white;
}

.cookie-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1001;
    align-items: center;
    justify-content: center;
}

.cookie-modal.show {
    display: flex;
}

.cookie-modal-content {
    background: white;
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.cookie-modal-header {
    padding: 2rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cookie-modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.cookie-modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--dozi-gray);
    transition: color 0.3s;
}

.cookie-modal-close:hover {
    color: var(--dozi-dark);
}

.cookie-modal-body {
    padding: 2rem;
}

.cookie-category {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--dozi-light-blue);
    border-radius: 15px;
}

.cookie-category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cookie-category h4 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
}

.cookie-category p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--dozi-gray);
}

.cookie-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
}

.cookie-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.cookie-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 30px;
}

.cookie-slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

.cookie-switch input:checked + .cookie-slider {
    background-color: var(--dozi-turquoise);
}

.cookie-switch input:checked + .cookie-slider:before {
    transform: translateX(30px);
}

.cookie-switch input:disabled + .cookie-slider {
    opacity: 0.5;
    cursor: not-allowed;
}

.cookie-modal-footer {
    padding: 2rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cookie-policy-link {
    color: var(--dozi-turquoise);
    text-decoration: none;
    font-weight: 500;
}

.cookie-policy-link:hover {
    text-decoration: underline;
}

/* ========================================
   COMPARISON TABLE
   ======================================== */
.comparison {
    padding: 6rem 2rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 244, 248, 0.6) 100%);
}

.comparison-container {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
}

.comparison-card {
    background: white;
    border-radius: 25px;
    padding: 3rem 2rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
    position: relative;
}

.comparison-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

.comparison-card.featured {
    border: 3px solid var(--dozi-turquoise);
    transform: scale(1.05);
}

.comparison-card.featured:hover {
    transform: scale(1.05) translateY(-10px);
}

.popular-badge {
    position: absolute;
    top: -15px;
    right: 2rem;
    background: linear-gradient(135deg, var(--dozi-turquoise) 0%, var(--dozi-pink) 100%);
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.9rem;
}

.plan-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid #e9ecef;
}

.plan-header h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--dozi-dark);
}

.plan-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
}

.price {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--dozi-turquoise) 0%, var(--dozi-pink) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.period {
    font-size: 1.2rem;
    color: var(--dozi-gray);
}

.plan-features {
    list-style: none;
    margin: 0 0 2rem;
    padding: 0;
}

.plan-features li {
    padding: 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--dozi-gray);
}

.check {
    color: var(--dozi-turquoise);
    font-size: 1.2rem;
    font-weight: 700;
}

.cross {
    color: #dee2e6;
    font-size: 1.2rem;
}

.plan-btn {
    display: block;
    width: 100%;
    padding: 1rem 2rem;
    border-radius: 25px;
    text-align: center;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.3s;
    border: 2px solid var(--dozi-turquoise);
    color: var(--dozi-turquoise);
    background: white;
}

.plan-btn:hover {
    background: var(--dozi-turquoise);
    color: white;
    transform: translateY(-2px);
}

.plan-btn.premium {
    background: linear-gradient(135deg, var(--dozi-turquoise) 0%, var(--dozi-pink) 100%);
    color: white;
    border: none;
}

.plan-btn.premium:hover {
    box-shadow: 0 10px 30px rgba(64, 224, 208, 0.4);
}

/* ========================================
   ROADMAP
   ======================================== */
.roadmap {
    padding: 6rem 2rem;
    background: white;
}

.roadmap-container {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
}

.roadmap-container::before {
    content: '';
    position: absolute;
    left: 30px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--dozi-turquoise) 0%, var(--dozi-pink) 100%);
}

.roadmap-item {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    position: relative;
}

.roadmap-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    z-index: 1;
}

.roadmap-content {
    flex: 1;
    background: var(--dozi-light-blue);
    padding: 2rem;
    border-radius: 20px;
    transition: all 0.3s;
}

.roadmap-content:hover {
    transform: translateX(10px);
    box-shadow: 0 8px 25px rgba(64, 224, 208, 0.15);
}

.roadmap-content h3 {
    margin: 0 0 0.5rem;
    font-size: 1.3rem;
    color: var(--dozi-dark);
}

.roadmap-content p {
    margin: 0 0 1rem;
    color: var(--dozi-gray);
}

.roadmap-status {
    display: inline-block;
    padding: 0.4rem 1rem;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 600;
}

.completed-status {
    background: #d4edda;
    color: #155724;
}

.progress-status {
    background: #fff3cd;
    color: #856404;
}

.planned-status {
    background: #d1ecf1;
    color: #0c5460;
}

@media (max-width: 768px) {
    .cookie-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        text-align: center;
    }

    .cookie-buttons {
        justify-content: center;
    }

    .cookie-btn {
        flex: 1;
        min-width: 120px;
    }

    .comparison-container {
        grid-template-columns: 1fr;
    }

    .comparison-card.featured {
        transform: scale(1);
    }

    .comparison-card.featured:hover {
        transform: translateY(-10px);
    }

    .roadmap-container::before {
        left: 20px;
    }

    .roadmap-icon {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
    }

    .roadmap-item {
        gap: 1rem;
    }
}
"""

# Append to CSS file
with open('css/styles.css', 'a', encoding='utf-8') as f:
    f.write(cookie_css)

print("✅ Added Cookie Banner, Comparison Table, and Roadmap CSS")

# Cookie Banner JavaScript
cookie_js = """

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
"""

# Append to JS file
with open('js/scripts.js', 'a', encoding='utf-8') as f:
    f.write(cookie_js)

print("✅ Added Cookie Banner JavaScript")
print("\n🎉 All features added successfully!")
print("   - Cookie Banner CSS & JS")
print("   - Comparison Table CSS")
print("   - Roadmap CSS")
