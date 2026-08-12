import { state } from './state.js';
import { renderHome } from './screens/home.js';
import { renderReels } from './screens/reels.js';
import { renderCreate } from './screens/create.js';
import { renderProfile } from './screens/profile.js';
import { renderSettings } from './screens/settings.js';
import { renderSearch } from './screens/search.js';
import { renderNotifications } from './screens/notifications.js';
import { renderLogin, renderSignup } from './screens/auth.js';

export function render(app) {
  if (state.screen === 'auth-login') return renderLogin(app);
  if (state.screen === 'auth-signup') return renderSignup(app);
  if (state.screen === 'profile') return renderProfile(app, state.profile);
  if (state.screen === 'settings') return renderSettings(app, state.accountType);
  const screens = { home: renderHome, reels: renderReels, create: renderCreate, search: renderSearch, notifications: renderNotifications };
  (screens[state.screen] || renderHome)(app);
}
