import { state } from '../state.js';
import { render } from '../router.js';
import { renderEditProfile } from '../screens/edit-profile.js';

export function goTo(app, screen) {
  state.screen = screen;
  render(app);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function renderEditProfileScreen(app) {
  state.screen = 'edit-profile';
  renderEditProfile(app, state.profile);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('../sw.js', import.meta.url);
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}
