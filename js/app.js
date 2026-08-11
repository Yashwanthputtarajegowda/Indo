import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const app = document.querySelector('#app');
const loginForm = document.querySelector('#login-form');
const createAccount = document.querySelector('#create-account');
const authMessage = document.querySelector('#auth-message');

function showMessage(message, isError = false) { if (!authMessage) return; authMessage.textContent = message; authMessage.classList.toggle('error', isError); }
function getCredentials() { return { email: document.querySelector('#email')?.value.trim() || '', password: document.querySelector('#password')?.value || '' }; }
function validateCredentials(email, password) { if (!email) return 'Enter your email address.'; if (!password) return 'Enter your password.'; if (password.length < 6) return 'Password must be at least 6 characters.'; return ''; }
function firebaseError(error) { switch (error?.code) { case 'auth/email-already-in-use': return 'This email already has an Indo account. Please sign in.'; case 'auth/invalid-email': return 'Please enter a valid email address.'; case 'auth/weak-password': return 'Password must be at least 6 characters.'; case 'auth/operation-not-allowed': return 'Email sign-up is disabled in Firebase.'; case 'auth/network-request-failed': return 'Network error. Check your connection.'; case 'auth/invalid-credential': return 'Email or password is incorrect.'; default: console.error('Indo auth error:', error); return 'Unable to continue. Please try again.'; } }

function renderHome(user) {
    if (!app) return;
    const name = user?.email?.split('@')[0] || 'Creator';
    const initial = (user?.email?.[0] || 'I').toUpperCase();
    app.innerHTML = `<section class="indo-home"><header class="home-header"><div class="home-brand">Indo</div><button class="home-icon" type="button">⌕</button></header><main class="home-content"><div class="home-welcome"><div><span class="home-kicker">WELCOME BACK</span><h2>${name}</h2></div><button class="avatar-btn" type="button">${initial}</button></div><section class="featured-card"><div class="featured-art"><span>INDO</span></div><div class="featured-info"><span class="pill">FEATURED</span><h3>Your world. Your videos.</h3><p>Discover creators, clips and stories made for Indo.</p><button class="watch-btn" type="button">Explore Indo</button></div></section><div class="section-heading"><h3>Fresh for you</h3><button type="button">See all</button></div><section class="video-grid"><article class="video-card"><div class="video-art art-one">01</div><strong>New stories</strong><span>Explore something new</span></article><article class="video-card"><div class="video-art art-two">02</div><strong>Indo Clips</strong><span>Quick moments</span></article><article class="video-card"><div class="video-art art-three">03</div><strong>Creators</strong><span>People to discover</span></article><article class="video-card"><div class="video-art art-four">04</div><strong>Trending</strong><span>What people love</span></article></section></main><nav class="bottom-nav"><button class="nav-item active" type="button"><span>⌂</span><small>Home</small></button><button class="nav-item" type="button"><span>◉</span><small>Clips</small></button><button class="nav-create" type="button"><span>＋</span></button><button class="nav-item" type="button"><span>♡</span><small>Following</small></button><button class="nav-item" type="button"><span>◎</span><small>Profile</small></button></nav></section>`;
}

onAuthStateChanged(auth, (user) => { if (user) renderHome(user); });

loginForm?.addEventListener('submit', async (event) => { event.preventDefault(); const { email, password } = getCredentials(); const validationError = validateCredentials(email, password); if (validationError) return showMessage(validationError, true); const button = loginForm.querySelector('.primary-btn'); if (button) button.disabled = true; showMessage('Signing in...'); try { await signInWithEmailAndPassword(auth, email, password); } catch (error) { showMessage(firebaseError(error), true); if (button) button.disabled = false; } });

createAccount?.addEventListener('click', async () => { const { email, password } = getCredentials(); const validationError = validateCredentials(email, password); if (validationError) return showMessage(validationError, true); createAccount.disabled = true; showMessage('Creating your Indo account...'); try { await createUserWithEmailAndPassword(auth, email, password); } catch (error) { showMessage(firebaseError(error), true); createAccount.disabled = false; } });
