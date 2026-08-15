import { nav } from "../components/nav.js";
import { renderHomeTopbar, installHomeTopbarStyles } from "./home-topbar-v2.js";
import { loadFollowStatus, toggleFollow } from "../features/social/follow.js";
import { state } from "../state.js";

const VERSION = "235";
function escapeHtml(value = "") {
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
function formatCount(v) {
  const n = Number(v) || 0;
  return n >= 1e6
    ? `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1e3
      ? `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`
      : String(n);
}
function initials(name, id) {
  return escapeHtml(
    (
      String(name || id || "I")
        .replace(/^@/, "")
        .trim()
        .charAt(0) || "I"
    ).toUpperCase(),
  );
}
async function searchUsers(q) {
  const value = String(q || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
  if (!value) return [];
  const api = window.INDO_API_BASE || "";
  const r = await fetch(
    `${api}/api/account/search-users?q=${encodeURIComponent(value)}`,
    {
      cache: "no-store",
    },
  );
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Could not search users.");
  return Array.isArray(d.users) ? d.users : [];
}
async function openUserProfile(id) {
  const clean = String(id || "")
    .replace(/^@+/, "")
    .trim();
  if (!clean) return;
  if (typeof window.__indoOpenProfile === "function") {
    await window.__indoOpenProfile({ userId: clean });
    return;
  }
  state.profile = { userId: clean, username: `@${clean}` };
  if (typeof window.__indoNavigate === "function") {
    await window.__indoNavigate("profile");
    return;
  }
  throw new Error("Profile navigation is unavailable.");
}
function renderCard(user) {
  const id = String(user.userId || user.username || "").replace(/^@+/, "");
  const uid = String(user.uid || "");
  const avatar = user.avatarUrl
    ? `<img class="search-profile-avatar" data-profile-username="${escapeHtml(id)}" src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(user.name || id)}" loading="lazy">`
    : `<div class="search-profile-avatar search-profile-initial" data-profile-username="${escapeHtml(id)}">${initials(user.name, id)}</div>`;
  return `<article class="search-profile-card" data-profile-user="${escapeHtml(id)}" data-profile-uid="${escapeHtml(uid)}"><button class="search-profile-main" type="button" data-open-profile="${escapeHtml(id)}" aria-label="Open ${escapeHtml(user.name || id)} profile">${avatar}<span class="search-profile-copy"><span class="search-profile-name">${escapeHtml(user.name || id)}${user.isVerified ? '<span class="search-verified">✓</span>' : ""}</span><span class="search-profile-id search-profile-id-link" data-open-profile="${escapeHtml(id)}" role="link" tabindex="0">@${escapeHtml(id)}</span><span class="search-profile-stats"><b>${formatCount(user.postsCount)}</b> Posts <i></i> <b>${formatCount(user.followersCount)}</b> Followers</span></span></button><button class="search-follow-button" type="button" data-follow-user="${escapeHtml(uid)}" data-following="0">Follow</button></article>`;
}
function injectStyles() {
  const id = "indo-search-v235";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `.search-v232{max-width:720px;margin:0 auto;padding:18px 16px 88px;box-sizing:border-box}.search-v232-box{display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #b43aff;border-radius:14px;background:linear-gradient(110deg,#100b17,#0b0b10);box-shadow:0 0 22px rgba(183,52,255,.08);min-height:52px}.search-v232-box input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#fff;font:600 16px/1.2 Arial,sans-serif}.search-v232-box input::placeholder{color:#8c8995}.search-v232-clear{display:none;width:28px;height:28px;border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}.search-v232-users-title{margin:22px 0 10px;color:#ff45ba;font:800 16px/1 Arial,sans-serif;letter-spacing:.3px;text-transform:uppercase}.search-v232-results{display:grid;gap:10px}.search-profile-card{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid rgba(174,65,255,.45);border-radius:16px;background:linear-gradient(115deg,rgba(17,12,25,.96),rgba(8,8,13,.98))}.search-profile-main{flex:1;min-width:0;display:flex;align-items:center;gap:12px;text-align:left;border:0;background:transparent;color:inherit;padding:0;cursor:pointer}.search-profile-avatar{width:68px;height:68px;flex:0 0 68px;border-radius:50%;object-fit:cover;background:#242734;display:grid;place-items:center;color:#fff;font:900 24px/1 Arial,sans-serif;overflow:hidden}.search-profile-copy{min-width:0;display:flex;flex-direction:column;gap:5px}.search-profile-name{display:flex;align-items:center;gap:7px;color:#fff;font:800 18px/1.15 Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.search-profile-id-link{color:#a7a4ae;font:600 14px/1 Arial,sans-serif;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none}.search-profile-id-link:hover{color:#fff;text-decoration:underline}.search-profile-stats{color:#aaa7b2;font:500 12px/1.2 Arial,sans-serif;white-space:nowrap}.search-profile-stats b{color:#eee;font-weight:800}.search-profile-stats i{display:inline-block;width:4px;height:4px;border-radius:50%;background:#ff43b6;margin:0 8px 2px}.search-verified{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#ff3eaf;color:#fff;font:900 12px/1 Arial,sans-serif}.search-follow-button{width:88px;min-width:88px;height:38px;border:1px solid #ff36af;border-radius:10px;background:transparent;color:#ff47b8;font:800 13px/1 Arial,sans-serif;cursor:pointer}.search-follow-button[data-following="1"]{border-color:#7d54ff;color:#fff;background:linear-gradient(135deg,#7c38ff,#df2bb4)}.search-follow-button:disabled{opacity:.6;cursor:wait}.search-v232-empty{padding:28px 10px;text-align:center;color:#8f8b96;font:600 14px/1.4 Arial,sans-serif}@media(max-width:420px){.search-v232{padding-left:9px;padding-right:9px}.search-profile-card{padding:10px}.search-profile-avatar{width:58px;height:58px;flex-basis:58px}.search-profile-name{font-size:16px}.search-profile-id-link{font-size:13px}.search-profile-stats{font-size:11px}.search-follow-button{width:80px;min-width:80px;height:36px}}`;
  document.head.appendChild(s);
}
export async function renderSearch(app) {
  installHomeTopbarStyles();
  injectStyles();
  app.innerHTML = `<div class="app-shell">${renderHomeTopbar()}<main class="search-v232"><div class="search-v232-box"><span aria-hidden="true">⌕</span><input id="user-search-input-v232" autocomplete="off" placeholder="Search @User ID..." aria-label="Search User ID"><button class="search-v232-clear" id="search-clear-v232" type="button" aria-label="Clear search">×</button></div><h4 class="search-v232-users-title">Users</h4><div class="search-v232-results" id="search-results-v232"><div class="search-v232-empty">Search a User ID to see matching profiles.</div></div></main>${nav("search")}</div>`;
  const input = app.querySelector("#user-search-input-v232");
  const clear = app.querySelector("#search-clear-v232");
  const results = app.querySelector("#search-results-v232");
  let timer = null,
    requestId = 0;
  const bindFollowButtons = () => {
    results.querySelectorAll("[data-follow-user]").forEach(async (b) => {
      if (b.dataset.bound === "1") return;
      b.dataset.bound = "1";
      const uid = b.dataset.followUser;
      if (!uid) {
        b.hidden = true;
        return;
      }
      try {
        const s = await loadFollowStatus(uid);
        b.dataset.following = s?.following ? "1" : "0";
        b.textContent = s?.requested
          ? "Requested"
          : s?.following
            ? "Following"
            : "Follow";
      } catch {}
      b.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const following = b.dataset.following === "1";
        b.disabled = true;
        try {
          const d = await toggleFollow(uid, !following);
          b.dataset.following = d?.following ? "1" : "0";
          b.textContent = d?.requested
            ? "Requested"
            : d?.following
              ? "Following"
              : "Follow";
        } catch (err) {
          b.title = err.message || "Could not update follow status.";
        } finally {
          b.disabled = false;
        }
      });
    });
  };
  const openFromTarget = (target) => {
    const t = target?.closest?.("[data-open-profile]");
    if (!t) return null;
    return (
      t.getAttribute("data-open-profile") ||
      t.closest(".search-profile-card")?.dataset.profileUser ||
      ""
    );
  };
  results.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest(".search-follow-button")) return;
    const id = target?.closest(".search-profile-id-link");
    const card = target?.closest(".search-profile-main");
    const username = openFromTarget(id || card);
    if (!username) return;
    e.preventDefault();
    e.stopPropagation();
    openUserProfile(username).catch((err) => {
      results.insertAdjacentHTML(
        "afterbegin",
        `<div class="search-v232-empty">${escapeHtml(err.message || "Could not open profile.")}</div>`,
      );
    });
  });
  results.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const target =
      e.target instanceof Element
        ? e.target.closest(".search-profile-id-link")
        : null;
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    openUserProfile(target.getAttribute("data-open-profile") || "").catch(
      () => {},
    );
  });
  const runSearch = async () => {
    const value = input.value.trim();
    clear.style.display = value ? "block" : "none";
    const current = ++requestId;
    if (!value) {
      results.innerHTML =
        '<div class="search-v232-empty">Search a User ID to see matching profiles.</div>';
      return;
    }
    results.innerHTML = '<div class="search-v232-empty">Searching...</div>';
    try {
      const users = await searchUsers(value);
      if (current !== requestId) return;
      results.innerHTML = users.length
        ? users.map(renderCard).join("")
        : '<div class="search-v232-empty">No matching users found.</div>';
      bindFollowButtons();
    } catch (err) {
      if (current !== requestId) return;
      results.innerHTML = `<div class="search-v232-empty">${escapeHtml(err.message || "Could not search users.")}</div>`;
    }
  };
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 180);
  });
  clear.addEventListener("click", () => {
    input.value = "";
    input.focus();
    runSearch();
  });
}
