const app = document.getElementById('root');

const ROUTER_VERSION = '20260813-57';

function showStartupError(error) {
  const message = error?.message || String(error || 'Unknown startup error.');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p><small>${message.replace(/[&<>\\"']/g, '')}</small><button type="button" onclick="location.reload()">Reload</button></main>`;
}

function applyGestureTransform(element, scale, rotation) {
  const safeScale = Math.max(0.45, Math.min(4, scale));
  const safeRotation = ((rotation + 180) % 360) - 180;
  element.dataset.gestureScale = String(safeScale);
  element.dataset.gestureRotation = String(safeRotation);
  element.style.transform = `translate(-50%, -50%) scale(${safeScale}) rotate(${safeRotation}deg)`;
}

function enhanceStoryGestures() {
  const preview = app.querySelector('#story-preview');
  const video = app.querySelector('#story-preview-video');
  if (!preview || !video || preview.dataset.gestureZoomBound === '1') return;
  preview.dataset.gestureZoomBound = '1';
  preview.style.touchAction = 'none';
  video.style.transformOrigin = 'center center';

  const pointers = new Map();
  let gesture = null;

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  const getElementTarget = (node) => node instanceof Element ? node.closest('.story-element') : null;

  const startGesture = () => {
    if (pointers.size !== 2 || gesture) return;
    const points = [...pointers.values()];
    const firstTarget = getElementTarget(points[0].target);
    const secondTarget = getElementTarget(points[1].target);
    let target = null;
    if (firstTarget && firstTarget === secondTarget) target = firstTarget;
    else if (!firstTarget && !secondTarget) target = video;
    if (!target) return;

    const currentScale = Number(target.dataset.gestureScale || '1') || 1;
    const currentRotation = Number(target.dataset.gestureRotation || '0') || 0;
    gesture = {
      target,
      startDistance: Math.max(1, distance(points[0], points[1])),
      startAngle: angle(points[0], points[1]),
      startScale: currentScale,
      startRotation: currentRotation
    };
    preview.classList.add('story-multi-gesture');
  };

  const updateGesture = () => {
    if (!gesture || pointers.size !== 2) return;
    const points = [...pointers.values()];
    const currentDistance = Math.max(1, distance(points[0], points[1]));
    const currentAngle = angle(points[0], points[1]);
    const scale = gesture.startScale * (currentDistance / gesture.startDistance);
    const rotation = gesture.startRotation + (currentAngle - gesture.startAngle);
    applyGestureTransform(gesture.target, scale, rotation);
    if (gesture.target === video) {
      video.style.transform = `scale(${Math.max(1, Math.min(4, scale))}) rotate(${rotation}deg)`;
    }
  };

  const endGesture = () => {
    if (pointers.size < 2) {
      gesture = null;
      preview.classList.remove('story-multi-gesture');
    }
  };

  preview.addEventListener('pointerdown', (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, target: event.target });
    if (pointers.size === 2) {
      startGesture();
      if (gesture) event.preventDefault();
    }
  }, true);

  preview.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    const entry = pointers.get(event.pointerId);
    entry.x = event.clientX;
    entry.y = event.clientY;
    if (gesture) {
      event.preventDefault();
      event.stopImmediatePropagation();
      updateGesture();
    }
  }, true);

  preview.addEventListener('pointerup', (event) => {
    pointers.delete(event.pointerId);
    endGesture();
  }, true);

  preview.addEventListener('pointercancel', (event) => {
    pointers.delete(event.pointerId);
    endGesture();
  }, true);
}

function enhanceStoryCreateLayout() {
  const preview = app.querySelector('#story-preview');
  const publish = app.querySelector('#story-publish-button');
  const addButton = app.querySelector('#story-add-button');
  if (!preview || !publish || !addButton) return;
  if (publish.parentElement !== preview) preview.appendChild(publish);
  publish.textContent = 'Done';
  publish.classList.add('story-publish-on-preview');
  publish.style.cssText = 'position:absolute;left:auto;right:0;bottom:12px;width:20%;max-width:none;height:44px;z-index:22;margin:0;border:0;border-radius:10px;background:#7b3cff;color:#fff;font-weight:800;cursor:pointer;';
  addButton.style.bottom = '68px';
  enhanceStoryGestures();
}

async function renderCurrentScreen() {
  const { render } = await import(`./router.js?v=${ROUTER_VERSION}`);
  await render(app);
  if (document.querySelector('#story-preview')) enhanceStoryCreateLayout();
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
      try { await openCreatorProfile(profileTarget.dataset.profileUsername || '', profileTarget.dataset.profileUid || ''); }
      catch (error) { console.error('Creator profile navigation failed:', error); showStartupError(error); }
      return;
    }
    const target = element?.closest('[data-screen]');
    if (!target || !app.contains(target)) return;
    const screen = target.dataset.screen;
    if (!screen) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try { await navigate(screen); }
    catch (error) { console.error('Navigation failed:', error); showStartupError(error); }
  }, true);
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
    if (authenticated) { await renderCurrentScreen(); return; }
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
      } finally { resetButton.disabled = false; }
    });
  } catch (error) {
    console.error('Indo startup failed:', error);
    showStartupError(error);
  }
}

start();
