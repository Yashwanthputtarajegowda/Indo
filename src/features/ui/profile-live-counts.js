import { auth } from "../auth/firebase-client.js";
import { state } from "../../state.js";

const KEY = Symbol.for("indo.profileLiveCountsV2");

async function refresh() {
  const root = document.getElementById("root");
  if (!root) return;
  const followersCount = root.querySelector("[data-followers-count]");
  const followingCount = root.querySelector("[data-following-count]");
  const postsCount = root.querySelector("[data-posts]");
  if (!followersCount && !followingCount && !postsCount) return;

  const targetUid = String(state.profile?.uid || state.profile?.ownerUid || state.profile?.userId || auth.currentUser?.uid || "").trim();
  if (!targetUid || !auth.currentUser) return;

  try {
    const token = await auth.currentUser.getIdToken(true);
    const base = window.INDO_API_BASE || "";
    const response = await fetch(`${base}/api/social/profile/${encodeURIComponent(targetUid)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Profile sync failed (${response.status}).`);

    const stats = data.stats || data.social || {};
    if (followersCount) followersCount.textContent = String(Number(stats.followersCount || 0));
    if (followingCount) followingCount.textContent = String(Number(stats.followingCount || 0));
    if (postsCount) postsCount.textContent = String(Number(stats.postsCount || 0));

    if (state.profile && String(state.profile.uid || state.profile.ownerUid || "") === targetUid) {
      state.profile = {
        ...state.profile,
        ...(data.profile || {}),
        uid: targetUid,
        ownerUid: targetUid,
        followersCount: Number(stats.followersCount || 0),
        followingCount: Number(stats.followingCount || 0),
      };
    }
  } catch (error) {
    console.warn("Canonical profile refresh failed:", error);
  }
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  const root = document.getElementById("root") || document.body;
  const observer = new MutationObserver(() => {
    clearTimeout(install.timer);
    install.timer = setTimeout(refresh, 50);
  });
  observer.observe(root, { childList: true, subtree: true });
  setTimeout(refresh, 0);
  setTimeout(refresh, 250);
  setTimeout(refresh, 800);
}

install();
export { install, refresh };
