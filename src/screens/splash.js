export function renderSplash(app) {
  app.innerHTML = `
    <main class="splash-screen" aria-label="Indo loading">
      <div class="splash-ambient splash-ambient-a" aria-hidden="true"></div>
      <div class="splash-ambient splash-ambient-b" aria-hidden="true"></div>
      <div class="splash-content">
        <div class="splash-mark" aria-hidden="true">
          <div class="splash-orb"><span>ϟ</span></div>
          <div class="splash-brand">Indo</div>
        </div>
        <div class="splash-tagline">Share. Connect. <b>Grow.</b></div>
        <div class="splash-progress" role="progressbar" aria-label="Loading Indo"><span></span></div>
      </div>
    </main>
  `;
}
