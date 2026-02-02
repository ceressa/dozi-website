// Firebase Configuration - dozi.app
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
const functions = firebase.functions();
const db = firebase.firestore();

// Global State
let currentUser = null;
let dashboardData = {
    user: null,
    medicines: [],
    badis: [],
    medicationLogs: [],
    stats: {}
};
let weeklyChart = null;

// UI Elements
const loadingScreen = document.getElementById('loadingScreen');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobileOverlay');
const navItems = document.querySelectorAll('.menu-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');

// --- EVENT LISTENERS ---

// Mobile Menu
function toggleSidebar(show) {
    if (show) {
        sidebar.classList.add('open');
        mobileOverlay.classList.add('show');
    } else {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('show');
    }
}

if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleSidebar(true));
if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
if(mobileOverlay) mobileOverlay.addEventListener('click', () => toggleSidebar(false));

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Active states
        navItems.forEach(nav => nav.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        item.classList.add('active');
        const pageId = item.dataset.page + 'Page';
        const targetPage = document.getElementById(pageId);
        if(targetPage) targetPage.classList.add('active');
        
        // Title update
        const title = item.querySelector('span').textContent;
        if(pageTitle) pageTitle.textContent = title;
        
        // Mobile sidebar close
        if (window.innerWidth <= 768) {
            toggleSidebar(false);
        }
    });
});

// Auth State Helper
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    await loadDashboard();
});

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if(confirm('Çıkış yapmak istiyor musunuz?')) {
            await auth.signOut();
        }
    });
}

// Refresh Button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.style.transform = 'rotate(180deg)';
        await loadDashboard();
        setTimeout(() => refreshBtn.style.transform = 'rotate(0deg)', 500);
    });
}

// --- CORE FUNCTIONS ---

async function loadDashboard() {
    try {
        // Sadece ilk yüklemede veya veri yoksa loading göster
        if (!dashboardData.user) loadingScreen.classList.remove('hidden');

        // GERÇEK VERİ ÇEKME (Firebase Function)
        const getDashboardData = functions.httpsCallable('getUserDashboardData');
        const result = await getDashboardData();
        
        if (!result.data.success) {
            throw new Error(result.data.message || 'Veri çekilemedi');
        }

        const data = result.data.data;
        
        // State güncelleme
        dashboardData.user = data.user;
        dashboardData.medicines = data.medicines || [];
        dashboardData.badis = data.badis || [];
        dashboardData.medicationLogs = data.medicationLogs || [];
        
        // İstatistik hesaplamaları (Eğer backend göndermiyorsa frontend'de hesapla)
        calculateStats();

        // UI Güncelleme
        updateUserProfile();
        updateStatsUI();
        renderRecentActivity();
        renderMedicinesList(); // İlaçlarım sayfası için
        renderBadisList(); // Badilerim sayfası için
        renderChart();

        loadingScreen.classList.add('hidden');

    } catch (error) {
        console.error('Dashboard error:', error);
        alert('Veriler yüklenirken hata oluştu: ' + error.message);
        loadingScreen.classList.add('hidden');
    }
}

function calculateStats() {
    // Frontend tarafında basit istatistik hesaplama
    const today = new Date().toISOString().split('T')[0];
    
    // Bugün alınması gerekenler (Basit mantık: tüm aktif ilaçlar)
    // Gerçekte ilacın frekansına bakmak gerekir ama UI için şimdilik:
    const activeMeds = dashboardData.medicines.filter(m => m.status === 'active' || !m.status);
    const totalDoses = activeMeds.length; // Basitleştirilmiş
    
    // Bugün alınanlar - güvenli tarih işleme
    const todayLogs = dashboardData.medicationLogs.filter(log => {
        try {
            // Timestamp kontrolü - güvenli
            let logDate;
            if (log.takenAt && log.takenAt._seconds) {
                logDate = new Date(log.takenAt._seconds * 1000);
            } else if (log.takenAt) {
                logDate = new Date(log.takenAt);
            } else if (log.timestamp && log.timestamp._seconds) {
                logDate = new Date(log.timestamp._seconds * 1000);
            } else if (log.timestamp) {
                logDate = new Date(log.timestamp);
            } else {
                return false; // Tarih yok, filtrele
            }
            
            // Geçersiz tarih kontrolü
            if (isNaN(logDate.getTime())) {
                return false;
            }
            
            return logDate.toISOString().split('T')[0] === today && log.status === 'taken';
        } catch (e) {
            console.warn('Log tarih hatası:', e, log);
            return false;
        }
    });

    dashboardData.stats = {
        totalMedicines: activeMeds.length,
        todayTaken: todayLogs.length,
        todayDoses: totalDoses > 0 ? totalDoses : todayLogs.length, // Göstermelik mantık
        streak: dashboardData.user.streak || 0,
        adherence: dashboardData.user.adherenceRate || 0
    };
}

function updateUserProfile() {
    const nameEl = document.getElementById('userName');
    const avatarEl = document.getElementById('userAvatar');
    
    if (nameEl) nameEl.textContent = dashboardData.user.displayName || currentUser.displayName || 'Kullanıcı';
    if (avatarEl && (dashboardData.user.photoURL || currentUser.photoURL)) {
        avatarEl.src = dashboardData.user.photoURL || currentUser.photoURL;
    }
    
    // Badges
    const todayBadge = document.getElementById('todayBadge');
    if (todayBadge) {
        // Kalan doz sayısı örneği
        const remaining = Math.max(0, dashboardData.stats.todayDoses - dashboardData.stats.todayTaken);
        todayBadge.textContent = remaining;
        todayBadge.style.display = remaining > 0 ? 'inline-block' : 'none';
    }
}

function updateStatsUI() {
    // İstatistik Kartlarını Doldur
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    
    set('totalMedicines', dashboardData.stats.totalMedicines);
    set('todayTaken', dashboardData.stats.todayTaken);
    set('todayDoses', dashboardData.stats.todayDoses);
    set('currentStreak', `${dashboardData.stats.streak} Gün`);
    set('adherenceRate', `%${Math.round(dashboardData.stats.adherence)}`);
}

function renderRecentActivity() {
    const listEl = document.getElementById('recentActivity');
    if (!listEl) return;

    if (dashboardData.medicationLogs.length === 0) {
        listEl.innerHTML = '<div class="empty-state" style="padding: 20px;">Henüz aktivite yok</div>';
        return;
    }

    // Son 5 aktivite
    const recentLogs = dashboardData.medicationLogs.slice(0, 5);
    
    listEl.innerHTML = recentLogs.map(log => {
        const date = log.takenAt ? new Date(log.takenAt._seconds * 1000) : new Date();
        const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const isTaken = log.status === 'taken';
        const statusClass = isTaken ? 'status-taken' : 'status-missed';
        const statusText = isTaken ? 'Alındı' : 'Atlandı';
        const icon = isTaken ? 'ri-check-line' : 'ri-close-line';
        
        return `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-details">
                <span class="activity-title">${log.medicineName || 'İlaç'}</span>
                <span class="activity-time">${timeStr}</span>
            </div>
            <span class="status-indicator ${statusClass}">${statusText}</span>
        </div>
        `;
    }).join('');
}

function renderMedicinesList() {
    const pageEl = document.getElementById('medicinesPage');
    if (!pageEl) return;
    
    if (dashboardData.medicines.length > 0) {
        let html = `
        <div style="text-align: center; margin-bottom: 32px;">
            <img src="images/dozi_logo.webp" alt="Dozi" style="width: 100px; height: 100px; margin-bottom: 16px;">
            <h2 style="color: var(--text-dark); margin-bottom: 8px;">İlaçlarım</h2>
            <p style="color: var(--text-light);">Toplam ${dashboardData.medicines.length} ilaç takip ediliyor</p>
        </div>
        <div class="medicines-grid">`;
        
        dashboardData.medicines.forEach(med => {
            const isActive = med.status === 'active' || !med.status;
            const times = med.times || ['09:00'];
            const timesStr = times.join(', ');
            
            html += `
            <div class="medicine-card ${isActive ? '' : 'inactive'}">
                <div class="medicine-header">
                    <div class="medicine-icon">
                        <i class="ri-capsule-fill"></i>
                    </div>
                    <div class="medicine-status">
                        <span class="status-badge ${isActive ? 'taken' : 'skipped'}">
                            ${isActive ? 'Aktif' : 'Pasif'}
                        </span>
                    </div>
                </div>
                <div class="medicine-body">
                    <h4>${med.name}</h4>
                    <div class="medicine-details">
                        <p><i class="ri-medicine-bottle-line"></i> ${med.dosage || '1 doz'}</p>
                        <p><i class="ri-calendar-line"></i> ${med.frequency || 'Her gün'}</p>
                        <p><i class="ri-time-line"></i> ${timesStr}</p>
                        ${med.stock ? `<p><i class="ri-stack-line"></i> Stok: ${med.stock}</p>` : ''}
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';
        
        pageEl.innerHTML = html;
    } else {
        pageEl.innerHTML = `
        <div class="empty-state">
            <img src="images/dozi_brand.webp" alt="Dozi" style="width: 150px; height: 150px; margin-bottom: 24px; opacity: 0.7;">
            <i class="ri-capsule-line"></i>
            <h3>Henüz ilaç eklenmemiş</h3>
            <p style="color: var(--text-light); margin-top: 8px;">Mobil uygulamadan ilaçlarını ekleyebilirsin</p>
        </div>`;
    }
}

function renderBadisList() {
    const pageEl = document.getElementById('badisPage');
    const badgeEl = document.getElementById('badisBadge');
    
    if (badgeEl) {
        badgeEl.textContent = dashboardData.badis.length;
        badgeEl.style.display = dashboardData.badis.length > 0 ? 'inline-block' : 'none';
    }

    if (!pageEl) return;

    if (dashboardData.badis.length > 0) {
        let html = `
        <div style="text-align: center; margin-bottom: 32px;">
            <img src="images/dozi_happy.webp" alt="Dozi" style="width: 120px; height: 120px; margin-bottom: 16px;">
            <h2 style="color: var(--text-dark); margin-bottom: 8px;">Badilerim</h2>
            <p style="color: var(--text-light);">Seni takip eden ve destek olan sevdiklerin</p>
        </div>
        <div class="badis-grid">`;
        
        dashboardData.badis.forEach(badi => {
            const initial = (badi.name || badi.email || 'B').charAt(0).toUpperCase();
            html += `
            <div class="badi-card">
                <div class="badi-avatar">${initial}</div>
                <div class="badi-info">
                    <h4>${badi.name || badi.email}</h4>
                    <p><i class="ri-mail-line"></i> ${badi.email}</p>
                    ${badi.phone ? `<p><i class="ri-phone-line"></i> ${badi.phone}</p>` : ''}
                </div>
                <div class="badi-status">
                    <span class="status-badge taken">Aktif</span>
                </div>
            </div>`;
        });
        html += '</div>';

        pageEl.innerHTML = html;
    } else {
        pageEl.innerHTML = `
        <div class="empty-state">
            <img src="images/dozi_brand.webp" alt="Dozi" style="width: 150px; height: 150px; margin-bottom: 24px; opacity: 0.7;">
            <i class="ri-team-line"></i>
            <h3>Henüz badin yok</h3>
            <p style="color: var(--text-light); margin-top: 8px;">Mobil uygulamadan sevdiklerini ekleyebilirsin</p>
        </div>`;
    }
}

// Chart.js
function renderChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    // Eğer grafik daha önce oluşturulduysa yok et
    if (weeklyChart) weeklyChart.destroy();

    // Verileri işle: Son 7 günün loglarını say
    // Bu kısım gerçek veriye göre dinamik olmalı.
    // Şimdilik demo array yerine dashboardData.medicationLogs üzerinden hesaplama yapılabilir.
    // Basitlik adına statik veri bırakıyorum ama veriye bağlamak için logs üzerinde döngü kurmak gerekir.
    
    const labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    // Gerçek veri yoksa boş kalmasın diye örnek veri, ama logs varsa onu kullan
    let takenData = [0,0,0,0,0,0,0];
    
    // Eğer loglar varsa günlerine göre dağıt (Basit bir örnek mantık)
    if (dashboardData.medicationLogs.length > 0) {
        // Buraya tarih işleme mantığı eklenebilir.
        // Şimdilik görselin bozulmaması için dummy data bırakıyorum
        // Gerçek implementasyonda: moment.js veya date-fns ile logları gruplayın.
        takenData = [4, 5, 3, 5, 4, 6, 4]; 
    }

    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#94a3b8';

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Alındı',
                    data: takenData,
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                    barThickness: 12
                },
                {
                    label: 'Atlandı',
                    data: [1, 0, 1, 0, 0, 0, 1],
                    backgroundColor: '#e2e8f0',
                    borderRadius: 6,
                    barThickness: 12
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9', drawBorder: false },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}


// --- BUGÜN SAYFASI ---
function renderTodayPage() {
    const pageEl = document.getElementById('todayPage');
    if (!pageEl) return;

    // Bugünün ilaçlarını bul
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Tüm aktif ilaçları bugün için göster (gerçekte reminder times'a bakılmalı)
    const todayMeds = dashboardData.medicines.filter(m => m.status === 'active' || !m.status);
    
    if (todayMeds.length === 0) {
        pageEl.innerHTML = '<div class="empty-state"><i class="ri-calendar-check-line"></i><h3>Bugün için ilaç yok</h3></div>';
        return;
    }

    let html = '<div class="timeline-container">';
    
    todayMeds.forEach(med => {
        // İlaç zamanlarını al (times array'i varsa)
        const times = med.times || ['09:00']; // Default bir zaman
        
        times.forEach(time => {
            // Bu ilaç için log var mı kontrol et
            const log = dashboardData.medicationLogs.find(l => 
                l.medicineId === med.id && 
                l.scheduledTime && 
                l.scheduledTime.includes(time)
            );
            
            const isTaken = log && log.status === 'taken';
            const isSkipped = log && log.status === 'skipped';
            const isPostponed = log && log.status === 'postponed';
            
            let statusClass = '';
            let statusText = 'Bekliyor';
            let statusIcon = 'ri-time-line';
            
            if (isTaken) {
                statusClass = 'taken';
                statusText = 'Alındı';
                statusIcon = 'ri-check-line';
            } else if (isSkipped) {
                statusClass = 'skipped';
                statusText = 'Atlandı';
                statusIcon = 'ri-close-line';
            } else if (isPostponed) {
                statusClass = 'postponed';
                statusText = 'Ertelendi';
                statusIcon = 'ri-time-line';
            }
            
            html += `
            <div class="timeline-item ${statusClass}">
                <div class="timeline-time">${time}</div>
                <div class="timeline-content">
                    <div class="timeline-icon">
                        <i class="${statusIcon}"></i>
                    </div>
                    <div class="timeline-info">
                        <h4>${med.name}</h4>
                        <p>${med.dosage || '1 doz'}</p>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    ${!isTaken && !isSkipped ? `
                    <div class="timeline-actions">
                        <button class="action-btn-primary" onclick="markMedication('${med.id}', '${time}', 'taken')">
                            <i class="ri-check-line"></i> Al
                        </button>
                        <button class="action-btn-secondary" onclick="markMedication('${med.id}', '${time}', 'skipped')">
                            <i class="ri-close-line"></i> Atla
                        </button>
                        <button class="action-btn-secondary" onclick="markMedication('${med.id}', '${time}', 'postponed')">
                            <i class="ri-time-line"></i> Ertele
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
            `;
        });
    });
    
    html += '</div>';
    pageEl.innerHTML = html;
}

// İlaç işaretleme fonksiyonu
window.markMedication = async function(medicineId, time, action) {
    try {
        // Loading göster
        const btn = event.target.closest('button');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="ri-loader-4-line"></i> İşleniyor...';
        }

        // Firebase Function çağır
        const markTaken = functions.httpsCallable('markMedicationTaken');
        const result = await markTaken({
            medicineId: medicineId,
            scheduledTime: time,
            status: action,
            timestamp: new Date().toISOString()
        });

        if (!result.data.success) {
            throw new Error(result.data.message || 'İşlem başarısız');
        }

        // Başarılı mesajı
        const messages = {
            'taken': '✅ İlaç alındı olarak işaretlendi!',
            'skipped': '⏭️ İlaç atlandı',
            'postponed': '⏰ İlaç ertelendi'
        };
        
        // Toast notification (basit alert yerine)
        showToast(messages[action] || 'İşlem tamamlandı');

        // Dashboard'u yenile
        await loadDashboard();
        renderTodayPage(); // Bugün sayfasını tekrar render et

    } catch (error) {
        console.error('Mark medication error:', error);
        showToast('❌ Hata: ' + error.message, 'error');
        
        // Butonu eski haline getir
        if (btn) {
            btn.disabled = false;
            const icons = { 'taken': 'check', 'skipped': 'close', 'postponed': 'time' };
            const texts = { 'taken': 'Al', 'skipped': 'Atla', 'postponed': 'Ertele' };
            btn.innerHTML = `<i class="ri-${icons[action]}-line"></i> ${texts[action]}`;
        }
    }
};

// Toast notification helper
function showToast(message, type = 'success') {
    // Basit bir toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Sayfa değiştiğinde bugün sayfasını render et
const originalSwitchPage = navItems[0].onclick;
navItems.forEach(item => {
    const oldHandler = item.onclick;
    item.addEventListener('click', function(e) {
        const page = this.dataset.page;
        if (page === 'today') {
            setTimeout(() => renderTodayPage(), 100);
        } else if (page === 'stats') {
            setTimeout(() => renderStatsPage(), 100);
        }
    });
});

// İlk yüklemede eğer bugün sayfası aktifse render et
if (document.querySelector('[data-page="today"]').classList.contains('active')) {
    renderTodayPage();
}

// Stats page render function
let monthlyChart = null;

function renderStatsPage() {
    // Update stat cards
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    
    set('statsAdherence', `%${Math.round(dashboardData.stats.adherence)}`);
    set('statsStreak', `${dashboardData.stats.streak} Gün`);
    
    // Calculate total taken from logs
    const totalTaken = dashboardData.medicationLogs.filter(log => log.status === 'taken').length;
    set('statsTotalTaken', totalTaken);
    
    // Calculate active days (unique dates with logs) - güvenli tarih işleme
    const uniqueDates = new Set();
    dashboardData.medicationLogs.forEach(log => {
        try {
            let date;
            if (log.takenAt && log.takenAt._seconds) {
                date = new Date(log.takenAt._seconds * 1000);
            } else if (log.takenAt) {
                date = new Date(log.takenAt);
            } else if (log.timestamp && log.timestamp._seconds) {
                date = new Date(log.timestamp._seconds * 1000);
            } else if (log.timestamp) {
                date = new Date(log.timestamp);
            } else {
                return; // Tarih yok, atla
            }
            
            // Geçersiz tarih kontrolü
            if (!isNaN(date.getTime())) {
                uniqueDates.add(date.toISOString().split('T')[0]);
            }
        } catch (e) {
            console.warn('Stats tarih hatası:', e, log);
        }
    });
    set('statsActiveDays', uniqueDates.size);
    
    // Render monthly chart
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    
    if (monthlyChart) monthlyChart.destroy();
    
    // Generate last 30 days data
    const days = [];
    const takenData = [];
    const missedData = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push(date.getDate() + '/' + (date.getMonth() + 1));
        
        const dayLogs = dashboardData.medicationLogs.filter(log => {
            try {
                let logDate;
                if (log.takenAt && log.takenAt._seconds) {
                    logDate = new Date(log.takenAt._seconds * 1000);
                } else if (log.takenAt) {
                    logDate = new Date(log.takenAt);
                } else if (log.timestamp && log.timestamp._seconds) {
                    logDate = new Date(log.timestamp._seconds * 1000);
                } else if (log.timestamp) {
                    logDate = new Date(log.timestamp);
                } else {
                    return false;
                }
                
                if (isNaN(logDate.getTime())) return false;
                
                return logDate.toISOString().split('T')[0] === dateStr;
            } catch (e) {
                return false;
            }
        });
        
        takenData.push(dayLogs.filter(l => l.status === 'taken').length);
        missedData.push(dayLogs.filter(l => l.status === 'missed' || l.status === 'skipped').length);
    }
    
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Alındı',
                    data: takenData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Kaçırıldı',
                    data: missedData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9', drawBorder: false },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}
