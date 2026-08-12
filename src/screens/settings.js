import { icons } from '../data.js';

export function renderSettings(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="profile">${icons.back}</button><h2>Settings</h2><span></span></header><main class="settings-page"><div class="settings-group"><h4>Account</h4><button class="setting-row"><span>♙</span>Account <b>›</b></button><button class="setting-row"><span>⌁</span>Privacy <em>Public</em><b>›</b></button><button class="setting-row"><span>$</span>Earning <em>OFF</em><b>›</b></button></div><div class="settings-group"><h4>Preferences</h4><button class="setting-row"><span>♧</span>Notifications <b>›</b></button><button class="setting-row"><span>⊘</span>Blocked Users <b>›</b></button><button class="setting-row"><span>▣</span>Wallet <b>›</b></button></div><div class="settings-group"><button class="setting-row"><span>?</span>Help & Support <b>›</b></button><button class="setting-row danger"><span>↪</span>Logout</button></div></main></div>`;
}
