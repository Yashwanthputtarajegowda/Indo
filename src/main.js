const app = document.getElementById('root');

function showStartupError(error) {
  const message = error?.message || String(error || 'Unknown startup error.');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p><small>${message.replace(/[&<>\\"']/g, '')}</small><button type="button" onclick="location.reload()">Reload</button></main>`;
}

async function renderCurrentScreen() {
  const { render } = await import('./router.js');
  render(app);
}

async function openHomeAfterLogin() {
  const { state } = await import('./state.js');
  state.authenticated = true;
  state.screen = 'home';
  await renderCurrentScreen();
}

function bindNavigation() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-screen]');
    if (!button || !app.contains(button)) return;

    event.preventDefault();
    event.stopPropagation();

    const screen = button.dataset.screen;
    if (!screen) return;

    try {
      const { state } = await import('./state.js');
      state.screen = screen;
      await renderCurrentScreen();
    } catch (error) {
      console.error('Navigation failed:', error);
      showStartupError(error);
    }
  });
}

async function start() {
  try {
    bindNavigation();

    const { renderLogin } = await import('./screens/auth.js');
    renderLogin(app);

    const form = app.querySelector('#login-form');
    const resetButton = app.querySelector('[data-password-reset]');
    if (!form) throw new Error('Login form could not be created.');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('.auth-submit');
      const message = form.querySelector('#login-message');
      const email = form.querySelector('#login-email')?.value?.trim() || '';
      const password = form.querySelector('#login-password')?.value || '';

      if (!email) {
        if (message) message.textContent = 'Email ID is required.';
        return;
      }
      if (!password) {
        if (message) message.textContent = 'Password is required.';
        return;
      }

      if (button) button.disabled = true;
      if (message) message.textContent = 'Logging in...';

      try {
        const { auth, signInWithEmailAndPassword } = await import('./features/auth/firebase-client.js');
        await signInWithEmailAndPassword(auth, email, password);
        if (message) message.textContent = 'Login successful.';
        await openHomeAfterLogin();
      } catch (error) {
        console.error('Login failed:', error);
        if (message) message.textContent = error?.message || 'Login failed. Please check your email and password.';
        if (button) button.disabled = false;
      }
    });

    resetButton?.addEventListener('click', async () => {
      const message = form.querySelector('#login-message');
      const emailInput = form.querySelector('#login-email');
      const email = emailInput?.value?.trim() || '';
      if (!email) {
        if (message) message.textContent = 'Enter your Email ID first.';
        emailInput?.focus();
        return;
      }

      resetButton.disabled = true;
      if (message) message.textContent = 'Sending password reset email...';

      try {
        const { auth, sendPasswordResetEmail } = await import('./features/auth/firebase-client.js');
        await sendPasswordResetEmail(auth, email);
        if (message) message.textContent = 'Password reset email sent. Check Inbox and Spam/Junk.';
      } catch (error) {
        console.error('Password reset failed:', error);
        const code = error?.code || '';
        const text = code === 'auth/user-not-found'
          ? 'No account was found for this email ID.'
          : code === 'auth/invalid-email'
            ? 'Enter a valid email ID.'
            : code === 'auth/too-many-requests'
              ? 'Too many requests. Please wait and try again.'
              : (error?.message || 'Could not send password reset email.');
        if (message) message.textContent = text;
      } finally {
        resetButton.disabled = false;
      }
    });
  } catch (error) {
    console.error('Indo startup failed:', error);
    showStartupError(error);
  }
}

start();
