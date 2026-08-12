import { state } from '../state.js';
import { requestPayout } from '../features/earning/wallet.js';
import { searchUserId, loadPublicProfile } from '../features/search/user-search.js';
import { updateCurrentProfile } from '../features/profile/update-profile.js';
import { submitSignup } from '../features/auth/signup-form.js';
import { submitLogin } from '../features/auth/login-form.js';

export function createFormHandlers({ goTo, refreshProfile, refreshEarning }) {
  function register() {
    document.addEventListener('submit', async (event) => {
      const form = event.target;

      if (form.id === 'payout-form') {
        event.preventDefault();
        const button = form.querySelector('.primary-btn');
        const message = form.querySelector('[data-wallet-message]');
        const amount = Number(form.querySelector('[name="amount"]')?.value || 0);
        const method = form.querySelector('[name="method"]')?.value || 'manual';
        if (button) button.disabled = true;
        if (message) message.textContent = 'Creating payout request...';

        try {
          const result = await requestPayout(amount, method);
          if (message) message.textContent = `Payout request created for $${Number(result.payout.amount).toFixed(2)}.`;
          form.reset();
          setTimeout(() => goTo('wallet'), 500);
        } catch (error) {
          if (message) message.textContent = error.message || 'Could not create payout request.';
        } finally {
          if (button) button.disabled = false;
        }
        return;
      }

      if (form.id === 'user-search-form') {
        event.preventDefault();
        const input = form.querySelector('[name="query"]');
        const resultBox = document.querySelector('[data-search-result]');
        const query = input?.value || '';
        if (!resultBox) return;
        resultBox.textContent = 'Searching...';

        try {
          const user = await searchUserId(query);
          if (!user) {
            resultBox.innerHTML = '<div class="search-empty">No Indo user found for that User ID.</div>';
            return;
          }

          const profile = await loadPublicProfile(user.uid);
          const targetUid = profile?.uid || user.uid;
          const initial = String(profile?.name || user.name || user.userId || 'I')
            .replace(/^@/, '')
            .charAt(0)
            .toUpperCase() || 'I';
          const accountType = profile?.accountType === 'private' ? 'Private account' : 'Public account';
          const safeBio = profile?.bio ? String(profile.bio).replace(/[&<>\"']/g, '') : '';

          resultBox.innerHTML = `
            <div class="search-user-result">
              <div class="avatar small">${initial}</div>
              <div class="search-user-copy">
                <b>${profile?.userId || user.userId}</b>
                <small>${profile?.name || user.name || 'Indo User'}</small>
                <small>${accountType}</small>
                <small>${Number(profile?.followersCount || 0).toLocaleString()} followers · ${Number(profile?.followingCount || 0).toLocaleString()} following · ${Number(profile?.postsCount || 0).toLocaleString()} posts</small>
                ${safeBio ? `<small>${safeBio}</small>` : ''}
              </div>
              <button class="follow-btn" type="button" data-search-follow-uid="${targetUid}">Follow</button>
              <button class="message-btn" type="button" data-message-uid="${targetUid}" data-message-user-name="${String(profile?.name || user.name || 'Indo User').replace(/[&<>\"']/g, '')}">Message</button>
            </div>`;
          return;
        } catch (error) {
          resultBox.textContent = error.message || 'Could not search User ID.';
        }
        return;
      }

      if (form.id === 'edit-profile-form') {
        event.preventDefault();
        const button = form.querySelector('.primary-btn');
        const message = form.querySelector('.edit-profile-message');
        const name = form.querySelector('[name="name"]')?.value || '';
        const bio = form.querySelector('[name="bio"]')?.value || '';
        if (button) button.disabled = true;
        if (message) message.textContent = 'Saving...';

        try {
          state.profile = await updateCurrentProfile({ name, bio });
          state.accountType = state.profile?.accountType || state.accountType;
          if (message) message.textContent = 'Profile updated.';
          setTimeout(() => goTo('profile'), 400);
        } catch (error) {
          if (message) message.textContent = error.message || 'Could not update profile.';
          if (button) button.disabled = false;
        }
        return;
      }

      if (!['signup-form', 'login-form'].includes(form.id)) return;
      event.preventDefault();
      const button = form.querySelector('.auth-submit');
      const message = form.querySelector('.auth-message');
      if (button) button.disabled = true;
      if (message) message.textContent = form.id === 'signup-form' ? 'Creating account...' : 'Logging in...';

      try {
        if (form.id === 'signup-form') {
          const result = await submitSignup(form);
          state.accountType = result.accountType || 'public';
          await refreshProfile().catch(() => {});
          await refreshEarning().catch(() => {});
          if (message) message.textContent = `Account created. Your User ID is ${result.username}.`;
        } else {
          const result = await submitLogin(form);
          state.accountType = result?.accountType || state.accountType;
          await refreshProfile().catch(() => {});
          await refreshEarning().catch(() => {});
          if (message) message.textContent = 'Login successful.';
        }
        setTimeout(() => goTo('home'), 500);
      } catch (error) {
        if (message) message.textContent = error.message || 'Something went wrong.';
        if (button) button.disabled = false;
      }
    });
  }

  return { register };
}
