export function renderSettingsPage(container) {
  container.innerHTML = `
    <main class="settings-page">
      <header class="settings-header">
        <button
          class="settings-back"
          type="button"
          data-settings-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="settings-title">Settings</h1>
      </header>

      <section class="settings-list">
        <div class="settings-section">Account</div>

        <button class="settings-item" type="button" data-settings-item="account">
          <span>Account Settings</span>
          <span>›</span>
        </button>

        <button class="settings-item" type="button" data-settings-item="privacy">
          <span>Privacy</span>
          <span>›</span>
        </button>

        <button class="settings-item" type="button" data-settings-item="security">
          <span>Security</span>
          <span>›</span>
        </button>

        <div class="settings-section">Preferences</div>

        <button class="settings-item" type="button" data-settings-item="theme">
          <span>Theme</span>
          <span>›</span>
        </button>

        <button class="settings-item" type="button" data-settings-item="notifications">
          <span>Notifications</span>
          <span>›</span>
        </button>

        <button class="settings-item" type="button" data-settings-item="language">
          <span>Language</span>
          <span>English</span>
        </button>

        <div class="settings-section">Support</div>

        <button class="settings-item" type="button" data-settings-item="help">
          <span>Help</span>
          <span>›</span>
        </button>

        <button class="settings-item" type="button" data-settings-item="about">
          <span>About Indo</span>
          <span>›</span>
        </button>

        <button
          class="settings-item settings-item--danger"
          type="button"
          data-settings-item="logout"
        >
          <span>Log Out</span>
          <span>›</span>
        </button>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-settings-back]");

    if (backButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: "profile"
          }
        })
      );

      return;
    }

    const item = event.target.closest("[data-settings-item]");

    if (!item) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:settings-action", {
        detail: {
          action: item.dataset.settingsItem
        }
      })
    );
  });
}
