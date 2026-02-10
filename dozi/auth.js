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

// Google Sign-In - use popup for all platforms
googleSignInBtn.addEventListener('click', async () => {
    try {
        showLoading(true);
        hideError();

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        // Use popup for all platforms
        // onAuthStateChanged below will handle verify + redirect
        await auth.signInWithPopup(provider);

    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error));
        showLoading(false);
    }
});

// Auth state handler: verify user and redirect to dashboard
auth.onAuthStateChanged(async (user) => {
    if (user) {
        showLoading(true);
        hideError();
        try {
            const verifyUser = functions.httpsCallable('verifyWebLogin');
            const response = await verifyUser({ uid: user.uid, email: user.email });

            if (response.data.success) {
                // If new user registered via web, redirect to dashboard with flag
                if (response.data.isNewUser) {
                    window.location.href = 'dashboard.html?welcome=new';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                await auth.signOut();
                showError(response.data.message || 'Giris yapilamadi. Lutfen tekrar deneyin.');
                showLoading(false);
            }
        } catch (error) {
            console.error('Verify error:', error);
            await auth.signOut();
            showError(getErrorMessage(error));
            showLoading(false);
        }
    } else {
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
