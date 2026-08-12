import { goTo, renderEditProfileScreen, registerServiceWorker } from './app/navigation.js';
import { createSessionController } from './app/session.js';
import { createClickHandlers } from './app/click-handlers.js';
import { createFormHandlers } from './app/form-handlers.js';
import { startSplash } from './features/splash/splash-flow.js';

const app = document.getElementById('root');

function renderBootSplash() {
  app.innerHTML = `
    <main class="splash-screen" aria-busy="true" aria-label="Loading Indo">
      <div class="splash-logo">I</div>
      <div class="splash-name">Indo</div>
      <div class="splash-spinner" aria-hidden="true"></div>
    </main>`;
}

function showBootError(error) {
  const message = error?.message || String(error || 'Unknown startup error.');
  app.innerHTML = `
    <main class="splash-screen splash-error">
      <div class="splash-logo">I</div>
      <div class="splash-name">Indo</div>
      <p>Indo could not start.</p>
      <small>${message.replace(/[&<>\"']/g, '')}</small>
      <button type="button" onclick="location.reload()">Reload</button>
    </main>`;
}

function refreshServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

async function boot() {
  renderBootSplash();
  refreshServiceWorker();

  try {
    const session = createSessionController(app);
    registerServiceWorker();
    session.start();

    createClickHandlers({
      app,
      getSessionUser: session.getSessionUser,
      refreshEarning: session.refreshEarning,
      refreshProfile: session.refreshProfile,
      goTo: (screen) => goTo(app, screen),
      renderEditProfileScreen: () => renderEditProfileScreen(app)
    }).register();

    createFormHandlers({
      goTo: (screen) => goTo(app, screen),
      refreshProfile: session.refreshProfile,
      refreshEarning: session.refreshEarning
    }).register();

    startSplash(app, () => {
      session.markSplashFinished();
      goTo(app, session.getSessionUser() ? 'home' : 'auth-login');
    });
  } catch (error) {
    console.error('Indo startup failed:', error);
    showBootError(error);
  }
}

boot();
