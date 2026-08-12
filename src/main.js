const app = document.getElementById('root');

function showStartupError(error) {
  const message = error?.message || String(error || 'Unknown startup error.');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p><small>${message.replace(/[&<>\"']/g, '')}</small><button type="button" onclick="location.reload()">Reload</button></main>`;
}

async function start() {
  try {
    // Do not statically import the application graph. A broken secondary screen
    // must never prevent the login screen from appearing.
    const { renderLogin } = await import('./screens/auth.js');
    renderLogin(app);

    // Register form handlers only after the login screen is visible.
    // If a secondary handler module has a problem, login UI still remains usable.
    try {
      const [{ createFormHandlers }, { state }] = await Promise.all([
        import('./app/form-handlers.js'),
        import('./state.js')
      ]);
      const { goTo } = await import('./app/navigation.js');
      const session = {
        refreshProfile: async () => {},
        refreshEarning: async () => {}
      };
      createFormHandlers({
        goTo: (screen) => {
          state.screen = screen;
          import('./router.js').then(({ render }) => render(app)).catch(() => {});
        },
        refreshProfile: session.refreshProfile,
        refreshEarning: session.refreshEarning
      }).register();
    } catch (handlerError) {
      console.error('Optional startup handlers failed:', handlerError);
    }
  } catch (error) {
    console.error('Indo startup failed:', error);
    showStartupError(error);
  }
}

start();
