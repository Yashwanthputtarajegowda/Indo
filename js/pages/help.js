const helpTopics = [
  "Account Help",
  "Privacy & Safety",
  "Videos & Reels",
  "Messages",
  "Report a Problem"
];

export function renderHelpPage(container) {
  container.innerHTML = `
    <main class="help-page">
      <section class="help-card">
        <button class="help-back" type="button" data-help-back aria-label="Back">
          ←
        </button>

        <h1 class="help-title">Help</h1>
        <p class="help-description">
          Find answers and get support for your Indo account.
        </p>

        <div class="help-list">
          ${helpTopics.map((topic) => `
            <button
              class="help-item"
              type="button"
              data-help-topic="${topic}"
            >
              ${topic}
            </button>
          `).join("")}
        </div>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-help-back]");

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
