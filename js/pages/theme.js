import { getTheme, setTheme } from "../services/theme.js";

const themeOptions = [
  "white",
  "dark",
  "system"
];

export function renderThemePage(container) {
  container.innerHTML = `
    <main class="theme-page">
      <section class="theme-card">
        <h1 class="theme-title">Theme</h1>
        <p class="theme-description">Choose how Indo should look.</p>

        <div class="theme-options">
          ${themeOptions.map((theme) => `
            <button
              class="theme-option ${getTheme() === theme ? "is-selected" : ""}"
              type="button"
              data-theme-option="${theme}"
            >
              ${theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          `).join("")}
        </div>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-option]");

    if (!button) {
      return;
    }

    setTheme(button.dataset.themeOption);

    container
      .querySelectorAll("[data-theme-option]")
      .forEach((option) => {
        option.classList.toggle(
          "is-selected",
          option.dataset.themeOption === button.dataset.themeOption
        );
      });
  });
}
