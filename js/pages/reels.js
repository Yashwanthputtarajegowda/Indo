const demoReels = [
  {
    userId: "@indo_creator",
    caption: "Welcome to Indo Reels"
  },
  {
    userId: "@indo_creator",
    caption: "Discover something new every day."
  }
];

export function renderReelsPage(container) {
  container.innerHTML = `
    <main class="reels-page">
      <section class="reels-feed" aria-label="Reels feed">
        ${demoReels.map((reel, index) => `
          <article class="reel-item" data-reel-index="${index}">
            <button
              class="reel-center-play"
              type="button"
              data-reel-play
              aria-label="Play reel"
            >
              ▶
            </button>

            <div class="reel-info">
              <p class="reel-user-id">${reel.userId}</p>
              <p class="reel-caption">${reel.caption}</p>
            </div>

            <div class="reel-actions">
              <button class="reel-action" type="button" data-reel-action="like">♥</button>
              <button class="reel-action" type="button" data-reel-action="comment">💬</button>
              <button class="reel-action" type="button" data-reel-action="share">↗</button>
              <button class="reel-action" type="button" data-reel-action="save">▢</button>
            </div>
          </article>
        `).join("")}
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-reel-action]");

    if (!actionButton) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:reel-action", {
        detail: {
          action: actionButton.dataset.reelAction
        }
      })
    );
  });
}
