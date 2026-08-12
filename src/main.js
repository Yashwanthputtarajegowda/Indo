import './styles.css';
import './features/splash/splash.css';
import { state } from './state.js';
import { render } from './router.js';
import { submitSignup } from './features/auth/signup-form.js';
import { startSplash } from './features/splash/splash-flow.js';

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
  if (authTarget) {
    goTo(`auth-${authTarget.dataset.auth}`);
  }
});

document.addEventListener('submit', async (event) => {
  if (event.target.id !== 'signup-form') return;
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('.auth-submit');
  const message = form.querySelector('#signup-message');
  if (button) button.disabled = true;
  if (message) message.textContent = 'Creating account...';
  try {
    const result = await submitSignup(form);
    if (message) message.textContent = `Account created. Your User ID is ${result.username}.`;
    setTimeout(() => goTo('home'), 700);
  } catch (error) {
    if (message) message.textContent = error.message || 'Could not create account.';
    if (button) button.disabled = false;
  }
});

startSplash(app, () => goTo('auth-login'));
