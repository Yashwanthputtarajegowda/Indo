const icon = (name) => {
  const icons = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.2-6 8-6s6.5 2 8 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5 10 3l2 4-2.2 1.8a14 14 0 0 0 5.4 5.4L17 12l4 2-.5 3c-.3 1.8-1.7 3-3.5 3C10.4 20 4 13.6 4 6.9 4 5 5.2 3.8 7 3.5Z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.8M6.2 6.8C3.7 8.7 2.5 12 2.5 12s3.5 6 9.5 6c1.3 0 2.5-.3 3.5-.7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>'
  };
  return icons[name] || '';
};

function logoMarkup(size = '') {
  return `<div class="auth-logo ${size}">
    <div class="auth-logo-orb"><span class="auth-logo-bolt">ϟ</span></div>
    <div class="auth-logo-word">Indo</div>
  </div>`;
}

function socialMarkup() {
  return `<div class="auth-social-label"><span></span><b>or continue with</b><span></span></div>
    <div class="auth-social-grid">
      <button type="button" class="auth-social"><span class="google-g">G</span>Google</button>
      <button type="button" class="auth-social"><span class="facebook-f">f</span>Facebook</button>
      <button type="button" class="auth-social"><span class="apple-mark">●</span>Apple</button>
    </div>
    <button type="button" class="auth-social auth-phone-social">${icon('phone')}<span>Phone</span></button>`;
}

function passwordField(id, placeholder, label) {
  return `<label class="auth-field">
    <span>${icon('lock')}<b>${label}</b></span>
    <span class="auth-input-wrap">${icon('lock')}<input id="${id}" type="password" autocomplete="current-password" placeholder="${placeholder}"><button type="button" class="auth-eye" data-eye="${id}" aria-label="Show password">${icon('eye')}</button></span>
  </label>`;
}

export function renderAuth(app, go) {
  const mode = sessionStorage.getItem('indo-auth-mode') || 'login';
  const isSignup = mode === 'signup';

  app.innerHTML = `<div class="auth-page ${isSignup ? 'auth-page-signup' : 'auth-page-login'}">
    <div class="auth-lightning auth-lightning-a">ϟ</div>
    <div class="auth-lightning auth-lightning-b">ϟ</div>
    <div class="auth-lightning auth-lightning-c">ϟ</div>
    <div class="auth-glow auth-glow-top"></div><div class="auth-glow auth-glow-bottom"></div>
    <main class="auth-shell ${isSignup ? 'auth-signup-shell' : ''}">
      ${isSignup ? `<button class="auth-back" data-auth-back aria-label="Back">${icon('back')}</button>` : ''}
      <section class="auth-brand-block ${isSignup ? 'auth-signup-brand' : ''}">
        ${logoMarkup(isSignup ? 'auth-logo-small' : '')}
        <p class="auth-tagline">${isSignup ? 'Choose your Indo identity and start sharing' : 'Login to continue your journey'}</p>
      </section>

      <section class="auth-card ${isSignup ? 'auth-signup-card' : ''}">
        <div class="auth-welcome">
          <div class="auth-kicker">${isSignup ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</div>
          <h1>${isSignup ? 'Create your account' : 'Welcome back!'}</h1>
          ${!isSignup ? '<p>Login to continue your journey</p>' : ''}
        </div>

        ${isSignup ? `<form class="auth-form" novalidate>
          <label class="auth-field"><span>${icon('user')}<b>Your name</b></span><span class="auth-input-wrap">${icon('user')}<input id="auth-username" autocomplete="name" placeholder="Enter your name"></span></label>
          <label class="auth-field"><span><b>User ID</b></span><span class="auth-input-wrap auth-userid-wrap"><span class="auth-at">@</span><input id="auth-userid" autocomplete="off" placeholder="Enter your user ID"><small class="auth-available">${icon('check')} User ID available</small></span></label>
          <label class="auth-field"><span>${icon('phone')}<b>Mobile Number</b></span><span class="auth-phone-row"><button type="button" class="auth-country">${icon('phone')}<b>+91</b><span>⌄</span></button><span class="auth-input-wrap"><input id="auth-mobile" inputmode="tel" placeholder="Enter your mobile number"></span></span></label>
          <label class="auth-field"><span>${icon('mail')}<b>Email ID</b></span><span class="auth-input-wrap">${icon('mail')}<input id="auth-email" type="email" autocomplete="email" placeholder="Enter your email ID"></span></label>
          ${passwordField('auth-password','Create a password','Password')}
          <label class="auth-terms"><input id="auth-terms" type="checkbox"><span></span><b>I agree to the <em>Terms of Service</em> &amp; <em>Privacy Policy</em></b></label>
          <button type="button" class="auth-submit" data-auth-submit="signup"><span>ϟ</span> Create Account ${icon('arrow')}</button>
        </form>` : `<form class="auth-form" novalidate>
          <label class="auth-field"><span>${icon('mail')}<b>Email ID</b></span><span class="auth-input-wrap">${icon('mail')}<input id="auth-login" autocomplete="username" placeholder="Enter your email ID"></span></label>
          ${passwordField('auth-login-password','Enter your password','Password')}
          <div class="auth-options"><label class="auth-check"><input type="checkbox"><span></span><b>Remember me</b></label><button type="button" class="forgot-btn">Forgot Password?</button></div>
          <button type="button" class="auth-submit" data-auth-submit="login"><span>ϟ</span> Login ${icon('arrow')}</button>
        </form>`}

        ${socialMarkup()}
        <div class="auth-create-row">${isSignup ? 'Already have an account?' : 'Don’t have an account?'} <button type="button" class="auth-switch" data-auth-mode="${isSignup ? 'login' : 'signup'}">${isSignup ? 'Login now →' : 'Create new account →'}</button></div>
        <div class="auth-privacy">${icon('shield')}<span>Your privacy is <b>100%</b> safe with <b>Indo</b></span></div>
      </section>
    </main>
  </div>`;

  app.querySelectorAll('[data-auth-mode]').forEach(button => {
    button.addEventListener('click', () => {
      sessionStorage.setItem('indo-auth-mode', button.dataset.authMode);
      renderAuth(app, go);
    });
  });

  app.querySelector('[data-auth-back]')?.addEventListener('click', () => {
    sessionStorage.setItem('indo-auth-mode', 'login');
    renderAuth(app, go);
  });

  app.querySelectorAll('[data-eye]').forEach(button => {
    button.addEventListener('click', () => {
      const input = app.querySelector(`#${button.dataset.eye}`);
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      button.innerHTML = icon(showing ? 'eye' : 'eyeOff');
    });
  });

  app.querySelector('#auth-userid')?.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    const available = app.querySelector('.auth-available');
    if (available) available.classList.toggle('show', value.startsWith('@') && value.length > 1 && !value.includes(' '));
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
