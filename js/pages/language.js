const LANGUAGES = [
  "English",
  "Kannada",
  "Hindi",
  "Telugu",
  "Tamil",
  "Malayalam"
];

export function renderLanguagePage(container) {
  const savedLanguage = localStorage.getItem("indo-language") || "English";

  container.innerHTML = `
    <main class="language-page">
      <section class="language-card">
        <button class="language-back" type="button" data-language-back>
          ←
        </button>

        <h1 class="language-title">Language</h1>
        <p class="language-description">
          Choose the language for your Indo app.
        </p>

        <div class="language-options">
          ${LANGUAGES.map((language) => `
            <button
              class="language-option ${
                language === savedLanguage ? "is-selected" : ""
              }"
              type="button"
              data-language="${language}"
            >
              ${language}
            </button>
          `).join("")}
        </div>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const option = event.target.closest("[data-language]");

    if (option) {
      const language = option.dataset.language;

      localStorage.setItem("indo-language", language);

      container
        .querySelectorAll("[data-language]")
        .forEach((button) => {
          button.classList.remove("is-selected");
        });

      option.classList.add("is-selected");

      window.dispatchEvent(
        new CustomEvent("indo:language-changed", {
          detail: {
            language
          }
        })
      );

      return;
    }

    const backButton = event.target.closest("[data-language-back]");

    if (backButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: "settings"
          }
        })
      );
    }
  });
}
