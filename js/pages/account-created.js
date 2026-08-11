export function renderAccountCreatedPage(container, profile) {
  const userId = profile?.username || profile?.userId || "@user";

  container.innerHTML = `
    <main class="account-created-page">
      <section class="account-created-card">
        <div class="account-created-icon" aria-hidden="true">
          ✓
        </div>

        <h1>Account Created</h1>
        <p>Your Indo account is ready.</p>

        <div class="account-created-user-id">
          ${userId}
        </div>

        <button
          class="account-created-continue"
          type="button"
          data-account-created-continue
        >
          Continue to Indo
        </button>
      </section>
    </main>
  `;

  container
    .querySelector("[data-account-created-continue]")
    .addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("indo:account-ready", {
          detail: profile
        })
      );
    });
}
