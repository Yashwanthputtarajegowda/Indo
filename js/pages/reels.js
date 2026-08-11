import { openComments, shareReel, toggleLike, toggleSave } from "../services/reel-actions.js";
import { setupReelMenuButton } from "../components/reel-menu-button.js";
import { getReels } from "../services/media-upload.js";

const demoReels = [
  { id: "demo-reel-1", userId: "@indo_creator", caption: "Welcome to Indo Reels" },
  { id: "demo-reel-2", userId: "@indo_creator", caption: "Discover something new every day." }
];

function renderReel(reel, index) {
  return `
    <article class="reel-item" data-reel-index="${index}" data-reel-user-id="${reel.creator || reel.userId}">
      ${reel.secureUrl ? `<video class="reel-video" src="${reel.secureUrl}" playsinline muted loop preload="metadata"></video>` : ""}
      <button class="reel-center-play" type="button" data-reel-play aria-label="Play reel">▶</button>
      <div class="reel-info">
        <p class="reel-user-id">
          <button class="reel-user-link" type="button" data-reel-profile="${reel.creator || reel.userId}">${reel.creator || reel.userId}</button>
        </p>
        <p class="reel-caption">${reel.caption || reel.title || ""}</p>
      </div>
      <div class="reel-actions">
        <button class="reel-action" type="button" data-reel-action="like">♡</button>
        <button class="reel-action" type="button" data-reel-action="comment">💬</button>
        <button class="reel-action" type="button" data-reel-action="share">↗</button>
        <button class="reel-action" type="button" data-reel-action="save">▢</button>
        <button class="reel-action" type="button" data-reel-menu-button aria-label="Reel menu">⋮</button>
      </div>
    </article>
  `;
}

export function renderReelsPage(container) {
  let reels = [...demoReels];

  container.innerHTML = `
    <main class="reels-page">
      <header class="reels-header">
        <h1>Reels</h1>
        <button class="reels-upload-button" type="button" data-reels-upload aria-label="Upload reel">＋</button>
      </header>
      <section class="reels-feed" data-reels-feed aria-label="Reels feed">
        ${reels.map(renderReel).join("")}
      </section>
      <nav class="reels-bottom-nav" aria-label="Main navigation">
        <button class="reels-nav-button" type="button" data-reels-nav="home">Home</button>
        <button class="reels-nav-button is-active" type="button" data-reels-nav="reels">Reels</button>
        <button class="reels-nav-button" type="button" data-reels-nav="message">Message</button>
        <button class="reels-nav-button" type="button" data-reels-nav="profile">Profile</button>
      </nav>
    </main>
  `;

  const feed = container.querySelector("[data-reels-feed]");

  getReels().then((remoteReels) => {
    if (!remoteReels.length) return;
    reels = remoteReels;
    feed.innerHTML = reels.map(renderReel).join("");
    setupReelMenuButton(container);
  }).catch((error) => console.warn("Indo reels load failed:", error.message));

  setupReelMenuButton(container);

  container.addEventListener("click", async (event) => {
    const uploadButton = event.target.closest("[data-reels-upload]");
    if (uploadButton) {
      window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "upload-reel" } }));
      return;
    }

    const profileButton = event.target.closest("[data-reel-profile]");
    if (profileButton) {
      window.dispatchEvent(new CustomEvent("indo:profile-open", { detail: { userId: profileButton.dataset.reelProfile } }));
      return;
    }

    const playButton = event.target.closest("[data-reel-play]");
    if (playButton) {
      const reelElement = playButton.closest("[data-reel-index]");
      const reel = reels[Number(reelElement?.dataset.reelIndex)];
      if (reel) window.dispatchEvent(new CustomEvent("indo:video-open", { detail: reel }));
      return;
    }

    const navButton = event.target.closest("[data-reels-nav]");
    if (navButton) {
      window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: navButton.dataset.reelsNav } }));
      return;
    }

    const actionButton = event.target.closest("[data-reel-action]");
    if (!actionButton) return;

    const reelElement = actionButton.closest("[data-reel-index]");
    const reel = reels[Number(reelElement?.dataset.reelIndex)];
    if (!reel) return;

    try {
      if (actionButton.dataset.reelAction === "like") actionButton.textContent = toggleLike(reel.id) ? "♥" : "♡";
      if (actionButton.dataset.reelAction === "comment") openComments(reel.id);
      if (actionButton.dataset.reelAction === "share") { await shareReel(reel.id); actionButton.textContent = "✓"; }
      if (actionButton.dataset.reelAction === "save") actionButton.textContent = toggleSave(reel.id) ? "▣" : "▢";
    } catch (error) {
      actionButton.title = error.message || "Action failed.";
    }
  });
}
