export function renderFlashPage(container) {
  container.innerHTML = `
    <main class="flash-page" aria-label="Indo splash screen">
      <section class="flash-content">
        <div class="indo-logo-mark" aria-hidden="true"></div>
        <h1 class="flash-title">Indo</h1>
        <p class="flash-tagline">Watch. Connect. Share.</p>
        <div class="flash-loader" aria-label="Loading"></div>
      </section>
    </main>
  `;
}
