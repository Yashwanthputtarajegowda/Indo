import './styles.css';
import './features/splash/splash.css';
import { state } from './state.js';
import { render } from './router.js';
import { submitSignup } from './features/auth/signup-form.js';
import { submitLogin } from './features/auth/login-form.js';
import { startSplash } from './features/splash/splash-flow.js';
import { setSettingsVisibility } from './features/account/settings-visibility.js';

const app = document.getElementById('root');

function goTo(screen) {
  state.screen = screen;
  render(app);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const screenTarget = event.target.closest('[data-screen]');
  if (screenTarget) {
    goTo(screenTarget.dataset.screen);
    return;
  }

  const authTarget = event.target.closest('[data-auth]');
  if (authTarget) goTo(`auth-${authTarget.dataset.auth}`);
});

document.addEventListener('change', async (event) => {
  const visibility = event.target.closest('[data-visibility]');
  if (!visibility) return;

  const nextType = visibility.value;
  const message = document.querySelector('.settings-message');
  visibility.disabled = true;
  if (message) message.textContent = 'Saving privacy setting...';

  try {
    const result = await setSettingsVisibility(nextType);
    state.accountType = result.accountType;
    if (message) message.textContent = `Account is now ${result.accountType}.`;
  } catch (error) {
    visibility.value = state.accountType;
    if (message) message.textContent = error.message || 'Could not update privacy setting.';
  } finally {
    visibility.disabled = false;
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!['signup-form', 'login-form'].includes(form.id)) return;
  event.preventDefault();

  const button = form.querySelector('.auth-submit');
  const message = form.querySelector('.auth-message');
  if (button) button.disabled = true;
  if (message) message.textContent = form.id === 'signup-form' ? 'Creating account...' : 'Logging in...';

  try {
    if (form.id === 'signup-form') {
      const result = await submitSignup(form);
      state.accountType = result.accountType || 'public';
      if (message) message.textContent = `Account created. Your User ID is ${result.username}.`;
    } else {
      const result = await submitLogin(form);
      state.accountType = result?.accountType || state.accountType;
      if (message) message.textContent = 'Login successful.';
    }
    setTimeout(() => goTo('home'), 500);
  } catch (error) {
    if (message) message.textContent = error.message || 'Something went wrong.';
    if (button) button.disabled = false;
  }
});

startSplash(app, () => goTo('auth-login'));
