export function renderSignupPage(container) {
  container.innerHTML = `
    <main class="auth-page">
      <div class="auth-backdrop" aria-hidden="true"></div>

      <section class="auth-card">
        <button
          type="button"
          class="auth-back"
          data-route="login"
          aria-label="Back"
        >
          ‹
        </button>

        <div class="auth-brand">
          <div class="auth-logo">Indo</div>
          <h1>Create Account</h1>
          <p>Join Indo and start watching</p>
        </div>

        <form class="auth-form" id="signup-form">
          <div class="auth-field">
            <label for="signup-name">Name</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autocomplete="name"
              placeholder="Enter your name"
              required
            />
          </div>

          <div class="auth-field">
            <label for="signup-email">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="auth-field">
            <label for="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autocomplete="new-password"
              placeholder="Create a password"
              required
            />
          </div>

          <button class="auth-submit" type="submit">Create Account</button>
        </form>

        <div class="auth-divider">
          <span>OR</span>
        </div>

        <button class="auth-switch" type="button" id="show-login">
          Already have an account? <strong>Login</strong>
        </button>
      </section>
    </main>
  `;
}
