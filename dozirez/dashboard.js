// Session Management
let currentSession = null;
let reservationsData = [];

// Initialize Dashboard
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeNavigation();
    loadDashboardData();
});

// Check Authentication
function checkAuth() {
    const session = localStorage.getItem('dozirez_session') || sessionStorage.getItem('dozirez_session');
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentSession = JSON.parse(session);
        const hoursSinceLogin = (Date.now() - currentSession.timestamp) / (1000 * 60 * 60);
        
        if (hoursSinceLogin >= 24) {
            logout();
            return;
        }
        
        // Display pharmacy info
        document.getElementById('pharmacyName').textContent = currentSession.pharmacyName || 'Eczane';
        document.getElementById('pharmacyId').textContent = `ID: ${currentSession.pharmacyId}`;
        
        // Set avatar initial
        const avatar = document.querySelector('.pharmacy-avatar');
        avatar.textContent = (currentSession.pharmacyName || 'E').charAt(0).toUpperCase();
        
    } catch (error) {
        console.error('Session error:', error);
        logout();
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await fetch(`https://us-central1-dozi-app.cloudfunctions.net/getPharmacyReservations?pharmacyId=${currentSession.pharmacyId}`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        const data = await response.json();
        reservationsData = data.reservations || [];
        
        updateStats(data.stats);
        updateRecentReservations(reservationsData.slice(0, 5));
        updateAllReservations(reservationsData);
        
    } catch (error) {
        console.error('Load data error:', error);
        // Show demo data for development
        loadDemoData();
    }
}

// Load Demo Data (for development)
function loadDemoData() {
    const demoData = {
        stats: {
            total: 127,
            completed: 98,
            pending: 12,
            avgResponseTime: '12 dk'
        },
        reservations: [
            {
                id: 'REZ001',
                date: '2025-01-29 14:30',
                customerName: 'Ahmet Y.',
                customerEmail: 'ahmet@example.com',
                medicineName: 'Aspirin 100mg',
                quantity: 2,
                status: 'PENDING',
                notes: ''
            },
            {
                id: 'REZ002',
                date: '2025-01-29 13:15',
                customerName: 'Ayşe K.',
                customerEmail: 'ayse@example.com',
                medicineName: 'Parol 500mg',
                quantity: 1,
                status: 'CONFIRMED',
                notes: 'Acil'
            },
            {
                id: 'REZ003',
                date: '2025-01-29 12:00',
                customerName: 'Mehmet D.',
                customerEmail: 'mehmet@example.com',
                medicineName: 'Majezik 25mg',
                quantity: 3,
                status: 'READY',
                notes: ''
            },
            {
                id: 'REZ004',
                date: '2025-01-29 10:45',
                customerName: 'Fatma S.',
                customerEmail: 'fatma@example.com',
                medicineName: 'Coraspin 100mg',
                quantity: 1,
                status: 'COMPLETED',
                notes: ''
            },
            {
                id: 'REZ005',
                date: '2025-01-28 16:20',
                customerName: 'Ali V.',
                customerEmail: 'ali@example.com',
                medicineName: 'Voltaren 50mg',
                quantity: 2,
                status: 'COMPLETED',
                notes: ''
            }
        ]
    };
    
    reservationsData = demoData.reservations;
    updateStats(demoData.stats);
    updateRecentReservations(demoData.reservations.slice(0, 5));
    updateAllReservations(demoData.reservations);
}

// Update Stats
function updateStats(stats) {
    document.getElementById('totalReservations').textContent = stats.total;
    document.getElementById('completedReservations').textContent = stats.completed;
    document.getElementById('pendingReservations').textContent = stats.pending;
    document.getElementById('avgResponseTime').textContent = stats.avgResponseTime;
    document.getElementById('pendingBadge').textContent = stats.pending;
}

// Update Recent Reservations
function updateRecentReservations(reservations) {
    const tbody = document.getElementById('recentReservationsTable');
    
    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Henüz rezervasyon yok</td></tr>';
        return;
    }
    
    tbody.innerHTML = reservations.map(res => `
        <tr>
            <td>${formatDate(res.date)}</td>
            <td>${res.customerName}</td>
            <td>${res.medicineName}</td>
            <td>${res.quantity}</td>
            <td><span class="status-badge ${res.status.toLowerCase()}">${getStatusText(res.status)}</span></td>
            <td>
                <button class="action-btn view" onclick="viewReservation('${res.id}')">
                    Detay
                </button>
            </td>
        </tr>
    `).join('');
}

// Update All Reservations
function updateAllReservations(reservations, filterStatus = 'all') {
    const tbody = document.getElementById('allReservationsTable');
    
    let filtered = reservations;
    if (filterStatus !== 'all') {
        filtered = reservations.filter(r => r.status === filterStatus);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Rezervasyon bulunamadı</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(res => `
        <tr>
            <td>${res.id}</td>
            <td>${formatDate(res.date)}</td>
            <td>${res.customerName}</td>
            <td>${res.medicineName}</td>
            <td>${res.quantity}</td>
            <td><span class="status-badge ${res.status.toLowerCase()}">${getStatusText(res.status)}</span></td>
            <td>
                <button class="action-btn view" onclick="viewReservation('${res.id}')">
                    Detay
                </button>
            </td>
        </tr>
    `).join('');
}

// View Reservation Detail
function viewReservation(reservationId) {
    const reservation = reservationsData.find(r => r.id === reservationId);
    if (!reservation) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: var(--dozi-gray);">Rezervasyon ID</h4>
            <p style="font-size: 18px; font-weight: 600;">${reservation.id}</p>
        </div>
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: var(--dozi-gray);">Müşteri Bilgileri</h4>
            <p style="font-weight: 600;">${reservation.customerName}</p>
            <p style="color: var(--dozi-gray);">${reservation.customerEmail}</p>
        </div>
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: var(--dozi-gray);">İlaç Bilgileri</h4>
            <p style="font-weight: 600;">${reservation.medicineName}</p>
            <p style="color: var(--dozi-gray);">Miktar: ${reservation.quantity} kutu</p>
        </div>
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: var(--dozi-gray);">Durum</h4>
            <span class="status-badge ${reservation.status.toLowerCase()}">${getStatusText(reservation.status)}</span>
        </div>
        ${reservation.notes ? `
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: var(--dozi-gray);">Notlar</h4>
            <p>${reservation.notes}</p>
        </div>
        ` : ''}
        <div style="display: flex; gap: 12px; margin-top: 24px;">
            ${reservation.status === 'PENDING' ? `
                <button class="btn btn-primary" onclick="updateReservationStatus('${reservation.id}', 'CONFIRMED')">
                    Onayla
                </button>
            ` : ''}
            ${reservation.status === 'CONFIRMED' ? `
                <button class="btn btn-primary" onclick="updateReservationStatus('${reservation.id}', 'READY')">
                    Hazır Olarak İşaretle
                </button>
            ` : ''}
            ${reservation.status === 'READY' ? `
                <button class="btn btn-primary" onclick="updateReservationStatus('${reservation.id}', 'COMPLETED')">
                    Tamamlandı
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="closeModal()">Kapat</button>
        </div>
    `;
    
    document.getElementById('reservationModal').classList.remove('hidden');
}

// Update Reservation Status
async function updateReservationStatus(reservationId, newStatus) {
    try {
        const response = await fetch('https://us-central1-dozi-app.cloudfunctions.net/updateReservationStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentSession.token}`
            },
            body: JSON.stringify({
                reservationId,
                status: newStatus,
                pharmacyId: currentSession.pharmacyId
            })
        });
        
        if (response.ok) {
            closeModal();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Update status error:', error);
        alert('Durum güncellenirken bir hata oluştu.');
    }
}

// Close Modal
function closeModal() {
    document.getElementById('reservationModal').classList.add('hidden');
}

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            loadPage(page);
        });
    });
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const status = btn.dataset.status;
            updateAllReservations(reservationsData, status);
        });
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function loadPage(pageName) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    const pageMap = {
        'overview': 'overviewPage',
        'reservations': 'reservationsPage',
        'stats': 'statsPage',
        'settings': 'settingsPage'
    };
    
    const pageId = pageMap[pageName];
    if (pageId) {
        document.getElementById(pageId).classList.remove('hidden');
    }
    
    // Update page title
    const titles = {
        'overview': 'Genel Bakış',
        'reservations': 'Rezervasyonlar',
        'stats': 'İstatistikler',
        'settings': 'Ayarlar'
    };
    document.querySelector('.page-title').textContent = titles[pageName];
}

// Logout
function logout() {
    localStorage.removeItem('dozirez_session');
    sessionStorage.removeItem('dozirez_session');
    window.location.href = 'login.html';
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return `Bugün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Dün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
               ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Bekliyor',
        'CONFIRMED': 'Onaylandı',
        'READY': 'Hazır',
        'COMPLETED': 'Tamamlandı',
        'CANCELLED': 'İptal',
        'REJECTED': 'Reddedildi',
        'EXPIRED': 'Süresi Doldu'
    };
    return statusMap[status] || status;
}

// Auto refresh every 2 minutes
setInterval(() => {
    loadDashboardData();
}, 120000);
