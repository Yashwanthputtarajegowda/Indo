const app = document.getElementById('root');

const ROUTER_VERSION = '20260813-34';

function showStartupError(error) {
  const message = error?.message || String(error || 'Unknown startup error.');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p><small>${message.replace(/[&<>\\"']/g, '')}</small><button type="button" onclick="location.reload()">Reload</button></main>`;
}

async function renderCurrentScreen() {
  const { render } = await import(`./router.js?v=${ROUTER_VERSION}`);
  await render(app);
}

async function navigate(screen) {
  const { state } = await import('./state.js');
  state.screen = screen;
  await renderCurrentScreen();
}

async function openHomeAfterLogin() {
  const { state } = await import('./state.js');
  state.authenticated = true;
  state.screen = 'home';
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
    profile = {
      ...(profile || {}),
      username: profile?.username || cleanUsername,
      uid: profile?.uid || profile?.userId || cleanUid,
      ownerUid: profile?.ownerUid || cleanUid
    };
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
  if (window.__indoNavigationBound) return;
  window.__indoNavigationBound = true;
  window.__indoNavigate = navigate;
  document.addEventListener('click', async (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const profileTarget = element?.closest('[data-profile-username]');
    if (profileTarget && app.contains(profileTarget)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        await openCreatorProfile(profileTarget.dataset.profileUsername || '', profileTarget.dataset.profileUid || '');
      } catch (error) {
        console.error('Creator profile navigation failed:', error);
        showStartupError(error);
      }
      return;
    }
    const target = element?.closest('[data-screen]');
    if (!target || !app.contains(target)) return;
    const screen = target.dataset.screen;
    if (!screen) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      await navigate(screen);
    } catch (error) {
      console.error('Navigation failed:', error);
      showStartupError(error);
    }
  }, true);
}

async function waitForFirebaseSession() {
  const [{ auth }, { onAuthStateChanged }] = await Promise.all([
    import('./features/auth/firebase-client.js'),
    import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js')
  ]);
  return new Promise((resolve) => {
    let settled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (settled) return;
      settled = true;
      unsubscribe();
      const { state } = await import('./state.js');
      state.authenticated = !!user;
      state.screen = user ? 'home' : 'auth-login';
      resolve(!!user);
    });
  });
}

async function start() {
  try {
    bindNavigation();
    const authenticated = await waitForFirebaseSession();
    if (authenticated) {
      await renderCurrentScreen();
      return;
    }
    const { renderLogin } = await import('./screens/auth.js');
    renderLogin(app);
    const form = app.querySelector('#login-form');
    const resetButton = app.querySelector('[data-password-reset]');
    if (!form) throw new Error('Login form could not be created.');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('.auth-submit');
      const message = form.querySelector('#login-message');
      const email = form.querySelector('#login-email')?.value?.trim() || '';
      const password = form.querySelector('#login-password')?.value || '';
      if (!email) { if (message) message.textContent = 'Email ID is required.'; return; }
      if (!password) { if (message) message.textContent = 'Password is required.'; return; }
      if (button) button.disabled = true;
      if (message) message.textContent = 'Logging in...';
      try {
        const { auth, signInWithEmailAndPassword } = await import('./features/auth/firebase-client.js');
        await signInWithEmailAndPassword(auth, email, password);
        if (message) message.textContent = 'Login successful.';
        await openHomeAfterLogin();
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
      } finally {
        resetButton.disabled = false;
      }
    });
  } catch (error) {
    console.error('Indo startup failed:', error);
    showStartupError(error);
  }
}

start();
