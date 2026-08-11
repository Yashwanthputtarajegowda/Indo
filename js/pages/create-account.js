import { ensureAuthenticated } from "../services/firebase-auth.js";
import { claimUserId, checkUserId } from "../services/account-api.js";
import { updateProfile } from "../services/profile-state.js";

function showCreateAccountError(element, message) {
  const text = String(message || "Could not create account.");
  element.textContent = text;
  element.dataset.errorType =
    text.includes("already has a User ID")
      ? "existing-user-id"
      : text.includes("already taken")
        ? "user-id-taken"
        : "general";
}

export function renderCreateAccountPage(container) {
  container.innerHTML = `
    <main class="create-account-page">
      <section class="create-account-card">
        <h1>Create Account</h1>
        <p>Choose your name and your unique Indo ID.</p>

        <form class="create-account-form" data-create-account-form novalidate>
          <div class="create-account-field">
            <label for="create-user-name">User Name</label>
            <input
              id="create-user-name"
              name="userName"
              type="text"
              autocomplete="name"
              required
            />
          </div>

          <div class="create-account-field">
            <label for="create-user-id">User ID</label>
            <div class="create-account-user-id">
              <span>@</span>
              <input
                id="create-user-id"
                name="userId"
                type="text"
                autocomplete="username"
                pattern="[A-Za-z0-9._-]+"
                required
              />
            </div>
            <small class="create-account-hint" data-create-account-hint>
              Your User ID starts with @ and is unique to this account.
            </small>
          </div>

          <div class="create-account-error" data-create-account-error role="alert"></div>

          <button class="create-account-submit" type="submit">
            Continue
          </button>
        </form>
      </section>
    </main>
  `;

  const form = container.querySelector("[data-create-account-form]");
  const userNameInput = form.querySelector("[name='userName']");
  const userIdInput = form.querySelector("[name='userId']");
  const error = container.querySelector("[data-create-account-error]");
  const submit = form.querySelector(".create-account-submit");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    delete error.dataset.errorType;

    const userName = String(userNameInput.value || "").trim();
    const userId = String(userIdInput.value || "").trim().replace(/^@+/, "");

    if (!userName || !userId) {
      showCreateAccountError(error, "Enter your User Name and User ID.");
      return;
    }

    if (!/^[A-Za-z0-9._-]{1,50}$/.test(userId)) {
      showCreateAccountError(
        error,
        "User ID can contain only letters, numbers, dots, underscores, and hyphens."
      );
      return;
    }

    submit.disabled = true;

    try {
      const availability = await checkUserId(userId);

      if (!availability.available) {
        showCreateAccountError(
          error,
          "That User ID is already taken. Choose another @UserID."
        );
        userIdInput.focus();
        return;
      }

      const user = await ensureAuthenticated();
      const result = await claimUserId({
        user,
        userId,
        name: userName
      });

      updateProfile({
        userName,
        userId: result.username || `@${userId}`
      });

      window.dispatchEvent(
        new CustomEvent("indo:create-account", {
          detail: result
        })
      );
    } catch (accountError) {
      showCreateAccountError(
        error,
        accountError.message || "Could not create account."
      );
    } finally {
      submit.disabled = false;
    }
  });
}
