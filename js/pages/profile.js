import { setupProfileMenuButton } from "../components/profile-menu-button.js";
import { getProfile } from "../services/profile-state.js";
import { fetchMyProfile } from "../services/account-profile.js";
import { getHomeVideos, getReels } from "../services/media-upload.js";

const demoTabs = ["Videos", "Reels", "Posts"];

function mediaCard(item, index) {
  return `
    <button class="profile-post-card profile-media-card" type="button" data-profile-media-index="${index}">
      ${item.secureUrl ? `<video class="profile-media-preview" src="${item.secureUrl}" muted playsinline preload="metadata"></video>` : ""}
      <span class="profile-media-label">${item.mediaType === "reel" ? "Reel" : "Video"}</span>
    </button>
  `;
}

export function renderProfilePage(container, profile = getProfile()) {
  const resolvedProfile = { ...getProfile(), ...profile };
  let activeTab = "videos";
  let media = [];

  const render = () => {
    const filtered = activeTab === "videos"
      ? media.filter((item) => (item.mediaType || "video") === "video")
      : activeTab === "reels"
        ? media.filter((item) => item.mediaType === "reel")
        : [];

    container.innerHTML = `
      <main class="profile-page">
        <header class="profile-header">
          <h1 class="profile-title">Profile</h1>
          <button class="profile-menu-button" type="button" data-profile-menu aria-label="Profile menu">⋮</button>
        </header>

        <section class="profile-summary">
          <div class="profile-avatar" aria-hidden="true">
            ${(resolvedProfile.userName || "Indo User").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 class="profile-user-name">${resolvedProfile.userName || "Indo User"}</h2>
            <p class="profile-user-id">${resolvedProfile.userId || "@indo_user"}</p>
            ${resolvedProfile.bio ? `<p class="profile-bio">${resolvedProfile.bio}</p>` : ""}
          </div>
          <div class="profile-stats">
            <button class="profile-stat" type="button" data-profile-stat="following"><strong>${resolvedProfile.following ?? 0}</strong><span>Following</span></button>
            <button class="profile-stat" type="button" data-profile-stat="followers"><strong>${resolvedProfile.followers ?? 0}</strong><span>Followers</span></button>
            <button class="profile-stat" type="button" data-profile-stat="posts"><strong>${media.length}</strong><span>Posts</span></button>
          </div>
        </section>

        <section class="profile-tabs" aria-label="Profile content tabs">
          ${demoTabs.map((tab) => `
            <button class="profile-tab ${activeTab === tab.toLowerCase() ? "is-active" : ""}" type="button" data-profile-tab="${tab.toLowerCase()}">${tab}</button>
          `).join("")}
        </section>

        <section class="profile-content-grid" aria-label="Profile content">
          ${filtered.length ? filtered.map(mediaCard).join("") : `<p class="profile-empty-content">No ${activeTab === "posts" ? "posts" : activeTab} yet.</p>`}
        </section>

        <nav class="profile-bottom-nav" aria-label="Main navigation">
          <button class="profile-nav-button" type="button" data-profile-nav="home">Home</button>
          <button class="profile-nav-button" type="button" data-profile-nav="reels">Reels</button>
          <button class="profile-nav-button" type="button" data-profile-nav="message">Message</button>
          <button class="profile-nav-button is-active" type="button" data-profile-nav="profile">Profile</button>
        </nav>
      </main>
    `;

    setupProfileMenuButton(container);
  };

  render();

  container.addEventListener("click", (event) => {
    const statButton = event.target.closest("[data-profile-stat]");
    if (statButton) {
      window.dispatchEvent(new CustomEvent("indo:profile-stat", { detail: { stat: statButton.dataset.profileStat } }));
      return;
    }

    const tabButton = event.target.closest("[data-profile-tab]");
    if (tabButton) {
      activeTab = tabButton.dataset.profileTab;
      render();
      return;
    }

    const mediaButton = event.target.closest("[data-profile-media-index]");
    if (mediaButton) {
      const filtered = activeTab === "videos"
        ? media.filter((item) => (item.mediaType || "video") === "video")
        : media.filter((item) => item.mediaType === "reel");
      const selected = filtered[Number(mediaButton.dataset.profileMediaIndex)];
      if (selected) window.dispatchEvent(new CustomEvent("indo:video-open", { detail: selected }));
      return;
    }

    const navButton = event.target.closest("[data-profile-nav]");
    if (navButton) {
      window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: navButton.dataset.profileNav } }));
    }
  });

  fetchMyProfile()
    .then(async (remoteProfile) => {
      if (!remoteProfile || !remoteProfile.username) return;

      const currentProfile = getProfile();
      const nextProfile = {
        ...currentProfile,
        userName: remoteProfile.name || resolvedProfile.userName,
        userId: remoteProfile.username,
        bio: remoteProfile.bio || "",
        accountType: remoteProfile.accountType,
        indoId: remoteProfile.indoId,
        email: remoteProfile.email,
        uid: remoteProfile.uid
      };

      localStorage.setItem("indo-profile-state", JSON.stringify(nextProfile));
      Object.assign(resolvedProfile, nextProfile);

      const [videos, reels] = await Promise.all([
        getHomeVideos(50).catch(() => []),
        getReels(50).catch(() => [])
      ]);
      media = [...videos, ...reels].filter((item) => item.ownerUid === remoteProfile.uid);
      render();
    })
    .catch((error) => {
      console.warn("Indo profile load failed:", error.message);
    });
}
