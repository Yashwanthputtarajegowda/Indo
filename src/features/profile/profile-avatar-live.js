import { auth } from "../auth/firebase-client.js";

const CACHE = new Map();
const pending = new Map();
const STYLE_ID = "indo-live-profile-avatar-v6";
const REFRESH_MS = 2500;
const CHANNEL_NAME = "indo-profile-avatar-live";
const API = () => window.INDO_API_BASE || "";
const norm = (v = "") =>
  String(v ?? "")
    .trim()
    .replace(/^@+/, "");
const valid = (v = "") => /^[A-Za-z0-9._-]{2,80}$/.test(norm(v));

async function loadProfile(key, { uid = false, force = false } = {}) {
  const clean = norm(key);
  if (!clean) return null;
  const cacheKey = `${uid ? "uid" : "id"}:${clean}`;
  if (!force && CACHE.has(cacheKey)) return CACHE.get(cacheKey);
  if (pending.has(cacheKey)) return pending.get(cacheKey);

  const promise = (async () => {
    try {
      const headers = {};
      if (auth.currentUser)
        headers.Authorization = `Bearer ${await auth.currentUser.getIdToken(false)}`;
      const path = uid
        ? `/api/account/public-profile/${encodeURIComponent(clean)}`
        : `/api/account/profile/${encodeURIComponent(clean)}`;
      const response = await fetch(`${API()}${path}`, {
        headers,
        cache: "no-store",
      });
      if (!response.ok) return null;
      const data = await response.json().catch(() => ({}));
      const profile = data?.profile || null;
      if (profile) CACHE.set(cacheKey, profile);
      return profile;
    } catch {
      return null;
    }
  })();

  pending.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    pending.delete(cacheKey);
  }
}

function avatarUrl(profile) {
  return String(
    profile?.avatarUrl || profile?.photoURL || profile?.photoUrl || "",
  ).trim();
}

function datasetIdentity(el) {
  if (!(el instanceof Element)) return null;
  const uid = norm(
    el.dataset.profileUid ||
      el.dataset.ownerUid ||
      el.dataset.actorUid ||
      el.dataset.userUid ||
      el.dataset.storyOwner ||
      "",
  );
  const id = norm(
    el.dataset.profileUsername ||
      el.dataset.profileUser ||
      el.dataset.userId ||
      el.dataset.username ||
      el.dataset.actorUserId ||
      el.dataset.relUser ||
      "",
  );
  return uid || valid(id) ? { uid, id } : null;
}

const USER_CONTAINERS = [
  ".indo-story-card",
  ".search-profile-card",
  ".indo-notice-card",
  ".indo-comment",
  ".indo-rel-v7-row",
  ".indo-rel-row",
  ".follower-row",
  ".following-row",
  ".user-row",
  ".user-card",
  ".profile-card",
  ".conversation",
  ".message",
  ".creator-card",
  ".author-card",
  ".profile-link",
  ".post-card",
  ".reel-user",
  ".indo-watch-creator",
  ".watch-creator",
  "[data-profile-card]",
].join(",");

function textIdentity(el) {
  if (!(el instanceof Element)) return "";
  const selectors = [
    ".search-profile-id",
    ".indo-notice-line b",
    ".indo-comment-name",
    ".indo-watch-creator-name",
    ".indo-rel-v7-id",
    ".indo-rel-id",
    '[class*="user-id"]',
    '[class*="username"]',
    "[data-user-id]",
    "[data-username]",
  ];
  for (const selector of selectors) {
    const nodes = el.matches?.(selector)
      ? [el]
      : [...(el.querySelectorAll?.(selector) || [])];
    for (const node of nodes) {
      const raw =
        node.getAttribute?.("data-user-id") ||
        node.getAttribute?.("data-username") ||
        node.textContent ||
        "";
      const match = String(raw).match(/@?([A-Za-z0-9._-]{2,80})/);
      const id = norm(match?.[1] || "");
      if (
        valid(id) &&
        !["user", "profile", "users", "indo"].includes(id.toLowerCase())
      )
        return id;
    }
  }
  return "";
}

function identityForAvatar(host) {
  if (!(host instanceof Element)) return null;

  // 1) Prefer identity stored directly on the avatar itself.
  const direct = datasetIdentity(host);
  if (direct) return direct;

  // 2) Only inherit identity from a known single-user container.
  const container = host.closest(USER_CONTAINERS);
  const fromContainer = datasetIdentity(container);
  if (fromContainer) return fromContainer;

  // 3) For known user containers without ids in data attributes, infer the id from their text.
  const inferred = textIdentity(container);
  if (inferred) return { uid: "", id: inferred };

  // 4) Do not inherit a generic ancestor's uid. That was the source of the repeated-photo bug.
  return null;
}

function avatarHosts(root) {
  const selectors = [
    ".neon-edge-avatar",
    ".indo-story-avatar",
    ".indo-notice-avatar",
    ".indo-watch-avatar",
    ".search-profile-avatar",
    ".indo-rel-v7-avatar",
    ".indo-rel-avatar",
    ".follower-avatar",
    ".following-avatar",
    ".message-avatar",
    ".conversation-avatar",
    ".user-avatar",
    "[data-profile-avatar]",
    "[data-user-avatar]",
  ];
  const out = [];
  for (const selector of selectors) {
    if (root?.matches?.(selector)) out.push(root);
    root?.querySelectorAll?.(selector).forEach((el) => out.push(el));
  }
  return [...new Set(out)];
}

function paint(host, profile) {
  if (!(host instanceof Element)) return;
  const url = avatarUrl(profile);
  if (!url) return;
  let image = host.querySelector(":scope > img.indo-live-avatar-img");
  if (!image) {
    image = document.createElement("img");
    image.className = "indo-live-avatar-img";
    image.alt = "Profile";
    image.loading = "lazy";
    image.decoding = "async";
    host.insertBefore(image, host.firstChild);
  }
  if (image.src !== url) image.src = url;
  host.classList.add("indo-live-avatar-has-image");
}

function paintIdRow(container, profile) {
  if (!(container instanceof Element)) return;
  const url = avatarUrl(profile);
  if (!url) return;
  const idNode = container.querySelector?.(
    '.search-profile-id,.indo-rel-v7-id,.indo-rel-id,[class*="user-id"],[class*="username"]',
  );
  if (!idNode || idNode.closest(".indo-live-id-avatar-wrap")) return;
  if (
    !String(idNode.textContent || "")
      .trim()
      .startsWith("@")
  )
    return;
  const wrap = document.createElement("span");
  wrap.className = "indo-live-id-avatar-wrap";
  wrap.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.className = "indo-live-id-avatar";
  img.src = url;
  img.alt = "";
  wrap.appendChild(img);
  idNode.parentElement?.insertBefore(wrap, idNode);
}

async function hydrateAvatar(host, force = false) {
  const identity = identityForAvatar(host);
  if (!identity) return;
  const profile = identity.uid
    ? await loadProfile(identity.uid, { uid: true, force })
    : await loadProfile(identity.id, { force });
  if (profile) paint(host, profile);
}

async function hydrateContainer(container, force = false) {
  if (!(container instanceof Element)) return;
  const identity =
    datasetIdentity(container) ||
    (() => {
      const id = textIdentity(container);
      return id ? { uid: "", id } : null;
    })();
  if (!identity) return;
  const profile = identity.uid
    ? await loadProfile(identity.uid, { uid: true, force })
    : await loadProfile(identity.id, { force });
  if (!profile) return;
  avatarHosts(container).forEach((host) => paint(host, profile));
  paintIdRow(container, profile);
}

function scan(root = document, force = false) {
  if (!root) return;
  avatarHosts(root).forEach((host) =>
    hydrateAvatar(host, force).catch(() => {}),
  );
  if (root.matches?.(USER_CONTAINERS))
    hydrateContainer(root, force).catch(() => {});
  root
    .querySelectorAll?.(USER_CONTAINERS)
    .forEach((container) => hydrateContainer(container, force).catch(() => {}));
}

function invalidate(uid, userId) {
  if (uid) CACHE.delete(`uid:${norm(uid)}`);
  if (userId) CACHE.delete(`id:${norm(userId)}`);
  scan(document, true);
}

function publish(profile) {
  const payload = {
    uid: profile?.uid || "",
    userId: profile?.username || profile?.userId || "",
    avatarUrl: avatarUrl(profile),
    ts: Date.now(),
  };
  try {
    localStorage.setItem("indo:profile-avatar-update", JSON.stringify(payload));
  } catch {}
  try {
    window.__indoProfileAvatarChannel?.postMessage(payload);
  } catch {}
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-live-avatar-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
    .indo-live-avatar-has-image>span:first-child{display:none!important}
    .search-profile-avatar,.indo-notice-avatar,.indo-watch-avatar,.neon-edge-avatar,.indo-story-avatar,.indo-rel-v7-avatar,.indo-rel-avatar,.follower-avatar,.following-avatar,.message-avatar,.conversation-avatar,.user-avatar{overflow:hidden}
    .indo-live-id-avatar-wrap{display:inline-grid;place-items:center;width:28px;height:28px;min-width:28px;margin-right:7px;border-radius:50%;overflow:hidden;vertical-align:middle;background:#171b28;box-shadow:0 0 0 1px rgba(255,255,255,.08) inset}
    .indo-live-id-avatar{width:100%;height:100%;object-fit:cover;display:block}
    .indo-comment>.indo-live-avatar-img{width:28px;height:28px;float:left;margin:0 8px 4px 0;border-radius:50%}
    .indo-comment:after{content:"";display:block;clear:both}
  `;
  document.head.appendChild(style);
}

function install() {
  if (window.__indoLiveProfileAvatarsInstalled) return;
  window.__indoLiveProfileAvatarsInstalled = true;
  installStyles();
  scan(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
    }
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("indo:profile-updated", (event) => {
    const profile = event.detail?.profile || event.detail || {};
    invalidate(profile.uid, profile.username || profile.userId);
    publish(profile);
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== "indo:profile-avatar-update" || !event.newValue) return;
    try {
      const payload = JSON.parse(event.newValue);
      invalidate(payload.uid, payload.userId);
    } catch {}
  });

  try {
    window.__indoProfileAvatarChannel = new BroadcastChannel(CHANNEL_NAME);
    window.__indoProfileAvatarChannel.addEventListener("message", (event) => {
      const payload = event.data || {};
      invalidate(payload.uid, payload.userId);
    });
  } catch {}

  setInterval(() => {
    if (!document.hidden) scan(document, true);
  }, REFRESH_MS);
}

install();
export function installLiveProfileAvatars() {
  install();
}
export function invalidateProfileAvatar(uid, userId) {
  invalidate(uid, userId);
}
