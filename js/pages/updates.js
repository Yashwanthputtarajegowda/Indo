const CURRENT_VERSION = "1.0.0";

export function renderUpdatesPage(container) {
  container.innerHTML = `
    <main class="updates-page">
      <button class="updates-back" type="button" data-updates-back aria-label="Back">
        ←
      </button>

      <section class="updates-card">
        <h1 class="updates-title">Updates</h1>
        <p class="updates-version">Current version: ${CURRENT_VERSION}</p>
        <p class="updates-status" data-updates-status>
          Check for the latest Indo version.
        </p>

        <button class="updates-check" type="button" data-updates-check>
          Check for Updates
        </button>
      </section>
    </main>
  `;

  const status = container.querySelector("[data-updates-status]");
  const checkButton = container.querySelector("[data-updates-check]");
  const backButton = container.querySelector("[data-updates-back]");

  checkButton.addEventListener("click", async () => {
    checkButton.disabled = true;
    status.textContent = "Checking for updates...";

    await new Promise((resolve) => {
      window.setTimeout(resolve, 700);
    });

    status.textContent = "You are using the latest version.";
    checkButton.disabled = false;
  });

  backButton.addEventListener("click", () => {
    window.dispatchEvent(
      new CustomEvent("indo:navigate", {
        detail: {
          page: "profile"
        }
      })
    );
  });
}
