const demoVideos = [
  {
    title: "Welcome to Indo",
    creator: "@indo_creator",
    views: "1.2K views"
  },
  {
    title: "Discover Something New",
    creator: "@indo_creator",
    views: "842 views"
  }
];

export function renderHomePage(container) {
  container.innerHTML = `
    <main class="home-page">
      <header class="home-header">
        <h1 class="home-brand">Indo</h1>
        <button class="home-search" type="button" aria-label="Search">
          🔍
        </button>
      </header>

      <section class="home-feed" aria-label="Home video feed">
        ${demoVideos.map((video) => `
          <article class="home-video-card">
            <div class="home-video-thumb">
              <button class="home-play" type="button" aria-label="Play video">
                ▶
              </button>
            </div>

            <div class="home-video-info">
              <h2 class="home-video-title">${video.title}</h2>
              <p class="home-video-meta">
                ${video.creator} · ${video.views}
              </p>
            </div>
          </article>
        `).join("")}
      </section>

      <nav class="home-bottom-nav" aria-label="Main navigation">
        <button class="home-nav-button is-active" type="button" data-home-nav="home">
          Home
        </button>
        <button class="home-nav-button" type="button" data-home-nav="reels">
          Reels
        </button>
        <button class="home-nav-button" type="button" data-home-nav="message">
          Message
        </button>
        <button class="home-nav-button" type="button" data-home-nav="profile">
          Profile
        </button>
      </nav>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-home-nav]");

    if (!button) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:navigate", {
        detail: {
          page: button.dataset.homeNav
        }
      })
    );
  });
}
