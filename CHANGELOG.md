# Dozi Website - Changelog

All notable changes to the Dozi website and web dashboard will be documented in this file.

## [Unreleased]

### v1.1.0 - Web Dashboard Redesign (2026-02-02)
**Type:** Feature | **Impact:** High

#### Added
- ✨ Modern web dashboard with Firebase integration
- 🎨 Timeline-based "Bugün" (Today) page with medication schedule
- 💊 Enhanced "İlaçlarım" (My Medicines) page with beautiful cards
- 👥 Redesigned "Badilerim" (My Buddies) page with avatar cards
- 📊 Comprehensive "İstatistikler" (Statistics) page with monthly charts
- 🖼️ Dozi brand images throughout the UI (dozi_brand.webp, dozi_happy.webp, dozi_logo.webp)
- 🎯 Action buttons: Al (Take), Atla (Skip), Ertele (Postpone)
- 🔔 Toast notification system for user feedback
- 📱 Fully responsive mobile design

#### Fixed
- 🐛 Fixed Firestore Timestamp serialization errors (.toDate() issues)
- 🔧 Converted all `.toDate()` calls to `new Date()` for ISO string compatibility
- 🎨 Improved empty states with Dozi character images

#### Technical
- Backend: Firebase Functions (`getUserDashboardData`, `markMedicationTaken`)
- Frontend: Vanilla JS with Chart.js for visualizations
- Security: Firebase Auth integration with proper session management
- Cache-busting: Added version parameter to JS imports (?v=4)

**Files:**
- `dozi/dashboard.html` - Main dashboard structure
- `dozi/dashboard.js` - Dashboard logic and Firebase integration
- `dozi/dashboard.css` - Modern styling with CSS variables
- `dozi/images/` - Dozi brand images folder

---

## Previous Versions

### v1.0.0 - Initial Website Launch
- Static website with blog, legal pages, and app download links
- Turkish and English language support
- SEO optimization and sitemap
- Cookie policy and GDPR compliance
