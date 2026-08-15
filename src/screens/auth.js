const svg = {
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17v11h-17z"/><path d="m4.5 7.5 7.5 5 7.5-5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-3.2 3-5 6.5-5s5.7 1.8 6.5 5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5 9.5 4l2 4-2 1.5c.8 1.8 2.2 3.2 4 4l1.5-2 4 2-.5 2.5c-.2 1-1 1.7-2 1.7C10.8 17.7 6.3 13.2 6.3 7.5c0-1 .7-1.8 1.7-2Z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z"/><path d="M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"/></svg>',
  eyeOff:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16"/><path d="M3 12s3.2-5 9-5c1.5 0 2.8.3 4 .9M21 12s-3.2 5-9 5c-1.5 0-2.8-.3-4-.9"/><path d="M10 10a2.5 2.5 0 0 0 3.5 3.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
};
function authIcon(icon) {
  return `<span class="auth-icon" aria-hidden="true">${svg[icon] || ""}</span>`;
}
function ambient() {
  return `<div class="auth-ambient" aria-hidden="true"><span class="auth-glow auth-glow-top"></span><span class="auth-glow auth-glow-bottom"></span><span class="auth-lightning auth-lightning-a">╱</span><span class="auth-lightning auth-lightning-b">╲</span></div>`;
}
function brand(signup = false) {
  return `<header class="auth-brand-block ${signup ? "auth-signup-brand" : ""}"><div class="auth-logo"><div class="auth-logo-orb"><span class="auth-logo-bolt">ϟ</span></div><div class="auth-logo-word">Indo</div></div></header>`;
}
function privacy() {
  return `<div class="auth-privacy">${svg.shield}<span>Your privacy is <b>100%</b> safe with <b>Indo</b></span></div>`;
}
function socialButtons() {
  return `<div class="auth-social-grid"><button type="button" class="auth-social" data-auth-provider="Google"><span class="google-g">G</span>Google</button><button type="button" class="auth-social" data-auth-provider="Facebook"><span class="facebook-f">f</span>Facebook</button><button type="button" class="auth-social" data-auth-provider="Apple"><span class="apple-mark">●</span>Apple</button></div><button type="button" class="auth-social auth-phone-social" data-auth-provider="Phone">${svg.phone}Phone</button>`;
}
function bindPasswordToggle(app, inputId, toggleId) {
  const password = app.querySelector(inputId);
  const toggle = app.querySelector(toggleId);
  toggle?.addEventListener("click", () => {
    if (!password) return;
    const showing = password.type === "text";
    password.type = showing ? "password" : "text";
    toggle.innerHTML = showing ? svg.eye : svg.eyeOff;
    toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });
}
function bindSocialButtons(app, messageSelector) {
  app.querySelectorAll("[data-auth-provider]").forEach((button) =>
    button.addEventListener("click", () => {
      const message = app.querySelector(messageSelector);
      if (message) message.textContent = `${button.getAttribute("data-auth-provider")} sign-in is not configured yet.`;
    }),
  );
}
function installUserIdBehavior(app) {
  const input = app.querySelector("#signup-user-id");
  const message = app.querySelector("#user-id-message");
  const available = app.querySelector("#user-id-available");
  if (!input || input.dataset.userIdBound === "1") return;
  input.dataset.userIdBound = "1";
  let timer;
  const getRawUserId = () =>
    String(input.value || "")
      .trim()
      .replace(/^@+/, "")
      .toLowerCase();
  const setAvailable = (show) => {
    if (available) available.classList.toggle("show", Boolean(show));
  };
  const updatePreview = () => {
    const raw = getRawUserId();
    if (message) message.textContent = raw ? `Your Indo ID will be @${raw}` : "Choose any User ID. @ will be added automatically.";
    setAvailable(false);
    return raw;
  };
  const checkAvailability = async () => {
    const raw = getRawUserId();
    if (!raw) {
      input.setCustomValidity("");
      updatePreview();
      return;
    }
    if (message) message.textContent = "Checking User ID...";
    try {
      const apiBase = window.INDO_API_BASE || "";
      const response = await fetch(`${apiBase}/api/account/check-user-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: raw }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not check User ID.");
      if (data.available) {
        input.setCustomValidity("");
        if (message) message.textContent = `@${raw} is available.`;
        setAvailable(true);
      } else {
        input.setCustomValidity("This User ID is already taken.");
        if (message) message.textContent = `@${raw} is already taken. Choose another User ID.`;
        setAvailable(false);
      }
    } catch (error) {
      input.setCustomValidity("");
      if (message) message.textContent = "User ID will be checked when you create the account.";
      setAvailable(false);
    }
  };
  input.addEventListener("input", () => {
    input.setCustomValidity("");
    updatePreview();
    clearTimeout(timer);
    timer = setTimeout(checkAvailability, 350);
  });
  input.addEventListener("blur", () => {
    input.value = getRawUserId();
    clearTimeout(timer);
    timer = setTimeout(checkAvailability, 0);
  });
}
const messageStyle = "margin:0;min-height:0;padding:0;font-size:8px;line-height:1.1;text-align:center;color:#ff7bdd;overflow:visible";
export function renderLogin(app) {
  app.innerHTML = `<main class="auth-page indo-auth-v160">${ambient()}<section class="auth-shell" aria-label="Indo login">${brand()}<section class="auth-card auth-login-card"><div class="auth-welcome"><h1>Welcome back!</h1><p>Login to continue your journey</p></div><form id="login-form" class="auth-form"><label class="auth-field"><span>${authIcon("mail")}Email ID</span><div class="auth-input-wrap">${svg.mail}<input id="login-email" type="email" placeholder="Enter your email" autocomplete="email" required></div></label><label class="auth-field"><span>${authIcon("lock")}Password</span><div class="auth-input-wrap">${svg.lock}<input id="login-password" type="password" placeholder="Enter your password" autocomplete="current-password" required><button class="auth-eye" id="login-password-toggle" type="button" aria-label="Show password">${svg.eye}</button></div></label><div class="auth-options"><label class="auth-check"><input id="login-remember" type="checkbox" checked><span></span>Remember me</label><button class="forgot-btn" data-password-reset type="button">Forgot Password?</button></div><p id="login-message" class="auth-message" aria-live="polite" style="${messageStyle}"></p><button class="auth-submit" type="submit"><span>⚡ Login</span>${svg.arrow}</button></form><div class="auth-social-label"><span></span><b>or continue with</b><span></span></div>${socialButtons()}<div class="auth-create-row">Don't have an account? <button class="auth-switch" data-auth="signup" type="button">Create new account →</button></div>${privacy()}</section></section></main>`;
  bindPasswordToggle(app, "#login-password", "#login-password-toggle");
  bindSocialButtons(app, "#login-message");
}
export function renderSignup(app) {
  app.innerHTML = `<main class="auth-page indo-auth-v160"><button class="auth-back auth-switch" data-auth="login" type="button" aria-label="Back to login">←</button>${ambient()}<section class="auth-shell auth-signup-shell" aria-label="Indo create account">${brand(true)}<section class="auth-card auth-signup-card"><div class="auth-welcome"><h1>Create your account</h1><p>Choose your Indo identity and start <b>sharing</b></p></div><form id="signup-form" class="auth-form"><label class="auth-field"><span>${authIcon("user")}Your name</span><div class="auth-input-wrap">${svg.user}<input id="signup-username" placeholder="Your name" autocomplete="name" required></div></label><label class="auth-field"><span>${authIcon("user")}User ID</span><div class="auth-input-wrap auth-userid-wrap"><span class="auth-at">@</span><input id="signup-user-id" placeholder="Choose your User ID" autocomplete="username" autocapitalize="none" spellcheck="false" required><span id="user-id-available" class="auth-available">${svg.check} User ID available</span></div><small id="user-id-message" class="auth-hint">Choose any User ID. @ will be added automatically.</small></label><label class="auth-field"><span>${authIcon("phone")}Mobile Number</span><div class="auth-phone-row"><button type="button" class="auth-country" aria-label="Country code">${svg.phone}<b>+91</b><span>⌄</span></button><div class="auth-input-wrap"><input id="signup-mobile" type="tel" placeholder="Enter your mobile number" autocomplete="tel" required></div></div></label><label class="auth-field"><span>${authIcon("mail")}Email ID</span><div class="auth-input-wrap">${svg.mail}<input id="signup-email" type="email" placeholder="Enter your email ID" autocomplete="email" required></div></label><label class="auth-field"><span>${authIcon("lock")}Password</span><div class="auth-input-wrap">${svg.lock}<input id="signup-password" type="password" placeholder="Create a password" autocomplete="new-password" minlength="8" required><button class="auth-eye" id="signup-password-toggle" type="button" aria-label="Show password">${svg.eye}</button></div></label><label class="auth-terms"><input id="signup-terms" type="checkbox" required><span></span><b>I agree to the <em>Terms of Service</em> and <em>Privacy Policy</em></b></label><p id="signup-message" class="auth-message" aria-live="polite" style="${messageStyle}"></p><button class="auth-submit" type="submit"><span>⚡ Create Account</span>${svg.arrow}</button></form><div class="auth-social-label"><span></span><b>or sign up with</b><span></span></div>${socialButtons()}<div class="auth-create-row">Already have an account? <button class="auth-switch" data-auth="login" type="button">Login now →</button></div>${privacy()}</section></section></main>`;
  bindPasswordToggle(app, "#signup-password", "#signup-password-toggle");
  bindSocialButtons(app, "#signup-message");
  installUserIdBehavior(app);
}
