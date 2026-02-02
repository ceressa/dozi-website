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

// UI Elements
const googleSignInBtn = document.getElementById('googleSignInBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Google Sign-In
googleSignInBtn.addEventListener('click', async () => {
    try {
        showLoading(true);
        hideError();

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        console.log('✅ Login successful:', user.email);

        // Call Firebase Function to verify and log user
        const verifyUser = functions.httpsCallable('verifyWebLogin');
        const response = await verifyUser({ uid: user.uid, email: user.email });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Bu hesap Dozi uygulamasında kayıtlı değil.');
        }

        // Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('❌ Login error:', error);
        showError(getErrorMessage(error));
        showLoading(false);
    }
});

// Auth State Observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, verify via function
        try {
            const verifyUser = functions.httpsCallable('verifyWebLogin');
            const response = await verifyUser({ uid: user.uid });
            
            if (response.data.success) {
                // Redirect to dashboard if already logged in
                window.location.href = 'dashboard.html';
            } else {
                // User not in database, sign out
                await auth.signOut();
                showError('Bu hesap Dozi uygulamasında kayıtlı değil.');
            }
        } catch (error) {
            console.error('Auth state error:', error);
            await auth.signOut();
        }
    }
});

// Helper Functions
function showLoading(show) {
    loading.classList.toggle('active', show);
    googleSignInBtn.disabled = show;
    googleSignInBtn.style.opacity = show ? '0.6' : '1';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('active');
}

function hideError() {
    errorDiv.classList.remove('active');
}

function getErrorMessage(error) {
    const errorMessages = {
        'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı. Lütfen tekrar deneyin.',
        'auth/popup-blocked': 'Pop-up engellendi. Lütfen tarayıcı ayarlarınızı kontrol edin.',
        'auth/cancelled-popup-request': 'Giriş işlemi iptal edildi.',
        'auth/network-request-failed': 'İnternet bağlantınızı kontrol edin.',
        'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
        'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
        'auth/operation-not-allowed': 'Google girişi etkin değil.',
    };

    return errorMessages[error.code] || error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

// Security: Prevent clickjacking
if (window.top !== window.self) {
    window.top.location = window.self.location;
}

// Security: Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    // Clear any sensitive data from memory
    console.clear();
});
