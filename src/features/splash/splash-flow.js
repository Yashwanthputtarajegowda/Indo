import { renderSplash } from '../../screens/splash.js';

export function startSplash(app, nextScreen, delay = 1800) {
  renderSplash(app);
  window.setTimeout(() => {
    nextScreen();
  }, delay);
}
