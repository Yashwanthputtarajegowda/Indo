import { renderBottomNavigation } from '../components/bottom-navigation.js';
import { createMediaCard } from '../components/media-card.js';
import { demoMedia } from '../data/demo-media.js';

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
        <img
          class="featured-card__image"
          src="${demoMedia.videos[0].imageUrl}"
          alt="${demoMedia.videos[0].title}"
        />
        <div class="featured-overlay">
          <span class="content-badge">FEATURED</span>
          <h2>${demoMedia.videos[0].title}</h2>
          <p>Movies, videos and reels made for Indo.</p>
          <button class="watch-button" type="button">▶ Watch now</button>
        </div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>Trending Videos</h2>
          <button type="button">See all</button>
        </div>

        <div class="video-row" id="trending-videos"></div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>Reels</h2>
          <button type="button">See all</button>
        </div>

        <div class="reel-row" id="home-reels"></div>
      </section>

      <div id="bottom-navigation"></div>
    </main>
  `;

  const videoContainer = document.getElementById('trending-videos');
  const reelContainer = document.getElementById('home-reels');
  const navigation = document.getElementById('bottom-navigation');

  if (videoContainer) {
    demoMedia.videos.forEach((media) => {
      videoContainer.appendChild(
        createMediaCard(media)
      );
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
