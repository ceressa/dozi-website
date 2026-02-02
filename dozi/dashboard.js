// Firebase Configuration - dozi.app için
const firebaseConfig = {
    apiKey: "AIzaSyBqZ9YqZ9YqZ9YqZ9YqZ9YqZ9YqZ9YqZ9Y",
    authDomain: "dozi-app.firebaseapp.com",
    projectId: "dozi-app",
    storageBucket: "dozi-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const functions = firebase.functions();

// Global State
let currentUser = null;
let userData = null;
let medicines = [];
let badis = [];
let medicationLogs = [];
let weeklyChart = null;
let distributionChart = null;

// UI Elements
const loadingScreen = document.getElementById('loadingScreen');
const dashboardContainer = document.getElementById('dashboardContainer');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// Initialize
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = user;
    await loadDashboard();
});

// Load Dashboard Data
async function loadDashboard() {
    try {
        showLoading(true);

        // Call Firebase Function to get all dashboard data
        const getDashboardData = functions.httpsCallable('getUserDashboardData');
        const response = await getDashboardData();

        if (!response.data.success) {
            throw new Error(response.data.message || 'Veri yüklenemedi');
        }

        const data = response.data.data;
        userData = data.user;
        medicines = data.medicines;
        badis = data.badis;
        medicationLogs = data.medicationLogs;

        updateUserProfile();
        updateOverviewStats();
        renderCharts();
        renderRecentActivity();

        showLoading(false);
        console.log('✅ Dashboard loaded successfully');

    } catch (error) {
        console.error('❌ Dashboard load error:', error);
        alert('Veriler yüklenirken bir hata oluştu: ' + error.message);
        showLoading(false);
    }
}

// Load Medicines
async function loadMedicines() {
    const snapshot = await db.collection('users')
        .doc(currentUser.uid)
        .collection('medicines')
        .where('isActive', '==', true)
        .get();

    medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    console.log(`📊 Loaded ${medicines.length} medicines`);
}

// Load Badis
async function loadBadis() {
    const snapshot = await db.collection('users')
        .doc(currentUser.uid)
        .collection('badis')
        .get();

    badis = [];
    for (const doc of snapshot.docs) {
        const badiData = doc.data();
        const badiUserId = badiData.userId;

        // Get badi user info
        const badiUserDoc = await db.collection('users').doc(badiUserId).get();
        if (badiUserDoc.exists) {
            badis.push({
                id: doc.id,
                userId: badiUserId,
                ...badiData,
                userInfo: badiUserDoc.data()
            });
        }
    }

    console.log(`👥 Loaded ${badis.length} badis`);
}

// Load Medication Logs
async function loadMedicationLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db.collection('medication_logs')
        .where('userId', '==', currentUser.uid)
        .where('scheduledTime', '>=', firebase.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .orderBy('scheduledTime', 'desc')
        .limit(500)
        .get();

    medicationLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    console.log(`📝 Loaded ${medicationLogs.length} medication logs`);
}

// Update User Profile
function updateUserProfile() {
    document.getElementById('userName').textContent = userData.displayName || 'Kullanıcı';
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').src = currentUser.photoURL || '../dozi_brand.png';
}

// Update Overview Stats
function updateOverviewStats() {
    // Total medicines
    document.getElementById('totalMedicines').textContent = medicines.length;

    // Today's doses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = medicationLogs.filter(log => {
        const logDate = log.scheduledTime.toDate();
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    });

    const todayTaken = todayLogs.filter(log => log.status === 'TAKEN').length;
    document.getElementById('todayDoses').textContent = todayLogs.length;
    document.getElementById('todayTaken').textContent = todayTaken;
    document.getElementById('todayBadge').textContent = todayLogs.length - todayTaken;

    // Current streak
    const streak = calculateStreak();
    document.getElementById('currentStreak').textContent = streak;

    // Adherence rate (last 7 days)
    const adherenceRate = calculateAdherenceRate(7);
    document.getElementById('adherenceRate').textContent = adherenceRate + '%';

    // Badis badge
    document.getElementById('badisBadge').textContent = badis.length;
}

// Calculate Streak
function calculateStreak() {
    if (medicationLogs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group logs by date
    const logsByDate = {};
    medicationLogs.forEach(log => {
        const date = log.scheduledTime.toDate();
        date.setHours(0, 0, 0, 0);
        const dateKey = date.getTime();

        if (!logsByDate[dateKey]) {
            logsByDate[dateKey] = { total: 0, taken: 0 };
        }
        logsByDate[dateKey].total++;
        if (log.status === 'TAKEN') {
            logsByDate[dateKey].taken++;
        }
    });

    // Calculate streak from today backwards
    let currentDate = today.getTime();
    while (logsByDate[currentDate]) {
        const dayData = logsByDate[currentDate];
        const adherence = (dayData.taken / dayData.total) * 100;
        if (adherence >= 80) {
            streak++;
            currentDate -= 24 * 60 * 60 * 1000; // Go back one day
        } else {
            break;
        }
    }

    return streak;
}

// Calculate Adherence Rate
function calculateAdherenceRate(days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const recentLogs = medicationLogs.filter(log => {
        return log.scheduledTime.toDate() >= startDate;
    });

    if (recentLogs.length === 0) return 0;

    const taken = recentLogs.filter(log => log.status === 'TAKEN').length;
    return Math.round((taken / recentLogs.length) * 100);
}

// Render Charts
function renderCharts() {
    renderWeeklyChart();
    renderDistributionChart();
}

// Render Weekly Chart
function renderWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');

    // Prepare data for last 7 days
    const labels = [];
    const takenData = [];
    const missedData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dayLogs = medicationLogs.filter(log => {
            const logDate = log.scheduledTime.toDate();
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === date.getTime();
        });

        const taken = dayLogs.filter(log => log.status === 'TAKEN').length;
        const missed = dayLogs.filter(log => log.status === 'MISSED').length;

        labels.push(date.toLocaleDateString('tr-TR', { weekday: 'short' }));
        takenData.push(taken);
        missedData.push(missed);
    }

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Alındı',
                    data: takenData,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 8
                },
                {
                    label: 'Kaçırıldı',
                    data: missedData,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// Render Distribution Chart
function renderDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Count medicines by time of day
    const morning = medicines.filter(m => {
        const times = m.times || [];
        return times.some(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 6 && hour < 12;
        });
    }).length;

    const afternoon = medicines.filter(m => {
        const times = m.times || [];
        return times.some(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 12 && hour < 18;
        });
    }).length;

    const evening = medicines.filter(m => {
        const times = m.times || [];
        return times.some(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 18 && hour < 24;
        });
    }).length;

    const night = medicines.filter(m => {
        const times = m.times || [];
        return times.some(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 0 && hour < 6;
        });
    }).length;

    if (distributionChart) {
        distributionChart.destroy();
    }

    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sabah', 'Öğlen', 'Akşam', 'Gece'],
            datasets: [{
                data: [morning, afternoon, evening, night],
                backgroundColor: [
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(99, 102, 241, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f1f5f9',
                        font: { size: 12 },
                        padding: 16
                    }
                }
            }
        }
    });
}

// Render Recent Activity
function renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    const recentLogs = medicationLogs.slice(0, 5);

    if (recentLogs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Henüz aktivite yok</p>';
        return;
    }

    container.innerHTML = recentLogs.map(log => {
        const medicine = medicines.find(m => m.id === log.medicineId);
        const medicineName = medicine ? medicine.name : 'Bilinmeyen İlaç';
        const time = log.scheduledTime.toDate();
        const timeStr = time.toLocaleString('tr-TR', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const statusConfig = {
            'TAKEN': { icon: '✅', color: '#10b981', text: 'Alındı' },
            'MISSED': { icon: '❌', color: '#ef4444', text: 'Kaçırıldı' },
            'SKIPPED': { icon: '⏭️', color: '#f59e0b', text: 'Atlandı' }
        };

        const status = statusConfig[log.status] || statusConfig['MISSED'];

        return `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${status.color}20; color: ${status.color};">
                    ${status.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${medicineName} - ${status.text}</div>
                    <div class="activity-time">${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = item.dataset.page;
        switchPage(pageName);
    });
});

function switchPage(pageName) {
    // Update nav items
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // Update pages
    pages.forEach(page => {
        page.classList.toggle('active', page.id === pageName + 'Page');
    });

    // Update header
    const titles = {
        'overview': { title: 'Genel Bakış', subtitle: 'İlaç takibinizin özeti' },
        'medicines': { title: 'İlaçlarım', subtitle: 'Tüm ilaçlarınız ve hatırlatıcılarınız' },
        'today': { title: 'Bugün', subtitle: 'Bugünkü dozlarınız' },
        'badis': { title: 'Badilerim', subtitle: 'Sevdiklerinizin ilaç takibi' },
        'stats': { title: 'İstatistikler', subtitle: 'Detaylı analiz ve raporlar' }
    };

    const pageInfo = titles[pageName] || titles['overview'];
    document.getElementById('pageTitle').textContent = pageInfo.title;
    document.getElementById('pageSubtitle').textContent = pageInfo.subtitle;

    // Load page-specific data
    if (pageName === 'medicines') {
        renderMedicinesPage();
    } else if (pageName === 'today') {
        renderTodayPage();
    } else if (pageName === 'badis') {
        renderBadisPage();
    } else if (pageName === 'stats') {
        renderStatsPage();
    }
}

// Render Medicines Page
function renderMedicinesPage() {
    const container = document.getElementById('medicinesGrid');
    
    if (medicines.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">Henüz ilaç eklenmemiş</p>';
        return;
    }

    container.innerHTML = medicines.map(medicine => `
        <div class="medicine-card">
            <div class="medicine-header">
                <h3>${medicine.name}</h3>
                <span class="medicine-badge">${medicine.dosage || 'Doz belirtilmemiş'}</span>
            </div>
            <div class="medicine-times">
                ${(medicine.times || []).map(time => `<span class="time-badge">${time}</span>`).join('')}
            </div>
            <div class="medicine-footer">
                <span>📦 Stok: ${medicine.stock || 0}</span>
                <span>🔔 ${medicine.reminderEnabled ? 'Aktif' : 'Pasif'}</span>
            </div>
        </div>
    `).join('');
}

// Render Today Page
function renderTodayPage() {
    const container = document.getElementById('todayTimeline');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = medicationLogs.filter(log => {
        const logDate = log.scheduledTime.toDate();
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    }).sort((a, b) => a.scheduledTime.toDate() - b.scheduledTime.toDate());

    if (todayLogs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">Bugün için doz yok</p>';
        return;
    }

    container.innerHTML = todayLogs.map(log => {
        const medicine = medicines.find(m => m.id === log.medicineId);
        const time = log.scheduledTime.toDate();
        const timeStr = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        const statusConfig = {
            'TAKEN': { icon: '✅', color: '#10b981', text: 'Alındı', action: false },
            'MISSED': { icon: '❌', color: '#ef4444', text: 'Kaçırıldı', action: true },
            'SKIPPED': { icon: '⏭️', color: '#f59e0b', text: 'Atlandı', action: false }
        };

        const status = statusConfig[log.status] || { icon: '⏰', color: '#6366f1', text: 'Bekliyor', action: true };

        return `
            <div class="timeline-item">
                <div class="timeline-time">${timeStr}</div>
                <div class="timeline-content">
                    <div class="timeline-icon" style="background: ${status.color}20; color: ${status.color};">
                        ${status.icon}
                    </div>
                    <div class="timeline-info">
                        <h4>${medicine ? medicine.name : 'Bilinmeyen İlaç'}</h4>
                        <p>${status.text}</p>
                    </div>
                    ${status.action ? `
                        <button class="action-btn" onclick="markAsTaken('${log.id}')">
                            Aldım
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Render Badis Page
function renderBadisPage() {
    const container = document.getElementById('badisGrid');
    
    if (badis.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">Henüz badi eklenmemiş</p>';
        return;
    }

    container.innerHTML = badis.map(badi => `
        <div class="badi-card">
            <div class="badi-header">
                <img src="${badi.userInfo.photoURL || '../dozi_brand.png'}" alt="${badi.userInfo.displayName}">
                <div>
                    <h3>${badi.userInfo.displayName || 'Kullanıcı'}</h3>
                    <p>${badi.userInfo.email}</p>
                </div>
            </div>
            <div class="badi-stats">
                <div class="badi-stat">
                    <span class="stat-label">İlaç Sayısı</span>
                    <span class="stat-value">-</span>
                </div>
                <div class="badi-stat">
                    <span class="stat-label">Uyum Oranı</span>
                    <span class="stat-value">-</span>
                </div>
            </div>
            <button class="view-btn" onclick="viewBadiDetails('${badi.userId}')">
                Detayları Gör
            </button>
        </div>
    `).join('');
}

// Render Stats Page
function renderStatsPage() {
    // TODO: Implement detailed stats page
    document.getElementById('statsPage').innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <h2 style="font-size: 24px; margin-bottom: 16px;">📊 Detaylı İstatistikler</h2>
            <p style="color: var(--text-muted);">Yakında eklenecek...</p>
        </div>
    `;
}

// Mark as Taken
window.markAsTaken = async function(logId) {
    try {
        const markTaken = functions.httpsCallable('markMedicationTaken');
        const response = await markTaken({ logId });

        if (!response.data.success) {
            throw new Error(response.data.message || 'İşlem başarısız');
        }

        alert('✅ İlaç alındı olarak işaretlendi!');
        await loadDashboard();
    } catch (error) {
        console.error('Error marking as taken:', error);
        alert('Bir hata oluştu: ' + error.message);
    }
};

// View Badi Details
window.viewBadiDetails = async function(badiUserId) {
    try {
        showLoading(true);
        
        const getBadiData = functions.httpsCallable('getBadiDashboardData');
        const response = await getBadiData({ badiUserId });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Badi verileri yüklenemedi');
        }

        // TODO: Show badi details in modal
        alert('Badi detayları: ' + JSON.stringify(response.data.data, null, 2));
        showLoading(false);
    } catch (error) {
        console.error('Error loading badi details:', error);
        alert('Bir hata oluştu: ' + error.message);
        showLoading(false);
    }
};

// Logout
logoutBtn.addEventListener('click', async () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        await auth.signOut();
        window.location.href = 'index.html';
    }
});

// Refresh
refreshBtn.addEventListener('click', async () => {
    refreshBtn.style.animation = 'spin 0.5s ease';
    await loadDashboard();
    setTimeout(() => {
        refreshBtn.style.animation = '';
    }, 500);
});

// Helper Functions
function showLoading(show) {
    if (show) {
        loadingScreen.classList.remove('hidden');
        dashboardContainer.style.display = 'none';
    } else {
        loadingScreen.classList.add('hidden');
        dashboardContainer.style.display = 'flex';
    }
}

// Security: Prevent clickjacking
if (window.top !== window.self) {
    window.top.location = window.self.location;
}
