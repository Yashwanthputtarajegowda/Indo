import './styles.css';
import { state } from './state.js';
import { render } from './router.js';

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

render(app);
