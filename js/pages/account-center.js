const centerItems = [
  {
    title: "Profile & Account",
    description: "Manage your Indo account details and profile information."
  },
  {
    title: "Login & Security",
    description: "Review account access and security options."
  },
  {
    title: "Connected Features",
    description: "Manage features connected to your Indo account."
  }
];

export function renderAccountCenterPage(container) {
  container.innerHTML = `
    <main class="account-center-page">
      <header class="account-center-header">
        <button
          class="account-center-back"
          type="button"
          data-account-center-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="account-center-title">Account Center</h1>
      </header>

      ${centerItems.map((item, index) => `
        <section class="account-center-card">
          <h2>${item.title}</h2>
          <p>${item.description}</p>

          <button
            class="account-center-action"
            type="button"
            data-account-center-action="${index}"
          >
            Manage
          </button>
        </section>
      `).join("")}
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-account-center-back]");

    if (backButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: "profile"
          }
        })
      );
    }
  });
}
