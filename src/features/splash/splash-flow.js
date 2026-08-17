import { renderSplash } from "../../screens/splash.js";
import { renderLogin } from "../../screens/auth.js";

function renderTransitionError(app, error) {
  const message =
    error?.message ||
    String(error || "Unknown navigation error.");
  app.innerHTML = `
    <main class="splash-screen splash-error">
      <div class="splash-logo">I</div>
      <div class="splash-name">Indo</div>
      <p>Indo could not open the next screen.</p>
      <small>${message.replace(/[&<>\"']/g, "")}</small>
      <button type="button" onclick="location.reload()">Reload</button>
    </main>`;
}

export function startSplash(app, nextScreen, delay = 2500) {
  renderSplash(app);
  let transitioned = false;
  let fallbackTimer;

  const finish = () => {
    if (transitioned) return;
    transitioned = true;
    window.clearTimeout(fallbackTimer);
    try {
      nextScreen();
    } catch (error) {
      console.error("Indo splash transition failed:", error);
      try {
        renderLogin(app);
      } catch (fallbackError) {
        renderTransitionError(app, fallbackError || error);
      }
    }
  };

  window.setTimeout(finish, Math.max(0, Number(delay) || 2500));

  // Never leave the app on the splash if the normal startup transition is
  // blocked by a slow module/auth/network operation.
  fallbackTimer = window.setTimeout(() => {
    if (transitioned) return;
    transitioned = true;
    try {
      renderLogin(app);
    } catch (error) {
      renderTransitionError(app, error);
    }
  }, 8000);
}
