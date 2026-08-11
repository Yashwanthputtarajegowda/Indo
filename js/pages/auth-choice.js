export function renderAuthChoicePage(container) {
  container.innerHTML = `
    <main class="auth-choice-page">
      <section class="auth-choice-card">
        <h1>Welcome to Indo</h1>
        <p>Watch, connect and share.</p>

        <div class="auth-choice-buttons">
          <button
            class="auth-choice-button auth-choice-button--primary"
            type="button"
            data-auth-action="login"
          >
            Login
          </button>

          <button
            class="auth-choice-button auth-choice-button--secondary"
            type="button"
            data-auth-action="create"
          >
            Create Account
          </button>
        </div>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-action]");

    if (!button) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:auth-action", {
        detail: {
          action: button.dataset.authAction
        }
      })
    );
  });
}
