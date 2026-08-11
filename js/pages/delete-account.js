import { deleteCurrentAccount } from "../services/account-lifecycle.js";

export function renderDeleteAccountPage(container) {
  container.innerHTML = `
    <main class="delete-account-page">
      <section class="delete-account-card">
        <h1 class="delete-account-title">Delete Account?</h1>
        <p class="delete-account-warning">
          This action is permanent. Your account and its associated data will be removed after confirmation.
        </p>

        <div class="delete-account-error" data-delete-account-error></div>

        <div class="delete-account-options">
          <button
            class="delete-account-option delete-account-option--cancel"
            type="button"
            data-delete-cancel
          >
            Cancel
          </button>

          <button
            class="delete-account-option delete-account-option--danger"
            type="button"
            data-delete-confirm
          >
            Delete Account
          </button>
        </div>
      </section>
    </main>
  `;

  const error = container.querySelector("[data-delete-account-error]");

  container.querySelector("[data-delete-cancel]").addEventListener("click", () => {
    window.dispatchEvent(
      new CustomEvent("indo:navigate", {
        detail: { page: "account-settings" }
      })
    );
  });

  container.querySelector("[data-delete-confirm]").addEventListener("click", async () => {
    error.textContent = "";

    try {
      await deleteCurrentAccount();

      window.dispatchEvent(
        new CustomEvent("indo:account-deleted")
      );
    } catch (deleteError) {
      error.textContent = deleteError.message || "Could not delete account.";
    }
  });
}
