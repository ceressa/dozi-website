# Dozi Website - Changelog

All notable changes to the Dozi website and web dashboard will be documented in this file.

## [Unreleased]

### v1.4.0 - Medicine Management, Enhanced Stats & Settings (2026-02-02)
**Type:** Feature | **Impact:** High

#### Added
- 💊 **Medicine Management System**
  - Add new medicines directly from web dashboard
  - Edit existing medicines (name, dosage, form, times, stock, notes)
  - Delete medicines with confirmation
  - Multiple reminder times per medicine
  - Stock tracking support
  - Medicine form selection (tablet, capsule, syrup, etc.)
  - Frequency options (daily, weekly, interval, as needed)

- 📊 **Enhanced Statistics**
  - Daily pattern chart showing medication times by hour
  - Medicine-specific adherence rates (horizontal bar chart)
  - Color-coded adherence (green ≥80%, orange ≥60%, red <60%)
  - Last 30 days analysis for all charts

- ⚙️ **Settings & Preferences**
  - Web push notifications toggle
  - Notification sound control
  - Reminder frequency settings (15/30/60 min)
  - Quiet hours configuration (start/end time)
  - Theme selection (light/dark/auto)
  - Settings persistence in Firestore
  - Reset settings option

#### Technical
- Modal system for medicine add/edit
- Form validation and error handling
- Firestore integration for settings storage
- Chart.js integration for new visualizations
- Responsive design for all new features

**Files:** `dashboard.html`, `dashboard.css`, `dashboard.js`

---

### v1.3.0 - Real-time Notification System & Animated Background (2026-02-02)
**Type:** Feature | **Impact:** High

#### Added
- 🔔 **Real-time notification panel** with live updates from Firestore reminderLogs
- 📊 **Notification badge** with unread count and pulse animation
- 🎨 **Animated gradient background** with smooth color transitions (15s cycle)
- 🌈 **Radial gradient overlays** for depth and visual interest
- 🔴 **Notification types**: reminder (yellow), alert (red), success (green)
- ⏰ **Time ago display**: "Az önce", "5 dk önce", "2 saat önce"
- 📱 **Slide-in notification panel** from right side (full-screen on mobile)
- 👁️ **Auto-read notifications** after 1 second of panel open
- 🔄 **Firestore snapshot listener** for real-time updates
- 🎯 **Event tracking**: NOTIFICATION_SENT, ALARM_TRIGGERED, ALARM_SCHEDULED

#### Changed
- 🎨 Background upgraded from static gradient to animated multi-color gradient
- 🔔 Notification bell icon added to header with badge
- 📐 Improved z-index layering for proper stacking

#### Technical
- Real-time Firestore listener on `users/{userId}/reminderLogs` collection
- Notification panel with overlay and smooth animations
- CSS keyframe animations for gradient shift
- Mobile-responsive notification panel (400px desktop, 100% mobile)

**Files:**
- `dozi/dashboard.html` - Added notification panel and overlay
- `dozi/dashboard.js` - Notification system logic and Firestore listener
- `dozi/dashboard.css` - Animated background and notification panel styles

---

### v1.2.2 - Dynamic Dozi Character Animations (2026-02-02)
**Type:** Enhancement | **Impact:** Medium

#### Added
- 🎭 **14 different Dozi emotions**: happy, bravo, congrats, king, love, star, time, anxious, cry, waiting, morning, sleepy, wink, idea, noted
- 🎬 **Animated GIFs**: Special moments use animated Dozi (congrats, king, love, star, time)
- ⏰ **Time-based greetings**: Morning, afternoon, evening messages with appropriate Dozi
- 🎨 **Contextual empty states**: Different Dozi images for each empty state (waiting, family, happy5)
- 👋 **Welcome animation**: Loading screen uses hosgeldin_anim.gif
- 💬 **Interactive Dozi**: Click for random encouraging messages with emotions
- 🎯 **Action feedback**: Different Dozi reactions for taken/skipped medications

#### Changed
- 🖼️ All Dozi images now use relative paths (../images/)
- 🎨 Loading screen uses larger animated Dozi (120px)

#### Technical
- Emotion-to-image mapping system
- Dynamic image switching based on context
- Auto-reset to default Dozi after 5 seconds

---

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
