import { auth, database } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';

const app = document.querySelector('#app');

function authScreen(mode = 'login', error = '') {
  const signup = mode === 'signup';
  app.innerHTML = `<main class="auth-page"><section class="auth-card"><div class="brand">Indo</div><h1>${signup ? 'Create account' : 'Welcome back'}</h1><p class="muted">${signup ? 'Join Indo and connect with people.' : 'Login to continue to Indo.'}</p>${error ? `<div class="error">${error}</div>` : ''}${signup ? '<input id="name" placeholder="Full name" autocomplete="name">' : ''}<input id="email" type="email" placeholder="Email" autocomplete="email"><input id="password" type="password" placeholder="Password" autocomplete="current-password"><button id="auth-submit" class="primary">${signup ? 'Create account' : 'Login'}</button><button id="auth-switch" class="link">${signup ? 'Already have an account? Login' : 'Create a new account'}</button></section></main>`;
  document.querySelector('#auth-switch').onclick = () => authScreen(signup ? 'login' : 'signup');
  document.querySelector('#auth-submit').onclick = async () => {
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    try {
      if (signup) {
        const name = document.querySelector('#name').value.trim();
        if (!name) throw new Error('Enter your name.');
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, `users/${credential.user.uid}`), { uid: credential.user.uid, name, email, createdAt: Date.now() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      authScreen(mode, e.code === 'auth/invalid-credential' ? 'Email or password is incorrect.' : (e.message || 'Something went wrong.'));
    }
  };
}

const pages = { home: 'Home', videos: 'Videos', reels: 'Reels', messages: 'Messages', profile: 'Profile' };

function renderApp(user) {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand">Indo</div><button id="logout" class="small-btn">Logout</button></header><main class="content"><section class="welcome"><div class="muted">WELCOME</div><h1>Hi, ${user.email.split('@')[0]}.</h1><p class="muted">Your Indo account is connected to Firebase.</p></section></main><nav class="bottom-nav">${Object.entries(pages).map(([key, title]) => `<button data-page="${key}">${title}</button>`).join('')}</nav></div>`;
  document.querySelector('#logout').onclick = () => signOut(auth);
}

onAuthStateChanged(auth, user => user ? renderApp(user) : authScreen());
