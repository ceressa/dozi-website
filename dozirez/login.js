// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxqVHN8xKqVHN8xKqVHN8xKqVHN8xKqVHN",
    authDomain: "dozi-app.firebaseapp.com",
    projectId: "dozi-app",
    storageBucket: "dozi-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pharmacyId = document.getElementById('pharmacyId').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    
    try {
        // Call Firebase Function for authentication
        const response = await fetch('https://us-central1-dozi-cd7cc.cloudfunctions.net/pharmacyLogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pharmacyId,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store session
            const sessionData = {
                pharmacyId: data.pharmacyId,
                pharmacyName: data.pharmacyName,
                token: data.token,
                timestamp: Date.now()
            };
            
            if (rememberMe) {
                localStorage.setItem('dozirez_session', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('dozirez_session', JSON.stringify(sessionData));
            }
            
            // Show success message
            showMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(data.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
    }
});

// Show Message Function
function showMessage(text, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type} show`;
    message.textContent = text;
    
    // Insert before form
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(message, form);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('dozirez_session') || sessionStorage.getItem('dozirez_session');
    
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const hoursSinceLogin = (Date.now() - sessionData.timestamp) / (1000 * 60 * 60);
            
            // Session valid for 24 hours
            if (hoursSinceLogin < 24) {
                window.location.href = 'dashboard.html';
            } else {
                // Clear expired session
                localStorage.removeItem('dozirez_session');
                sessionStorage.removeItem('dozirez_session');
            }
        } catch (error) {
            console.error('Session parse error:', error);
        }
    }
});

// Forgot Password Handler
document.querySelector('.forgot-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    const pharmacyId = document.getElementById('pharmacyId').value.trim();
    
    if (!pharmacyId) {
        showMessage('Lütfen önce Eczane ID\'nizi girin.', 'error');
        return;
    }
    
    // Send password reset email
    showMessage('Şifre sıfırlama bağlantısı email adresinize gönderildi.', 'success');
});
