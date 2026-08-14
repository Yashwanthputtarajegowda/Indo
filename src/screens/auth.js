export function renderLogin(app) {
  app.innerHTML = `
    <main class="auth-page indo-auth-v140">
      <div class="auth-ambient" aria-hidden="true">
        <span class="auth-orb auth-orb-a"></span>
        <span class="auth-orb auth-orb-b"></span>
        <span class="auth-heart auth-heart-a">♥</span>
        <span class="auth-heart auth-heart-b">♥</span>
        <span class="auth-heart auth-heart-c">♥</span>
        <span class="auth-spark auth-spark-a">✦</span>
        <span class="auth-spark auth-spark-b">✦</span>
      </div>

      <section class="auth-login-stage" aria-label="Indo login">
        <div class="auth-hero-brand">
          <div class="auth-collage" aria-hidden="true">
            <div class="auth-photo auth-photo-a"><span>✦</span></div>
            <div class="auth-photo auth-photo-b"><span>♥</span></div>
            <div class="auth-photo auth-photo-c"><span>✦</span></div>
            <div class="auth-photo auth-photo-d"><span>♥</span></div>
          </div>
          <div class="auth-logo-mark"><span>♥</span>Indo</div>
          <div class="auth-tagline">Connect. Share. <b>Love.</b></div>
        </div>

        <section class="auth-card">
          <div class="auth-card-glow" aria-hidden="true"></div>
          <div class="auth-welcome">
            <div class="auth-wave">👋</div>
            <h1>Welcome back!</h1>
            <p>Login to continue your journey</p>
          </div>

          <form id="login-form" class="auth-form">
            <label class="auth-field">
              <span><i aria-hidden="true">✉</i>Email ID</span>
              <div class="auth-input-wrap">
                <input id="login-email" type="email" placeholder="Enter your email" autocomplete="email" required>
                <b aria-hidden="true">✉</b>
              </div>
            </label>

            <label class="auth-field">
              <span><i aria-hidden="true">♙</i>Password</span>
              <div class="auth-input-wrap">
                <input id="login-password" type="password" placeholder="Enter your password" autocomplete="current-password" required>
                <button class="auth-eye" id="login-password-toggle" type="button" aria-label="Show password">◉</button>
              </div>
            </label>

            <div class="auth-options">
              <label class="auth-check"><input id="login-remember" type="checkbox"><span></span>Remember me</label>
              <button class="forgot-btn" data-password-reset type="button">Forgot Password?</button>
            </div>

            <p id="login-message" class="auth-message" aria-live="polite"></p>
            <button class="auth-submit" type="submit"><span>Login</span><b>→</b></button>
          </form>

          <div class="auth-divider"><span></span><b>or continue with</b><span></span></div>
          <div class="auth-socials" aria-label="Additional sign-in options">
            <button type="button" class="auth-social" data-auth-provider="google" aria-label="Google">G</button>
            <button type="button" class="auth-social" data-auth-provider="facebook" aria-label="Facebook">f</button>
            <button type="button" class="auth-social" data-auth-provider="apple" aria-label="Apple">●</button>
            <button type="button" class="auth-social auth-phone" data-auth-provider="phone" aria-label="Phone">⌕</button>
          </div>

          <div class="auth-create-row">Don't have an account? <button class="auth-switch" data-auth="signup" type="button">Create new account <b>›</b></button></div>
        </section>

        <div class="auth-privacy">♢ <span>Your privacy is 100% safe with Indo</span> <b>♥</b></div>
      </section>
    </main>`;

  const password = app.querySelector('#login-password');
  const toggle = app.querySelector('#login-password-toggle');
  toggle?.addEventListener('click', () => {
    if (!password) return;
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    toggle.textContent = showing ? '◉' : '◌';
    toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

  app.querySelectorAll('[data-auth-provider]').forEach((button) => {
    button.addEventListener('click', () => {
      const message = app.querySelector('#login-message');
      if (message) message.textContent = `${button.getAttribute('data-auth-provider')} sign-in is not configured yet.`;
    });
  });
}

export function renderSignup(app) {
  app.innerHTML = `
    <main class="auth-page indo-auth-v140">
      <div class="auth-ambient" aria-hidden="true"><span class="auth-orb auth-orb-a"></span><span class="auth-orb auth-orb-b"></span></div>
      <section class="auth-login-stage auth-signup-stage">
        <div class="auth-hero-brand auth-hero-compact">
          <div class="auth-logo-mark"><span>♥</span>Indo</div>
          <div class="auth-tagline">Create your <b>Indo</b> journey.</div>
        </div>
        <section class="auth-card">
          <div class="auth-welcome"><div class="auth-wave">✨</div><h1>Create account</h1><p>Join Indo and start sharing.</p></div>
          <form id="signup-form" class="auth-form">
            <label class="auth-field"><span>Username</span><div class="auth-input-wrap"><input id="signup-username" placeholder="Username" autocomplete="nickname" required></div></label>
            <label class="auth-field"><span>User ID</span><div class="auth-input-wrap"><input id="signup-user-id" placeholder="@yourid" autocomplete="username" required></div><small id="user-id-message" class="auth-hint">Starts with @ and must be unique.</small></label>
            <label class="auth-field"><span>Mobile Number</span><div class="auth-input-wrap"><input id="signup-mobile" type="tel" placeholder="Mobile number" autocomplete="tel" required></div></label>
            <label class="auth-field"><span>Email ID</span><div class="auth-input-wrap"><input id="signup-email" type="email" placeholder="Email address" autocomplete="email" required></div></label>
            <label class="auth-field"><span>Password</span><div class="auth-input-wrap"><input id="signup-password" type="password" placeholder="Password" autocomplete="new-password" minlength="8" required></div></label>
            <p id="signup-message" class="auth-message" aria-live="polite"></p>
            <button class="auth-submit" type="submit"><span>Create Account</span><b>→</b></button>
          </form>
          <div class="auth-create-row auth-create-login">Already have an account? <button class="auth-switch" data-auth="login" type="button">Login <b>›</b></button></div>
        </section>
      </section>
    </main>`;
}
