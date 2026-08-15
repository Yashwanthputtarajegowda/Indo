import { auth } from "../auth/firebase-client.js";

const API = () => window.INDO_API_BASE || "";
const CACHE = new Map();
const AVATAR_CLASS = "indo-live-avatar-img";
const STYLE_ID = "indo-profile-identity-v1";

function clean(value = "") {
  return String(value || "")
    .trim()
    .replace(/^@+/, "");
}

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>\"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) return null;
  return {
    Authorization: `Bearer ${await user.getIdToken()}`,
  };
}

async function fetchProfile(identity) {
  const userId = clean(identity?.userId);
  const uid = clean(identity?.uid);
  if (!userId && !uid) return null;

  const key = uid || `id:${userId}`;
  if (CACHE.has(key)) return CACHE.get(key);

  const promise = (async () => {
    const headers = await authHeaders();
    if (!headers) return null;

    const candidates = [];
    if (userId) {
      candidates.push(
        `/api/account/profile/${encodeURIComponent(userId)}`,
      );
    }
    if (uid) {
      candidates.push(
        `/api/account/public-profile/${encodeURIComponent(uid)}`,
      );
    }

    for (const path of candidates) {
      try {
        const response = await fetch(`${API()}${path}`, {
          headers,
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.profile) continue;
        return {
          uid: String(data.profile.uid || uid),
          userId: clean(
            data.profile.userId ||
              data.profile.username ||
              userId,
          ),
          name: String(
            data.profile.name ||
              data.profile.displayName ||
              userId ||
              "Indo User",
          ),
          avatarUrl: String(
            data.profile.avatarUrl ||
              data.profile.photoURL ||
              data.profile.photoUrl ||
              "",
          ).trim(),
        };
      } catch {}
    }

    return null;
  })();

  CACHE.set(key, promise);
  return promise;
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${AVATAR_CLASS} {
      width:100%;
      height:100%;
      display:block;
      object-fit:cover;
      border-radius:inherit;
    }

    [data-profile-avatar].indo-live-avatar-ready,
    .neon-edge-avatar.indo-live-avatar-ready,
    .indo-msg-avatar.indo-live-avatar-ready,
    .reel-avatar.indo-live-avatar-ready,
    .indo-notice-avatar.indo-live-avatar-ready,
    .indo-relation-avatar.indo-live-avatar-ready {
      overflow:hidden;
    }
  `;
  document.head.appendChild(style);
}

function getAvatarTargets(root) {
  const selectors = [
    "[data-profile-avatar]",
    ".neon-edge-creator[data-profile-uid] .neon-edge-avatar",
    ".reel-user[data-profile-uid] .avatar",
    ".indo-msg-avatar[data-profile-uid]",
    ".indo-notice-avatar[data-profile-uid]",
    ".indo-relation-avatar[data-profile-uid]",
  ];

  const targets = new Set();
  selectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((node) => {
      targets.add(node);
    });
  });
  return [...targets];
}

async function hydrateAvatar(element) {
  if (!(element instanceof Element)) return;
  if (element.dataset.avatarHydrated === "1") return;

  const uid = clean(element.dataset.profileUid);
  const userId = clean(
    element.dataset.profileUsername ||
      element.dataset.profileUser ||
      element.dataset.userId,
  );

  if (!uid && !userId) return;

  element.dataset.avatarHydrated = "1";
  const profile = await fetchProfile({ uid, userId });
  if (!profile?.avatarUrl) return;

  const existing = element.querySelector(`img.${AVATAR_CLASS}`);
  if (existing) {
    existing.src = profile.avatarUrl;
    existing.alt = profile.name;
    return;
  }

  const image = document.createElement("img");
  image.className = AVATAR_CLASS;
  image.src = profile.avatarUrl;
  image.alt = `${profile.name} profile picture`;
  image.loading = "lazy";
  image.decoding = "async";
  image.referrerPolicy = "no-referrer";

  image.addEventListener(
    "error",
    () => image.remove(),
    { once: true },
  );

  element.prepend(image);
  element.classList.add("indo-live-avatar-ready");
}

export async function enhanceProfileIdentity(root = document) {
  installStyles();
  if (!root?.querySelectorAll) return;

  const targets = getAvatarTargets(root);
  await Promise.allSettled(
    targets.map((target) => hydrateAvatar(target)),
  );
}

let observer = null;

export function installProfileIdentityEnhancer() {
  installStyles();
  if (observer || typeof MutationObserver === "undefined") return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          enhanceProfileIdentity(node).catch(() => {});
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  enhanceProfileIdentity(document).catch(() => {});
}

export function clearProfileIdentityCache() {
  CACHE.clear();
}
