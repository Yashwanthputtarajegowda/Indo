const privacyOptions = [
  ["Private Account", "Off"],
  ["Activity Status", "On"],
  ["Blocked Accounts", "0"]
];

const securityOptions = [
  ["Login Activity", "View"],
  ["Two-Factor Authentication", "Off"],
  ["Password", "Change"]
];

export function renderPrivacySecurityPage(container) {
  container.innerHTML = `
    <main class="privacy-security-page">
      <header class="privacy-security-header">
        <button
          class="privacy-security-back"
          type="button"
          data-privacy-security-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="privacy-security-title">Privacy & Security</h1>
      </header>

      <section class="privacy-security-section">
        <h2>Privacy</h2>

        <div class="privacy-security-list">
          ${privacyOptions.map(([label, value]) => `
            <button
              class="privacy-security-item"
              type="button"
              data-privacy-security-action="${label.toLowerCase().replaceAll(" ", "-")}"
            >
              <span>${label}</span>
              <span class="privacy-security-value">${value}</span>
            </button>
          `).join("")}
        </div>
      </section>

      <section class="privacy-security-section">
        <h2>Security</h2>

        <div class="privacy-security-list">
          ${securityOptions.map(([label, value]) => `
            <button
              class="privacy-security-item"
              type="button"
              data-privacy-security-action="${label.toLowerCase().replaceAll(" ", "-")}"
            >
              <span>${label}</span>
              <span class="privacy-security-value">${value}</span>
            </button>
          `).join("")}
        </div>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-privacy-security-back]");

    if (backButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: "settings"
          }
        })
      );
      return;
    }

    const actionButton = event.target.closest("[data-privacy-security-action]");

    if (actionButton) {
      window.dispatchEvent(
        new CustomEvent("indo:privacy-security-action", {
          detail: {
            action: actionButton.dataset.privacySecurityAction
          }
        })
      );
    }
  });
}
