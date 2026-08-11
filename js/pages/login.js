import { ensureAuthenticated } from "../services/firebase-auth.js";

export function renderLoginPage(container) {
  container.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <h1>Welcome Back</h1>
        <p>Login to continue to Indo.</p>

        <form class="login-form" data-login-form>
          <div class="login-field">
            <label for="login-user-id">User ID</label>
            <input
              id="login-user-id"
              name="userId"
              type="text"
              placeholder="@yourid"
              autocomplete="username"
              required
            />
          </div>

          <div class="login-field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>

          <div class="login-error" data-login-error></div>

          <button class="login-submit" type="submit">
            Login
          </button>
        </form>
      </section>
    </main>
  `;

  const form = container.querySelector("[data-login-form]");
  const error = container.querySelector("[data-login-error]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";

    const formData = new FormData(form);
    const userId = String(formData.get("userId") || "").trim();
    const password = String(formData.get("password") || "");

    if (!userId || !password) {
      error.textContent = "Enter your User ID and password.";
      return;
    }

    try {
      const user = await ensureAuthenticated();

      window.dispatchEvent(
        new CustomEvent("indo:login", {
          detail: {
            user,
            userId
          }
        })
      );
    } catch (loginError) {
      error.textContent = loginError.message || "Login failed.";
    }
  });
}
