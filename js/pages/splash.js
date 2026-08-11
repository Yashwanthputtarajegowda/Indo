export function renderSplashPage(container) {
  container.innerHTML = `
    <main class="splash-page">
      <div class="splash-page__backdrop" aria-hidden="true"></div>

      <section class="splash-page__content">
        <div class="splash-logo" aria-label="Indo">
          <span>Indo</span>
          <i aria-hidden="true">▶</i>
        </div>

        <div class="splash-page__bottom">
          <h1>Movies, Videos & Reels</h1>
          <p>All in one place</p>

          <button
            type="button"
            class="splash-start"
            data-route="login"
          >
            Get Started
          </button>
        </div>
      </section>
    </main>
  `;
}
