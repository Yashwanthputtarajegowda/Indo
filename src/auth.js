export function renderAuth(app, go) {
  const mode = sessionStorage.getItem('indo-auth-mode') || 'signup';
  const isSignup = mode === 'signup';

  app.innerHTML = `<div class="auth-shell">
    <div class="auth-brand"><span>♥</span>indo</div>
    <p class="auth-tagline">Share your world<br>Connect with people</p>
    <div class="auth-card">
      <div class="auth-tabs">
        <button data-auth-mode="signup" class="${isSignup ? 'active' : ''}">Create Account</button>
        <button data-auth-mode="login" class="${!isSignup ? 'active' : ''}">Log In</button>
      </div>
      ${isSignup ? `
        <label>Username<input id="auth-username" autocomplete="username" placeholder="Your username"></label>
        <label>User ID<input id="auth-userid" autocomplete="off" placeholder="@yourid"></label>
        <label>Mobile Number<input id="auth-mobile" inputmode="tel" placeholder="+91 XXXXX XXXXX"></label>
        <label>Email<input id="auth-email" type="email" autocomplete="email" placeholder="you@example.com"></label>
        <label>Password<input id="auth-password" type="password" autocomplete="new-password" placeholder="Create a password"></label>
        <p class="auth-hint">User ID must start with @ and will be unique.</p>
        <button class="primary-btn" data-auth-submit="signup">Sign Up</button>
      ` : `
        <label>User ID or Email<input id="auth-login" autocomplete="username" placeholder="@yourid or email"></label>
        <label>Password<input id="auth-login-password" type="password" autocomplete="current-password" placeholder="Your password"></label>
        <button class="forgot-btn">Forgot Password?</button>
        <button class="primary-btn" data-auth-submit="login">Log In</button>
      `}
    </div>
  </div>`;

  app.querySelectorAll('[data-auth-mode]').forEach(button => {
    button.addEventListener('click', () => {
      sessionStorage.setItem('indo-auth-mode', button.dataset.authMode);
      renderAuth(app, go);
    });
  });

  const submit = app.querySelector('[data-auth-submit]');
  submit?.addEventListener('click', () => {
    if (submit.dataset.authSubmit === 'signup') {
      const userId = app.querySelector('#auth-userid')?.value.trim() || '';
      if (!userId.startsWith('@') || userId.length < 2) {
        alert('User ID @ ಇಂದ ಶುರು ಆಗಬೇಕು.');
        return;
      }
      if (userId.includes(' ')) {
        alert('User IDನಲ್ಲಿ space ಇರಬಾರದು.');
        return;
      }
    }
    go('home');
  });
}
