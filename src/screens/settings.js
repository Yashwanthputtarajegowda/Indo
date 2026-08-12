import { icons } from '../data.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export function renderSettings(app, accountType = 'public', earning = null, summary = null) {
  const isPrivate = accountType === 'private';
  const eligible = Boolean(earning?.eligible);
  const enabled = Boolean(earning?.earningEnabled);
  const status = eligible ? (enabled ? 'ON' : 'READY') : 'OFF';
  const actionLabel = enabled ? 'Turn Earning OFF' : (eligible ? 'Turn Earning ON' : 'View Earning Requirements');
  const videoHours = Number(earning?.videoWatchHours || 0).toFixed(2);
  const reelHours = Number(earning?.reelWatchHours || 0).toFixed(2);
  const videoRequirement = Number(earning?.requirements?.videoWatchHours || 5000);
  const reelRequirement = Number(earning?.requirements?.reelWatchHours || 1000);
  const payable = Number(summary?.payableRevenue || 0).toFixed(2);
  const gross = Number(summary?.grossRevenue || 0).toFixed(2);
  const videoViews = Number(summary?.videoViews || 0).toLocaleString();
  const reelViews = Number(summary?.reelViews || 0).toLocaleString();

  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="profile">${icons.back}</button><h2>Settings</h2><span></span></header><main class="settings-page"><div class="settings-group"><h4>Account</h4><button class="setting-row"><span>♙</span>Account <b>›</b></button><div class="setting-row privacy-row"><span>⌁</span><div><strong>Privacy</strong><small>Choose who can see your account</small></div><select data-visibility aria-label="Account privacy"><option value="public" ${!isPrivate ? 'selected' : ''}>Public</option><option value="private" ${isPrivate ? 'selected' : ''}>Private</option></select></div><button class="setting-row" data-earning-toggle type="button"><span>$</span><div><strong>Earning</strong><small>${eligible ? 'Eligible' : 'Complete watch-hour requirements first'}</small></div><em data-earning-status>${status}</em><b>›</b></button><div class="earning-panel" data-earning-panel><div class="earning-progress"><div><span>Video watch hours</span><strong>${escapeHtml(videoHours)} / ${escapeHtml(videoRequirement)}</strong></div><div class="earning-bar"><span style="width:${Math.min(100, (Number(earning?.videoWatchHours || 0) / videoRequirement) * 100)}%"></span></div></div><div class="earning-progress"><div><span>Reel watch hours</span><strong>${escapeHtml(reelHours)} / ${escapeHtml(reelRequirement)}</strong></div><div class="earning-bar"><span style="width:${Math.min(100, (Number(earning?.reelWatchHours || 0) / reelRequirement) * 100)}%"></span></div></div><div class="earning-summary"><div><small>Video views</small><strong>${escapeHtml(videoViews)}</strong><span>$${Number(summary?.rates?.videoPer1000Views || 0.5).toFixed(2)} / 1,000</span></div><div><small>Reel views</small><strong>${escapeHtml(reelViews)}</strong><span>$${Number(summary?.rates?.reelPer1000Views || 0.1).toFixed(2)} / 1,000</span></div><div><small>Estimated revenue</small><strong>$${escapeHtml(gross)}</strong><span>${enabled ? 'Payable' : 'Not payable yet'}</span></div><div><small>Payable balance</small><strong>$${escapeHtml(payable)}</strong><span>Based on current views</span></div></div><button class="primary-btn earning-action" data-earning-action type="button" ${!eligible ? 'disabled' : ''}>${escapeHtml(actionLabel)}</button><p class="earning-message" data-earning-message aria-live="polite"></p></div></div><div class="settings-group"><h4>Preferences</h4><button class="setting-row"><span>♧</span>Notifications <b>›</b></button><button class="setting-row" data-screen="blocked-users"><span>⊘</span>Blocked Users <b>›</b></button><button class="setting-row" data-screen="wallet"><span>▣</span>Wallet <b>›</b></button></div><div class="settings-group"><button class="setting-row"><span>?</span>Help & Support <b>›</b></button><button class="setting-row danger" data-logout><span>↪</span>Logout</button><p class="settings-message" aria-live="polite"></p></div></main></div>`;
}
