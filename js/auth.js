(() => {
    const allowedPages = new Set([
        'about.html',
        'cars.html',
        'contact.html',
        'import.html',
        'tricycles.html',
        'vehicle-details.html',
        'admin.html'
    ]);
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    const isAuthPage = ['signup.html', 'login.html', 'forgot-password.html', 'reset-password.html'].includes(pageName);
    const isAdminPage = pageName === 'admin.html';

    function destinationFrom(value) {
        if (!value) return 'index.html';

        try {
            const destination = new URL(value, window.location.href);
            const destinationPage = destination.pathname.split('/').pop();
            if (destination.origin !== window.location.origin ||
                (destinationPage !== 'index.html' && !allowedPages.has(destinationPage))) {
                return 'index.html';
            }
            return `${destinationPage}${destination.search}${destination.hash}`;
        } catch {
            return 'index.html';
        }
    }

    function authUrl(page, destination) {
        const params = new URLSearchParams();
        params.set('next', destinationFrom(destination));
        return `${page}?${params.toString()}`;
    }

    function showMessage(element, message) {
        if (element) element.textContent = message;
    }

    function isAuthenticated() {
        return localStorage.getItem('authToken') !== null;
    }

    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        window.location.href = 'index.html';
    }

    // Make logout available globally
    window.ZackconnectAuth = {
        logout,
        isAuthenticated,
        getUserInfo() {
            try {
                return JSON.parse(localStorage.getItem('userInfo') || 'null');
            } catch {
                return null;
            }
        }
    };

    function initHomeGate() {
        if (isAuthenticated()) return;

        document.addEventListener('click', event => {
            const link = event.target.closest('a[href]');
            if (!link || event.defaultPrevented || event.button !== 0 ||
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const destination = new URL(link.href, window.location.href);
            const targetPage = destination.pathname.split('/').pop();
            if (destination.origin !== window.location.origin || !allowedPages.has(targetPage)) return;

            event.preventDefault();
            window.location.href = authUrl('signup.html', `${targetPage}${destination.search}${destination.hash}`);
        });

        const searchForm = document.getElementById('searchForm');
        if (!searchForm) return;

        searchForm.addEventListener('submit', event => {
            event.preventDefault();

            const destination = new URL(searchForm.action, window.location.href);
            const formData = new FormData(searchForm);
            for (const [key, value] of formData.entries()) {
                if (typeof value === 'string' && value.trim()) destination.searchParams.set(key, value.trim());
            }
            window.location.href = authUrl('signup.html', `${destination.pathname.split('/').pop()}${destination.search}`);
        });
    }

    function initSignup() {
        const form = document.getElementById('signupForm');
        if (!form) return;

        const message = document.getElementById('signupMessage');
        const next = destinationFrom(new URLSearchParams(window.location.search).get('next'));
        document.querySelectorAll('a[href="login.html"]').forEach(link => {
            link.href = authUrl('login.html', next);
        });

        form.addEventListener('submit', async event => {
            event.preventDefault();
            showMessage(message, '');

            const name = form.elements.name.value.trim();
            const email = form.elements.email.value.trim();
            const password = form.elements.password.value;
            const confirmPassword = form.elements.confirmPassword.value;

            if (!name || !email || !password || !confirmPassword) {
                showMessage(message, 'Please complete all fields.');
                return;
            }
            if (!form.elements.email.validity.valid) {
                showMessage(message, 'Enter a valid email address.');
                return;
            }
            if (password.length < 8) {
                showMessage(message, 'Your password must be at least 8 characters.');
                return;
            }
            if (password !== confirmPassword) {
                showMessage(message, 'The passwords do not match.');
                return;
            }

            // Call backend API
            if (window.ZackconnectAPI) {
                try {
                    showMessage(message, 'Creating your account...');
                    await window.ZackconnectAPI.AuthAPI.signup({ name, email, password });
                    showMessage(message, 'Account created successfully! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = authUrl('login.html', next);
                    }, 2000);
                } catch (error) {
                    console.error('Signup error:', error);
                    showMessage(message, error.message || 'Failed to create account. Please try again.');
                }
            } else {
                showMessage(message, 'API not available. Please try again later.');
            }
        });
    }

    function initLogin() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        const params = new URLSearchParams(window.location.search);
        const emailInput = document.getElementById('loginEmail');
        const next = destinationFrom(params.get('next'));
        if (params.has('email')) emailInput.value = params.get('email');
        document.querySelectorAll('a[href="signup.html"]').forEach(link => {
            link.href = authUrl('signup.html', next);
        });
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            const updateForgotPasswordLink = () => {
                const email = emailInput.value.trim();
                forgotPasswordLink.href = email
                    ? `forgot-password.html?email=${encodeURIComponent(email)}`
                    : 'forgot-password.html';
            };
            updateForgotPasswordLink();
            emailInput.addEventListener('input', updateForgotPasswordLink);
        }

        form.addEventListener('submit', async event => {
            event.preventDefault();
            const email = emailInput.value.trim();
            const password = form.elements.password.value;

            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }

            // Call backend API
            if (window.ZackconnectAPI) {
                try {
                    const response = await window.ZackconnectAPI.AuthAPI.login(email, password);
                    if (next === 'admin.html' && response.user.role !== 'admin') {
                        showMessage(document.getElementById('loginMessage'), 'This account does not have administrator access.');
                        return;
                    }
                    // Store token and user info
                    localStorage.setItem('authToken', response.token);
                    localStorage.setItem('userInfo', JSON.stringify(response.user));
                    // Redirect admin users to admin.html, others to next page
                    const redirectUrl = response.user.role === 'admin' ? 'admin.html' : next;
                    window.location.href = redirectUrl;
                } catch (error) {
                    console.error('Login error:', error);
                    alert(error.message || 'Login failed. Please check your credentials.');
                }
            } else {
                alert('API not available. Please try again later.');
            }
        });
    }

    function initForgotPassword() {
        const form = document.getElementById('forgotPasswordForm');
        if (!form) return;

        const emailInput = document.getElementById('forgotPasswordEmail');
        const message = document.getElementById('forgotPasswordMessage');
        const email = new URLSearchParams(window.location.search).get('email');
        if (email) emailInput.value = email;

        form.addEventListener('submit', async event => {
            event.preventDefault();
            showMessage(message, '');
            message.classList.remove('is-success');

            const enteredEmail = emailInput.value.trim();
            if (!enteredEmail || !emailInput.validity.valid) {
                showMessage(message, 'Enter a valid email address.');
                return;
            }
            if (!window.ZackconnectAPI) {
                showMessage(message, 'Password reset is unavailable right now. Please try again later.');
                return;
            }

            try {
                showMessage(message, 'Sending your reset link...');
                await window.ZackconnectAPI.AuthAPI.requestPasswordReset(enteredEmail);
                message.classList.add('is-success');
                showMessage(message, 'If an account exists for that email, a password reset link will be sent.');
            } catch (error) {
                console.error('Password reset request error:', error);
                showMessage(message, error.message || 'Could not send a reset link. Please try again.');
            }
        });
    }

    function initResetPassword() {
        const form = document.getElementById('resetPasswordForm');
        if (!form) return;

        const message = document.getElementById('resetPasswordMessage');
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) {
            form.hidden = true;
            showMessage(message, 'This password reset link is invalid or incomplete. Request a new one to continue.');
            return;
        }

        form.addEventListener('submit', async event => {
            event.preventDefault();
            showMessage(message, '');

            const password = form.elements.password.value;
            const confirmPassword = form.elements.confirmPassword.value;
            if (password.length < 8) {
                showMessage(message, 'Your password must be at least 8 characters.');
                return;
            }
            if (password !== confirmPassword) {
                showMessage(message, 'The passwords do not match.');
                return;
            }
            if (!window.ZackconnectAPI) {
                showMessage(message, 'Password reset is unavailable right now. Please try again later.');
                return;
            }

            try {
                showMessage(message, 'Updating your password...');
                await window.ZackconnectAPI.AuthAPI.resetPassword(token, password);
                message.classList.add('is-success');
                showMessage(message, 'Your password has been reset. You can now log in.');
                form.reset();
            } catch (error) {
                console.error('Password reset error:', error);
                showMessage(message, error.message || 'This reset link is invalid or has expired. Request a new one.');
            }
        });
    }

    if (isAdminPage && !isAuthenticated()) {
        window.location.replace(authUrl('login.html', 'admin.html'));
        return;
    }

    if (isAdminPage) {
        let userInfo;
        try {
            userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        } catch {
            userInfo = null;
        }
        if (userInfo?.role !== 'admin') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            window.location.replace(authUrl('login.html', 'admin.html'));
            return;
        }
    }

    if (!isAuthPage && pageName !== 'index.html' && !isAuthenticated()) {
        const requestedPage = `${pageName}${window.location.search}${window.location.hash}`;
        window.location.replace(authUrl('signup.html', requestedPage));
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (pageName === 'index.html') initHomeGate();
        if (pageName === 'signup.html') initSignup();
        if (pageName === 'login.html') initLogin();
        if (pageName === 'forgot-password.html') initForgotPassword();
        if (pageName === 'reset-password.html') initResetPassword();
    });
})();
