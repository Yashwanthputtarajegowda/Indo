import { auth } from "../auth/firebase-client.js";
import { state } from "../../state.js";

const KEY = Symbol.for("indo.feedFollowButton");
const STYLE_ID = "indo-feed-follow-button-design4";

function style() {
  if (document.getElementById(STYLE_ID)) return;
  const node = document.createElement("style");
  node.id = STYLE_ID;
  node.textContent = `
    /* OPTION 2 — FLOATING CAPSULE VIDEO SECTION ONLY */
    .video-post.neon-edge-post{
      margin:0 0 16px!important;
      overflow:hidden!important;
      border:1px solid rgba(174,111,255,.20)!important;
      border-radius:18px!important;
      background:#08080d!important;
      box-shadow:0 10px 28px rgba(0,0,0,.22)!important;
    }

    .video-post.neon-edge-post .neon-edge-head{
      display:flex!important;
      align-items:center!important;
      gap:8px!important;
      min-height:0!important;
      margin:8px!important;
      padding:6px 8px!important;
      border:1px solid rgba(255,255,255,.08)!important;
      border-radius:18px!important;
      background:linear-gradient(135deg,rgba(34,29,49,.94),rgba(15,14,22,.92))!important;
      box-shadow:0 8px 20px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.04)!important;
      backdrop-filter:blur(12px)!important;
    }

    .video-post.neon-edge-post .neon-edge-head::before{
      display:none!important;
    }

    .video-post.neon-edge-post .neon-edge-creator{
      flex:1 1 auto!important;
      min-width:0!important;
      display:flex!important;
      align-items:center!important;
      gap:8px!important;
      border:0!important;
      background:transparent!important;
    }

    .video-post.neon-edge-post .neon-edge-avatar{
      width:34px!important;
      height:34px!important;
      min-width:34px!important;
      border-radius:50%!important;
      clip-path:none!important;
      border:1px solid rgba(205,140,255,.72)!important;
      background:#191622!important;
      box-shadow:0 0 12px rgba(177,96,255,.20)!important;
    }

    .video-post.neon-edge-post .neon-edge-avatar::after,
    .video-post.neon-edge-post .neon-edge-creator::after{
      display:none!important;
    }

    .video-post.neon-edge-post .neon-edge-name{
      min-width:0!important;
      font-size:12px!important;
      font-weight:800!important;
      line-height:1!important;
      color:#f7f4fb!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }

    /* Existing static button is intentionally hidden; the real functional button below owns follow state. */
    .video-post.neon-edge-post .neon-edge-follow{
      display:none!important;
    }

    .video-post.neon-edge-post .indo-feed-follow{
      flex:0 0 auto!important;
      min-width:80px!important;
      height:30px!important;
      padding:0 12px!important;
      margin:0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:5px!important;
      border:1px solid rgba(205,133,255,.72)!important;
      border-radius:999px!important;
      background:rgba(17,15,24,.72)!important;
      color:#fbf4ff!important;
      box-shadow:0 0 0 1px rgba(255,255,255,.025),0 6px 16px rgba(0,0,0,.18)!important;
      font:800 11px/1 system-ui,sans-serif!important;
      cursor:pointer!important;
      transition:transform .15s ease,box-shadow .15s ease,background .15s ease!important;
    }

    .video-post.neon-edge-post .indo-feed-follow:hover{
      transform:translateY(-1px)!important;
      box-shadow:0 8px 18px rgba(0,0,0,.22),0 0 16px rgba(211,104,255,.18)!important;
    }

    .video-post.neon-edge-post .indo-feed-follow.following{
      background:linear-gradient(135deg,#7139ef,#bf48c9)!important;
      border-color:rgba(235,172,255,.88)!important;
      color:#fff!important;
      box-shadow:0 0 16px rgba(176,75,224,.28)!important;
    }

    .video-post.neon-edge-post .indo-feed-follow.pending{
      background:rgba(56,48,66,.72)!important;
      border-color:rgba(153,136,169,.58)!important;
      color:#eadff0!important;
    }

    .video-post.neon-edge-post .indo-feed-follow:disabled{
      opacity:.65!important;
      cursor:default!important;
      transform:none!important;
    }

    .video-post.neon-edge-post .indo-feed-follow svg{
      width:14px!important;
      height:14px!important;
      flex:0 0 auto!important;
      fill:none!important;
      stroke:currentColor!important;
      stroke-width:1.9!important;
      stroke-linecap:round!important;
      stroke-linejoin:round!important;
    }

    .video-post.neon-edge-post .neon-edge-more{
      flex:0 0 auto!important;
      margin:0!important;
      width:30px!important;
      height:30px!important;
      border:1px solid rgba(255,255,255,.08)!important;
      border-radius:50%!important;
      background:rgba(22,19,30,.78)!important;
      color:#fff!important;
      box-shadow:none!important;
    }

    .video-post.neon-edge-post .neon-video-stage{
      position:relative!important;
      margin:0 8px!important;
      overflow:hidden!important;
      aspect-ratio:4 / 5!important;
      min-height:0!important;
      max-height:none!important;
      border:1px solid rgba(255,255,255,.06)!important;
      border-radius:15px!important;
      background:#000!important;
      box-shadow:0 8px 22px rgba(0,0,0,.18)!important;
      isolation:isolate!important;
    }

    .video-post.neon-edge-post .neon-video-stage::before,
    .video-post.neon-edge-post .neon-video-stage::after{
      display:none!important;
    }

    .video-post.neon-edge-post .neon-video-stage .post-video{
      position:relative!important;
      z-index:0!important;
      width:100%!important;
      height:100%!important;
      min-height:100%!important;
      object-fit:cover!important;
      object-position:center!important;
      background:#000!important;
    }

    .video-post.neon-edge-post .neon-edge-actions{
      display:grid!important;
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      align-items:center!important;
      width:auto!important;
      min-height:0!important;
      margin:8px!important;
      padding:2px!important;
      border:1px solid rgba(255,255,255,.08)!important;
      border-radius:18px!important;
      background:rgba(17,15,24,.88)!important;
      box-shadow:0 8px 20px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.035)!important;
      backdrop-filter:blur(12px)!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button{
      width:100%!important;
      height:42px!important;
      min-width:0!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:5px!important;
      border:0!important;
      border-right:0!important;
      border-radius:13px!important;
      background:transparent!important;
      color:#d9d3e2!important;
      padding:0!important;
      font:700 10px/1 system-ui,sans-serif!important;
      transition:background .15s ease,color .15s ease,transform .15s ease!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button:hover{
      background:rgba(142,80,224,.10)!important;
      color:#fff!important;
      transform:translateY(-1px)!important;
      text-shadow:none!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button svg{
      width:18px!important;
      height:18px!important;
      flex:0 0 18px!important;
      filter:none!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button small{
      font-size:10px!important;
      font-weight:800!important;
      color:inherit!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button.is-active.like-action{
      color:#ff70c7!important;
      text-shadow:0 0 8px rgba(255,112,199,.28)!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button.is-active.save-action{
      color:#bc8cff!important;
      text-shadow:0 0 8px rgba(188,140,255,.25)!important;
    }

    .video-post.neon-edge-post .neon-edge-copy{
      padding:4px 12px 11px!important;
      background:#08080d!important;
      border-top:0!important;
    }

    .video-post.neon-edge-post .neon-edge-title{
      color:#e9e5ed!important;
      font-size:12px!important;
    }

    @media (max-width:520px){
      .video-post.neon-edge-post .neon-edge-head{
        margin:7px!important;
      }
      .video-post.neon-edge-post .neon-video-stage{
        margin:0 7px!important;
      }
      .video-post.neon-edge-post .neon-edge-actions{
        margin:7px!important;
      }
      .video-post.neon-edge-post .indo-feed-follow{
        min-width:76px!important;
        height:29px!important;
        padding:0 10px!important;
        font-size:10px!important;
      }
    }
  `;
  document.head.appendChild(node);
}

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken(true);
  const apiBase = window.INDO_API_BASE || "";
  return fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

function followIcon(following = false) {
  return following
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
}

function buttonLabel(stateValue) {
  if (stateValue === "pending") return "Requested";
  if (stateValue === "following") return "Following";
  return "Follow";
}

function paintButton(button, stateValue) {
  button.classList.toggle(
    "following",
    stateValue === "following",
  );
  button.classList.toggle(
    "pending",
    stateValue === "pending",
  );
  button.dataset.followState = stateValue;
  button.innerHTML = `${followIcon(stateValue === "following")}<span>${buttonLabel(stateValue)}</span>`;
}

async function setupButton(button, ownerUid) {
  const uid = String(ownerUid || "").trim();
  const currentUid = String(
    auth.currentUser?.uid || "",
  ).trim();
  if (!uid || !currentUid || uid === currentUid) {
    button.remove();
    return;
  }
  try {
    const response = await request(
      `/api/social/follow-status/${encodeURIComponent(uid)}`,
    );
    const data = await response.json().catch(() => ({}));
    if (data.pending) paintButton(button, "pending");
    else
      paintButton(
        button,
        data.following || data.isFollowing
          ? "following"
          : "idle",
      );
  } catch {
    paintButton(button, "idle");
  }

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const currentState =
      button.dataset.followState || "idle";
    const nextFollow = currentState !== "following";
    button.disabled = true;
    try {
      const response = await request("/api/social/follow", {
        method: "POST",
        body: JSON.stringify({
          targetUid: uid,
          follow: nextFollow,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.error || "Could not update follow status.",
        );
      if (data.pending) paintButton(button, "pending");
      else
        paintButton(
          button,
          nextFollow ? "following" : "idle",
        );
    } catch (error) {
      console.warn("Feed follow action failed:", error);
    } finally {
      button.disabled = false;
    }
  });
}

function process(root = document) {
  root
    .querySelectorAll?.(".post-card.video-post .post-head")
    .forEach((head) => {
      if (head.querySelector(".indo-feed-follow")) return;
      const card = head.closest(".post-card.video-post");
      const ownerUid = card?.dataset.ownerUid || "";
      if (!ownerUid) return;
      const more = head.querySelector(".post-more");
      if (!more) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "indo-feed-follow";
      button.setAttribute("aria-label", "Follow creator");
      paintButton(button, "idle");
      head.insertBefore(button, more);
      setupButton(button, ownerUid);
    });
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  style();
  process(document);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations)
      for (const node of mutation.addedNodes)
        if (node.nodeType === 1) process(node);
  });
  observer.observe(
    document.getElementById("root") || document.body,
    {
      childList: true,
      subtree: true,
    },
  );
}

function relationEntries(value) {
  return Object.values(value || {})
    .filter((item) => item && item.uid)
    .map((item) => ({
      uid: String(item.uid),
      userId: String(item.userId || item.username || ""),
      name: String(item.name || "Indo User"),
    }));
}
async function relationToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken(true);
}
async function loadRelationDirect(
  targetUid,
  relation,
  token,
) {
  const url = `https://indo-174f0-default-rtdb.firebaseio.com/users/${encodeURIComponent(targetUid)}/${relation}.json?auth=${encodeURIComponent(token)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("relation read failed");
  return relationEntries(
    await response.json().catch(() => ({})),
  );
}
async function openProfileRelation(root, relation) {
  const modal = document.createElement("div");
  modal.className = "indo-rel-modal";
  if (!document.getElementById("indo-rel-direct-style")) {
    const s = document.createElement("style");
    s.id = "indo-rel-direct-style";
    s.textContent =
      ".indo-rel-modal{position:fixed;inset:0;z-index:35001;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:14px}.indo-rel-card{width:min(100%,520px);height:min(80vh,640px);background:#101016;border:1px solid #282830;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}.indo-rel-head{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #24242b;color:#fff}.indo-rel-head button{width:34px;height:34px;border:0;background:transparent;color:#fff;font-size:22px}.indo-rel-list{flex:1;overflow:auto;padding:8px}.indo-rel-row{width:100%;display:flex;gap:12px;align-items:center;padding:11px 10px;border:0;background:transparent;color:#fff;text-align:left}.indo-rel-avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#2a2a31;font-weight:800}.indo-rel-empty{padding:36px 16px;text-align:center;color:#8d8d98;font-size:13px}.indo-rel-name{font-size:13px;font-weight:700}.indo-rel-id{font-size:11px;color:#92929d;margin-top:2px}";
    document.head.appendChild(s);
  }
  modal.innerHTML = `<section class="indo-rel-card"><header class="indo-rel-head"><strong>${relation === "followers" ? "Followers" : "Following"}</strong><button type="button" data-rclose>×</button></header><div class="indo-rel-list"><div class="indo-rel-empty">Loading...</div></div></section>`;
  document.body.appendChild(modal);
  modal
    .querySelector("[data-rclose]")
    ?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
  const list = modal.querySelector(".indo-rel-list");
  try {
    const token = await relationToken();
    const p = state.profile || {};
    let uid = String(p.uid || p.ownerUid || "").trim();
    let username = String(
      p.username ||
        root.querySelector(".profile-direct-head h2")
          ?.textContent ||
        "",
    )
      .replace(/^@/, "")
      .trim();
    if (!uid && username) {
      const r = await fetch(
        `${window.INDO_API_BASE || ""}/api/account/profile/${encodeURIComponent(username)}?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.profile) {
        uid = String(d.profile.uid || "");
        state.profile = {
          ...(state.profile || {}),
          ...d.profile,
          uid,
          username: String(d.profile.username || username),
        };
      }
    }
    if (!uid) throw new Error("Profile UID is missing.");
    let items = [];
    try {
      items = await loadRelationDirect(
        uid,
        relation,
        token,
      );
    } catch {}
    if (!items.length && p[relation])
      items = relationEntries(p[relation]);
    if (!items.length) {
      try {
        const r = await fetch(
          `${window.INDO_API_BASE || ""}/api/social/${relation}/${encodeURIComponent(uid)}?t=${Date.now()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );
        const d = await r.json().catch(() => ({}));
        if (r.ok)
          items = Array.isArray(d.items) ? d.items : [];
      } catch {}
    }
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
        return `<button class="indo-rel-row" type="button" data-ruser="${item.uid || ""}" data-rid="${id}"><div class="indo-rel-avatar">${(name.charAt(0) || "U").toUpperCase()}</div><div><div class="indo-rel-name">${name}</div><div class="indo-rel-id">@${id || "user"}</div></div></button>`;
      })
      .join("");
    list.querySelectorAll("[data-ruser]").forEach((b) =>
      b.addEventListener("click", async () => {
        const uid = b.dataset.ruser || "";
        const id = b.dataset.rid || "";
        modal.remove();
        state.profile = {
          uid,
          ownerUid: uid,
          username: id,
        };
        state.screen = "profile";
        if (window.__indoNavigate)
          await window.__indoNavigate("profile");
      }),
    );
  } catch (error) {
    list.innerHTML = `<div class="indo-rel-empty">${String(error?.message || "Could not load list.")}</div>`;
  }
}
function installRelationOverride() {
  const KEY2 = Symbol.for("indo.profileRelationOverride");
  if (globalThis[KEY2]) return;
  globalThis[KEY2] = true;
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
      const root = document.getElementById("root");
      const stats = stat.parentElement;
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
      openProfileRelation(
        root,
        index === 1 ? "followers" : "following",
      );
    },
    true,
  );
}

install();
installRelationOverride();
