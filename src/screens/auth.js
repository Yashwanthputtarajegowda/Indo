export function renderLogin(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand auth-brand"><span>♥</span>Indo</div>
        <h1>Welcome back</h1>
        <p>Login to continue</p>
        <form id="login-form">
          <label>
            Email ID
            <input id="login-email" type="email" placeholder="Email address" autocomplete="email" required>
          </label>
          <label>
            Password
            <input id="login-password" type="password" placeholder="Password" autocomplete="current-password" required>
          </label>
          <button class="forgot-btn" data-password-reset type="button">Forgot Password?</button>
          <p id="login-message" class="auth-message" aria-live="polite"></p>
          <button class="auth-submit" type="submit">Login</button>
        </form>
        <button class="auth-switch" data-auth="signup">Create a new account</button>
      </div>
    </div>`;
}

export function renderSignup(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand auth-brand"><span>♥</span>Indo</div>
        <h1>Create account</h1>
        <p>Username can repeat; User ID must be unique.</p>
        <form id="signup-form">
          <label>
            Username
            <input id="signup-username" placeholder="Username" autocomplete="nickname" required>
          </label>
          <label>
            User ID
            <input id="signup-user-id" placeholder="@yourid" autocomplete="username" required>
            <small id="user-id-message" class="auth-hint" aria-live="polite">Starts with @ and must be unique.</small>
          </label>
          <label>
            Mobile Number
            <input id="signup-mobile" type="tel" placeholder="Mobile number" autocomplete="tel" required>
          </label>
          <label>
            Email ID
            <input id="signup-email" type="email" placeholder="Email address" autocomplete="email" required>
          </label>
          <label>
            Password
            <input id="signup-password" type="password" placeholder="Password" autocomplete="new-password" minlength="8" required>
          </label>
          <p id="signup-message" class="auth-message" aria-live="polite"></p>
          <button class="auth-submit" type="submit">Create Account</button>
        </form>
        <button class="auth-switch" data-auth="login">Already have an account? Login</button>
      </div>
    </div>`;
}
