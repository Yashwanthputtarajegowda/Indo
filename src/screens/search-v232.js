import { nav } from "../components/nav.js";
import { renderHomeTopbar, installHomeTopbarStyles } from "./home-topbar-v230.js";
import { loadFollowStatus, toggleFollow } from "../features/social/follow.js";
import { state } from "../state.js";

const VERSION = "232";

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

function formatCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function initials(name, userId) {
  return escapeHtml(
    (
      String(name || userId || "I")
        .replace(/^@/, "")
        .trim()
        .charAt(0) || "I"
    ).toUpperCase(),
  );
}

async function searchUsers(query) {
  const value = String(query || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
  if (!value) return [];
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}/api/account/search-users?q=${encodeURIComponent(value)}`, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not search users.");
  return Array.isArray(data.users) ? data.users : [];
}

async function openUserProfile(username) {
  const apiBase = window.INDO_API_BASE || "";
  const clean = String(username || "").replace(/^@/, "");
  const response = await fetch(`${apiBase}/api/account/profile/${encodeURIComponent(clean)}`, {
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data.error || "Could not open profile.");
  state.profile = { ...data.profile, stats: data.stats, social: data.social };
  state.screen = "profile";
  if (typeof window.__indoNavigate === "function") await window.__indoNavigate("profile");
}

function renderCard(user) {
  const avatar = user.avatarUrl
    ? `<img class="search-profile-avatar" src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(user.name)}" loading="lazy">`
    : `<div class="search-profile-avatar search-profile-initial">${initials(user.name, user.userId)}</div>`;
  return `<article class="search-profile-card" data-profile-user="${escapeHtml(user.userId)}">
    <button class="search-profile-main" type="button" data-open-profile="${escapeHtml(user.userId)}">
      ${avatar}
      <span class="search-profile-copy">
        <span class="search-profile-name">${escapeHtml(user.name)}${user.isVerified ? '<span class="search-verified">✓</span>' : ""}</span>
        <span class="search-profile-id">${escapeHtml(user.userId)}</span>
        <span class="search-profile-stats"><b>${formatCount(user.postsCount)}</b> Posts <i></i> <b>${formatCount(user.followersCount)}</b> Followers</span>
      </span>
    </button>
    <button class="search-follow-button" type="button" data-follow-user="${escapeHtml(user.uid)}" data-following="0">Follow</button>
  </article>`;
}

function injectStyles() {
  const id = "indo-search-v232";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    .search-v232{max-width:720px;margin:0 auto;padding:18px 16px 88px;box-sizing:border-box}
    .search-v232-box{display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #b43aff;border-radius:14px;background:linear-gradient(110deg,#100b17,#0b0b10);box-shadow:0 0 22px rgba(183,52,255,.08);min-height:52px}
    .search-v232-box svg{width:20px;height:20px;color:#fff;flex:0 0 auto}
    .search-v232-box input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#fff;font:600 16px/1.2 Arial,sans-serif}
    .search-v232-box input::placeholder{color:#8c8995}
    .search-v232-clear{display:none;width:28px;height:28px;border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}
    .search-v232-users-title{margin:22px 0 10px;color:#ff45ba;font:800 16px/1 Arial,sans-serif;letter-spacing:.3px;text-transform:uppercase}
    .search-v232-results{display:grid;gap:10px}
    .search-profile-card{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid rgba(174,65,255,.45);border-radius:16px;background:linear-gradient(115deg,rgba(17,12,25,.96),rgba(8,8,13,.98));box-shadow:inset 0 0 30px rgba(159,54,255,.03)}
    .search-profile-main{flex:1;min-width:0;display:flex;align-items:center;gap:12px;text-align:left;border:0;background:transparent;color:inherit;padding:0;cursor:pointer}
    .search-profile-avatar{width:68px;height:68px;flex:0 0 68px;border-radius:50%;object-fit:cover;background:#242734;display:grid;place-items:center;color:#fff;font:900 24px/1 Arial,sans-serif}
    .search-profile-copy{min-width:0;display:flex;flex-direction:column;gap:5px}
    .search-profile-name{display:flex;align-items:center;gap:7px;color:#fff;font:800 18px/1.15 Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .search-profile-id{color:#a7a4ae;font:600 14px/1 Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .search-profile-stats{color:#aaa7b2;font:500 12px/1.2 Arial,sans-serif;white-space:nowrap}
    .search-profile-stats b{color:#eee;font-weight:800}.search-profile-stats i{display:inline-block;width:4px;height:4px;border-radius:50%;background:#ff43b6;margin:0 8px 2px}
    .search-verified{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#ff3eaf;color:#fff;font:900 12px/1 Arial,sans-serif}
    .search-follow-button{width:88px;min-width:88px;height:38px;border:1px solid #ff36af;border-radius:10px;background:transparent;color:#ff47b8;font:800 13px/1 Arial,sans-serif;cursor:pointer}
    .search-follow-button[data-following="1"]{border-color:#7d54ff;color:#fff;background:linear-gradient(135deg,#7c38ff,#df2bb4)}
    .search-follow-button:disabled{opacity:.6;cursor:wait}
    .search-v232-empty{padding:28px 10px;text-align:center;color:#8f8b96;font:600 14px/1.4 Arial,sans-serif}
    @media(max-width:420px){.search-v232{padding-left:9px;padding-right:9px}.search-profile-card{padding:10px}.search-profile-avatar{width:58px;height:58px;flex-basis:58px}.search-profile-name{font-size:16px}.search-profile-id{font-size:13px}.search-profile-stats{font-size:11px}.search-follow-button{width:80px;min-width:80px;height:36px}}
  `;
  document.head.appendChild(style);
}

export async function renderSearch(app) {
  installHomeTopbarStyles();
  injectStyles();
  app.innerHTML = `<div class="app-shell">${renderHomeTopbar()}<main class="search-v232"><div class="search-v232-box"><span aria-hidden="true">⌕</span><input id="user-search-input-v232" autocomplete="off" placeholder="Search @User ID..." aria-label="Search User ID"><button class="search-v232-clear" id="search-clear-v232" type="button" aria-label="Clear search">×</button></div><h4 class="search-v232-users-title">Users</h4><div class="search-v232-results" id="search-results-v232"><div class="search-v232-empty">Search a User ID to see matching profiles.</div></div></main>${nav("search")}</div>`;

  const input = app.querySelector("#user-search-input-v232");
  const clear = app.querySelector("#search-clear-v232");
  const results = app.querySelector("#search-results-v232");
  let timer = null;
  let requestId = 0;

  const bindFollowButtons = () => {
    results.querySelectorAll("[data-follow-user]").forEach(async (button) => {
      if (button.dataset.bound === "1") return;
      button.dataset.bound = "1";
      const targetUid = button.dataset.followUser;
      try {
        const status = await loadFollowStatus(targetUid);
        const following = Boolean(status?.following);
        button.dataset.following = following ? "1" : "0";
        button.textContent = status?.requested ? "Requested" : following ? "Following" : "Follow";
      } catch {}
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const following = button.dataset.following === "1";
        button.disabled = true;
        try {
          const data = await toggleFollow(targetUid, !following);
          button.dataset.following = data?.following ? "1" : "0";
          button.textContent = data?.requested ? "Requested" : data?.following ? "Following" : "Follow";
        } catch (error) {
          button.title = error.message || "Could not update follow status.";
        } finally {
          button.disabled = false;
        }
      });
    });
  };

  results.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const cardButton = target?.closest("[data-open-profile]");
    if (!cardButton) return;
    openUserProfile(cardButton.dataset.openProfile).catch((error) => {
      results.insertAdjacentHTML("afterbegin", `<div class="search-v232-empty">${escapeHtml(error.message || "Could not open profile.")}</div>`);
    });
  });

  const runSearch = async () => {
    const value = input.value.trim();
    clear.style.display = value ? "block" : "none";
    const current = ++requestId;
    if (!value) {
      results.innerHTML = '<div class="search-v232-empty">Search a User ID to see matching profiles.</div>';
      return;
    }
    results.innerHTML = '<div class="search-v232-empty">Searching...</div>';
    try {
      const users = await searchUsers(value);
      if (current !== requestId) return;
      results.innerHTML = users.length ? users.map(renderCard).join("") : '<div class="search-v232-empty">No matching users found.</div>';
      bindFollowButtons();
    } catch (error) {
      if (current !== requestId) return;
      results.innerHTML = `<div class="search-v232-empty">${escapeHtml(error.message || "Could not search users.")}</div>`;
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
