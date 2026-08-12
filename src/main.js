import './styles.css';
import './features/splash/splash.css';

import { startSplash } from './features/splash/splash-flow.js';
import { createSessionController } from './app/session.js';
import { createClickHandlers } from './app/click-handlers.js';
import { createFormHandlers } from './app/form-handlers.js';
import { goTo, renderEditProfileScreen, registerServiceWorker } from './app/navigation.js';

const app = document.getElementById('root');
const session = createSessionController(app);

registerServiceWorker();
session.start();

const clickHandlers = createClickHandlers({
  app,
  getSessionUser: session.getSessionUser,
  refreshEarning: session.refreshEarning,
  refreshProfile: session.refreshProfile,
  goTo: (screen) => goTo(app, screen),
  renderEditProfileScreen: () => renderEditProfileScreen(app)
});

const formHandlers = createFormHandlers({
  goTo: (screen) => goTo(app, screen),
  refreshProfile: session.refreshProfile,
  refreshEarning: session.refreshEarning
});

clickHandlers.register();
formHandlers.register();

startSplash(app, () => {
  session.markSplashFinished();
  goTo(app, session.getSessionUser() ? 'home' : 'auth-login');
});
