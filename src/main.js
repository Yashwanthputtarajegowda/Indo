const app = document.getElementById('root');

function showStartupError(error) {
  const message = error?.message || String(error || 'Unknown startup error.');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p><small>${message.replace(/[&<>\"']/g, '')}</small><button type="button" onclick="location.reload()">Reload</button></main>`;
}

async function start() {
  try {
    const { renderLogin } = await import('./screens/auth.js');
    renderLogin(app);

    const form = app.querySelector('#login-form');
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
        const { state } = await import('./state.js');
        state.authenticated = true;
        state.screen = 'home';
        const { render } = await import('./router.js');
        render(app);
      } catch (error) {
        console.error('Login failed:', error);
        if (message) message.textContent = error?.message || 'Login failed. Please check your email and password.';
        if (button) button.disabled = false;
      }
    });
  } catch (error) {
    console.error('Indo startup failed:', error);
    showStartupError(error);
  }
}

start();
