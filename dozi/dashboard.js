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

// Auth State
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    await loadDashboard();
    startNotificationListener();
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
        if (tabName === 'stats') renderStats();
        if (tabName === 'badis') renderBadis();
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
    
    dashboardData.timelineItems = [];

    // For each medicine, create timeline items for today's doses
    dashboardData.medicines.forEach(medicine => {
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
        <div class="medicine-card">
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
        </div>
    `).join('');
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
            
            badis.push({
                name: badiUser?.displayName || 'Badi',
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
