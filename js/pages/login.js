export function renderLoginPage(container) {
  container.innerHTML = `
    <main class="auth-page">
      <div class="auth-backdrop" aria-hidden="true"></div>

      <section class="auth-card">
        <button
          type="button"
          class="auth-back"
          data-route="splash"
          aria-label="Back"
        >
          ‹
        </button>

        <div class="auth-brand">
          <div class="auth-logo">Indo</div>
          <h1>Welcome Back</h1>
          <p>Login to continue watching</p>
        </div>

        <form class="auth-form" id="login-form">
          <div class="auth-field">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="auth-field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button class="auth-submit" type="submit">Login</button>
        </form>

        <div class="auth-divider">
          <span>OR</span>
        </div>

        <button class="auth-switch" type="button" id="show-signup">
          Don't have an account? <strong>Sign Up</strong>
        </button>
      </section>
    </main>
  `;
}
