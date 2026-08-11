export function renderCreateAccountPage(container) {
  container.innerHTML = `
    <main class="create-account-page">
      <section class="create-account-card">
        <h1>Create Account</h1>
        <p>Choose your name and your unique Indo ID.</p>

        <form class="create-account-form" data-create-account-form>
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
                pattern="[A-Za-z0-9._]+"
                required
              />
            </div>
          </div>

          <div class="create-account-error" data-create-account-error></div>

          <button
            class="create-account-submit"
            type="submit"
          >
            Continue
          </button>
        </form>
      </section>
    </main>
  `;

  const form = container.querySelector("[data-create-account-form]");
  const error = container.querySelector("[data-create-account-error]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const userName = String(formData.get("userName") || "").trim();
    const userId = String(formData.get("userId") || "").trim();

    if (!userName || !userId) {
      error.textContent = "Enter your User Name and User ID.";
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:create-account", {
        detail: {
          userName,
          userId: `@${userId}`
        }
      })
    );
  });
}
