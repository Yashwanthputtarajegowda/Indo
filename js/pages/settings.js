import { signOutUser } from "../services/firebase-auth.js";
import { deleteAccount } from "../services/account-deletion.js";

export function renderSettingsPage(container) {
  container.innerHTML = `
    <main class="settings-page">
      <header class="settings-header">
        <button class="settings-back" type="button" data-settings-back aria-label="Back">←</button>
        <h1 class="settings-title">Settings</h1>
      </header>

      <section class="settings-list">
        <div class="settings-section">Account</div>
        <button class="settings-item" type="button" data-settings-item="account"><span>Account Settings</span><span>›</span></button>
        <button class="settings-item" type="button" data-settings-item="privacy"><span>Privacy</span><span>›</span></button>
        <button class="settings-item" type="button" data-settings-item="security"><span>Security</span><span>›</span></button>

        <div class="settings-section">Content</div>
        <button class="settings-item" type="button" data-settings-item="saved"><span>Saved Reels</span><span>›</span></button>

        <div class="settings-section">Preferences</div>
        <button class="settings-item" type="button" data-settings-item="theme"><span>Theme</span><span>›</span></button>
        <button class="settings-item" type="button" data-settings-item="notifications"><span>Notifications</span><span>›</span></button>
        <button class="settings-item" type="button" data-settings-item="language"><span>Language</span><span>English</span></button>

        <div class="settings-section">Support</div>
        <button class="settings-item" type="button" data-settings-item="help"><span>Help</span><span>›</span></button>
        <button class="settings-item" type="button" data-settings-item="about"><span>About Indo</span><span>›</span></button>
        <button class="settings-item settings-item--danger" type="button" data-settings-item="delete-account"><span>Delete Account</span><span>›</span></button>
        <button class="settings-item settings-item--danger" type="button" data-settings-item="logout"><span>Log Out</span><span>›</span></button>
      </section>

      <div class="settings-confirm" data-delete-confirm hidden>
        <div class="settings-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <h2 id="delete-account-title">Delete account?</h2>
          <p>This permanently deletes your Indo profile and account data. This action cannot be undone.</p>
          <div class="settings-confirm-actions">
            <button type="button" data-delete-cancel>Cancel</button>
            <button type="button" class="settings-item--danger" data-delete-confirm>Delete permanently</button>
          </div>
          <p class="settings-confirm-error" data-delete-error></p>
        </div>
      </div>
    </main>
  `;

  const confirmOverlay = container.querySelector("[data-delete-confirm]");
  const cancelButton = container.querySelector("[data-delete-cancel]");
  const confirmButton = container.querySelector("[data-delete-confirm]");
  const errorText = container.querySelector("[data-delete-error]");

  const closeConfirm = () => {
    confirmOverlay.hidden = true;
    errorText.textContent = "";
    confirmButton.disabled = false;
  };

  container.addEventListener("click", async (event) => {
    if (event.target.closest("[data-settings-back]")) {
      window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "profile" } }));
      return;
    }

    if (event.target.closest("[data-delete-cancel]")) {
      closeConfirm();
      return;
    }

    if (event.target.closest("[data-delete-confirm]")) {
      confirmButton.disabled = true;
      errorText.textContent = "";
      try {
        await deleteAccount();
      } catch (error) {
        confirmButton.disabled = false;
        errorText.textContent = error.message || "Could not delete account.";
      }
      return;
    }

    const item = event.target.closest("[data-settings-item]");
    if (!item) return;
    const action = item.dataset.settingsItem;

    if (action === "delete-account") {
      confirmOverlay.hidden = false;
      return;
    }
    if (action === "saved") {
      window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "saved" } }));
      return;
    }
    if (action === "notifications") {
      window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "notifications" } }));
      return;
    }
    if (action === "logout") {
      item.disabled = true;
      try {
        await signOutUser();
      } catch (error) {
        item.disabled = false;
        item.title = error.message || "Could not log out.";
      }
      return;
    }

    window.dispatchEvent(new CustomEvent("indo:settings-action", { detail: { action } }));
  });
}
