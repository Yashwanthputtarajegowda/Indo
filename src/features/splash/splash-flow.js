import { renderSplash } from '../../screens/splash.js';

function renderTransitionError(app, error) {
  const message = error?.message || String(error || 'Unknown navigation error.');
  app.innerHTML = `
    <main class="splash-screen splash-error">
      <div class="splash-logo">I</div>
      <div class="splash-name">Indo</div>
      <p>Indo could not open the next screen.</p>
      <small>${message.replace(/[&<>\"']/g, '')}</small>
      <button type="button" onclick="location.reload()">Reload</button>
    </main>`;
}

export function startSplash(app, nextScreen, delay = 1800) {
  renderSplash(app);
  let transitioned = false;
  window.setTimeout(() => {
    if (transitioned) return;
    transitioned = true;
    try {
      nextScreen();
    } catch (error) {
      console.error('Indo splash transition failed:', error);
      renderTransitionError(app, error);
    }
  }, delay);
}
