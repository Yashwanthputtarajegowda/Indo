export function renderSignupPage(container) {
  container.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <div class="auth-brand">
          <h1>Indo</h1>
          <p>Create your account</p>
        </div>

        <form class="auth-form" id="signup-form">
          <label for="signup-name">Name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autocomplete="name"
            placeholder="Enter your name"
            required
          />

          <label for="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="Enter your email"
            required
          />

          <label for="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="Create a password"
            required
          />

          <button type="submit">Create Account</button>
        </form>

        <button class="auth-switch" type="button" id="show-login">
          Already have an account? Login
        </button>
      </section>
    </main>
  `;
}
