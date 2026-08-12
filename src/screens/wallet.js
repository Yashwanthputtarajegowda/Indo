import { nav } from '../components/nav.js';
import { loadWallet, requestPayout } from '../features/earning/wallet.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function renderPayouts(payouts) {
  if (!payouts.length) return '<div class="profile-empty">No payout requests yet.</div>';
  return payouts.map((payout) => `<div class="payout-row"><div><strong>$${Number(payout.amount || 0).toFixed(2)}</strong><small>${escapeHtml(payout.method || 'manual')} · ${escapeHtml(payout.status || 'pending')}</small></div><span>${new Date(Number(payout.createdAt || Date.now())).toLocaleDateString()}</span></div>`).join('');
}

export async function renderWallet(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="settings" aria-label="Back">‹</button><h2>Wallet</h2><span></span></header><main class="settings-page"><section class="wallet-card"><small>Available balance</small><strong data-wallet-balance>$0.00</strong><p data-wallet-status>Loading wallet...</p></section><form id="payout-form" class="upload-form"><label>Amount to request<input name="amount" type="number" min="0.01" step="0.01" placeholder="10.00" required></label><label>Method<select name="method"><option value="manual">Manual review</option><option value="bank">Bank payout</option></select></label><button class="primary-btn" type="submit">Request payout</button><p class="wallet-message" data-wallet-message aria-live="polite"></p></form><div class="settings-group"><h4>Payout history</h4><div data-payout-list><div class="profile-empty">Loading...</div></div></div></main>${nav('profile')}</div>`;

  const balance = app.querySelector('[data-wallet-balance]');
  const status = app.querySelector('[data-wallet-status]');
  const list = app.querySelector('[data-payout-list]');
  try {
    const wallet = await loadWallet();
    balance.textContent = `$${Number(wallet.balance || 0).toFixed(2)}`;
    status.textContent = wallet.earningEnabled ? `Minimum payout: $${Number(wallet.minimumPayoutUsd || 10).toFixed(2)}` : 'Turn Earning ON after eligibility to build payable balance.';
    list.innerHTML = renderPayouts(wallet.payouts || []);
  } catch (error) {
    status.textContent = error.message || 'Could not load wallet.';
    list.innerHTML = '<div class="profile-empty">Could not load payout history.</div>';
  }
}
