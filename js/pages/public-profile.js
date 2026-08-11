import { followUser, unfollowUser, getFollowStatus } from "../services/social-api.js";

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
  let followState = { following: false, followers: 0, followingCount: 0 };

  try {
    if (!resolved.uid) resolved = await findUser(resolved.userId);
    followState = await getFollowStatus(resolved.uid);
  } catch (error) {
    resolved = { ...resolved, name: resolved.name || "Indo User", userId: resolved.userId || "@unknown" };
    container.innerHTML = `<main class="public-profile-page"><p class="public-profile-error">${error.message || "Could not load profile."}</p><button type="button" data-public-profile-back>Back</button></main>`;
    container.querySelector("[data-public-profile-back]").addEventListener("click", () => window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "reels" } })));
    return;
  }

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
            <span><strong>${followState.followers || 0}</strong> Followers</span>
            <span><strong>${followState.followingCount || 0}</strong> Following</span>
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
        render();
      } catch (error) {
        button.title = error.message || "Could not update follow status.";
      } finally {
        if (container.querySelector("[data-public-follow]")) container.querySelector("[data-public-follow]").disabled = false;
      }
    });
  };

  render();
}
