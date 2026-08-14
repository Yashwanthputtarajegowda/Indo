function authIcon(symbol, extra = '') {
  return `<span class="auth-icon ${extra}" aria-hidden="true">${symbol}</span>`;
}

function installUserIdBehavior(app) {
  const input = app.querySelector('#signup-user-id');
  const message = app.querySelector('#user-id-message');
  if (!input || input.dataset.userIdBound === '1') return;
  input.dataset.userIdBound = '1';
  let timer;

  const normalizeDisplay = () => {
    const raw = String(input.value || '').trim().replace(/^@+/, '');
    input.value = raw ? `@${raw}` : '';
    if (raw) input.setSelectionRange(input.value.length, input.value.length);
    return raw;
  };

  const checkAvailability = async () => {
    const raw = String(input.value || '').trim().replace(/^@+/, '').toLowerCase();
    if (!raw) {
      if (message) message.textContent = 'Type your User ID. Indo will add @ automatically.';
      return;
    }
    if (message) message.textContent = 'Checking User ID...';
    try {
      const apiBase = window.INDO_API_BASE || '';
      const response = await fetch(`${apiBase}/api/account/check-user-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: raw }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not check User ID.');
      if (message) message.textContent = data.available
        ? `@${raw} is available.`
        : `@${raw} is already taken. Choose another User ID.`;
      input.setCustomValidity(data.available ? '' : 'This User ID is already taken.');
    } catch (error) {
      input.setCustomValidity('');
      if (message) message.textContent = 'Availability will be confirmed when you create the account.';
    }
  };

  input.addEventListener('input', () => {
    normalizeDisplay();
    input.setCustomValidity('');
    clearTimeout(timer);
    timer = setTimeout(checkAvailability, 350);
  });
  input.addEventListener('blur', () => {
    normalizeDisplay();
    clearTimeout(timer);
    timer = setTimeout(checkAvailability, 0);
  });
}

export function renderLogin(app) {
  app.innerHTML = `
    <main class="auth-page indo-auth-v146">
      <div class="auth-ambient" aria-hidden="true">
        <span class="auth-orbit auth-orbit-a"></span><span class="auth-orbit auth-orbit-b"></span>
        <span class="auth-star auth-star-a">✦</span><span class="auth-star auth-star-b">•</span>
        <span class="auth-star auth-star-c">•</span><span class="auth-star auth-star-d">✦</span>
      </div>
      <section class="auth-shell" aria-label="Indo login">
        <header class="auth-brand-block">
          <div class="auth-brand-ring"><div class="auth-brand-ring-inner"></div></div>
          <div class="auth-logo-mark"><span>♥</span>Indo</div>
          <div class="auth-tagline">Connect. Share. <b>Love.</b></div>
          <div class="auth-center-badge auth-lock-badge" aria-hidden="true">🔒</div>
        </header>
        <section class="auth-card auth-login-card">
          <div class="auth-welcome"><h1>Welcome back!</h1><p>Login to continue your journey</p></div>
          <form id="login-form" class="auth-form">
            <label class="auth-field"><span>${authIcon('✉')}Email ID</span><div class="auth-input-wrap"><input id="login-email" type="email" placeholder="Email ID" autocomplete="email" required><b aria-hidden="true">✉</b></div></label>
            <label class="auth-field"><span>${authIcon('♙')}Password</span><div class="auth-input-wrap"><input id="login-password" type="password" placeholder="Password" autocomplete="current-password" required><button class="auth-eye" id="login-password-toggle" type="button" aria-label="Show password">◉</button></div></label>
            <div class="auth-options"><label class="auth-check"><input id="login-remember" type="checkbox" checked><span></span>Remember me</label><button class="forgot-btn" data-password-reset type="button">Forgot Password?</button></div>
            <p id="login-message" class="auth-message" aria-live="polite"></p>
            <button class="auth-submit" type="submit"><span>Login</span><b>→</b></button>
          </form>
          <div class="auth-divider"><span></span><b>or continue with</b><span></span></div>
          <div class="auth-socials"><button type="button" class="auth-social google" data-auth-provider="google">G</button><button type="button" class="auth-social facebook" data-auth-provider="facebook">f</button><button type="button" class="auth-social apple" data-auth-provider="apple">●</button><button type="button" class="auth-social phone" data-auth-provider="phone">⌕</button></div>
          <div class="auth-create-row">Don't have an account? <button class="auth-switch" data-auth="signup" type="button">Create new account <b>→</b></button></div>
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
    <main class="auth-page indo-auth-v146">
      <div class="auth-ambient" aria-hidden="true">
        <span class="auth-orbit auth-orbit-a"></span><span class="auth-orbit auth-orbit-b"></span>
        <span class="auth-star auth-star-a">✦</span><span class="auth-star auth-star-b">•</span>
        <span class="auth-star auth-star-c">•</span><span class="auth-star auth-star-d">✦</span>
      </div>
      <section class="auth-shell auth-signup-shell" aria-label="Indo create account">
        <header class="auth-brand-block auth-signup-brand">
          <button class="auth-back auth-switch" data-auth="login" type="button" aria-label="Back to login">←</button>
          <div class="auth-logo-mark"><span>♥</span>Indo</div>
          <div class="auth-tagline">Connect. Share. <b>Love.</b></div>
          <div class="auth-center-badge auth-user-badge" aria-hidden="true">♙<b>+</b></div>
        </header>
        <section class="auth-card auth-signup-card">
          <div class="auth-welcome"><h1>Create your account</h1><p>Join Indo and start <b>connecting</b></p></div>
          <form id="signup-form" class="auth-form">
            <label class="auth-field"><span>${authIcon('♙')}Username</span><div class="auth-input-wrap"><input id="signup-username" placeholder="Username" autocomplete="nickname" required></div></label>
            <label class="auth-field"><span>${authIcon('@')}User ID</span><div class="auth-input-wrap"><input id="signup-user-id" placeholder="Choose your User ID" autocomplete="username" required></div><small id="user-id-message" class="auth-hint">Type your User ID — Indo will automatically add @.</small></label>
            <label class="auth-field"><span>${authIcon('⌕')}Mobile Number</span><div class="auth-input-wrap"><input id="signup-mobile" type="tel" placeholder="Mobile Number" autocomplete="tel" required></div></label>
            <label class="auth-field"><span>${authIcon('✉')}Email ID</span><div class="auth-input-wrap"><input id="signup-email" type="email" placeholder="Email ID" autocomplete="email" required></div></label>
            <label class="auth-field"><span>${authIcon('♙')}Password</span><div class="auth-input-wrap"><input id="signup-password" type="password" placeholder="Password" autocomplete="new-password" minlength="8" required><button class="auth-eye" id="signup-password-toggle" type="button" aria-label="Show password">◉</button></div></label>
            <label class="auth-terms"><input id="signup-terms" type="checkbox" required><span></span><b>I agree to the <em>Terms of Service</em> and <em>Privacy Policy</em></b></label>
            <p id="signup-message" class="auth-message" aria-live="polite"></p>
            <button class="auth-submit" type="submit"><span>Create Account</span><b>→</b></button>
          </form>
          <div class="auth-divider"><span></span><b>or sign up with</b><span></span></div>
          <div class="auth-socials"><button type="button" class="auth-social google" data-auth-provider="google">G</button><button type="button" class="auth-social facebook" data-auth-provider="facebook">f</button><button type="button" class="auth-social apple" data-auth-provider="apple">●</button><button type="button" class="auth-social phone" data-auth-provider="phone">⌕</button></div>
          <div class="auth-create-row">Already have an account? <button class="auth-switch" data-auth="login" type="button">Login now <b>→</b></button></div>
        </section>
        <div class="auth-privacy">♢ <span>Your privacy is 100% safe with Indo</span> <b>♥</b></div>
      </section>
    </main>`;

  const password = app.querySelector('#signup-password');
  const toggle = app.querySelector('#signup-password-toggle');
  toggle?.addEventListener('click', () => {
    if (!password) return;
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    toggle.textContent = showing ? '◉' : '◌';
    toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });
  installUserIdBehavior(app);
}
