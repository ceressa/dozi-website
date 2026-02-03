// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqxped2ZQS7uJHCX-MmCq0Nnj5Vtudloo",
    authDomain: "dozi-cd7cc.firebaseapp.com",
    projectId: "dozi-cd7cc",
    storageBucket: "dozi-cd7cc.firebasestorage.app",
    messagingSenderId: "393677078355",
    appId: "1:393677078355:web:415e8d15c58ec4d48ceba6"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Global State
let currentUser = null;
let dashboardData = {
    user: null,
    medicines: [],
    medicationLogs: [],
    timelineItems: [],
    notifications: []
};
let currentFilter = 'all';
let notificationListener = null;

// Inactivity Timer (15 minutes)
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

// Day Change Checker
let dayChangeInterval = null;
let currentDate = new Date().toDateString();

// Auth State
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    await loadDashboard();
    startNotificationListener();
    
    // Start inactivity timer
    startInactivityTimer();
    
    // Start day change checker
    startDayChangeChecker();
});

// Event Listeners
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    if (confirm('Çıkış yapmak istiyor musunuz?')) {
        await auth.signOut();
    }
});

document.getElementById('refreshBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('refreshBtn');
    btn.style.transform = 'rotate(360deg)';
    await loadDashboard();
    setTimeout(() => btn.style.transform = 'rotate(0deg)', 500);
});

// Notification Panel
document.getElementById('notificationBtn')?.addEventListener('click', () => {
    openNotificationPanel();
});

document.getElementById('notificationPanelClose')?.addEventListener('click', () => {
    closeNotificationPanel();
});

document.getElementById('notificationOverlay')?.addEventListener('click', () => {
    closeNotificationPanel();
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTimeline();
    });
});

// Tab switching
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabName + 'Tab').classList.add('active');
        
        // Load data for the tab if needed
        if (tabName === 'medicines') renderMedicines();
        if (tabName === 'reminders') renderReminders();
        if (tabName === 'stats') renderStats();
        if (tabName === 'badis') renderBadis();
        if (tabName === 'settings') loadSettings();
    });
});


// Load Dashboard
async function loadDashboard() {
    try {
        showLoading(true);

        // Fetch user data
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists) {
            throw new Error('Kullanıcı bulunamadı');
        }
        dashboardData.user = userDoc.data();

        // Fetch medicines
        const medicinesSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('medicines')
            .where('isActive', '==', true)
            .get();
        
        dashboardData.medicines = medicinesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch today's logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const logsSnapshot = await db.collection('medication_logs')
            .where('userId', '==', currentUser.uid)
            .where('scheduledTime', '>=', firebase.firestore.Timestamp.fromDate(today))
            .get();

        dashboardData.medicationLogs = logsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Build timeline
        buildTimeline();
        
        // Update UI
        updateHeader();
        updateStats();
        renderTimeline();
        
        showLoading(false);
        
        // Show contextual Dozi message based on stats
        const hour = new Date().getHours();
        if (hour < 12) {
            showDoziMessage('Günaydın! Bugünün ilaçlarını görebilirsin 💊', 'morning');
        } else if (hour < 18) {
            showDoziMessage('Merhaba! İlaçlarını almayı unutma 😊', 'happy');
        } else {
            showDoziMessage('İyi akşamlar! Bugünkü durumunu kontrol et 🌙', 'sleepy');
        }

    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('Veriler yüklenirken hata oluştu: ' + error.message, 'error');
        showLoading(false);
    }
}

// Build Timeline from medicines and logs
function buildTimeline() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const now = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    dashboardData.timelineItems = [];

    // For each medicine, create timeline items for today's doses
    dashboardData.medicines.forEach(medicine => {
        // Check if medicine should be taken today based on frequency
        if (!shouldTakeMedicineToday(medicine, today, dayOfWeek)) {
            return; // Skip this medicine for today
        }

        const times = medicine.times || ['09:00'];
        
        times.forEach(time => {
            const [hour, minute] = time.split(':');
            const scheduledTime = new Date(today);
            scheduledTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

            // Find existing log
            const log = dashboardData.medicationLogs.find(l => 
                l.medicineId === medicine.id && 
                l.scheduledTime && 
                new Date(l.scheduledTime.toDate()).getHours() === parseInt(hour) &&
                new Date(l.scheduledTime.toDate()).getMinutes() === parseInt(minute)
            );

            let status = 'pending';
            let takenAt = null;

            if (log) {
                if (log.status === 'TAKEN' || log.status === 'taken') {
                    status = 'taken';
                    takenAt = log.takenAt;
                } else if (log.status === 'SKIPPED' || log.status === 'skipped') {
                    status = 'missed';
                } else if (log.status === 'MISSED' || log.status === 'missed') {
                    status = 'missed';
                }
            } else {
                // Auto-mark as missed if time has passed (more than 30 minutes)
                const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
                if (scheduledTime < thirtyMinutesAgo) {
                    status = 'missed';
                    // Auto-create missed log
                    autoMarkMissed(medicine.id, scheduledTime);
                }
            }

            dashboardData.timelineItems.push({
                id: log?.id || `${medicine.id}-${time}`,
                medicineId: medicine.id,
                medicineName: medicine.name,
                dosage: medicine.dosage || '1 doz',
                scheduledTime: scheduledTime,
                time: time,
                status: status,
                takenAt: takenAt,
                logId: log?.id
            });
        });
    });

    // Sort by time (chronological)
    dashboardData.timelineItems.sort((a, b) => a.scheduledTime - b.scheduledTime);
}

// Check if medicine should be taken today based on frequency
function shouldTakeMedicineToday(medicine, today, dayOfWeek) {
    let frequency = medicine.frequency || 'DAILY';
    
    // Map Turkish frequency values to English
    const frequencyMap = {
        'Her gün': 'DAILY',
        'Haftanın belirli günleri': 'WEEKLY',
        'Gün aşırı': 'INTERVAL',
        'Gerektiğinde': 'AS_NEEDED'
    };
    
    // Convert Turkish to English if needed
    if (frequencyMap[frequency]) {
        frequency = frequencyMap[frequency];
    }
    
    switch (frequency) {
        case 'DAILY':
            return true;
            
        case 'WEEKLY':
            // Check if today is in the weeklyDays array
            const weeklyDays = medicine.weeklyDays || [];
            // weeklyDays: [1, 3, 5] means Monday, Wednesday, Friday
            // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            return weeklyDays.includes(dayOfWeek);
            
        case 'INTERVAL':
            // Check if today matches the interval pattern
            const intervalDays = medicine.intervalDays || 1;
            const startDate = medicine.startDate ? new Date(medicine.startDate.toDate ? medicine.startDate.toDate() : medicine.startDate) : new Date();
            const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            return daysSinceStart % intervalDays === 0;
            
        case 'AS_NEEDED':
            // As needed medicines don't show in timeline automatically
            return false;
            
        default:
            return true;
    }
}

// Auto-mark missed medications
async function autoMarkMissed(medicineId, scheduledTime) {
    try {
        await db.collection('medication_logs').add({
            userId: currentUser.uid,
            medicineId: medicineId,
            scheduledTime: firebase.firestore.Timestamp.fromDate(scheduledTime),
            status: 'MISSED',
            takenVia: 'WEB_DASHBOARD_AUTO',
            createdAt: firebase.firestore.Timestamp.now()
        });
    } catch (error) {
        console.error('Auto-mark missed error:', error);
    }
}

// Update Header
function updateHeader() {
    document.getElementById('userName').textContent = dashboardData.user.displayName || currentUser.displayName || 'Kullanıcı';
    
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('tr-TR', options);
}

// Update Stats
function updateStats() {
    const taken = dashboardData.timelineItems.filter(item => item.status === 'taken').length;
    const pending = dashboardData.timelineItems.filter(item => item.status === 'pending').length;
    const missed = dashboardData.timelineItems.filter(item => item.status === 'missed').length;
    const streak = dashboardData.user.streak || 0;

    document.getElementById('statTaken').textContent = taken;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statMissed').textContent = missed;
    document.getElementById('statStreak').textContent = streak;
}

// Render Timeline
function renderTimeline() {
    const timeline = document.getElementById('timeline');
    const emptyTimeline = document.getElementById('emptyTimeline');

    // Filter items
    let items = dashboardData.timelineItems;
    if (currentFilter !== 'all') {
        items = items.filter(item => item.status === currentFilter);
    }

    if (items.length === 0) {
        timeline.style.display = 'none';
        emptyTimeline.style.display = 'block';
        return;
    }

    timeline.style.display = 'block';
    emptyTimeline.style.display = 'none';

    timeline.innerHTML = items.map(item => {
        const isPast = item.scheduledTime < new Date();
        const statusText = {
            'taken': 'Alındı',
            'missed': 'Kaçırıldı',
            'pending': isPast ? 'Gecikti' : 'Bekliyor'
        };

        const statusIcon = {
            'taken': 'ri-checkbox-circle-fill',
            'missed': 'ri-close-circle-fill',
            'pending': 'ri-time-fill'
        };

        return `
        <div class="timeline-item ${item.status}" data-id="${item.id}">
            <div class="timeline-card">
                <div class="timeline-time">
                    <i class="${statusIcon[item.status]}"></i>
                    ${item.time}
                </div>
                <div class="timeline-medicine">${item.medicineName}</div>
                <div class="timeline-dosage">${item.dosage}</div>
                <div class="timeline-status ${item.status}">
                    <i class="${statusIcon[item.status]}"></i>
                    ${statusText[item.status]}
                </div>
                ${item.status === 'pending' ? `
                <div class="timeline-actions">
                    <button class="action-btn action-btn-take" onclick="markMedication('${item.medicineId}', '${item.time}', 'taken')">
                        <i class="ri-check-line"></i> Aldım
                    </button>
                    <button class="action-btn action-btn-postpone" onclick="postponeMedication('${item.medicineId}', '${item.time}')">
                        <i class="ri-time-line"></i> Ertele
                    </button>
                    <button class="action-btn action-btn-skip" onclick="markMedication('${item.medicineId}', '${item.time}', 'skipped')">
                        <i class="ri-close-line"></i> Atla
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

// Mark Medication
window.markMedication = async function(medicineId, time, action) {
    const clickedButton = event?.target?.closest('button');
    
    try {
        if (clickedButton) {
            clickedButton.disabled = true;
            clickedButton.innerHTML = '<i class="ri-loader-4-line"></i> İşleniyor...';
        }

        const today = new Date().toISOString().split('T')[0];
        const scheduledDateTime = `${today}T${time}:00`;
        
        // Create or update log
        await db.collection('medication_logs').add({
            userId: currentUser.uid,
            medicineId: medicineId,
            scheduledTime: firebase.firestore.Timestamp.fromDate(new Date(scheduledDateTime)),
            status: action.toUpperCase(),
            takenAt: action === 'taken' ? firebase.firestore.Timestamp.now() : null,
            takenVia: 'WEB_DASHBOARD',
            createdAt: firebase.firestore.Timestamp.now()
        });

        const messages = {
            'taken': '✅ Harika! İlaç alındı olarak işaretlendi',
            'skipped': '⏭️ İlaç atlandı'
        };
        
        showToast(messages[action] || 'İşlem tamamlandı', 'success');
        
        if (action === 'taken') {
            showDoziMessage('Aferin! İlacını almayı unutmadın 🎉', 'bravo');
        } else {
            showDoziMessage('Tamam, not aldım 📝', 'noted');
        }

        // Reload dashboard
        await loadDashboard();

    } catch (error) {
        console.error('Mark medication error:', error);
        showToast('❌ Hata: ' + error.message, 'error');
        
        if (clickedButton) {
            clickedButton.disabled = false;
            const icons = { 'taken': 'check', 'skipped': 'close' };
            const texts = { 'taken': 'Aldım', 'skipped': 'Atla' };
            clickedButton.innerHTML = `<i class="ri-${icons[action]}-line"></i> ${texts[action]}`;
        }
    }
};

// Postpone Medication
window.postponeMedication = async function(medicineId, time) {
    const clickedButton = event?.target?.closest('button');
    
    try {
        if (clickedButton) {
            clickedButton.disabled = true;
            clickedButton.innerHTML = '<i class="ri-loader-4-line"></i> Erteleniyor...';
        }

        // Show postpone options
        const postponeMinutes = await showPostponeDialog();
        
        if (!postponeMinutes) {
            // User cancelled
            if (clickedButton) {
                clickedButton.disabled = false;
                clickedButton.innerHTML = '<i class="ri-time-line"></i> Ertele';
            }
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const scheduledDateTime = `${today}T${time}:00`;
        
        // Create postpone log
        await db.collection('medication_logs').add({
            userId: currentUser.uid,
            medicineId: medicineId,
            scheduledTime: firebase.firestore.Timestamp.fromDate(new Date(scheduledDateTime)),
            status: 'POSTPONED',
            postponedMinutes: postponeMinutes,
            takenVia: 'WEB_DASHBOARD',
            createdAt: firebase.firestore.Timestamp.now()
        });

        showToast(`⏰ İlaç ${postponeMinutes} dakika ertelendi`, 'success');
        showDoziMessage(`Tamam, ${postponeMinutes} dakika sonra tekrar hatırlatırım! ⏰`, 'time');

        // Reload dashboard
        await loadDashboard();

    } catch (error) {
        console.error('Postpone medication error:', error);
        showToast('❌ Hata: ' + error.message, 'error');
        
        if (clickedButton) {
            clickedButton.disabled = false;
            clickedButton.innerHTML = '<i class="ri-time-line"></i> Ertele';
        }
    }
};

// Show Postpone Dialog
function showPostponeDialog() {
    return new Promise((resolve) => {
        const options = [
            { label: '15 dakika', value: 15 },
            { label: '30 dakika', value: 30 },
            { label: '1 saat', value: 60 },
            { label: 'İptal', value: null }
        ];
        
        const message = 'Ne kadar ertelemek istersin?';
        const choice = prompt(message + '\n\n' + options.map((o, i) => `${i + 1}. ${o.label}`).join('\n'));
        
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < options.length) {
            resolve(options[index].value);
        } else {
            resolve(null);
        }
    });
}

// Show Loading
function showLoading(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (show) {
        loadingScreen.classList.remove('hidden');
        appContainer.style.display = 'none';
    } else {
        loadingScreen.classList.add('hidden');
        appContainer.style.display = 'block';
    }
}

// Show Toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show Dozi Message with dynamic image
function showDoziMessage(message, emotion = 'happy') {
    const doziSpeech = document.getElementById('doziSpeech');
    const doziMessage = document.getElementById('doziMessage');
    const doziImg = document.querySelector('.dozi-character img');
    
    // Emotion to image mapping
    const emotions = {
        'happy': 'dozi_happy.webp',
        'bravo': 'dozi_bravo.webp',
        'congrats': 'dozi_congrats_anim.gif',
        'king': 'dozi_king_anim.gif',
        'love': 'dozi_love_anim.gif',
        'star': 'dozi_star_anim.gif',
        'time': 'dozi_time_anim.gif',
        'anxious': 'dozi_anxious.webp',
        'cry': 'dozi_cry.webp',
        'waiting': 'dozi_waiting.webp',
        'morning': 'dozi_morning.webp',
        'sleepy': 'dozi_sleepy.webp',
        'wink': 'dozi_wink.webp',
        'idea': 'dozi_idea.webp',
        'noted': 'dozi_noted.webp'
    };
    
    doziImg.src = `../images/${emotions[emotion] || emotions.happy}`;
    doziMessage.textContent = message;
    doziSpeech.style.display = 'block';
    
    setTimeout(() => {
        doziSpeech.style.display = 'none';
        doziImg.src = '../images/dozi_happy.webp';
    }, 5000);
}

// Dozi Character Click
document.getElementById('doziCharacter')?.addEventListener('click', () => {
    const messages = [
        { text: 'Merhaba! Bugün nasılsın? 😊', emotion: 'happy' },
        { text: 'İlaçlarını almayı unutma! 💊', emotion: 'time' },
        { text: 'Harika gidiyorsun! 🎉', emotion: 'bravo' },
        { text: 'Sağlığın çok önemli! ❤️', emotion: 'love' },
        { text: 'Her gün biraz daha iyisin! 🌟', emotion: 'star' },
        { text: 'Seninle gurur duyuyorum! 👑', emotion: 'king' },
        { text: 'Devam et böyle! 💪', emotion: 'wink' }
    ];
    const random = messages[Math.floor(Math.random() * messages.length)];
    showDoziMessage(random.text, random.emotion);
});


// ============================================
// NOTIFICATION SYSTEM
// ============================================

// Start Real-time Notification Listener
function startNotificationListener() {
    if (!currentUser) return;
    
    // Listen to reminder logs (NOTIFICATION_SENT events)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    notificationListener = db.collection('users')
        .doc(currentUser.uid)
        .collection('reminderLogs')
        .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(today))
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            const notifications = [];
            let hasNewNotification = false;
            
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    
                    // Check if this is a new notification (within last 10 seconds)
                    const notifTime = data.timestamp?.toDate() || new Date();
                    const now = new Date();
                    const diffSeconds = (now - notifTime) / 1000;
                    
                    if (diffSeconds < 10 && data.eventType === 'NOTIFICATION_SENT') {
                        hasNewNotification = true;
                        // Send browser notification
                        sendBrowserNotification(
                            '💊 İlaç Hatırlatması',
                            `${data.medicineName || 'İlaç'} alma zamanı!`,
                            data
                        );
                    }
                }
            });
            
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Create notification from reminder log
                if (data.eventType === 'NOTIFICATION_SENT') {
                    notifications.push({
                        id: doc.id,
                        type: 'reminder',
                        title: '💊 İlaç Hatırlatması',
                        message: `${data.medicineName || 'İlaç'} alma zamanı!`,
                        time: data.timestamp?.toDate() || new Date(),
                        read: false,
                        icon: 'ri-capsule-fill'
                    });
                } else if (data.eventType === 'ALARM_TRIGGERED') {
                    notifications.push({
                        id: doc.id,
                        type: 'alert',
                        title: '⏰ Alarm Tetiklendi',
                        message: `${data.medicineName || 'İlaç'} için alarm çaldı`,
                        time: data.timestamp?.toDate() || new Date(),
                        read: false,
                        icon: 'ri-alarm-warning-fill'
                    });
                } else if (data.eventType === 'ALARM_SCHEDULED') {
                    notifications.push({
                        id: doc.id,
                        type: 'success',
                        title: '✅ Alarm Kuruldu',
                        message: `${data.medicineName || 'İlaç'} için alarm ayarlandı`,
                        time: data.timestamp?.toDate() || new Date(),
                        read: true,
                        icon: 'ri-checkbox-circle-fill'
                    });
                }
            });
            
            dashboardData.notifications = notifications;
            updateNotificationBadge();
            renderNotifications();
        }, (error) => {
            console.error('Notification listener error:', error);
        });
}

// Update Notification Badge
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    const unreadCount = dashboardData.notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Open Notification Panel
function openNotificationPanel() {
    document.getElementById('notificationPanel').classList.add('open');
    document.getElementById('notificationOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Mark all as read after 1 second
    setTimeout(() => {
        dashboardData.notifications.forEach(n => n.read = true);
        updateNotificationBadge();
    }, 1000);
}

// Close Notification Panel
function closeNotificationPanel() {
    document.getElementById('notificationPanel').classList.remove('open');
    document.getElementById('notificationOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Render Notifications
function renderNotifications() {
    const content = document.getElementById('notificationPanelContent');
    
    if (dashboardData.notifications.length === 0) {
        content.innerHTML = `
            <div class="notification-empty">
                <img src="../images/dozi_waiting.webp" alt="Dozi">
                <h3>Henüz bildirim yok</h3>
                <p>Yeni bildirimler burada görünecek</p>
            </div>
        `;
        return;
    }
    
    content.innerHTML = dashboardData.notifications.map(notif => {
        const timeAgo = getTimeAgo(notif.time);
        const unreadClass = notif.read ? '' : 'unread';
        
        return `
            <div class="notification-item ${unreadClass} ${notif.type}" data-id="${notif.id}">
                <div class="notification-header">
                    <div class="notification-title">
                        <i class="${notif.icon}"></i>
                        ${notif.title}
                    </div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                <div class="notification-message">${notif.message}</div>
            </div>
        `;
    }).join('');
}

// Get Time Ago
function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
}


// Render Medicines Tab
function renderMedicines() {
    const grid = document.getElementById('medicinesGrid');
    const empty = document.getElementById('emptyMedicines');
    
    if (dashboardData.medicines.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    empty.style.display = 'none';
    
    grid.innerHTML = dashboardData.medicines.map(med => `
        <div class="medicine-card" data-medicine-id="${med.id}">
            <div class="medicine-card-header">
                <div class="medicine-icon">
                    <i class="ri-capsule-fill"></i>
                </div>
                <div class="medicine-info">
                    <h3>${med.name}</h3>
                    <p>${med.dosage || '1 doz'}</p>
                </div>
            </div>
            <div class="medicine-times">
                ${(med.times || ['09:00']).map(time => `
                    <span class="time-badge"><i class="ri-time-line"></i> ${time}</span>
                `).join('')}
            </div>
            <div class="medicine-card-actions">
                <button class="btn-edit" onclick="openMedicineModal('${med.id}')">
                    <i class="ri-edit-line"></i>
                    Düzenle
                </button>
                <button class="btn-delete" onclick="deleteMedicine('${med.id}', '${med.name.replace(/'/g, "\\'")}')">
                    <i class="ri-delete-bin-line"></i>
                    Sil
                </button>
            </div>
        </div>
    `).join('');
}

// Render Reminders Tab
function renderReminders() {
    const list = document.getElementById('remindersList');
    const empty = document.getElementById('emptyReminders');
    
    if (dashboardData.medicines.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    
    list.style.display = 'flex';
    empty.style.display = 'none';
    
    const frequencyLabels = {
        'DAILY': 'Her gün',
        'WEEKLY': 'Haftalık',
        'INTERVAL': 'Belirli aralıklarla',
        'AS_NEEDED': 'Gerektiğinde'
    };
    
    list.innerHTML = dashboardData.medicines.map(med => `
        <div class="reminder-card">
            <div class="reminder-card-header">
                <div class="reminder-medicine-info">
                    <div class="reminder-medicine-icon">
                        <i class="ri-capsule-fill"></i>
                    </div>
                    <div class="reminder-medicine-details">
                        <h3>${med.name}</h3>
                        <p>${med.dosage || '1 doz'}</p>
                    </div>
                </div>
                <span class="reminder-status ${med.isActive ? 'active' : 'inactive'}">
                    ${med.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </div>
            
            <div class="reminder-frequency">
                <i class="ri-repeat-line"></i>
                <span>${frequencyLabels[med.frequency] || 'Her gün'}</span>
            </div>
            
            <div class="reminder-times-grid">
                ${(med.times || ['09:00']).map(time => `
                    <div class="reminder-time-badge">
                        <i class="ri-alarm-line"></i>
                        <span>${time}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="reminder-actions">
                <button class="btn-edit-reminder" onclick="openMedicineModal('${med.id}')">
                    <i class="ri-edit-line"></i>
                    Düzenle
                </button>
                <button class="btn-toggle-reminder ${med.isActive ? '' : 'inactive'}" onclick="toggleReminder('${med.id}', ${!med.isActive})">
                    <i class="ri-${med.isActive ? 'pause' : 'play'}-circle-line"></i>
                    ${med.isActive ? 'Duraklat' : 'Aktifleştir'}
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle Reminder Active Status
async function toggleReminder(medicineId, newStatus) {
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('medicines')
            .doc(medicineId)
            .update({
                isActive: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        showToast(newStatus ? 'Hatırlatma aktifleştirildi' : 'Hatırlatma duraklatıldı', 'success');
        await loadDashboardData();
        renderReminders();
        
    } catch (error) {
        console.error('Error toggling reminder:', error);
        showToast('Hatırlatma durumu değiştirilemedi', 'error');
    }
}

// Render Stats Tab
function renderStats() {
    // Calculate adherence
    const last7Days = dashboardData.medicationLogs.filter(log => {
        const logDate = new Date(log.takenAt?.toDate() || log.createdAt?.toDate());
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
    });
    
    const taken = last7Days.filter(log => log.status === 'TAKEN').length;
    const total = last7Days.length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    
    document.getElementById('adherencePercent').textContent = `%${adherence}`;
    document.getElementById('streakDays').textContent = dashboardData.user?.streak || 0;
    
    // Render weekly chart
    renderWeeklyChart();
}

// Render Weekly Chart
function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyStatsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get last 7 days data
    const days = [];
    const takenData = [];
    const missedData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStr = date.toLocaleDateString('tr-TR', { weekday: 'short' });
        days.push(dayStr);
        
        const dayLogs = dashboardData.medicationLogs.filter(log => {
            const logDate = new Date(log.takenAt?.toDate() || log.createdAt?.toDate());
            return logDate.toDateString() === date.toDateString();
        });
        
        takenData.push(dayLogs.filter(l => l.status === 'TAKEN').length);
        missedData.push(dayLogs.filter(l => l.status === 'MISSED' || l.status === 'SKIPPED').length);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Alınan',
                    data: takenData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Kaçırılan',
                    data: missedData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render Badis Tab
async function renderBadis() {
    const list = document.getElementById('badisList');
    const empty = document.getElementById('emptyBadis');
    
    try {
        // Fetch badis
        const badisSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('badis')
            .get();
        
        if (badisSnapshot.empty) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }
        
        list.style.display = 'grid';
        empty.style.display = 'none';
        
        const badis = [];
        for (const doc of badisSnapshot.docs) {
            const badiData = doc.data();
            
            // Fetch badi user data
            const badiUserDoc = await db.collection('users').doc(badiData.badiUserId).get();
            const badiUser = badiUserDoc.data();
            
            // Fetch badi's today logs
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const logsSnapshot = await db.collection('medication_logs')
                .where('userId', '==', badiData.badiUserId)
                .where('scheduledTime', '>=', firebase.firestore.Timestamp.fromDate(today))
                .get();
            
            const taken = logsSnapshot.docs.filter(d => d.data().status === 'TAKEN').length;
            const total = logsSnapshot.docs.length;
            
            // Get name from displayName, nickname, or email
            let name = badiUser?.displayName || badiData.nickname || 'Badi';
            if (!badiUser?.displayName && !badiData.nickname && badiUser?.email) {
                // Extract name from email (before @)
                name = badiUser.email.split('@')[0];
            }
            
            badis.push({
                name: name,
                email: badiUser?.email || '',
                taken: taken,
                total: total
            });
        }
        
        list.innerHTML = badis.map(badi => {
            const initial = badi.name.charAt(0).toUpperCase();
            return `
                <div class="badi-card">
                    <div class="badi-card-header">
                        <div class="badi-avatar">${initial}</div>
                        <div class="badi-info">
                            <h3>${badi.name}</h3>
                            <p>${badi.email}</p>
                        </div>
                    </div>
                    <div class="badi-stats">
                        <div class="badi-stat">
                            <div class="badi-stat-value">${badi.taken}</div>
                            <div class="badi-stat-label">Alındı</div>
                        </div>
                        <div class="badi-stat">
                            <div class="badi-stat-value">${badi.total}</div>
                            <div class="badi-stat-label">Toplam</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Badis render error:', error);
        list.style.display = 'none';
        empty.style.display = 'block';
    }
}


// ========================================
// NEW FEATURES: Medicine Management
// ========================================

let editingMedicineId = null;

// Medicine Modal Controls
const medicineModal = document.getElementById('medicineModal');
const medicineModalOverlay = document.getElementById('medicineModalOverlay');
const addMedicineBtn = document.getElementById('addMedicineBtn');
const medicineModalClose = document.getElementById('medicineModalClose');
const cancelMedicineBtn = document.getElementById('cancelMedicineBtn');
const medicineForm = document.getElementById('medicineForm');
const addReminderTimeBtn = document.getElementById('addReminderTimeBtn');

// Open Medicine Modal
function openMedicineModal(medicineId = null) {
    editingMedicineId = medicineId;
    const modalTitle = document.getElementById('medicineModalTitle');
    
    if (medicineId) {
        modalTitle.textContent = 'İlaç Düzenle';
        loadMedicineData(medicineId);
    } else {
        modalTitle.textContent = 'İlaç Ekle';
        medicineForm.reset();
        resetReminderTimes();
    }
    
    medicineModal.classList.add('active');
    medicineModalOverlay.classList.add('active');
}

// Close Medicine Modal
function closeMedicineModal() {
    medicineModal.classList.remove('active');
    medicineModalOverlay.classList.remove('active');
    editingMedicineId = null;
    medicineForm.reset();
}

// Load Medicine Data for Editing
async function loadMedicineData(medicineId) {
    try {
        const doc = await db.collection('users')
            .doc(currentUser.uid)
            .collection('medicines')
            .doc(medicineId)
            .get();
        
        if (!doc.exists) return;
        
        const medicine = doc.data();
        
        document.getElementById('medicineName').value = medicine.name || '';
        document.getElementById('medicineDosage').value = medicine.dosage || '';
        document.getElementById('medicineForm').value = medicine.form || 'TABLET';
        document.getElementById('medicineFrequency').value = medicine.frequency || 'DAILY';
        document.getElementById('medicineStock').value = medicine.stock || '';
        document.getElementById('medicineNotes').value = medicine.notes || '';
        
        // Load reminder times
        if (medicine.times && medicine.times.length > 0) {
            const timesList = document.getElementById('reminderTimesList');
            timesList.innerHTML = '';
            
            medicine.times.forEach((time, index) => {
                addReminderTimeInput(time, index === 0);
            });
        }
    } catch (error) {
        console.error('Error loading medicine:', error);
        showToast('İlaç yüklenirken hata oluştu', 'error');
    }
}

// Reset Reminder Times
function resetReminderTimes() {
    const timesList = document.getElementById('reminderTimesList');
    timesList.innerHTML = '';
    addReminderTimeInput('09:00', true);
}

// Add Reminder Time Input
function addReminderTimeInput(value = '09:00', isFirst = false) {
    const timesList = document.getElementById('reminderTimesList');
    const timeItem = document.createElement('div');
    timeItem.className = 'reminder-time-item';
    
    timeItem.innerHTML = `
        <input type="time" class="form-input reminder-time-input" value="${value}" required>
        <button type="button" class="btn-icon-small remove-time-btn" style="display: ${isFirst ? 'none' : 'inline-flex'};">
            <i class="ri-close-line"></i>
        </button>
    `;
    
    const removeBtn = timeItem.querySelector('.remove-time-btn');
    removeBtn.addEventListener('click', () => {
        timeItem.remove();
        updateRemoveButtons();
    });
    
    timesList.appendChild(timeItem);
}

// Update Remove Buttons Visibility
function updateRemoveButtons() {
    const timeItems = document.querySelectorAll('.reminder-time-item');
    timeItems.forEach((item, index) => {
        const removeBtn = item.querySelector('.remove-time-btn');
        removeBtn.style.display = timeItems.length === 1 ? 'none' : 'inline-flex';
    });
}

// Save Medicine
async function saveMedicine(e) {
    e.preventDefault();
    
    const name = document.getElementById('medicineName').value.trim();
    const dosage = document.getElementById('medicineDosage').value.trim();
    const form = document.getElementById('medicineForm').value;
    const frequency = document.getElementById('medicineFrequency').value;
    const stock = document.getElementById('medicineStock').value;
    const notes = document.getElementById('medicineNotes').value.trim();
    
    // Get reminder times
    const timeInputs = document.querySelectorAll('.reminder-time-input');
    const times = Array.from(timeInputs).map(input => input.value).filter(t => t);
    
    if (times.length === 0) {
        showToast('En az bir hatırlatıcı saati ekleyin', 'error');
        return;
    }
    
    const medicineData = {
        name,
        dosage,
        form,
        frequency,
        times,
        stock: stock ? parseInt(stock) : null,
        notes,
        isActive: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        const medicinesRef = db.collection('users')
            .doc(currentUser.uid)
            .collection('medicines');
        
        if (editingMedicineId) {
            // Update existing medicine
            await medicinesRef.doc(editingMedicineId).update(medicineData);
            showToast('İlaç güncellendi', 'success');
        } else {
            // Create new medicine
            medicineData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await medicinesRef.add(medicineData);
            showToast('İlaç eklendi', 'success');
        }
        
        closeMedicineModal();
        await renderMedicines();
        
    } catch (error) {
        console.error('Error saving medicine:', error);
        showToast('İlaç kaydedilirken hata oluştu', 'error');
    }
}

// Delete Medicine
async function deleteMedicine(medicineId, medicineName) {
    if (!confirm(`"${medicineName}" ilacını silmek istediğinize emin misiniz?`)) {
        return;
    }
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('medicines')
            .doc(medicineId)
            .delete();
        
        showToast('İlaç silindi', 'success');
        await renderMedicines();
        
    } catch (error) {
        console.error('Error deleting medicine:', error);
        showToast('İlaç silinirken hata oluştu', 'error');
    }
}

// Event Listeners
addMedicineBtn.addEventListener('click', () => openMedicineModal());
medicineModalClose.addEventListener('click', closeMedicineModal);
cancelMedicineBtn.addEventListener('click', closeMedicineModal);
medicineModalOverlay.addEventListener('click', closeMedicineModal);
medicineForm.addEventListener('submit', saveMedicine);
addReminderTimeBtn.addEventListener('click', () => {
    addReminderTimeInput('09:00', false);
    updateRemoveButtons();
});

// ========================================
// NEW FEATURES: Enhanced Statistics
// ========================================

let dailyPatternChart = null;
let medicineAdherenceChart = null;

// Render Daily Pattern Chart
async function renderDailyPatternChart() {
    const canvas = document.getElementById('dailyPatternChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    try {
        // Get medication logs for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const logsSnapshot = await db.collection('medication_logs')
            .where('userId', '==', currentUser.uid)
            .where('scheduledTime', '>=', firebase.firestore.Timestamp.fromDate(thirtyDaysAgo))
            .where('status', '==', 'TAKEN')
            .get();
        
        // Group by hour
        const hourCounts = new Array(24).fill(0);
        
        logsSnapshot.forEach(doc => {
            const log = doc.data();
            if (log.takenAt) {
                const hour = log.takenAt.toDate().getHours();
                hourCounts[hour]++;
            }
        });
        
        // Destroy existing chart
        if (dailyPatternChart) {
            dailyPatternChart.destroy();
        }
        
        dailyPatternChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'İlaç Sayısı',
                    data: hourCounts,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering daily pattern chart:', error);
    }
}

// Render Medicine Adherence Chart
async function renderMedicineAdherenceChart() {
    const canvas = document.getElementById('medicineAdherenceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    try {
        // Get medicines
        const medicinesSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('medicines')
            .where('isActive', '==', true)
            .get();
        
        const medicineNames = [];
        const adherenceRates = [];
        
        for (const doc of medicinesSnapshot.docs) {
            const medicine = doc.data();
            
            // Calculate adherence for this medicine
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const logsSnapshot = await db.collection('medication_logs')
                .where('userId', '==', currentUser.uid)
                .where('medicineId', '==', doc.id)
                .where('scheduledTime', '>=', firebase.firestore.Timestamp.fromDate(thirtyDaysAgo))
                .get();
            
            let taken = 0;
            let total = 0;
            
            logsSnapshot.forEach(logDoc => {
                const log = logDoc.data();
                total++;
                if (log.status === 'TAKEN') taken++;
            });
            
            if (total > 0) {
                medicineNames.push(medicine.name);
                adherenceRates.push(Math.round((taken / total) * 100));
            }
        }
        
        // Destroy existing chart
        if (medicineAdherenceChart) {
            medicineAdherenceChart.destroy();
        }
        
        medicineAdherenceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: medicineNames,
                datasets: [{
                    label: 'Uyum Oranı (%)',
                    data: adherenceRates,
                    backgroundColor: adherenceRates.map(rate => 
                        rate >= 80 ? 'rgba(16, 185, 129, 0.6)' :
                        rate >= 60 ? 'rgba(245, 158, 11, 0.6)' :
                        'rgba(239, 68, 68, 0.6)'
                    ),
                    borderColor: adherenceRates.map(rate => 
                        rate >= 80 ? 'rgba(16, 185, 129, 1)' :
                        rate >= 60 ? 'rgba(245, 158, 11, 1)' :
                        'rgba(239, 68, 68, 1)'
                    ),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering medicine adherence chart:', error);
    }
}

// Update renderStats to include new charts
const originalRenderStats = renderStats;
renderStats = async function() {
    await originalRenderStats();
    await renderDailyPatternChart();
    await renderMedicineAdherenceChart();
};

// ========================================
// NEW FEATURES: Settings & Notifications
// ========================================

// Settings Controls
const webNotificationsToggle = document.getElementById('webNotificationsToggle');
const notificationSoundToggle = document.getElementById('notificationSoundToggle');
const reminderFrequency = document.getElementById('reminderFrequency');
const quietHoursToggle = document.getElementById('quietHoursToggle');
const quietHoursSettings = document.getElementById('quietHoursSettings');
const quietHoursStart = document.getElementById('quietHoursStart');
const quietHoursEnd = document.getElementById('quietHoursEnd');
const themeSelect = document.getElementById('themeSelect');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');

// Load Settings
async function loadSettings() {
    try {
        // Check current notification permission status
        const hasPermission = await checkNotificationPermission();
        
        const doc = await db.collection('users')
            .doc(currentUser.uid)
            .collection('settings')
            .doc('preferences')
            .get();
        
        if (doc.exists) {
            const settings = doc.data();
            
            // Only enable toggle if permission is granted
            webNotificationsToggle.checked = settings.webNotifications && hasPermission;
            notificationSoundToggle.checked = settings.notificationSound !== false;
            reminderFrequency.value = settings.reminderFrequency || '30';
            quietHoursToggle.checked = settings.quietHours?.enabled || false;
            quietHoursStart.value = settings.quietHours?.start || '22:00';
            quietHoursEnd.value = settings.quietHours?.end || '08:00';
            themeSelect.value = settings.theme || 'light';
            
            // Show/hide quiet hours settings
            quietHoursSettings.style.display = quietHoursToggle.checked ? 'block' : 'none';
        } else {
            // Default values
            webNotificationsToggle.checked = false;
            notificationSoundToggle.checked = true;
            reminderFrequency.value = '30';
            quietHoursToggle.checked = false;
            quietHoursStart.value = '22:00';
            quietHoursEnd.value = '08:00';
            themeSelect.value = 'light';
            quietHoursSettings.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save Settings
async function saveSettings() {
    try {
        const settings = {
            webNotifications: webNotificationsToggle.checked,
            notificationSound: notificationSoundToggle.checked,
            reminderFrequency: reminderFrequency.value,
            quietHours: {
                enabled: quietHoursToggle.checked,
                start: quietHoursStart.value,
                end: quietHoursEnd.value
            },
            theme: themeSelect.value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('settings')
            .doc('preferences')
            .set(settings, { merge: true });
        
        showToast('Ayarlar kaydedildi', 'success');
        
        // Request notification permission if enabled
        if (settings.webNotifications && 'Notification' in window) {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    showToast('Bildirim izni verildi', 'success');
                }
            }
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Ayarlar kaydedilirken hata oluştu', 'error');
    }
}

// Reset Settings
async function resetSettings() {
    if (!confirm('Tüm ayarları sıfırlamak istediğinize emin misiniz?')) {
        return;
    }
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('settings')
            .doc('preferences')
            .delete();
        
        // Reset form
        webNotificationsToggle.checked = false;
        notificationSoundToggle.checked = true;
        reminderFrequency.value = '30';
        quietHoursToggle.checked = false;
        quietHoursStart.value = '22:00';
        quietHoursEnd.value = '08:00';
        themeSelect.value = 'light';
        quietHoursSettings.style.display = 'none';
        
        showToast('Ayarlar sıfırlandı', 'success');
        
    } catch (error) {
        console.error('Error resetting settings:', error);
        showToast('Ayarlar sıfırlanırken hata oluştu', 'error');
    }
}

// Event Listeners
quietHoursToggle.addEventListener('change', () => {
    quietHoursSettings.style.display = quietHoursToggle.checked ? 'block' : 'none';
});

// Web Notifications Toggle - Request permission immediately when enabled
webNotificationsToggle.addEventListener('change', async () => {
    if (webNotificationsToggle.checked) {
        // Request permission immediately
        const granted = await requestNotificationPermission();
        
        // If permission denied, revert toggle
        if (!granted) {
            webNotificationsToggle.checked = false;
            showToast('Bildirim izni verilmedi. Toggle kapatıldı.', 'warning');
        }
    }
});

saveSettingsBtn.addEventListener('click', saveSettings);
resetSettingsBtn.addEventListener('click', resetSettings);

// Load settings when settings tab is opened
const settingsTab = document.querySelector('[data-tab="settings"]');
if (settingsTab) {
    settingsTab.addEventListener('click', loadSettings);
}

// Make functions globally accessible
window.openMedicineModal = openMedicineModal;
window.deleteMedicine = deleteMedicine;
window.toggleReminder = toggleReminder;


// ========================================
// BROWSER NOTIFICATIONS
// ========================================

// Check Notification Permission
async function checkNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Bu tarayıcı bildirimleri desteklemiyor');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission === 'denied') {
        return false;
    }
    
    return false;
}

// Request Notification Permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showToast('Bu tarayıcı bildirimleri desteklemiyor', 'error');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission === 'denied') {
        showToast('Bildirim izni reddedilmiş. Tarayıcı ayarlarından izin verebilirsiniz.', 'error');
        return false;
    }
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            showToast('Bildirim izni verildi!', 'success');
            
            // Send test notification
            new Notification('Dozi Bildirimleri Aktif! 🎉', {
                body: 'Artık ilaç hatırlatmalarını tarayıcıdan alacaksınız.',
                icon: '../dozi_brand.png',
                badge: '../dozi_brand.png',
                tag: 'dozi-welcome',
                requireInteraction: false
            });
            
            return true;
        } else {
            showToast('Bildirim izni verilmedi', 'warning');
            return false;
        }
    } catch (error) {
        console.error('Notification permission error:', error);
        showToast('Bildirim izni alınırken hata oluştu', 'error');
        return false;
    }
}

// Send Browser Notification
async function sendBrowserNotification(title, body, data = {}) {
    // Check if notifications are enabled in settings
    try {
        const settingsDoc = await db.collection('users')
            .doc(currentUser.uid)
            .collection('settings')
            .doc('preferences')
            .get();
        
        const settings = settingsDoc.exists ? settingsDoc.data() : {};
        
        // Check if web notifications are enabled
        if (!settings.webNotifications) {
            console.log('Web notifications disabled in settings');
            return;
        }
        
        // Check quiet hours
        if (settings.quietHours?.enabled) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const startTime = settings.quietHours.start || '22:00';
            const endTime = settings.quietHours.end || '08:00';
            
            // Check if current time is in quiet hours
            if (isInQuietHours(currentTime, startTime, endTime)) {
                console.log('In quiet hours, notification suppressed');
                return;
            }
        }
        
        // Check notification permission
        if (Notification.permission !== 'granted') {
            console.log('Notification permission not granted');
            return;
        }
        
        // Play notification sound if enabled
        if (settings.notificationSound !== false) {
            playNotificationSound();
        }
        
        // Create notification
        const notification = new Notification(title, {
            body: body,
            icon: '../dozi_brand.png',
            badge: '../dozi_brand.png',
            tag: data.medicineId || 'dozi-reminder',
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: data
        });
        
        // Handle notification click
        notification.onclick = function(event) {
            event.preventDefault();
            window.focus();
            notification.close();
            
            // Open notification panel
            openNotificationPanel();
        };
        
        // Auto close after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);
        
    } catch (error) {
        console.error('Error sending browser notification:', error);
    }
}

// Check if time is in quiet hours
function isInQuietHours(currentTime, startTime, endTime) {
    // Convert times to minutes for comparison
    const toMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };
    
    const current = toMinutes(currentTime);
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    
    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (start > end) {
        return current >= start || current < end;
    }
    
    // Normal quiet hours (e.g., 14:00 - 16:00)
    return current >= start && current < end;
}

// Play Notification Sound
function playNotificationSound() {
    try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Update saveSettings to request permission when enabling
const originalSaveSettings = saveSettings;
saveSettings = async function() {
    const webNotificationsEnabled = webNotificationsToggle.checked;
    
    // If enabling web notifications, request permission first
    if (webNotificationsEnabled) {
        const hasPermission = await requestNotificationPermission();
        
        if (!hasPermission) {
            // Revert toggle if permission denied
            webNotificationsToggle.checked = false;
            return;
        }
    }
    
    // Call original save function
    await originalSaveSettings();
};

// Check permission on page load
window.addEventListener('load', async () => {
    const hasPermission = await checkNotificationPermission();
    console.log('Notification permission:', Notification.permission);
});


// ========================================
// INACTIVITY TIMER & DAY CHANGE CHECKER
// ========================================

// Start Inactivity Timer
function startInactivityTimer() {
    // Reset timer on any user activity
    const resetTimer = () => {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        inactivityTimer = setTimeout(async () => {
            console.log('User inactive for 15 minutes, logging out...');
            showToast('15 dakika hareketsizlik nedeniyle çıkış yapılıyor...', 'warning');
            
            // Wait 2 seconds before logout
            setTimeout(async () => {
                await auth.signOut();
            }, 2000);
        }, INACTIVITY_TIMEOUT);
    };
    
    // Listen to user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    // Start initial timer
    resetTimer();
}

// Start Day Change Checker
function startDayChangeChecker() {
    // Check every minute if day has changed
    dayChangeInterval = setInterval(() => {
        const newDate = new Date().toDateString();
        
        if (newDate !== currentDate) {
            console.log('Day changed, reloading dashboard...');
            currentDate = newDate;
            
            // Show notification
            showDoziMessage('Yeni güne hoş geldin! Dashboard yenileniyor... 🌅', 'morning');
            
            // Reload dashboard after 2 seconds
            setTimeout(async () => {
                await loadDashboard();
            }, 2000);
        }
    }, 60000); // Check every minute
}

// Cleanup on logout
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Clear timers
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        if (dayChangeInterval) {
            clearInterval(dayChangeInterval);
        }
        if (notificationListener) {
            notificationListener();
        }
    }
});
