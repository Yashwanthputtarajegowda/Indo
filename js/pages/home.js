import { getHomeVideos } from "../services/media-upload.js";

const demoVideos = [
  { title: "Welcome to Indo", creator: "@indo_creator", views: "1.2K views" },
  { title: "Discover Something New", creator: "@indo_creator", views: "842 views" }
];

function renderVideoCard(video, index) {
  return `
    <article class="home-video-card" data-home-video="${index}">
      <div class="home-video-thumb">
        ${video.secureUrl ? `<video class="home-video-preview" src="${video.secureUrl}" muted playsinline preload="metadata"></video>` : ""}
        <button class="home-play" type="button" data-home-play aria-label="Play ${video.title}">▶</button>
      </div>
      <div class="home-video-info">
        <h2 class="home-video-title">${video.title}</h2>
        <p class="home-video-meta">
          <button class="home-creator-link" type="button" data-home-creator="${video.creator}">${video.creator}</button>
          · ${video.views ?? 0} views
        </p>
      </div>
    </article>
  `;
}

export function renderHomePage(container) {
  container.innerHTML = `
    <main class="home-page">
      <header class="home-header">
        <h1 class="home-brand">Indo</h1>
        <button class="home-search" type="button" aria-label="Search">🔍</button>
      </header>
      <section class="home-feed" data-home-feed aria-label="Home video feed">
        ${demoVideos.map(renderVideoCard).join("")}
      </section>
      <nav class="home-bottom-nav" aria-label="Main navigation">
        <button class="home-nav-button is-active" type="button" data-home-nav="home">Home</button>
        <button class="home-nav-button" type="button" data-home-nav="reels">Reels</button>
        <button class="home-nav-button" type="button" data-home-nav="message">Message</button>
        <button class="home-nav-button" type="button" data-home-nav="profile">Profile</button>
      </nav>
    </main>
  `;

  const feed = container.querySelector("[data-home-feed]");
  let videos = [...demoVideos];

  getHomeVideos().then((remoteVideos) => {
    if (!remoteVideos.length) return;
    videos = remoteVideos;
    feed.innerHTML = videos.map(renderVideoCard).join("");
  }).catch((error) => console.warn("Indo home feed load failed:", error.message));

  container.addEventListener("click", (event) => {
    const creatorButton = event.target.closest("[data-home-creator]");
    if (creatorButton) {
      window.dispatchEvent(new CustomEvent("indo:profile-open", { detail: { userId: creatorButton.dataset.homeCreator } }));
      return;
    }

    const playButton = event.target.closest("[data-home-play]");
    if (playButton) {
      const card = playButton.closest("[data-home-video]");
      const video = videos[Number(card?.dataset.homeVideo)];
      if (video) window.dispatchEvent(new CustomEvent("indo:video-open", { detail: video }));
      return;
    }

    const navButton = event.target.closest("[data-home-nav]");
    if (!navButton) return;
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: navButton.dataset.homeNav } }));
  });
}
