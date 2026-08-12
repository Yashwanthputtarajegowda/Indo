import { followUser, unfollowUser, getFollowStatus } from "../services/social-api.js";
import { getFollowLists } from "../services/social-lists.js";

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

async function findUser(userId) {
  const normalized = String(userId || "").replace(/^@+/, "").trim().toLowerCase();
  const response = await fetch(`${API_BASE_URL}/account/check-user-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: normalized })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.exists || !data.user) throw new Error(data.error || "Profile not found.");
  return data.user;
}

export async function renderPublicProfilePage(container, profile = {}) {
  let resolved = profile;
  let followState = { following: false, followersCount: 0, followingCount: 0 };
  let followLists = { followers: [], following: [] };

  try {
    if (!resolved.uid) resolved = await findUser(resolved.userId);
    followState = await getFollowStatus(resolved.uid);
    followLists = await getFollowLists(resolved.uid);
  } catch (error) {
    resolved = { ...resolved, name: resolved.name || "Indo User", userId: resolved.userId || "@unknown" };
    container.innerHTML = `<main class="public-profile-page"><p class="public-profile-error">${error.message || "Could not load profile."}</p><button type="button" data-public-profile-back>Back</button></main>`;
    container.querySelector("[data-public-profile-back]").addEventListener("click", () => window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "reels" } })));
    return;
  }

  const showList = (title, items) => {
    const rows = items.length ? items.map((item) => `
      <button type="button" class="public-profile-list-row" data-profile-user="${item.uid}" data-profile-user-id="${item.userId}">
        <span class="public-profile-list-avatar">${String(item.name || "I").slice(0, 1).toUpperCase()}</span>
        <span><strong>${item.name}</strong><small>${item.userId}</small></span>
      </button>
    `).join("") : `<p class="public-profile-list-empty">No users yet.</p>`;

    container.insertAdjacentHTML("beforeend", `
      <div class="public-profile-list-backdrop" data-profile-list-backdrop>
        <section class="public-profile-list-modal" role="dialog" aria-modal="true" aria-label="${title}">
          <header><h2>${title}</h2><button type="button" data-profile-list-close aria-label="Close">×</button></header>
          <div>${rows}</div>
        </section>
      </div>
    `);
  };

  const render = () => {
    const isFollowing = Boolean(followState.following);
    container.innerHTML = `
      <main class="public-profile-page">
        <header class="public-profile-header">
          <button type="button" class="public-profile-back" data-public-profile-back aria-label="Back">←</button>
          <h1>Profile</h1>
        </header>
        <section class="public-profile-summary">
          <div class="public-profile-avatar">${String(resolved.name || "I").slice(0, 1).toUpperCase()}</div>
          <h2>${resolved.name || "Indo User"}</h2>
          <p>${resolved.userId || "@unknown"}</p>
          <button type="button" class="public-profile-follow" data-public-follow>${isFollowing ? "Following" : "Follow"}</button>
          <div class="public-profile-stats">
            <button type="button" data-profile-list="followers"><strong>${followLists.followers.length}</strong><span>Followers</span></button>
            <button type="button" data-profile-list="following"><strong>${followLists.following.length}</strong><span>Following</span></button>
          </div>
        </section>
      </main>
    `;

    container.querySelector("[data-public-profile-back]").addEventListener("click", () => window.history.back());
    container.querySelector("[data-public-follow]").addEventListener("click", async () => {
      const button = container.querySelector("[data-public-follow]");
      button.disabled = true;
      try {
        followState = isFollowing ? await unfollowUser(resolved.uid) : await followUser(resolved.uid);
        followLists = await getFollowLists(resolved.uid);
        render();
      } catch (error) {
        button.title = error.message || "Could not update follow status.";
      } finally {
        if (container.querySelector("[data-public-follow]")) container.querySelector("[data-public-follow]").disabled = false;
      }
    });

    container.querySelectorAll("[data-profile-list]").forEach((button) => {
      button.addEventListener("click", () => {
        const items = button.dataset.profileList === "followers" ? followLists.followers : followLists.following;
        showList(button.dataset.profileList === "followers" ? "Followers" : "Following", items);
      });
    });

    container.addEventListener("click", (event) => {
      const close = event.target.closest("[data-profile-list-close]");
      const backdrop = event.target.closest("[data-profile-list-backdrop]");
      const user = event.target.closest("[data-profile-user]");
      if (close || (backdrop && event.target === backdrop)) backdrop?.remove();
      if (user) {
        backdrop?.remove();
        window.dispatchEvent(new CustomEvent("indo:profile-open", { detail: { userId: user.dataset.profileUserId } }));
      }
    });
  };

  render();
}
