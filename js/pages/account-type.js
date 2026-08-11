const accountTypes = [
  {
    id: "personal",
    title: "Personal Account",
    description: "For sharing videos, reels and connecting with people."
  },
  {
    id: "creator",
    title: "Creator Account",
    description: "For creators who want creator tools and earning features."
  }
];

export function renderAccountTypePage(container) {
  const storedType = localStorage.getItem("indo-account-type") || "personal";

  container.innerHTML = `
    <main class="account-type-page">
      <header class="account-type-header">
        <button
          class="account-type-back"
          type="button"
          data-account-type-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="account-type-title">Account Type</h1>
      </header>

      <section class="account-type-options">
        ${accountTypes.map((type) => `
          <button
            class="account-type-option ${
              type.id === storedType ? "is-selected" : ""
            }"
            type="button"
            data-account-type="${type.id}"
          >
            <h2>${type.title}</h2>
            <p>${type.description}</p>
          </button>
        `).join("")}
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-account-type-back]");

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

    const option = event.target.closest("[data-account-type]");

    if (!option) {
      return;
    }

    localStorage.setItem(
      "indo-account-type",
      option.dataset.accountType
    );

    container
      .querySelectorAll("[data-account-type]")
      .forEach((button) => {
        button.classList.remove("is-selected");
      });

    option.classList.add("is-selected");

    window.dispatchEvent(
      new CustomEvent("indo:account-type-changed", {
        detail: {
          accountType: option.dataset.accountType
        }
      })
    );
  });
}
