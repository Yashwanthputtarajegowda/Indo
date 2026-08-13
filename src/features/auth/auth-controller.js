import { state } from '../../state.js';
import { submitSignup } from './signup-form.js';

function getRoot() { return document.getElementById('root'); }

function installBottomNavigation() {
  if (globalThis.__indoBottomNavV3) return;
  globalThis.__indoBottomNavV3 = true;

  const patchNav = () => {
    document.querySelectorAll('.bottom-nav').forEach((nav) => {
      if (nav.dataset.bottomNavV3 === '1') return;
      nav.dataset.bottomNavV3 = '1';
      const active = nav.querySelector('button.active')?.dataset.screen || 'home';
      nav.innerHTML = `
        <button type="button" data-screen="home" class="${active === 'home' ? 'active' : ''}">⌂<span>Home</span></button>
        <button type="button" data-screen="search" class="${active === 'search' ? 'active' : ''}">⌕<span>Search</span></button>
        <button type="button" data-screen="reels" class="${active === 'reels' ? 'active' : ''}">▶<span>Reels</span></button>
        <button type="button" data-video-section aria-label="Video">▣<span>Video</span></button>
        <button type="button" data-screen="notifications" class="${active === 'notifications' ? 'active' : ''}">♧<span>Notification</span></button>
        <button type="button" data-screen="profile" class="${active === 'profile' ? 'active' : ''}">●<span>Profile</span></button>
      `;
    });
  };

  patchNav();
  const observer = new MutationObserver(patchNav);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', (event) => {
    const videoButton = event.target instanceof Element ? event.target.closest('[data-video-section]') : null;
    if (!videoButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}

async function goTo(screen) {
  if (typeof window.__indoNavigate === 'function') {
    await window.__indoNavigate(screen);
    return;
  }
  state.screen = screen;
  const router = await import('../../router.js?v=20260813-115');
  await router.render(getRoot());
}

function bindSignupForm() {
  const form = getRoot()?.querySelector('#signup-form');
  if (!form || form.dataset.authControllerBound === '1') return;
  form.dataset.authControllerBound = '1';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('.auth-submit');
    const message = form.querySelector('#signup-message');
    if (button) button.disabled = true;
    if (message) message.textContent = 'Creating account...';
    try {
      await submitSignup(form);
      state.authenticated = true;
      state.screen = 'home';
      state.profile = null;
      if (message) message.textContent = 'Account created successfully.';
      await goTo('home');
    } catch (error) {
      console.error('Signup failed:', error);
      const code = error?.code || '';
      const text = code === 'auth/email-already-in-use'
        ? 'This email ID is already registered.'
        : code === 'auth/weak-password'
          ? 'Password must be at least 8 characters.'
          : code === 'auth/invalid-email'
            ? 'Enter a valid email ID.'
            : (error?.message || 'Could not create account. Please try again.');
      if (message) message.textContent = text;
      if (button) button.disabled = false;
    }
  });
}

function bindAuthSwitches() {
  const root = getRoot();
  if (!root) return;
  root.querySelectorAll('[data-auth]').forEach((button) => {
    if (button.dataset.authControllerBound === '1') return;
    button.dataset.authControllerBound = '1';
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const screen = button.dataset.auth === 'signup' ? 'auth-signup' : 'auth-login';
      await goTo(screen);
      bindAuthSwitches();
      bindSignupForm();
    });
  });
  bindSignupForm();
}

const observer = new MutationObserver(() => bindAuthSwitches());
observer.observe(document.body, { childList: true, subtree: true });

installBottomNavigation();
bindAuthSwitches();

export { bindAuthSwitches, bindSignupForm, installBottomNavigation };
