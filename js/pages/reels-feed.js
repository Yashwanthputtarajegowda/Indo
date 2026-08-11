import { demoMedia } from "../data/demo-media.js";

export function renderReelsFeed(container) {
  const reels = demoMedia.reels;

  container.innerHTML = `
    <main class="reels-feed" aria-label="Reels">
      <header class="reels-header">
        <h1>Reels</h1>
        <button type="button" aria-label="Reels camera">◉</button>
      </header>

      <section class="reels-list">
        ${reels.map((reel) => `
          <article class="reel-item">
            <img
              src="${reel.imageUrl}"
              alt="${reel.title}"
              class="reel-item__media"
              loading="lazy"
            />

            <div class="reel-item__shade"></div>

            <div class="reel-item__info">
              <strong>${reel.creator}</strong>
              <p>${reel.title}</p>
            </div>

            <div class="reel-item__actions">
              <button type="button" aria-label="Like">♡</button>
              <button type="button" aria-label="Comment">◯</button>
              <button type="button" aria-label="Share">↗</button>
            </div>
          </article>
        `).join("")}
      </section>
    </main>
  `;
}
