import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const LOGIN_PENDING_KEY = 'indo-login-pending';

document.addEventListener('click', (event) => {
    const button = event.target.closest('#submit');

    if (!button) {
        return;
    }

    const isLoginButton = button.textContent.trim().toLowerCase() === 'login';

    if (isLoginButton) {
        sessionStorage.setItem(LOGIN_PENDING_KEY, '1');
    }
}, true);

onAuthStateChanged(auth, (user) => {
    if (!user || sessionStorage.getItem(LOGIN_PENDING_KEY) !== '1') {
        return;
    }

    sessionStorage.removeItem(LOGIN_PENDING_KEY);
    window.location.replace('./index.html');
});
