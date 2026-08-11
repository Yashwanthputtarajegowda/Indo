import {
  openComments,
  shareReel,
  toggleLike,
  toggleSave
} from "../services/reel-actions.js";
import { setupReelMenuButton } from "../components/reel-menu-button.js";

const demoReels = [
  {
    id: "demo-reel-1",
    userId: "@indo_creator",
    caption: "Welcome to Indo Reels"
  },
  {
    id: "demo-reel-2",
    userId: "@indo_creator",
    caption: "Discover something new every day."
  }
];

export function renderReelsPage(container) {
  container.innerHTML = `
    <main class="reels-page">
      <section class="reels-feed" aria-label="Reels feed">
        ${demoReels.map((reel, index) => `
          <article
            class="reel-item"
            data-reel-index="${index}"
            data-reel-user-id="${reel.userId}"
          >
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
              <button
                class="reel-action"
                type="button"
                data-reel-action="like"
              >
                ♥
              </button>

              <button
                class="reel-action"
                type="button"
                data-reel-action="comment"
              >
                💬
              </button>

              <button
                class="reel-action"
                type="button"
                data-reel-action="share"
              >
                ↗
              </button>

              <button
                class="reel-action"
                type="button"
                data-reel-action="save"
              >
                ▢
              </button>

              <button
                class="reel-action"
                type="button"
                data-reel-menu-button
                aria-label="Reel menu"
              >
                ⋮
              </button>
            </div>
          </article>
        `).join("")}
      </section>
    </main>
  `;

  setupReelMenuButton(container);

  container.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-reel-action]");

    if (!actionButton) {
      return;
    }

    const reel = demoReels[
      Number(actionButton.closest("[data-reel-index]").dataset.reelIndex)
    ];

    try {
      if (actionButton.dataset.reelAction === "like") {
        const liked = toggleLike(reel.id);
        actionButton.textContent = liked ? "♥" : "♡";
      }

      if (actionButton.dataset.reelAction === "comment") {
        openComments(reel.id);
      }

      if (actionButton.dataset.reelAction === "share") {
        await shareReel(reel.id);
        actionButton.textContent = "✓";
      }

      if (actionButton.dataset.reelAction === "save") {
        const saved = toggleSave(reel.id);
        actionButton.textContent = saved ? "▣" : "▢";
      }
    } catch (error) {
      actionButton.title = error.message || "Action failed.";
    }
  });
}
