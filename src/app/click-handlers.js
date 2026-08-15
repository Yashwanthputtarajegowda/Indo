import { state } from "../state.js";
import { loadEngagement, toggleLike, toggleSave, addComment, loadComments, shareMedia } from "../features/feed/media-engagement.js";
import { loadFollowStatus, toggleFollow } from "../features/social/follow.js";
import { toggleEarning } from "../features/earning/earning.js";
import { resetPassword } from "../features/auth/password-reset.js";
import { handleLogout } from "../features/auth/logout-button.js";

export function createClickHandlers({ app, getSessionUser, refreshEarning, refreshProfile, goTo, renderEditProfileScreen }) {
  async function handleEarning(event) {
    const toggleTarget = event.target.closest("[data-earning-action]");
    const rowTarget = event.target.closest("[data-earning-toggle]");
    if (!toggleTarget && !rowTarget) return false;
    if (rowTarget && !toggleTarget) {
      const panel = document.querySelector("[data-earning-panel]");
      if (panel) panel.classList.toggle("open");
      return true;
    }

    const message = document.querySelector("[data-earning-message]");
    const nextEnabled = !Boolean(state.earning?.earningEnabled);
    toggleTarget.disabled = true;
    if (message) message.textContent = "Saving earning setting...";
    try {
      const result = await toggleEarning(nextEnabled);
      await refreshEarning();
      const status = document.querySelector("[data-earning-status]");
      if (status) status.textContent = result.earningEnabled ? "ON" : result.eligible ? "READY" : "OFF";
      toggleTarget.textContent = result.earningEnabled ? "Turn Earning OFF" : "Turn Earning ON";
      if (message) message.textContent = result.earningEnabled ? "Earning started." : "Earning turned off.";
    } catch (error) {
      if (message) message.textContent = error.message || "Could not update earning setting.";
    } finally {
      toggleTarget.disabled = false;
    }
    return true;
  }

  async function handleEngagement(event) {
    const target = event.target.closest("[data-engagement]");
    if (!target) return false;
    const card = target.closest("[data-video-id]");
    if (!card) return false;

    const mediaId = card.dataset.videoId;
    const action = target.dataset.engagement;
    try {
      if (action === "like") {
        if (target.dataset.busy === "true") return true;
        target.dataset.busy = "true";
        const small = target.querySelector("small");
        const previousLiked = target.classList.contains("active");
        const previousCount = Number((small?.textContent || "0").replace(/,/g, "")) || 0;
        const optimisticLiked = !previousLiked;
        target.classList.toggle("active", optimisticLiked);
        if (small) {
          small.textContent = Math.max(0, previousCount + (optimisticLiked ? 1 : -1)).toLocaleString();
        }
        try {
          const current = await loadEngagement(mediaId);
          const result = await toggleLike(mediaId, !current.liked);
          target.classList.toggle("active", Boolean(result.liked));
          if (small) small.textContent = Number(result.likes || 0).toLocaleString();
          target.title = result.liked ? "Liked" : "Like";
        } catch (error) {
          target.classList.toggle("active", previousLiked);
          if (small) small.textContent = previousCount.toLocaleString();
          target.title = error.message || "Could not update like.";
        } finally {
          delete target.dataset.busy;
        }
      } else if (action === "save") {
        const current = await loadEngagement(mediaId);
        const result = await toggleSave(mediaId, !current.saved);
        target.classList.toggle("active", Boolean(result.saved));
      } else if (action === "share") {
        const result = await shareMedia(mediaId);
        if (result?.copied) target.title = "Link copied";
      } else if (action === "comment") {
        const existing = await loadComments(mediaId);
        const latest = existing
          .slice(-3)
          .map((item) => `${item.username}: ${item.text}`)
          .join("\n");
        const prompt = latest ? `Recent comments:\n${latest}\n\nWrite a comment:` : "Write a comment:";
        const text = window.prompt(prompt);
        if (!text?.trim()) return true;
        await addComment(mediaId, text.trim());
        target.title = "Comment added";
      }
    } catch (error) {
      target.title = error.message || "Action failed";
    }
    return true;
  }

  async function handleFollow(event) {
    const target = event.target.closest("[data-follow-uid], [data-search-follow-uid]");
    if (!target) return false;

    const targetUid = target.dataset.followUid || target.dataset.searchFollowUid;
    const sessionUser = getSessionUser();
    if (!targetUid || sessionUser?.uid === targetUid) return true;

    target.disabled = true;
    try {
      const current = await loadFollowStatus(targetUid);
      const result = await toggleFollow(targetUid, !current.following);
      target.textContent = result.pending ? "Requested" : result.following ? "Following" : "Follow";
      target.classList.toggle("active", Boolean(result.following));
      target.dataset.pending = result.pending ? "true" : "false";
    } catch (error) {
      target.title = error.message || "Could not update follow status.";
    } finally {
      target.disabled = false;
    }
    return true;
  }

  async function hydrateFollowButtons(root) {
    const sessionUser = getSessionUser();
    const buttons = root.querySelectorAll("[data-follow-uid], [data-search-follow-uid]");
    for (const button of buttons) {
      const uid = button.dataset.followUid || button.dataset.searchFollowUid;
      if (!uid || sessionUser?.uid === uid) continue;
      try {
        const result = await loadFollowStatus(uid);
        button.textContent = result.pending ? "Requested" : result.following ? "Following" : "Follow";
        button.classList.toggle("active", Boolean(result.following));
        button.dataset.pending = result.pending ? "true" : "false";
      } catch {}
    }
  }

  function register() {
    document.addEventListener("click", async (event) => {
      if (await handleEarning(event)) return;
      if (await handleEngagement(event)) return;
      if (await handleFollow(event)) return;

      const passwordResetTarget = event.target.closest("[data-password-reset]");
      if (passwordResetTarget) {
        const emailInput = document.querySelector("#login-email");
        const message = document.querySelector("#login-message");
        const email = emailInput?.value?.trim() || "";
        if (!email) {
          if (message) message.textContent = "Enter your Email ID first.";
          emailInput?.focus();
          return;
        }
        passwordResetTarget.disabled = true;
        if (message) message.textContent = "Sending password reset email...";
        try {
          await resetPassword(email);
          if (message) message.textContent = "Password reset email sent. Check your inbox.";
        } catch (error) {
          if (message) message.textContent = error.message || "Could not send password reset email.";
        } finally {
          passwordResetTarget.disabled = false;
        }
        return;
      }

      const editProfileTarget = event.target.closest("[data-edit-profile]");
      if (editProfileTarget) {
        await refreshProfile().catch(() => {});
        renderEditProfileScreen();
        return;
      }

      const logoutTarget = event.target.closest("[data-logout]");
      if (logoutTarget) {
        await handleLogout(document.querySelector(".settings-message"));
        return;
      }

      const screenTarget = event.target.closest("[data-screen]");
      if (screenTarget) {
        const nextScreen = screenTarget.dataset.screen;
        if (nextScreen === "profile" && getSessionUser()) await refreshProfile().catch(() => {});
        if (nextScreen === "settings" && getSessionUser()) await refreshEarning().catch(() => {});
        goTo(nextScreen);
        if (nextScreen === "reels") await hydrateFollowButtons(app);
        return;
      }

      const authTarget = event.target.closest("[data-auth]");
      if (authTarget) goTo(`auth-${authTarget.dataset.auth}`);
    });
  }

  return { register, hydrateFollowButtons };
}
