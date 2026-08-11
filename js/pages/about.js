const appInfo = {
  version: "1.0.0",
  name: "Indo",
  description: "A place to watch, connect and share.",
  copyright: "© Indo"
};

export function renderAboutPage(container) {
  container.innerHTML = `
    <main class="about-page">
      <section class="about-card">
        <button
          class="about-back"
          type="button"
          data-about-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="about-title">About ${appInfo.name}</h1>
        <p class="about-version">Version ${appInfo.version}</p>

        <div class="about-section">
          <h2>About Indo</h2>
          <p>${appInfo.description}</p>
        </div>

        <div class="about-section">
          <h2>App Version</h2>
          <p>${appInfo.version}</p>
        </div>

        <div class="about-section">
          <h2>Copyright</h2>
          <p>${appInfo.copyright}</p>
        </div>
      </section>
    </main>
  `;

  container.querySelector("[data-about-back]").addEventListener("click", () => {
    window.dispatchEvent(
      new CustomEvent("indo:navigate", {
        detail: {
          page: "profile"
        }
      })
    );
  });
}
