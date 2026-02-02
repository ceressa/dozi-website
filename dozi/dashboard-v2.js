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
    timelineItems: []
};
let currentFilter = 'all';

// Auth State
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    await loadDashboard();
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

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTimeline();
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
        showDoziMessage('Merhaba! Bugünün ilaçlarını görebilirsin 💊');

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
            showDoziMessage('Aferin! İlacını almayı unutmadın 🎉');
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

// Show Dozi Message
function showDoziMessage(message) {
    const doziSpeech = document.getElementById('doziSpeech');
    const doziMessage = document.getElementById('doziMessage');
    
    doziMessage.textContent = message;
    doziSpeech.style.display = 'block';
    
    setTimeout(() => {
        doziSpeech.style.display = 'none';
    }, 5000);
}

// Dozi Character Click
document.getElementById('doziCharacter')?.addEventListener('click', () => {
    const messages = [
        'Merhaba! Bugün nasılsın? 😊',
        'İlaçlarını almayı unutma! 💊',
        'Harika gidiyorsun! 🎉',
        'Sağlığın çok önemli! ❤️',
        'Her gün biraz daha iyisin! 🌟'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showDoziMessage(randomMessage);
});
