export function renderSplash(app) {
  app.innerHTML = `
    <main class="splash-screen" aria-label="Indo">
      <div class="splash-content">
        <div class="splash-logo" aria-hidden="true">I</div>
        <div class="splash-brand">Indo</div>
        <div class="splash-loader" aria-label="Loading"></div>
      </div>
    </main>
  `;
}
