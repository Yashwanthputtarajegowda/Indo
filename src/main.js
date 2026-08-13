import { bindAuthSwitches } from './features/auth/auth-controller.js';

const app = document.getElementById('root');
const ROUTER_VERSION = '20260814-131';

function sanitize(value = '') { return String(value).replace(/[&<>\"']/g, ''); }

function showStartupError(error) {
  const message = sanitize(error?.message || error || 'Unknown startup error.');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p><small>${message}</small><button type="button" data-screen="home">Reload</button></main>`;
}

function showSharedStory(story) {
  if (!story?.secureUrl) return;
  document.querySelector('.indo-shared-story-viewer')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'indo-shared-story-viewer';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,.96);display:grid;place-items:center;padding:16px;';
  overlay.innerHTML = `<div style="position:relative;width:min(100%,430px);height:min(90vh,760px);background:#000;border-radius:16px;overflow:hidden"><button type="button" data-shared-close style="position:absolute;left:12px;top:12px;z-index:3;width:36px;height:36px;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:24px">×</button><div style="position:absolute;left:58px;right:54px;top:18px;z-index:3;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">@${sanitize(story.username || story.name || 'Indo User').replace(/^@/, '')}</div><video src="${sanitize(story.secureUrl)}" autoplay playsinline style="width:100%;height:100%;object-fit:contain;background:#000"></video></div>`;
  const close = () => overlay.remove();
  overlay.querySelector('[data-shared-close]')?.addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  document.body.appendChild(overlay);
  overlay.querySelector('video')?.play().catch(() => {});
}

async function openSharedStoryFromUrl() {
  const id = String(new URLSearchParams(window.location.search).get('story') || '').trim();
  if (!id) return;
  try {
    const { auth } = await import('./features/auth/firebase-client.js');
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    const apiBase = window.INDO_API_BASE || '';
    const response = await fetch(`${apiBase}/api/stories`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json().catch(() => ({}));
    const stories = Array.isArray(data.stories) ? data.stories : [];
    const story = stories.find((item) => String(item?.id || item?.publicId || '') === id);
    if (!story) return;
    const secureUrl = story.secureUrl || story.videoUrl || story.url || story.mediaUrl || '';
    if (secureUrl) showSharedStory({ ...story, secureUrl });
  } catch (error) { console.warn('Shared story open failed:', error); }
}

async function renderCurrentScreen() {
  const { render } = await import(`./router.js?v=${ROUTER_VERSION}`);
  await render(app);
  bindAuthSwitches();
  if (!document.querySelector('#story-preview')) await openSharedStoryFromUrl();
}

async function navigate(screen) {
  const { state } = await import('./state.js');
  state.screen = screen;
  await renderCurrentScreen();
}

async function openCreatorProfile(username, uid = '') {
  const cleanUsername = String(username || '').replace(/^@/, '').trim();
  const cleanUid = String(uid || '').trim();
  if (!cleanUsername && !cleanUid) return;
  const { state } = await import('./state.js');
  const apiBase = window.INDO_API_BASE || '';
  const headers = {};
  try {
    const { auth } = await import('./features/auth/firebase-client.js');
    if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  } catch {}
  try {
    let profile = null;
    if (cleanUsername) {
      const response = await fetch(`${apiBase}/api/account/profile/${encodeURIComponent(cleanUsername)}`, { headers });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.profile) profile = data.profile;
    }
    profile = { ...(profile || {}), username: profile?.username || cleanUsername, uid: profile?.uid || profile?.userId || cleanUid, ownerUid: profile?.ownerUid || cleanUid };
    if (!profile.username && !profile.uid && !profile.ownerUid) throw new Error('Creator information is missing.');
    state.profile = profile;
    state.screen = 'profile';
    await renderCurrentScreen();
  } catch (error) {
    console.error('Creator profile failed:', error);
    const toast = document.createElement('div');
    toast.textContent = error?.message || 'Profile could not be opened.';
    toast.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9999;padding:10px 14px;border-radius:12px;background:#18181f;color:#fff;font-size:13px;font-weight:700;box-shadow:0 8px 30px rgba(0,0,0,.45);';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
}

function bindNavigation() {
  if (window.__indoNavigationBoundV131) return;
  window.__indoNavigationBoundV131 = true;
  window.__indoNavigate = navigate;
  document.addEventListener('click', async (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const profileTarget = element?.closest('[data-profile-username]');
    if (profileTarget && app.contains(profileTarget)) {
      event.preventDefault(); event.stopImmediatePropagation();
      await openCreatorProfile(profileTarget.dataset.profileUsername || '', profileTarget.dataset.profileUid || '');
      return;
    }
    const target = element?.closest('[data-screen]');
    if (!target || !app.contains(target)) return;
    const screen = target.dataset.screen;
    if (!screen) return;
    event.preventDefault(); event.stopImmediatePropagation();
    try { await navigate(screen); } catch (error) { console.error('Navigation failed:', error); showStartupError(error); }
  }, true);
}

function bindLoginForm() {
  const form = app.querySelector('#login-form');
  if (!form || form.dataset.loginBound === '1') return;
  form.dataset.loginBound = '1';
  const resetButton = form.querySelector('[data-password-reset]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('.auth-submit');
    const message = form.querySelector('#login-message');
    const email = form.querySelector('#login-email')?.value?.trim() || '';
    const password = form.querySelector('#login-password')?.value || '';
    if (!email || !password) { if (message) message.textContent = 'Email ID and password are required.'; return; }
    if (button) button.disabled = true;
    if (message) message.textContent = 'Logging in...';
    try {
      const { auth, signInWithEmailAndPassword } = await import('./features/auth/firebase-client.js');
      await signInWithEmailAndPassword(auth, email, password);
      const { state } = await import('./state.js');
      state.authenticated = true; state.screen = 'home'; state.profile = null;
      await renderCurrentScreen();
    } catch (error) {
      console.error('Login failed:', error);
      if (message) message.textContent = error?.message || 'Login failed. Please check your email and password.';
      if (button) button.disabled = false;
    }
  });
  resetButton?.addEventListener('click', async () => {
    const message = form.querySelector('#login-message');
    const emailInput = form.querySelector('#login-email');
    const email = emailInput?.value?.trim() || '';
    if (!email) { if (message) message.textContent = 'Enter your Email ID first.'; emailInput?.focus(); return; }
    resetButton.disabled = true;
    if (message) message.textContent = 'Sending password reset email...';
    try {
      const { auth, sendPasswordResetEmail } = await import('./features/auth/firebase-client.js');
      await sendPasswordResetEmail(auth, email);
      if (message) message.textContent = 'Password reset email sent. Check Inbox and Spam/Junk.';
    } catch (error) {
      console.error('Password reset failed:', error);
      const code = error?.code || '';
      const text = code === 'auth/user-not-found' ? 'No account was found for this email ID.' : code === 'auth/invalid-email' ? 'Enter a valid email ID.' : code === 'auth/too-many-requests' ? 'Too many requests. Please wait and try again.' : (error?.message || 'Could not send password reset email.');
      if (message) message.textContent = text;
    } finally { resetButton.disabled = false; }
  });
}

async function waitForFirebaseSession() {
  const [{ auth }, { onAuthStateChanged }] = await Promise.all([
    import('./features/auth/firebase-client.js'),
    import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js'),
  ]);
  return new Promise((resolve) => {
    let settled = false;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (settled) return; settled = true; unsubscribe(); resolve(user || null);
    });
  });
}

async function start() {
  try {
    if (!app) throw new Error('App root is missing.');
    bindNavigation();
    const user = await waitForFirebaseSession();
    const { state } = await import('./state.js');
    state.authenticated = Boolean(user); state.screen = user ? 'home' : 'auth-login'; state.profile = null;
    await renderCurrentScreen();
    if (!user) bindLoginForm();
  } catch (error) { console.error('Indo startup failed:', error); showStartupError(error); }
}

start();
