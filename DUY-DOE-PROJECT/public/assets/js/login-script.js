// ===============================
// 🎬 LOGIN SCRIPT
// ===============================

// Admin credentials (ในสถานการณ์จริงควรเก็บไว้ในฐานข้อมูล)
const ADMIN_CREDENTIALS = {
    username: 'duydoe',
    password: 'admin123',
    email: 'admin@duydoe.com'
};

// Google Sign-In Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // ต้องแทนที่ด้วย Client ID จริง

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Login page loaded');
    console.log('🔍 DOM fully loaded');

    // Check if already logged in
    try {
        checkAuthStatus();
        console.log('✅ Auth status checked');
    } catch (error) {
        console.error('❌ Error checking auth status:', error);
    }

    // Initialize form
    try {
        initializeLoginForm();
        console.log('✅ Login form initialized');
    } catch (error) {
        console.error('❌ Error initializing login form:', error);
    }

    // Initialize Google Sign-In
    try {
        initializeGoogleSignIn();
        console.log('✅ Google Sign-In initialized');
    } catch (error) {
        console.error('❌ Error initializing Google Sign-In:', error);
    }

    // Setup password toggle
    try {
        setupPasswordToggle();
        console.log('✅ Password toggle setup');
    } catch (error) {
        console.error('❌ Error setting up password toggle:', error);
    }

    console.log('🎉 All login components initialized');
});

// ===============================
// CHECK AUTH STATUS
// ===============================
function checkAuthStatus() {
    console.log('🔍 Checking auth status...');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    const currentPage = window.location.pathname;

    console.log('🔍 Auth data:', {
        isLoggedIn,
        loginTime,
        currentTime: Date.now(),
        currentPage
    });

    if (isLoggedIn && loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        console.log('🔍 Time analysis:', {
            timeDiff,
            hoursDiff,
            within24Hours: hoursDiff < 24
        });

        // Auto logout after 24 hours
        if (hoursDiff < 24) {
            // Check if we're already on admin page to prevent redirect loop
            if (currentPage.includes('admin-add-movie.html')) {
                console.log('✅ Already on admin page, no redirect needed');
                return;
            }

            console.log('✅ User still logged in, redirecting...');
            // Redirect to admin page
            window.location.href = '/admin-add-movie.html';
            return;
        } else {
            console.log('⏰ Session expired, logging out...');
            // Clear expired session
            logout();
        }
    } else {
        console.log('🔍 User not logged in, staying on login page');
    }
}

// ===============================
// INITIALIZE LOGIN FORM
// ===============================
function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    const submitBtn = document.querySelector('button[type="submit"]');
    const googleBtn = document.getElementById('googleLoginBtn');

    console.log('🔍 Finding elements:', {
        form: !!form,
        submitBtn: !!submitBtn,
        googleBtn: !!googleBtn
    });

    if (form) {
        console.log('✅ Form found, adding submit listener');

        form.addEventListener('submit', async (e) => {
            console.log('🎯 Form submit event triggered!');
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            console.log('🔍 Login attempt:', { username, password: '***' });

            // Show loading
            showLoading(true);

            try {
                // Validate credentials
                if (validateCredentials(username, password)) {
                    console.log('✅ Login successful');
                    // Login successful
                    handleLoginSuccess(username, rememberMe);
                } else {
                    console.log('❌ Login failed');
                    // Login failed
                    showError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('เกิดข้อผิดพลาด กรุณาลองใหม่');
            } finally {
                showLoading(false);
            }
        });
    } else {
        console.error('❌ Login form not found');
    }

    // Add click listener for submit button as backup
    if (submitBtn) {
        console.log('✅ Submit button found, adding click listener');

        // Test click immediately
        submitBtn.addEventListener('click', (e) => {
            console.log('🎯 Submit button clicked!');
            console.log('🔍 Button details:', {
                type: submitBtn.type,
                disabled: submitBtn.disabled,
                form: !!submitBtn.form
            });

            e.preventDefault();
            e.stopPropagation();

            // Manual form validation and submission
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            console.log('🔍 Manual login attempt:', { username, password: '***' });

            if (!username || !password) {
                console.log('❌ Missing username or password');
                showError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
                return;
            }

            // Show loading
            showLoading(true);

            try {
                // Validate credentials
                if (validateCredentials(username, password)) {
                    console.log('✅ Manual login successful');
                    handleLoginSuccess(username, rememberMe);
                } else {
                    console.log('❌ Manual login failed');
                    showError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                }
            } catch (error) {
                console.error('Manual login error:', error);
                showError('เกิดข้อผิดพลาด กรุณาลองใหม่');
            } finally {
                showLoading(false);
            }
        });

        // Test if button is clickable
        console.log('🔍 Testing button:', {
            tagName: submitBtn.tagName,
            type: submitBtn.type,
            disabled: submitBtn.disabled,
            style: submitBtn.style.display,
            computedStyle: window.getComputedStyle(submitBtn).pointerEvents,
            offsetWidth: submitBtn.offsetWidth,
            offsetHeight: submitBtn.offsetHeight,
            visible: submitBtn.offsetWidth > 0 && submitBtn.offsetHeight > 0
        });

        // Add mouseover/mouseout testing
        submitBtn.addEventListener('mouseover', () => {
            console.log('🖱️ Mouse over submit button');
        });

        submitBtn.addEventListener('mouseout', () => {
            console.log('🖱️ Mouse out submit button');
        });

    } else {
        console.error('❌ Submit button not found');
    }

    // Add click listener for Google button
    if (googleBtn) {
        console.log('✅ Google button found, adding click listener');
        googleBtn.addEventListener('click', (e) => {
            console.log('🎯 Google button clicked!');
            e.preventDefault();
            e.stopPropagation();
            handleGoogleLogin();
        });
    } else {
        console.error('❌ Google button not found');
    }
}

// ===============================
// VALIDATE CREDENTIALS
// ===============================
function validateCredentials(username, password) {
    console.log('🔍 Validating:', username, password);

    // Check admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        console.log('✅ Admin credentials match');
        return true;
    }

    // You can add more validation logic here
    console.log('❌ Credentials do not match');
    return false;
}

// ===============================
// HANDLE LOGIN SUCCESS
// ===============================
function handleLoginSuccess(username, rememberMe) {
    console.log('🎉 Handling login success for:', username);

    // Save login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('loginTime', Date.now().toString());

    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberMe');
    }

    // Show success message
    showSuccess('เข้าสู่ระบบสำเร็จ!');

    // Redirect after delay
    setTimeout(() => {
        console.log('🔄 Redirecting to admin page');
        window.location.href = '/admin-add-movie.html';
    }, 1500);
}

// ===============================
// INITIALIZE GOOGLE SIGN-IN
// ===============================
function initializeGoogleSignIn() {
    console.log('🔍 Initializing Google Sign-In');

    const googleBtn = document.getElementById('googleLoginBtn');

    if (googleBtn) {
        console.log('✅ Google button found, adding click listener');

        googleBtn.addEventListener('click', () => {
            console.log('🎯 Google login clicked!');
            handleGoogleLogin();
        });
    } else {
        console.error('❌ Google button not found');
    }
}

// ===============================
// HANDLE GOOGLE LOGIN
// ===============================
function handleGoogleLogin() {
    console.log('🔍 Handling Google login');

    // For demo purposes, we'll simulate Google login
    // In production, you need to set up Google Sign-In properly

    showLoading(true);

    // Simulate Google login process
    setTimeout(() => {
        // Check if this is the admin's Google account
        // In production, you'd verify the Google token

        // For demo, we'll allow any Google login for admin
        handleGoogleLoginSuccess();
    }, 2000);
}

// ===============================
// HANDLE GOOGLE LOGIN SUCCESS
// ===============================
function handleGoogleLoginSuccess() {
    // In production, you'd verify the Google token here
    // For demo, we'll simulate successful Google login

    // Save login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', 'admin');
    localStorage.setItem('loginMethod', 'google');
    localStorage.setItem('loginTime', Date.now().toString());

    showSuccess('เข้าสู่ระบบด้วย Google สำเร็จ!');

    setTimeout(() => {
        window.location.href = '/admin-add-movie.html';
    }, 1500);
}

// ===============================
// SETUP PASSWORD TOGGLE
// ===============================
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    console.log('🔍 Setting up password toggle:', {
        toggleBtn: !!toggleBtn,
        passwordInput: !!passwordInput
    });

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            console.log('👁️ Password toggle clicked');
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;

            // Update icon
            const icon = toggleBtn.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
}

// ===============================
// SHOW LOADING
// ===============================
function showLoading(show) {
    const submitBtn = document.querySelector('button[type="submit"]');
    const googleBtn = document.getElementById('googleLoginBtn');

    if (show) {
        submitBtn?.classList.add('loading');
        submitBtn.disabled = true;
        googleBtn?.classList.add('loading');
        googleBtn.disabled = true;
    } else {
        submitBtn?.classList.remove('loading');
        submitBtn.disabled = false;
        googleBtn?.classList.remove('loading');
        googleBtn.disabled = false;
    }
}

// ===============================
// SHOW ERROR
// ===============================
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successDiv = document.getElementById('successMessage');

    // Hide success message
    successDiv.style.display = 'none';

    // Show error message
    errorText.textContent = message;
    errorDiv.style.display = 'flex';

    // Auto hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// ===============================
// SHOW SUCCESS
// ===============================
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const errorDiv = document.getElementById('errorMessage');

    // Hide error message
    errorDiv.style.display = 'none';

    // Show success message
    successText.textContent = message;
    successDiv.style.display = 'flex';
}

// ===============================
// LOGOUT FUNCTION
// ===============================
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('loginMethod');

    // Redirect to login page
    if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
}

// ===============================
// CHECK ADMIN ACCESS
// ===============================
function checkAdminAccess() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        window.location.href = '/login.html';
        return false;
    }

    return true;
}

// ===============================
// GLOBAL FUNCTIONS
// ===============================

// Make logout available globally
window.logout = logout;

// Make checkAdminAccess available globally
window.checkAdminAccess = checkAdminAccess;

// Auto-logout after inactivity
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        console.log('🕐 Auto-logout due to inactivity');
        logout();
    }, 30 * 60 * 1000); // 30 minutes
}

// Reset timer on user activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);

// Start timer
resetInactivityTimer();
