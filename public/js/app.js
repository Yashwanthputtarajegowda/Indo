import { auth, database } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import {
  ref,
  get,
  set,
  runTransaction
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';

const app = document.querySelector('#app');

function showError(message) {
  const box = document.querySelector('#auth-error');
  if (box) box.textContent = message;
}

function authScreen(mode = 'login') {
  const signup = mode === 'signup';

  app.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <div class="brand">Indo</div>
        <h1>${signup ? 'Create your account' : 'Welcome back'}</h1>
        <p class="muted">${signup ? 'Create your unique Indo account.' : 'Login with your Indo account.'}</p>
        <div id="auth-error" class="error" aria-live="polite"></div>

        ${signup ? `
          <label>Full name</label>
          <input id="name" maxlength="60" placeholder="Your name" autocomplete="name">
          <label>User ID</label>
          <input id="userId" maxlength="20" placeholder="Choose a unique user ID" autocomplete="username">
          <small class="hint">3–20 characters: letters, numbers, . or _</small>
        ` : ''}

        <label>Email</label>
        <input id="email" type="email" placeholder="Email address" autocomplete="email">
        <label>Password</label>
        <input id="password" type="password" minlength="6" placeholder="Password" autocomplete="new-password">
        ${signup ? '<label>Confirm password</label><input id="confirmPassword" type="password" minlength="6" placeholder="Confirm password" autocomplete="new-password">' : ''}

        ${signup ? `
          <label>Account type</label>
          <div class="account-choice">
            <label class="choice"><input type="radio" name="accountType" value="public" checked><span><strong>Public</strong><small>Anyone can view your profile.</small></span></label>
            <label class="choice"><input type="radio" name="accountType" value="private"><span><strong>Private</strong><small>Only approved followers can view private content.</small></span></label>
          </div>
        ` : ''}

        <button id="auth-submit" class="primary">${signup ? 'Create account' : 'Login'}</button>
        <button id="auth-switch" class="link">${signup ? 'Already have an account? Login' : 'Create a new account'}</button>
      </section>
    </main>`;

  document.querySelector('#auth-switch').onclick = () => authScreen(signup ? 'login' : 'signup');
  document.querySelector('#auth-submit').onclick = signup ? createAccount : login;
}

async function createAccount() {
  const name = document.querySelector('#name').value.trim();
  const userId = document.querySelector('#userId').value.trim();
  const email = document.querySelector('#email').value.trim().toLowerCase();
  const password = document.querySelector('#password').value;
  const confirmPassword = document.querySelector('#confirmPassword').value;
  const accountType = document.querySelector('input[name="accountType"]:checked').value;

  if (name.length < 2) return showError('Enter your full name.');
  if (!/^[A-Za-z0-9._]{3,20}$/.test(userId)) return showError('User ID must be 3–20 characters using letters, numbers, . or _.');
  if (!email) return showError('Enter your email.');
  if (password.length < 6) return showError('Password must be at least 6 characters.');
  if (password !== confirmPassword) return showError('Passwords do not match.');

  const normalizedUserId = userId.toLowerCase();
  const usernameRef = ref(database, `userIds/${normalizedUserId}`);
  let reservation;

  try {
    reservation = await runTransaction(usernameRef, current => current === null ? true : undefined);
    if (!reservation.committed) return showError('That User ID is already taken. Choose another one.');

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    await set(ref(database, `users/${uid}`), {
      uid,
      userId,
      normalizedUserId,
      name,
      email,
      accountType,
      isPrivate: accountType === 'private',
      followersCount: 0,
      followingCount: 0,
      createdAt: Date.now()
    });

    await signOut(auth);
    authScreen('login');
    showError('Account created successfully. Login with your email and password.');
  } catch (error) {
    if (reservation?.committed) await set(usernameRef, null).catch(() => {});
    const messages = {
      'auth/email-already-in-use': 'This email is already registered. Please login.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/weak-password': 'Choose a stronger password.'
    };
    showError(messages[error.code] || error.message || 'Account creation failed.');
  }
}

async function login() {
  const email = document.querySelector('#email').value.trim().toLowerCase();
  const password = document.querySelector('#password').value;
  if (!email || !password) return showError('Enter your email and password.');

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const message = error.code === 'auth/invalid-credential'
      ? 'Email or password is incorrect.'
      : (error.message || 'Login failed.');
    showError(message);
  }
}

const pages = {
  home: 'Home',
  videos: 'Videos',
  reels: 'Reels',
  messages: 'Messages',
  profile: 'Profile'
};

function renderApp(user) {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">Indo</div>
        <button id="logout" class="small-btn">Logout</button>
      </header>
      <main class="content">
        <section class="welcome">
          <div class="muted">WELCOME</div>
          <h1>You're in.</h1>
          <p class="muted">${user.email}</p>
        </section>
      </main>
      <nav class="bottom-nav">
        ${Object.entries(pages).map(([key, title]) => `<button data-page="${key}">${title}</button>`).join('')}
      </nav>
    </div>`;

  document.querySelector('#logout').onclick = () => signOut(auth);
}

onAuthStateChanged(auth, user => {
  if (user) renderApp(user);
  else authScreen('login');
});
