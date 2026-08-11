import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { ref, get, set, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';

const API_BASE_URL = 'https://indo-backend-production-41b1.up.railway.app';
const app = document.querySelector('#app');
let authMode = 'login';
let backendOnline = false;

async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET', cache: 'no-store' });
    backendOnline = response.ok;
  } catch {
    backendOnline = false;
  }
}

const cleanUserId = value => value.trim().toLowerCase().replace(/^@/, '');
const validUserId = value => /^[a-z0-9._]{3,30}$/.test(value);
const firebaseMessage = error => ({
  'auth/email-already-in-use':'This email is already registered.',
  'auth/invalid-email':'Enter a valid email address.',
  'auth/weak-password':'Password must be at least 6 characters.',
  'auth/invalid-credential':'Email or password is incorrect.',
  'auth/too-many-requests':'Too many attempts. Try again later.'
}[error.code] || error.message || 'Something went wrong.');

function renderAuth(error = '', success = '') {
  const signup = authMode === 'signup';
  app.innerHTML = `<main class="auth-page"><section class="auth-card">
    <div class="brand">Indo</div>
    <h1>${signup ? 'Create your account' : 'Welcome back'}</h1>
    <p class="muted">${signup ? 'Create your real Indo account.' : 'Login with your Indo account.'}</p>
    <div class="muted small">Backend: ${backendOnline ? 'Connected' : 'Unavailable'}</div>
    ${error ? `<div class="error">${error}</div>` : ''}
    ${success ? `<div class="success">${success}</div>` : ''}
    ${signup ? `<div class="field"><label>User name</label><input id="name" maxlength="60" placeholder="Your name" autocomplete="name"></div>
    <div class="field"><label>User ID</label><div class="prefix-wrap"><span>@</span><input id="username" maxlength="30" placeholder="yashwanth" autocomplete="username"></div><div class="muted small">Use letters, numbers, dot or underscore. @ is added automatically.</div></div>` : ''}
    <div class="field"><label>Email</label><input id="email" type="email" placeholder="you@example.com" autocomplete="email"></div>
    <div class="field"><label>Password</label><input id="password" type="password" placeholder="Minimum 6 characters" autocomplete="current-password"></div>
    ${signup ? `<div class="field"><label>Confirm password</label><input id="confirm" type="password" placeholder="Repeat password" autocomplete="new-password"></div>
    <div class="field"><label>Account type</label><div class="choice-row"><label class="choice"><input type="radio" name="privacy" value="public" checked> Public</label><label class="choice"><input type="radio" name="privacy" value="private"> Private</label></div><div class="muted small">Private accounts require approval before followers can see protected posts and stories.</div></div>` : ''}
    <button id="submit" class="primary">${signup ? 'Create Account' : 'Login'}</button>
    <button id="switch" class="link">${signup ? 'Already have an account? Login' : 'New to Indo? Create Account'}</button>
  </section></main>`;

  document.querySelector('#switch').onclick = () => { authMode = signup ? 'login' : 'signup'; renderAuth(); };
  document.querySelector('#submit').onclick = signup ? createAccount : login;
}

async function reserveIndoId() {
  const counterRef = ref(db, 'system/indoCounter');
  const result = await runTransaction(counterRef, current => (Number(current) || 1165) + 1);
  if (!result.committed) throw new Error('Could not generate Indo ID. Please try again.');
  return `INDO${String(result.snapshot.val()).padStart(6, '0')}`;
}

async function createAccount() {
  const button = document.querySelector('#submit');
  const name = document.querySelector('#name').value.trim();
  const username = cleanUserId(document.querySelector('#username').value);
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const confirm = document.querySelector('#confirm').value;
  const privacy = document.querySelector('input[name="privacy"]:checked').value;
  if (!name) return renderAuth('Enter your name.');
  if (!validUserId(username)) return renderAuth('User ID must be 3–30 characters: letters, numbers, dot or underscore.');
  if (!email) return renderAuth('Enter your email.');
  if (password.length < 6) return renderAuth('Password must be at least 6 characters.');
  if (password !== confirm) return renderAuth('Passwords do not match.');
  button.disabled = true;
  button.textContent = 'Creating...';
  try {
    const usernameRef = ref(db, `usernames/${username}`);
    const existing = await get(usernameRef);
    if (existing.exists()) throw new Error('@' + username + ' is already taken. Choose another User ID.');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const indoId = await reserveIndoId();
    const user = credential.user;
    await set(usernameRef, { uid: user.uid, username: `@${username}` });
    await set(ref(db, `users/${user.uid}`), { uid: user.uid, indoId, name, username: `@${username}`, usernameKey: username, email, accountType: privacy, createdAt: serverTimestamp() });
    await signOut(auth);
    authMode = 'login';
    renderAuth('', `Account created successfully. Your Indo ID is ${indoId}. Please login.`);
  } catch (error) {
    try { if (auth.currentUser) await signOut(auth); } catch {}
    renderAuth(firebaseMessage(error));
  }
}

async function login() {
  const button = document.querySelector('#submit');
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  if (!email || !password) return renderAuth('Enter your email and password.');
  button.disabled = true;
  button.textContent = 'Logging in...';
  try { await signInWithEmailAndPassword(auth, email, password); }
  catch (error) { renderAuth(firebaseMessage(error)); }
}

function showLoggedIn(user) {
  app.innerHTML = `<main class="auth-page"><section class="auth-card"><div class="brand">Indo</div><h1>Logged in</h1><p class="muted">${user.email}</p><p class="success">Firebase authentication and Railway backend are connected.</p><button id="logout" class="primary">Logout</button></section></main>`;
  document.querySelector('#logout').onclick = async () => { await signOut(auth); authMode = 'login'; renderAuth(); };
}

(async () => {
  await checkBackend();
  onAuthStateChanged(auth, user => user ? showLoggedIn(user) : renderAuth());
})();
