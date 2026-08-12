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

async function boot() {
  renderBootSplash();

  try {
    const [navigation, sessionModule, clickModule, formModule] = await Promise.all([
      import('./app/navigation.js'),
      import('./app/session.js'),
      import('./app/click-handlers.js'),
      import('./app/form-handlers.js')
    ]);
    const { startSplash } = await import('./features/splash/splash-flow.js');
    const { createSessionController } = sessionModule;
    const { createClickHandlers } = clickModule;
    const { createFormHandlers } = formModule;
    const {
      goTo,
      renderEditProfileScreen,
      registerServiceWorker
    } = navigation;

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
