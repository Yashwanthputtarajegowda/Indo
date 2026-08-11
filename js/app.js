import { auth } from './firebase.js';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const loginForm = document.querySelector('#login-form');
const createAccount = document.querySelector('#create-account');
const authMessage = document.querySelector('#auth-message');

function showMessage(message, isError = false) {
    if (!authMessage) return;

    authMessage.textContent = message;
    authMessage.classList.toggle('error', isError);
}

function getCredentials() {
    return {
        email: document.querySelector('#email')?.value.trim() || '',
        password: document.querySelector('#password')?.value || ''
    };
}

function validateCredentials(email, password) {
    if (!email) return 'Enter your email address.';
    if (!password) return 'Enter your password.';

    if (password.length < 6) {
        return 'Password must be at least 6 characters.';
    }

    return '';
}

function firebaseError(error) {
    switch (error?.code) {
        case 'auth/email-already-in-use':
            return 'This email already has an Indo account. Please sign in.';

        case 'auth/invalid-email':
            return 'Please enter a valid email address.';

        case 'auth/weak-password':
            return 'Password must be at least 6 characters.';

        case 'auth/operation-not-allowed':
            return 'Email sign-up is disabled in Firebase.';

        case 'auth/network-request-failed':
            return 'Network error. Check your connection.';

        case 'auth/invalid-credential':
            return 'Email or password is incorrect.';

        default:
            console.error('Indo auth error:', error);
            return 'Unable to continue. Please try again.';
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = './pages/home.html';
    }
});

loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { email, password } = getCredentials();
    const validationError = validateCredentials(email, password);

    if (validationError) {
        showMessage(validationError, true);
        return;
    }

    const button = loginForm.querySelector('.primary-btn');

    if (button) {
        button.disabled = true;
    }

    showMessage('Signing in...');

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        showMessage(firebaseError(error), true);

        if (button) {
            button.disabled = false;
        }
    }
});

createAccount?.addEventListener('click', async () => {
    const { email, password } = getCredentials();
    const validationError = validateCredentials(email, password);

    if (validationError) {
        showMessage(validationError, true);
        return;
    }

    createAccount.disabled = true;
    showMessage('Creating your Indo account...');

    try {
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
    } catch (error) {
        showMessage(firebaseError(error), true);
        createAccount.disabled = false;
    }
});
