// Firebase Configuration - dozi.app için
const firebaseConfig = {
    apiKey: "AIzaSyBqxped2ZQS7uJHCX-MmCq0Nnj5Vtudloo",
    authDomain: "dozi-cd7cc.firebaseapp.com",
    projectId: "dozi-cd7cc",
    storageBucket: "dozi-cd7cc.firebasestorage.app",
    messagingSenderId: "393677078355",
    appId: "1:393677078355:web:415e8d15c58ec4d48ceba6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const functions = firebase.app().functions('europe-west3');

// UI Elements
const googleSignInBtn = document.getElementById('googleSignInBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Detect iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Google Sign-In
googleSignInBtn.addEventListener('click', async () => {
    try {
        showLoading(true);
        hideError();

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        // iOS Safari: use redirect instead of popup
        if (isIOS()) {
            // Store intent so we know to verify after redirect
            sessionStorage.setItem('dozi-login-pending', 'true');
            await auth.signInWithRedirect(provider);
            return; // Page will redirect, execution stops here
        }

        // Desktop/Android: use popup
        const result = await auth.signInWithPopup(provider);
        await verifyAndRedirect(result.user);

    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error));
        showLoading(false);
    }
});

// Handle redirect result (for iOS)
auth.getRedirectResult().then(async (result) => {
    if (result.user && sessionStorage.getItem('dozi-login-pending')) {
        sessionStorage.removeItem('dozi-login-pending');
        showLoading(true);
        hideError();
        try {
            await verifyAndRedirect(result.user);
        } catch (error) {
            console.error('Redirect login error:', error);
            showError(getErrorMessage(error));
            showLoading(false);
        }
    }
}).catch((error) => {
    console.error('Redirect result error:', error);
    sessionStorage.removeItem('dozi-login-pending');
    showError(getErrorMessage(error));
});

// Verify user with Cloud Function and redirect
async function verifyAndRedirect(user) {
    try {
        const verifyUser = functions.httpsCallable('verifyWebLogin');
        const response = await verifyUser({ uid: user.uid, email: user.email });

        if (!response.data.success) {
            await auth.signOut();
            throw new Error(response.data.message || 'Bu hesap Dozi uygulamasinda kayitli degil. Lutfen once mobil uygulamayi indirin.');
        }

        // Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        // Extract meaningful message from Firebase function errors
        if (error.code === 'internal' || error.message === 'INTERNAL' || error.message === 'internal') {
            await auth.signOut();
            throw new Error('Sunucu hatasi olustu. Lutfen tekrar deneyin.');
        }
        // Re-throw for outer catch
        throw error;
    }
}

// Auth State Observer - auto-redirect if already logged in
auth.onAuthStateChanged(async (user) => {
    // Skip if redirect login is in progress
    if (sessionStorage.getItem('dozi-login-pending')) return;

    if (user) {
        try {
            const verifyUser = functions.httpsCallable('verifyWebLogin');
            const response = await verifyUser({ uid: user.uid });
            
            if (response.data.success) {
                window.location.href = 'dashboard.html';
            } else {
                await auth.signOut();
                showError('Bu hesap Dozi uygulamasinda kayitli degil.');
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
        'auth/popup-closed-by-user': 'Giris penceresi kapatildi. Lutfen tekrar deneyin.',
        'auth/popup-blocked': 'Pop-up engellendi. Lutfen tarayici ayarlarinizi kontrol edin.',
        'auth/cancelled-popup-request': 'Giris islemi iptal edildi.',
        'auth/network-request-failed': 'Internet baglantinizi kontrol edin.',
        'auth/too-many-requests': 'Cok fazla deneme yapildi. Lutfen daha sonra tekrar deneyin.',
        'auth/user-disabled': 'Bu hesap devre disi birakilmis.',
        'auth/operation-not-allowed': 'Google girisi etkin degil.',
        'auth/web-storage-unsupported': 'Tarayiciniz desteklenmiyor. Safari ayarlarindan cerezleri aktif edin.',
        'auth/credential-already-in-use': 'Bu hesap zaten baska bir giris ile iliskilendirilmis.',
    };

    // Firebase Functions errors come with error.code like 'internal', 'unauthenticated', etc.
    if (error.code === 'internal' || error.code === 'unavailable') {
        return 'Sunucu hatasi olustu. Lutfen tekrar deneyin.';
    }
    if (error.code === 'unauthenticated') {
        return 'Oturum dogrulanamadi. Lutfen tekrar giris yapin.';
    }

    return errorMessages[error.code] || error.message || 'Bir hata olustu. Lutfen tekrar deneyin.';
}

// Security: Prevent clickjacking
if (window.top !== window.self) {
    window.top.location = window.self.location;
}
