export function renderAccountSettingsPage(container, account = {}) {
  const userName = account.userName || "Indo User";
  const userId = account.userId || "@indo_user";

  const items = [
    {
      key: "user-name",
      label: "User Name",
      value: userName
    },
    {
      key: "user-id",
      label: "User ID",
      value: userId
    },
    {
      key: "account-type",
      label: "Account Type",
      value: account.accountType || "Public"
    },
    {
      key: "email",
      label: "Email",
      value: account.email || "Not added"
    },
    {
      key: "password",
      label: "Password",
      value: "Change"
    },
    {
      key: "delete-account",
      label: "Delete Account",
      value: ""
    }
  ];

  container.innerHTML = `
    <main class="account-settings-page">
      <header class="account-settings-header">
        <button
          class="account-settings-back"
          type="button"
          data-account-settings-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="account-settings-title">Account Settings</h1>
      </header>

      <section class="account-settings-list">
        ${items.map((item) => `
          <button
            class="account-settings-item"
            type="button"
            data-account-setting="${item.key}"
          >
            <span>${item.label}</span>
            <span class="account-settings-value">${item.value}</span>
          </button>
        `).join("")}
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-account-settings-back]");

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

    const setting = event.target.closest("[data-account-setting]");

    if (!setting) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:account-setting", {
        detail: {
          setting: setting.dataset.accountSetting
        }
      })
    );
  });
}
