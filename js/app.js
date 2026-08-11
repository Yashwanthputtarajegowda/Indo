import { auth } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const loginForm = document.querySelector('#login-form');
const createAccount = document.querySelector('#create-account');
const authMessage = document.querySelector('#auth-message');

function showMessage(message, isError = false) {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.classList.toggle('error', isError);
}

loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#email')?.value.trim();
    const password = document.querySelector('#password')?.value;

    if (!email || !password) {
        showMessage('Enter your email and password.', true);
        return;
    }

    const button = loginForm.querySelector('.primary-btn');
    if (button) button.disabled = true;
    showMessage('Signing in...');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage('Login successful. Indo is ready.');
    } catch (error) {
        const message = error?.code === 'auth/invalid-credential'
            ? 'Email or password is incorrect.'
            : error?.message || 'Unable to sign in.';
        showMessage(message, true);
    } finally {
        if (button) button.disabled = false;
    }
});

createAccount?.addEventListener('click', async () => {
    const email = document.querySelector('#email')?.value.trim();
    const password = document.querySelector('#password')?.value;

    if (!email || !password) {
        showMessage('Enter email and password first.', true);
        return;
    }

    createAccount.disabled = true;
    showMessage('Creating your Indo account...');

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage('Account created successfully. Welcome to Indo.');
    } catch (error) {
        const message = error?.code === 'auth/email-already-in-use'
            ? 'This email already has an Indo account. Sign in instead.'
            : error?.message || 'Unable to create the account.';
        showMessage(message, true);
    } finally {
        createAccount.disabled = false;
    }
});
