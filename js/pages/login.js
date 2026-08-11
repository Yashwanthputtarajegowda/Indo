export function renderLoginPage(container) {
  container.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <div class="auth-brand">
          <h1>Indo</h1>
          <p>Movies, Videos & Reels</p>
        </div>

        <form class="auth-form" id="login-form">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="Enter your email"
            required
          />

          <label for="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
          />

          <button type="submit">Login</button>
        </form>

        <button class="auth-switch" type="button" id="show-signup">
          Create a new account
        </button>
      </section>
    </main>
  `;
}
