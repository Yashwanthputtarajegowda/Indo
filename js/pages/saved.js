import { getSavedMedia } from "../services/media-save.js";

export function renderSavedPage(container) {
  container.innerHTML = `
    <main class="saved-page">
      <header class="saved-header">
        <button type="button" data-saved-back aria-label="Back">←</button>
        <h1>Saved</h1>
      </header>
      <section class="saved-grid" data-saved-grid></section>
    </main>
  `;

  const grid = container.querySelector("[data-saved-grid]");

  getSavedMedia().then((items) => {
    grid.innerHTML = items.length ? items.map((item, index) => `
      <button type="button" class="saved-card" data-saved-index="${index}">
        ${item.secureUrl ? `<video src="${item.secureUrl}" muted playsinline preload="metadata"></video>` : ""}
        <span>${item.title || "Saved reel"}</span>
      </button>
    `).join("") : `<p class="saved-empty">No saved reels yet.</p>`;

    grid.addEventListener("click", (event) => {
      const card = event.target.closest("[data-saved-index]");
      if (!card) return;
      const item = items[Number(card.dataset.savedIndex)];
      if (item) window.dispatchEvent(new CustomEvent("indo:video-open", { detail: item }));
    });
  }).catch((error) => {
    grid.innerHTML = `<p class="saved-empty">${error.message || "Could not load saved reels."}</p>`;
  });

  container.querySelector("[data-saved-back]").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "profile" } }));
  });
}
