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

// Track if we're in the middle of a login attempt
let loginInProgress = false;

// Detect iOS/mobile Safari
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Google Sign-In button handler
googleSignInBtn.addEventListener('click', async () => {
    try {
        showLoading(true);
        hideError();
        loginInProgress = true;

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        // iOS Safari: use redirect (popup is unreliable on iOS)
        if (isIOS()) {
            await auth.signInWithRedirect(provider);
            // Page navigates away, code below won't run
            return;
        }

        // Desktop/Android: use popup
        const result = await auth.signInWithPopup(provider);
        // onAuthStateChanged will handle the rest
        
    } catch (error) {
        console.error('Login error:', error);
        loginInProgress = false;
        showError(getErrorMessage(error));
        showLoading(false);
    }
});

// Single auth handler: works for both popup, redirect, and returning users
auth.onAuthStateChanged(async (user) => {
    if (user) {
        showLoading(true);
        hideError();
        try {
            const verifyUser = functions.httpsCallable('verifyWebLogin');
            const response = await verifyUser({ uid: user.uid, email: user.email });
            
            if (response.data.success) {
                window.location.href = 'dashboard.html';
            } else {
                await auth.signOut();
                showError(response.data.message || 'Bu hesap Dozi uygulamasinda kayitli degil. Lutfen once mobil uygulamayi indirin.');
                showLoading(false);
            }
        } catch (error) {
            console.error('Verify error:', error);
            await auth.signOut();
            showError(getErrorMessage(error));
            showLoading(false);
        }
    } else {
        // No user signed in - if we were loading (redirect return with no user), stop
        showLoading(false);
    }
});

// Helper Functions
function showLoading(show) {
    if (loading) loading.classList.toggle('active', show);
    if (googleSignInBtn) {
        googleSignInBtn.disabled = show;
        googleSignInBtn.style.opacity = show ? '0.6' : '1';
    }
}

function showError(message) {
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('active');
    }
}

function hideError() {
    if (errorDiv) errorDiv.classList.remove('active');
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

    // Firebase Functions errors
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
