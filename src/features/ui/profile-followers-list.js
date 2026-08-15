import { auth } from "../auth/firebase-client.js";
import { state } from "../../state.js";

const KEY = Symbol.for("indo.profileFollowersListV5");
const FIREBASE_DB =
  "https://indo-174f0-default-rtdb.firebaseio.com";

function esc(value = "") {
  return String(value).replace(
    /[&<>\"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}
function styleOnce() {
  if (
    document.getElementById(
      "indo-profile-followers-list-style-v5",
    )
  )
    return;
  const style = document.createElement("style");
  style.id = "indo-profile-followers-list-style-v5";
  style.textContent = `.indo-rel-modal{position:fixed;inset:0;z-index:35000;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:14px}.indo-rel-card{width:min(100%,520px);height:min(80vh,640px);background:#101016;border:1px solid #282830;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 18px 60px rgba(0,0,0,.65)}.indo-rel-head{height:56px;flex:0 0 56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #24242b;background:#101016;color:#fff}.indo-rel-head strong{font-size:15px}.indo-rel-close{width:34px;height:34px;border:0;border-radius:50%;background:#1b1b22;color:#fff;font-size:22px;cursor:pointer}.indo-rel-list{flex:1;overflow:auto;padding:8px}.indo-rel-row{width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;min-height:60px;border:0;border-radius:10px;background:transparent;color:#fff;text-align:left;cursor:pointer}.indo-rel-row:hover{background:#1a1a21}.indo-rel-avatar{width:40px;height:40px;min-width:40px;border-radius:50%;display:grid;place-items:center;background:#2a2a31;font-weight:800}.indo-rel-name{font-size:13px;font-weight:700;line-height:1.2}.indo-rel-id{font-size:11px;color:#92929d;margin-top:2px}.indo-rel-empty{padding:36px 16px;text-align:center;color:#8d8d98;font-size:13px}`;
  document.head.appendChild(style);
}
function closeModal() {
  document.querySelector(".indo-rel-modal")?.remove();
}
async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken(true);
}
function mapEntries(value) {
  return Object.values(value || {})
    .filter((item) => item && item.uid)
    .map((item) => ({
      uid: String(item.uid),
      userId: String(item.userId || item.username || ""),
      name: String(item.name || "Indo User"),
    }));
}

async function readFirebaseRelation(
  targetUid,
  relation,
  idToken,
) {
  const url = `${FIREBASE_DB}/users/${encodeURIComponent(targetUid)}/${relation}.json?auth=${encodeURIComponent(idToken)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      `Firebase relation read failed (${response.status}).`,
    );
  return mapEntries(
    await response.json().catch(() => ({})),
  );
}

async function readBackendRelation(
  apiBase,
  targetUid,
  relation,
  idToken,
) {
  const response = await fetch(
    `${apiBase}/api/social/${relation}/${encodeURIComponent(targetUid)}`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error || `Could not load ${relation}.`,
    );
  return Array.isArray(data.items) ? data.items : [];
}

async function loadRelation(root, relation) {
  const apiBase = window.INDO_API_BASE || "";
  const idToken = await getToken();
  const profileState = state.profile || {};
  let targetUid = String(
    profileState.uid || profileState.ownerUid || "",
  ).trim();
  let username = String(
    profileState.username ||
      root.querySelector(".profile-direct-head h2")
        ?.textContent ||
      "",
  )
    .trim()
    .replace(/^@/, "");

  if (!targetUid && username) {
    try {
      const response = await fetch(
        `${apiBase}/api/account/profile/${encodeURIComponent(username)}?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          cache: "no-store",
        },
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.profile) {
        targetUid = String(
          data.profile.uid || data.profile.ownerUid || "",
        );
        username = String(
          data.profile.username || username,
        );
        state.profile = {
          ...(state.profile || {}),
          ...data.profile,
          uid: targetUid,
          username,
        };
      }
    } catch {}
  }

  if (!targetUid)
    throw new Error("Profile UID is missing.");

  // Read Firebase directly first. This avoids a stale Railway deployment or
  // API route problem preventing the follower/following list from opening.
  try {
    const direct = await readFirebaseRelation(
      targetUid,
      relation,
      idToken,
    );
    if (direct.length) return direct;
  } catch {}

  try {
    const backend = await readBackendRelation(
      apiBase,
      targetUid,
      relation,
      idToken,
    );
    if (backend.length) return backend;
  } catch {}

  if (profileState[relation]) {
    const local = mapEntries(profileState[relation]);
    if (local.length) return local;
  }

  if (username) {
    try {
      const response = await fetch(
        `${apiBase}/api/account/profile/${encodeURIComponent(username)}?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          cache: "no-store",
        },
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.profile) {
        const local = mapEntries(data.profile[relation]);
        if (local.length) return local;
      }
    } catch {}
  }

  return [];
}

function openList(root, relation) {
  styleOnce();
  closeModal();
  const modal = document.createElement("div");
  modal.className = "indo-rel-modal";
  modal.innerHTML = `<section class="indo-rel-card"><header class="indo-rel-head"><strong>${relation === "followers" ? "Followers" : "Following"}</strong><button class="indo-rel-close" type="button" aria-label="Close">×</button></header><div class="indo-rel-list"><div class="indo-rel-empty">Loading...</div></div></section>`;
  document.body.appendChild(modal);
  modal
    .querySelector(".indo-rel-close")
    ?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  const list = modal.querySelector(".indo-rel-list");
  loadRelation(root, relation)
    .then((items) => {
      if (!items.length) {
        list.innerHTML =
          '<div class="indo-rel-empty">No users yet.</div>';
        return;
      }
      list.innerHTML = items
        .map((item) => {
          const id = String(item.userId || "").replace(
            /^@/,
            "",
          );
          const name = String(item.name || "Indo User");
          const initial = (
            name.trim().charAt(0) ||
            id.charAt(0) ||
            "U"
          ).toUpperCase();
          return `<button class="indo-rel-row" type="button" data-rel-uid="${esc(item.uid)}" data-rel-user="${esc(id)}"><div class="indo-rel-avatar">${esc(initial)}</div><div><div class="indo-rel-name">${esc(name)}</div><div class="indo-rel-id">@${esc(id || "user")}</div></div></button>`;
        })
        .join("");
      list
        .querySelectorAll("[data-rel-uid]")
        .forEach((button) =>
          button.addEventListener("click", async () => {
            const uid = button.dataset.relUid || "";
            const userId = button.dataset.relUser || "";
            closeModal();
            state.profile = {
              uid,
              ownerUid: uid,
              username: userId,
            };
            state.screen = "profile";
            if (window.__indoNavigate)
              await window.__indoNavigate("profile");
          }),
        );
    })
    .catch((error) => {
      list.innerHTML = `<div class="indo-rel-empty">${esc(error?.message || "Could not load list.")}</div>`;
    });
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  styleOnce();
  document.addEventListener(
    "click",
    (event) => {
      const stat =
        event.target instanceof Element
          ? event.target.closest(
              ".profile-direct-stats > div",
            )
          : null;
      if (!stat) return;
      const stats = stat.parentElement;
      const root = document.getElementById("root");
      if (
        !root?.contains(stat) ||
        !stats?.classList.contains("profile-direct-stats")
      )
        return;
      const index = Array.prototype.indexOf.call(
        stats.children,
        stat,
      );
      if (index !== 1 && index !== 2) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openList(
        root,
        index === 1 ? "followers" : "following",
      );
    },
    true,
  );
}
install();
export { install };
