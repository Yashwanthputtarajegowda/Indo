import { renderBottomNavigation } from '../components/bottom-navigation.js';

export function renderHomePage(container) {
  container.innerHTML = `
    <main class="indo-app">
      <header class="home-header">
        <div class="brand-mark">
          <span class="brand-dot"></span>
          <h1>Indo</h1>
        </div>

        <button class="header-icon" type="button" aria-label="Search">⌕</button>
      </header>

      <section class="home-tabs" aria-label="Home sections">
        <button class="home-tab is-active" type="button">For You</button>
        <button class="home-tab" type="button">Movies</button>
        <button class="home-tab" type="button">Videos</button>
        <button class="home-tab" type="button">Reels</button>
      </section>

      <section class="featured-card">
        <div class="featured-overlay">
          <span class="content-badge">FEATURED</span>
          <h2>Discover something new</h2>
          <p>Movies, videos and reels made for Indo.</p>
          <button class="watch-button" type="button">▶ Watch now</button>
        </div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>Trending Videos</h2>
          <button type="button">See all</button>
        </div>

        <div class="video-row">
          <article class="video-card">
            <div class="video-thumbnail thumbnail-one"><span>▶</span></div>
            <h3>Trending video</h3>
            <p>Indo creator</p>
          </article>

          <article class="video-card">
            <div class="video-thumbnail thumbnail-two"><span>▶</span></div>
            <h3>Popular today</h3>
            <p>Indo creator</p>
          </article>

          <article class="video-card">
            <div class="video-thumbnail thumbnail-three"><span>▶</span></div>
            <h3>New release</h3>
            <p>Indo creator</p>
          </article>
        </div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>Reels</h2>
          <button type="button">See all</button>
        </div>

        <div class="reel-row">
          <article class="reel-card reel-one"><span>▶</span></article>
          <article class="reel-card reel-two"><span>▶</span></article>
          <article class="reel-card reel-three"><span>▶</span></article>
        </div>
      </section>

      <div id="bottom-navigation"></div>
    </main>
  `;

  const navigation = document.getElementById('bottom-navigation');

  if (navigation) {
    renderBottomNavigation(navigation);
  }
}
