import { recordMediaView } from "../services/media-views.js";

export function renderVideoPlayerPage(container, video = {}) {
  const title = video.title || "Indo Video";
  const creator = video.creator || "@indo_creator";
  const secureUrl = video.secureUrl || "";
  const videoId = video.id || "";

  container.innerHTML = `
    <main class="video-player-page">
      <header class="video-player-header">
        <button class="video-player-back" type="button" data-video-back aria-label="Back">←</button>
        <h1 class="video-player-title">${title}</h1>
      </header>

      <section class="video-player-area">
        ${secureUrl ? `<video class="video-player-media" data-video-media src="${secureUrl}" controls playsinline preload="metadata"></video>` : `
          <button class="video-player-placeholder" type="button" data-video-play aria-label="Play video">▶</button>
        `}
      </section>

      <section class="video-player-info">
        <h2>${title}</h2>
        <p>${creator}</p>
        <p data-video-views>${Number(video.views || 0)} views</p>
      </section>
    </main>
  `;

  const views = container.querySelector("[data-video-views]");
  let viewRecorded = false;

  const recordViewOnce = async () => {
    if (viewRecorded || !videoId) return;
    viewRecorded = true;
    try {
      const result = await recordMediaView(videoId);
      if (result?.views != null && views) {
        views.textContent = `${result.views} views`;
      }
    } catch (error) {
      viewRecorded = false;
      console.warn("Indo media view tracking failed:", error.message);
    }
  };

  const media = container.querySelector("[data-video-media]");
  if (media) {
    media.addEventListener("play", recordViewOnce, { once: true });
  } else {
    container.querySelector("[data-video-play]")?.addEventListener("click", recordViewOnce);
  }

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-video-back]");
    if (!backButton) return;
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "home" } }));
  });
}
