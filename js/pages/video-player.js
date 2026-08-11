export function renderVideoPlayerPage(container, video = {}) {
  const title = video.title || "Indo Video";
  const creator = video.creator || "@indo_creator";

  container.innerHTML = `
    <main class="video-player-page">
      <header class="video-player-header">
        <button
          class="video-player-back"
          type="button"
          data-video-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="video-player-title">${title}</h1>
      </header>

      <section class="video-player-area">
        <button
          class="video-player-placeholder"
          type="button"
          data-video-play
          aria-label="Play video"
        >
          ▶
        </button>
      </section>

      <section class="video-player-info">
        <h2>${title}</h2>
        <p>${creator}</p>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-video-back]");

    if (backButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: "home"
          }
        })
      );
    }
  });
}
