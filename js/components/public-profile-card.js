import { getPublicProfile, followUser, unfollowUser, getFollowStatus } from "../services/social-api.js";

export async function renderPublicProfileCard(container, userId) {
  const requestedUserId = String(userId || "").trim();
  container.innerHTML = `<section class="public-profile-card"><p>Loading profile…</p></section>`;

  try {
    const profile = await getPublicProfile(requestedUserId);
    const status = await getFollowStatus(profile.uid);
    const targetLabel = profile.userId || requestedUserId;

    container.innerHTML = `
      <section class="public-profile-card" data-public-profile-uid="${profile.uid}">
        <div class="public-profile-avatar" aria-hidden="true">${(profile.name || "I").slice(0, 1).toUpperCase()}</div>
        <div class="public-profile-main">
          <h2>${profile.name || "Indo User"}</h2>
          <p>${targetLabel}</p>
        </div>
        <button class="public-profile-follow" type="button" data-public-profile-follow>
          ${status.following ? "Following" : "Follow"}
        </button>
        <p class="public-profile-status" data-public-profile-status></p>
      </section>
    `;

    const button = container.querySelector("[data-public-profile-follow]");
    const statusText = container.querySelector("[data-public-profile-status]");

    button.addEventListener("click", async () => {
      button.disabled = true;
      statusText.textContent = "";
      try {
        const result = status.following
          ? await unfollowUser(profile.uid)
          : await followUser(profile.uid);
        status.following = Boolean(result.following);
        button.textContent = status.following ? "Following" : "Follow";
      } catch (error) {
        statusText.textContent = error.message || "Could not update follow status.";
      } finally {
        button.disabled = false;
      }
    });
  } catch (error) {
    container.innerHTML = `<section class="public-profile-card"><p>${error.message || "Could not load profile."}</p></section>`;
  }
}
