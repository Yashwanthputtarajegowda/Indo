import { state } from './state.js';
import { renderHome } from './screens/home.js';
import { renderReels } from './screens/reels.js';
import { renderCreate } from './screens/create.js?v=20260813-1';
import { renderProfile } from './screens/profile.js';
import { renderSettings } from './screens/settings.js';
import { renderSearch } from './screens/search.js';
import { renderNotifications } from './screens/notifications.js';
import { renderLogin, renderSignup } from './screens/auth.js';
import { renderWallet } from './screens/wallet.js';
import { renderBlockedUsers } from './screens/blocked-users.js';

export function render(app) {
  if (state.screen === 'auth-login') return renderLogin(app);
  if (state.screen === 'auth-signup') return renderSignup(app);
  if (state.screen === 'profile') return renderProfile(app, state.profile);
  if (state.screen === 'settings') return renderSettings(app, state.accountType, state.earning, state.earningSummary);
  if (state.screen === 'wallet') return renderWallet(app);
  if (state.screen === 'blocked-users') return renderBlockedUsers(app);
  if (state.screen === 'activity') return renderNotifications(app, 'activity');
  const screens = { home: renderHome, reels: renderReels, create: renderCreate, search: renderSearch, notifications: renderNotifications };
  (screens[state.screen] || renderHome)(app);
}
