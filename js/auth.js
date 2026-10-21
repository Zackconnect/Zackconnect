(() => {
    const demoLoginKey = 'zackconnectDemoLogin';
    const allowedPages = new Set([
        'about.html',
        'cars.html',
        'contact.html',
        'import.html',
        'tricycles.html',
        'vehicle-details.html'
    ]);
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    const isAuthPage = pageName === 'signup.html' || pageName === 'login.html';

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

    function hasDemoLogin() {
        return window.sessionStorage.getItem(demoLoginKey) === 'true';
    }

    function initHomeGate() {
        if (hasDemoLogin()) return;

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

        form.addEventListener('submit', event => {
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

            showMessage(message, 'Your details have not been sent or saved. Account creation will be available when the backend is connected.');
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

        form.addEventListener('submit', event => {
            event.preventDefault();
            window.sessionStorage.setItem(demoLoginKey, 'true');
            window.location.href = next;
        });
    }

    if (!isAuthPage && pageName !== 'index.html' && !hasDemoLogin()) {
        const requestedPage = `${pageName}${window.location.search}${window.location.hash}`;
        window.location.replace(authUrl('signup.html', requestedPage));
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (pageName === 'index.html') initHomeGate();
        if (pageName === 'signup.html') initSignup();
        if (pageName === 'login.html') initLogin();
    });
})();
