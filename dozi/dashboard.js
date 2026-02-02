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

// --- UTILS (Hata Önleyici Yardımcılar) ---

// Tarih verisini güvenli bir şekilde işleyen fonksiyon
function parseDate(input) {
    if (!input) return new Date(); // Veri yoksa şu anı döndür
    
    try {
        // Firestore Timestamp formatı ({_seconds: ..., _nanoseconds: ...})
        if (input._seconds) return new Date(input._seconds * 1000);
        if (input.seconds) return new Date(input.seconds * 1000); // Bazı versiyonlarda _ olmadan gelir
        
        // String veya Number (milisaniye) formatı
        const date = new Date(input);
        
        // Eğer geçersiz tarih oluştuysa (Invalid Date)
        if (isNaN(date.getTime())) return new Date();
        
        return date;
    } catch (e) {
        console.warn("Tarih çevirme hatası:", e);
        return new Date(); // Hata durumunda çökmemesi için şu anı döndür
    }
}

// --- EVENT LISTENERS ---

// UI Elements
const loadingScreen = document.getElementById('loadingScreen');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobileOverlay');
const navItems = document.querySelectorAll('.menu-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');

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
        navItems.forEach(nav => nav.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        item.classList.add('active');
        const pageId = item.dataset.page + 'Page';
        const targetPage = document.getElementById(pageId);
        if(targetPage) targetPage.classList.add('active');
        
        const title = item.querySelector('span').textContent;
        if(pageTitle) pageTitle.textContent = title;
        
        if (window.innerWidth <= 768) {
            toggleSidebar(false);
        }
    });
});

// Auth State
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

// Refresh
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
        if (!dashboardData.user) loadingScreen.classList.remove('hidden');

        const getDashboardData = functions.httpsCallable('getUserDashboardData');
        const result = await getDashboardData();
        
        if (!result.data.success) {
            throw new Error(result.data.message || 'Veri çekilemedi');
        }

        const data = result.data.data;
        
        dashboardData.user = data.user;
        dashboardData.medicines = data.medicines || [];
        dashboardData.badis = data.badis || [];
        dashboardData.medicationLogs = data.medicationLogs || [];
        
        calculateStats(); // Hata veren fonksiyon burasıydı, artık güvenli
        updateUserProfile();
        updateStatsUI();
        renderRecentActivity();
        renderMedicinesList();
        renderBadisList();
        renderChart();

        loadingScreen.classList.add('hidden');

    } catch (error) {
        console.error('Dashboard error:', error);
        // Hata olsa bile ekranı aç ki kullanıcı takılı kalmasın
        loadingScreen.classList.add('hidden');
        // alert('Veri yükleme hatası: ' + error.message); // Kullanıcıyı çok rahatsız etmemek için kapattım
    }
}

function calculateStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Aktif ilaçlar
    const activeMeds = dashboardData.medicines.filter(m => m.status === 'active' || !m.status);
    const totalDoses = activeMeds.length;
    
    // Bugün alınanlar - GÜVENLİ TARİH KONTROLÜ İLE
    const todayLogs = dashboardData.medicationLogs.filter(log => {
        const logDate = parseDate(log.takenAt || log.timestamp);
        
        // toISOString kullanmadan önce tarih geçerli mi kontrolü parseDate içinde yapıldı ama yine de:
        const logDateString = logDate.toISOString().split('T')[0];
        
        return logDateString === today && log.status === 'taken';
    });

    dashboardData.stats = {
        totalMedicines: activeMeds.length,
        todayTaken: todayLogs.length,
        todayDoses: totalDoses > 0 ? totalDoses : todayLogs.length, 
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
    
    const todayBadge = document.getElementById('todayBadge');
    if (todayBadge) {
        const remaining = Math.max(0, dashboardData.stats.todayDoses - dashboardData.stats.todayTaken);
        todayBadge.textContent = remaining;
        todayBadge.style.display = remaining > 0 ? 'inline-block' : 'none';
    }
}

function updateStatsUI() {
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

    const recentLogs = dashboardData.medicationLogs.slice(0, 5);
    
    listEl.innerHTML = recentLogs.map(log => {
        const date = parseDate(log.takenAt || log.timestamp); // Güvenli tarih
        const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const isTaken = log.status === 'taken';
        const statusClass = isTaken ? 'status-taken' : 'status-missed';
        const statusText = isTaken ? 'Alındı' : 'Atlandı';
        const icon = isTaken ? 'ri-check-line' : 'ri-close-line';
        
        return `
        <div class="activity-item">
            <div class="activity-icon ${isTaken ? 'success' : 'danger'}">
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
        let html = '<div class="stats-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">';
        dashboardData.medicines.forEach(med => {
            html += `
            <div class="stat-card border-left-blue">
                <div class="stat-icon blue"><i class="ri-capsule-line"></i></div>
                <div class="stat-info">
                    <span class="stat-value" style="font-size: 1.1rem;">${med.name}</span>
                    <span class="stat-label">${med.dosage || '1'} Doz • ${med.frequency || 'Her gün'}</span>
                </div>
            </div>`;
        });
        html += '</div>';
        
        const emptyState = pageEl.querySelector('.empty-state');
        if (emptyState) pageEl.innerHTML = html;
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
        let html = '<div class="content-grid">';
        dashboardData.badis.forEach(badi => {
            html += `
            <div class="card">
                <div class="card-body" style="display:flex; align-items:center; gap:15px;">
                    <div class="activity-icon" style="background:#e0f2fe; color:#0284c7;">
                        <i class="ri-user-smile-line"></i>
                    </div>
                    <div>
                        <h4 style="margin:0; color:var(--text-dark)">${badi.name || badi.email}</h4>
                        <p style="margin:0; font-size:0.85rem; color:var(--text-light)">Badi</p>
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';

        const emptyState = pageEl.querySelector('.empty-state');
        if (emptyState) pageEl.innerHTML = html;
    }
}

function renderChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    if (weeklyChart) weeklyChart.destroy();

    const labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    // Demo verisi (Gerçek veriyi burada map etmek lazım)
    const takenData = [4, 5, 3, 5, 4, 6, 4]; 

    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#64748b';

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Alındı',
                    data: takenData,
                    backgroundColor: '#3b82f6',
                    hoverBackgroundColor: '#2563eb',
                    borderRadius: 8,
                    barThickness: 16
                },
                {
                    label: 'Atlandı',
                    data: [1, 0, 1, 0, 0, 0, 1],
                    backgroundColor: '#e2e8f0',
                    hoverBackgroundColor: '#cbd5e1',
                    borderRadius: 8,
                    barThickness: 16
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20, font: {size: 12} }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9', drawBorder: false },
                    border: { display: false },
                    ticks: { padding: 10 }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}
