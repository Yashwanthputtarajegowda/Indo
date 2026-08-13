import { state } from '../../state.js';
import { submitSignup } from './signup-form.js';

function getRoot() { return document.getElementById('root'); }

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

bindAuthSwitches();

export { bindAuthSwitches, bindSignupForm };
