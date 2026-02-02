# Dozi Website - Changelog

All notable changes to the Dozi website and web dashboard will be documented in this file.

## [Unreleased]

### v1.2.1 - Multi-Tab Dashboard (2026-02-02)
**Type:** Feature | **Impact:** High

#### Added
- 🎯 **Tab navigation system** with 4 sections (Bugün, İlaçlarım, İstatistikler, Badilerim)
- 💊 **Medicines tab**: Grid view of all active medicines with dosage times
- 📊 **Stats tab**: Adherence rate, streak counter, weekly performance chart
- 👥 **Badis tab**: Family members tracking with today's medication progress
- 📱 **Mobile-responsive tabs**: Icons only on mobile, full labels on desktop
- 📈 **Chart.js integration**: Weekly stats visualization with line chart
- ⚡ **Smart data loading**: Each tab loads data only when accessed

#### Changed
- 🔄 Reorganized dashboard into tabbed interface for better UX
- 🎨 Improved navigation with active state indicators

#### Technical
- Tab switching with smooth fade animations
- Real-time Firestore queries for badis data
- Chart.js for data visualization
- Responsive grid layouts for all tabs

---

### v1.2.0 - Dozi Timeline Dashboard (2026-02-02)
**Type:** Feature | **Impact:** High

#### Added
- ✨ **Complete dashboard redesign** with unique glassmorphism + gradient UI
- 🎨 **Timeline view** with color-coded medication status (green/red/orange)
- ⚡ **Real-time UI updates** after marking medications (no page reload)
- 🤖 **Auto-mark missed medications** if 30+ minutes past scheduled time
- 📅 **Chronological sorting** from past to future
- 📊 **Stats bar** with 4 key metrics (Taken, Pending, Missed, Streak)
- 🔍 **Filter buttons** (All, Pending, Taken, Missed)
- 💬 **Floating Dozi character** with interactive speech bubbles
- 🔔 **Toast notifications** for user feedback
- 📱 **Mobile-first responsive design** with modern animations
- 🎯 **Direct Firestore writes** (no Firebase Functions dependency)

#### Changed
- 🔄 Old dashboard.html now redirects to dashboard-v2.html
- 🎨 Switched from generic design to unique Dozi-branded experience
- ⚡ Improved performance with direct Firestore access

#### Technical
- Files: `dashboard-v2.html`, `dashboard-v2.css`, `dashboard-v2.js`
- Design: Glassmorphism, gradient backgrounds, smooth animations
- Icons: Remix Icons for consistent iconography
- Fonts: Inter font family for modern typography

---

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
