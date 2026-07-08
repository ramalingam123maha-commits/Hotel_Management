// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const togglePasswordButton = document.getElementById('togglePassword');
const formMessage = document.getElementById('formMessage');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Sample credentials for demo (in production, this would be handled by backend)
const DEMO_CREDENTIALS = {
    email: 'admin@hotel.com',
    password: 'password123'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRememberedEmail();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    togglePasswordButton.addEventListener('click', togglePasswordVisibility);
    emailInput.addEventListener('input', clearEmailError);
    passwordInput.addEventListener('input', clearPasswordError);
}

// Handle Login Form Submission
async function handleLogin(e) {
    e.preventDefault();

    // Clear previous messages
    clearMessages();

    // Validate inputs
    if (!validateForm()) {
        return;
    }

    // Disable button and show loading state
    const loginButton = loginForm.querySelector('.login-button');
    const originalButtonText = loginButton.textContent;
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
        // Simulate API call delay
        await simulateApiCall(1500);

        // Validate credentials
        if (validateCredentials(emailInput.value, passwordInput.value)) {
            showSuccessMessage('Login successful! Redirecting...');
            
            // Save email if "Remember me" is checked
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Save login session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', emailInput.value);

            // Simulate redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/dashboard.html'; // Replace with actual dashboard URL
            }, 2000);
        } else {
            showErrorMessage('Invalid email or password. Please try again.');
        }
    } catch (error) {
        showErrorMessage('An error occurred. Please try again.');
        console.error('Login error:', error);
    } finally {
        // Re-enable button
        loginButton.disabled = false;
        loginButton.textContent = originalButtonText;
    }
}

// Validate Form Inputs
function validateForm() {
    let isValid = true;

    // Validate email
    if (!emailInput.value.trim()) {
        showEmailError('Email is required');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showEmailError('Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!passwordInput.value) {
        showPasswordError('Password is required');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        showPasswordError('Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate Credentials (Demo)
function validateCredentials(email, password) {
    return email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type');
    if (type === 'password') {
        passwordInput.setAttribute('type', 'text');
        togglePasswordButton.innerHTML = '<span>🙈</span>';
    } else {
        passwordInput.setAttribute('type', 'password');
        togglePasswordButton.innerHTML = '<span>👁️</span>';
    }
}

// Error Display Functions
function showEmailError(message) {
    emailError.textContent = message;
    emailError.classList.add('show');
    emailInput.classList.add('error');
}

function clearEmailError() {
    emailError.classList.remove('show');
    emailInput.classList.remove('error');
}

function showPasswordError(message) {
    passwordError.textContent = message;
    passwordError.classList.add('show');
    passwordInput.classList.add('error');
}

function clearPasswordError() {
    passwordError.classList.remove('show');
    passwordInput.classList.remove('error');
}

// Message Display Functions
function showSuccessMessage(message) {
    formMessage.textContent = message;
    formMessage.className = 'form-message success';
}

function showErrorMessage(message) {
    formMessage.textContent = message;
    formMessage.className = 'form-message error';
}

function clearMessages() {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
}

// Load Remembered Email
function loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }
}

// Simulate API Call
function simulateApiCall(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

// Handle Forgot Password
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset functionality would be implemented here.\nFor demo: use admin@hotel.com / password123');
});

// Handle Sign Up Link
document.querySelector('.login-footer a').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Sign up page would be implemented here.');
});

// Log in with Enter key
loginForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// Demo Info
console.log('🔐 DEMO LOGIN CREDENTIALS:');
console.log('Email:', DEMO_CREDENTIALS.email);
console.log('Password:', DEMO_CREDENTIALS.password);
