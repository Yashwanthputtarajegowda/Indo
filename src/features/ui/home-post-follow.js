import { auth } from "../auth/firebase-client.js";

const INSTALLED = Symbol.for("indo.homePostFollow");

function styleButton(button) {
  button.style.cssText = [
    "height:30px",
    "min-width:72px",
    "padding:0 12px",
    "margin-left:auto",
    "margin-right:8px",
    "border:1px solid rgba(255,255,255,.16)",
    "border-radius:8px",
    "background:#17171d",
    "color:#fff",
    "font:700 12px/1 system-ui,sans-serif",
    "cursor:pointer",
    "white-space:nowrap",
  ].join(";");
}

async function getFollowStatus(targetUid) {
  const user = auth.currentUser;
  if (!user || !targetUid) return false;
  try {
    const token = await user.getIdToken();
    const apiBase = window.INDO_API_BASE || "";
    const response = await fetch(`${apiBase}/api/social/follow-status/${encodeURIComponent(targetUid)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => ({}));
    return Boolean(data.following || data.isFollowing);
  } catch {
    return false;
  }
}

async function setFollow(targetUid, shouldFollow) {
  const user = auth.currentUser;
  if (!user || !targetUid) throw new Error("Please login first.");
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}/api/social/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetUid, follow: shouldFollow }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.detail || "Could not update follow status.");
  }
}

function enhanceCard(card) {
  if (!(card instanceof Element)) return;
  const head = card.querySelector(".post-head");
  const menu = head?.querySelector("[data-feed-more]");
  const targetUid = String(card.dataset.ownerUid || "").trim();
  const currentUid = String(auth.currentUser?.uid || "").trim();
  if (!head || !menu || !targetUid || targetUid === currentUid || head.querySelector("[data-post-follow]")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.postFollow = targetUid;
  button.setAttribute("aria-label", "Follow user");
  button.textContent = "Follow";
  styleButton(button);
  head.insertBefore(button, menu);

  getFollowStatus(targetUid).then((following) => {
    if (!button.isConnected) return;
    button.textContent = following ? "Following" : "Follow";
    button.dataset.following = following ? "1" : "0";
  });
}

export function enhanceHomePostFollowButtons(root = document) {
  root.querySelectorAll(".video-post[data-owner-uid], .post-card[data-owner-uid]").forEach(enhanceCard);
}

function install() {
  if (globalThis[INSTALLED]) return;
  globalThis[INSTALLED] = true;
  document.addEventListener(
    "click",
    async (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-post-follow]") : null;
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const targetUid = String(button.dataset.postFollow || "").trim();
      if (!targetUid) return;
      const next = button.dataset.following !== "1";
      const oldText = button.textContent;
      button.disabled = true;
      button.textContent = next ? "Following…" : "Follow…";
      try {
        await setFollow(targetUid, next);
        button.dataset.following = next ? "1" : "0";
        button.textContent = next ? "Following" : "Follow";
      } catch (error) {
        button.textContent = oldText || "Follow";
      } finally {
        button.disabled = false;
      }
    },
    true,
  );
}

install();
export { install };
