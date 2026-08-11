import { renderBottomNavigation } from '../components/bottom-navigation.js';
import { createMediaCard } from '../components/media-card.js';
import { demoMedia } from '../data/demo-media.js';

export function renderHomePage(container) {
  const featured = demoMedia.videos[0];

  container.innerHTML = `
    <main class="indo-app">
      <header class="home-header">
        <div class="brand-mark">
          <h1>Indo</h1>
        </div>

        <div class="home-header__actions">
          <button class="header-icon" type="button" aria-label="Search">⌕</button>
          <button class="header-icon" type="button" aria-label="Notifications">♧</button>
        </div>
      </header>

      <section class="home-tabs" aria-label="Home sections">
        <button class="home-tab is-active" type="button">For You</button>
        <button class="home-tab" type="button">Movies</button>
        <button class="home-tab" type="button">Reels</button>
        <button class="home-tab" type="button">Web Series</button>
      </section>

      <section class="featured-card">
        <img
          class="featured-card__image"
          src="${featured.imageUrl}"
          alt="${featured.title}"
        />
        <div class="featured-overlay">
          <span class="content-badge">FEATURED</span>
          <h2>${featured.title}</h2>
          <p>New Release · Action · 2024</p>
          <button class="watch-button" type="button">Watch Now</button>
        </div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>Trending Now</h2>
          <button type="button">See All ›</button>
        </div>
        <div class="video-row" id="trending-videos"></div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>Reels For You</h2>
          <button type="button">See All ›</button>
        </div>
        <div class="reel-row" id="home-reels"></div>
      </section>

      <div id="bottom-navigation"></div>
    </main>
  `;

  const videoContainer = container.querySelector('#trending-videos');
  const reelContainer = container.querySelector('#home-reels');
  const navigation = container.querySelector('#bottom-navigation');

  if (videoContainer) {
    demoMedia.videos.forEach((media) => {
      videoContainer.appendChild(createMediaCard(media));
    });
  }

  if (reelContainer) {
    demoMedia.reels.forEach((media) => {
      reelContainer.appendChild(
        createMediaCard({
          ...media,
          type: 'reel'
        })
      );
    });
  }

  if (navigation) {
    renderBottomNavigation(navigation);
  }
}
