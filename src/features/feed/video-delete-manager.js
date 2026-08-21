import { auth } from "../auth/firebase-client.js";

const STYLE_ID = "indo-video-delete-manager-v4";
const MENU_ID = "indo-video-delete-menu";
const DELETE_PATH = "/api/media/videos/";
const FIREBASE_DATABASE_URL = "https://indo-174f0-default-rtdb.firebaseio.com";
let installed = false;
let deleting = false;

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${MENU_ID}{position:fixed;z-index:2147483647;min-width:180px;padding:6px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:#15151d;box-shadow:0 16px 42px rgba(0,0,0,.65)}
    #${MENU_ID} button{display:block;width:100%;padding:12px;border:0;border-radius:8px;background:transparent;color:#fff;text-align:left;font:700 13px/1.2 system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
    #${MENU_ID} button:hover{background:#24242d}
    #${MENU_ID} .delete{color:#ff6b75}
    #${MENU_ID} button:disabled{opacity:.6;cursor:wait}
  `;
  document.head.appendChild(style);
}

function closeMenu() {
  document.getElementById(MENU_ID)?.remove();
}

function getCardValue(card, names = []) {
  for (const name of names) {
    const dataKey = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const value = card?.dataset?.[dataKey] ?? card?.getAttribute(`data-${name}`);
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function cardVideoId(card) {
  return getCardValue(card, ["video-id", "videoid"]);
}

function cardOwnerUid(card) {
  return getCardValue(card, ["owner-uid"]);
}

function markDeleted(videoId) {
  const cleanId = String(videoId || "").trim();
  if (!cleanId) return;
  try {
    localStorage.setItem(`indo:deleted-video:${cleanId}`, String(Date.now()));
  } catch {}
}

function removeAllMatchingCards(videoId) {
  const cleanId = String(videoId || "").trim();
  if (!cleanId) return;
  document.querySelectorAll("[data-video-id]").forEach((card) => {
    if (cardVideoId(card) === cleanId) card.remove();
  });
}

async function requestBackendDelete(videoId, user) {
  const token = await user.getIdToken(true);
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) throw new Error("Backend URL is not configured.");

  const response = await fetch(`${base}${DELETE_PATH}${encodeURIComponent(videoId)}/delete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
    credentials: "omit",
  });

  const text = await response.text().catch(() => "");
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}

  if (!response.ok) {
    throw new Error(String(data.detail || data.error || `Delete failed (${response.status}).`).slice(0, 300));
  }

  return data;
}

async function firebaseGet(path, token) {
  const url = `${FIREBASE_DATABASE_URL}/${String(path || "").replace(/^\/+|\/+$/g, "")}.json?auth=${encodeURIComponent(token)}`;
  const response = await fetch(url, { method: "GET", cache: "no-store" });
  const text = await response.text().catch(() => "");
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) {
    throw new Error(String(data?.error || `Firebase read failed (${response.status}).`).slice(0, 300));
  }
  return data;
}

async function firebasePatch(updates, token) {
  const url = `${FIREBASE_DATABASE_URL}/.json?auth=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(updates),
    cache: "no-store",
  });
  const text = await response.text().catch(() => "");
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) {
    throw new Error(String(data?.error || `Firebase delete failed (${response.status}).`).slice(0, 300));
  }
  return data;
}

async function findFirebaseVideoRecords(videoId, token) {
  const cleanId = String(videoId || "").trim();
  if (!cleanId) return [];
  const data = await firebaseGet("videos", token);
  if (!data || typeof data !== "object") return [];
  return Object.entries(data)
    .filter(([, value]) => value && String(value.id || "") === cleanId)
    .map(([key, value]) => ({ key, value }));
}

async function deleteFirebaseCopies(videoId, uid, token) {
  const cleanId = String(videoId || "").trim();
  const cleanUid = String(uid || "").trim();
  if (!cleanId || !cleanUid) return { deleted: false, records: 0 };

  const records = await findFirebaseVideoRecords(cleanId, token);
  const owned = records.filter(({ value }) => String(value?.ownerUid || "") === cleanUid);
  if (records.length && !owned.length) throw new Error("You can delete only your own video.");

  const updates = {};
  for (const { key } of owned) updates[`videos/${key}`] = null;

  // Canonical Indo user tree and legacy engagement trees.
  updates[`users/${cleanUid}/content/posts/${cleanId}`] = null;
  updates[`users/${cleanUid}/content/videos/${cleanId}`] = null;
  updates[`users/${cleanUid}/engagement/videos/${cleanId}`] = null;
  updates[`videoLikes/${cleanId}`] = null;
  updates[`videoComments/${cleanId}`] = null;
  updates[`videoSaves/${cleanId}`] = null;

  await firebasePatch(updates, token);
  return { deleted: true, records: owned.length };
}

async function safeDelete(videoId, user) {
  const token = await user.getIdToken(true);
  let backendResult = null;
  let backendError = null;

  try {
    backendResult = await requestBackendDelete(videoId, user);
  } catch (error) {
    backendError = error;
  }

  // Always verify and clean Firebase from the authenticated owner's context.
  let firebaseResult = null;
  try {
    firebaseResult = await deleteFirebaseCopies(videoId, user.uid, token);
  } catch (error) {
    if (!backendResult?.deleted) throw error;
    console.warn("Firebase client cleanup failed after backend delete:", error);
  }

  if (backendError && !firebaseResult?.deleted) throw backendError;

  return {
    ok: true,
    backend: backendResult,
    firebase: firebaseResult,
  };
}

function createMenu(card, anchor) {
  closeMenu();
  const user = auth.currentUser;
  if (!user) return;

  const videoId = cardVideoId(card);
  if (!videoId) return;
  const ownerUid = cardOwnerUid(card);
  if (ownerUid && ownerUid !== String(user.uid)) return;

  const menu = document.createElement("div");
  menu.id = MENU_ID;
  menu.innerHTML = `
    <button type="button" class="delete" data-delete-video="true">Delete video</button>
    <button type="button" data-close-video-delete="true">Cancel</button>
  `;
  document.body.appendChild(menu);

  const rect = anchor.getBoundingClientRect();
  const width = 190;
  const height = 104;
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
  const preferredTop = rect.bottom + 8;
  const top = preferredTop + height <= window.innerHeight ? preferredTop : rect.top - height - 8;
  menu.style.left = `${left}px`;
  menu.style.top = `${Math.max(8, top)}px`;

  menu.querySelector("[data-close-video-delete]")?.addEventListener("click", closeMenu, { once: true });
  menu.querySelector("[data-delete-video]")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleting) return;

    deleting = true;
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "Deleting…";

    try {
      await safeDelete(videoId, user);
      markDeleted(videoId);
      removeAllMatchingCards(videoId);
      closeMenu();
      window.dispatchEvent(new CustomEvent("indo:video-deleted", { detail: { videoId } }));
    } catch (error) {
      console.error("Indo video delete failed:", error);
      button.disabled = false;
      button.textContent = error?.message || "Delete failed";
    } finally {
      deleting = false;
    }
  }, { once: true });
}

function installDelegatedDelete() {
  if (installed) return;
  installed = true;
  installStyles();
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(`#${MENU_ID}`)) return;

    const more = target.closest(".video-post .neon-edge-more, .video-post [data-video-more], [data-video-id] .neon-edge-more");
    if (!more) {
      closeMenu();
      return;
    }

    const card = more.closest("[data-video-id]");
    if (!card) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    createMenu(card, more);
  }, true);

  document.addEventListener("scroll", closeMenu, true);
  window.addEventListener("resize", closeMenu, { passive: true });
}

installDelegatedDelete();