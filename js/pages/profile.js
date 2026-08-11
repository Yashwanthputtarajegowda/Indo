import { setupProfileMenuButton } from "../components/profile-menu-button.js";

const demoProfile = {
  userName: "Indo User",
  userId: "@indo_user",
  following: 12,
  followers: 48,
  posts: 6
};

const demoTabs = [
  "Videos",
  "Reels",
  "Posts"
];

export function renderProfilePage(container, profile = demoProfile) {
  container.innerHTML = `
    <main class="profile-page">
      <header class="profile-header">
        <h1 class="profile-title">Profile</h1>

        <button
          class="profile-menu-button"
          type="button"
          data-profile-menu
          aria-label="Profile menu"
        >
          ⋮
        </button>
      </header>

      <section class="profile-summary">
        <div class="profile-avatar" aria-hidden="true">
          ${profile.userName.slice(0, 1).toUpperCase()}
        </div>

        <div>
          <h2 class="profile-user-name">${profile.userName}</h2>
          <p class="profile-user-id">${profile.userId}</p>
        </div>

        <div class="profile-stats">
          <button class="profile-stat" type="button" data-profile-stat="following">
            <strong>${profile.following}</strong>
            <span>Following</span>
          </button>

          <button class="profile-stat" type="button" data-profile-stat="followers">
            <strong>${profile.followers}</strong>
            <span>Followers</span>
          </button>

          <button class="profile-stat" type="button" data-profile-stat="posts">
            <strong>${profile.posts}</strong>
            <span>Posts</span>
          </button>
        </div>
      </section>

      <section class="profile-tabs" aria-label="Profile content tabs">
        ${demoTabs.map((tab, index) => `
          <button
            class="profile-tab ${index === 0 ? "is-active" : ""}"
            type="button"
            data-profile-tab="${tab.toLowerCase()}"
          >
            ${tab}
          </button>
        `).join("")}
      </section>

      <section class="profile-content-grid" aria-label="Profile content">
        ${Array.from({ length: profile.posts }).map((_, index) => `
          <button
            class="profile-post-card"
            type="button"
            data-profile-post="${index + 1}"
          >
            ${index + 1}
          </button>
        `).join("")}
      </section>

      <nav class="profile-bottom-nav" aria-label="Main navigation">
        <button class="profile-nav-button" type="button" data-profile-nav="home">
          Home
        </button>
        <button class="profile-nav-button" type="button" data-profile-nav="reels">
          Reels
        </button>
        <button class="profile-nav-button" type="button" data-profile-nav="message">
          Message
        </button>
        <button class="profile-nav-button is-active" type="button" data-profile-nav="profile">
          Profile
        </button>
      </nav>
    </main>
  `;

  setupProfileMenuButton(container);

  container.addEventListener("click", (event) => {
    const statButton = event.target.closest("[data-profile-stat]");

    if (statButton) {
      window.dispatchEvent(
        new CustomEvent("indo:profile-stat", {
          detail: {
            stat: statButton.dataset.profileStat
          }
        })
      );

      return;
    }

    const tabButton = event.target.closest("[data-profile-tab]");

    if (tabButton) {
      container
        .querySelectorAll("[data-profile-tab]")
        .forEach((button) => {
          button.classList.remove("is-active");
        });

      tabButton.classList.add("is-active");

      return;
    }

    const navButton = event.target.closest("[data-profile-nav]");

    if (navButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: navButton.dataset.profileNav
          }
        })
      );
    }
  });
}
