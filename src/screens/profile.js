import { auth } from "../features/auth/firebase-client.js";
import { renderIndoBrandTopbar } from "../components/indo-brand-topbar.js";
import { nav } from "../components/nav.js";

const API_BASE = () => window.INDO_API_BASE || "";
const POLL_MS = 3000;
const STYLE_ID = "indo-profile";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
const count = (v) => {
  const n = Number(v) || 0;
  return n >= 1e6
    ? `${(n / 1e6).toFixed(1).replace(".0", "")}M`
    : n >= 1e3
      ? `${(n / 1e3).toFixed(1).replace(".0", "")}K`
      : String(n);
};

async function token() {
  const u = auth.currentUser;
  if (!u) throw Error("Please login first.");
  return u.getIdToken(false);
}
async function api(path, options = {}) {
  const h = { ...(options.headers || {}) };
  if (options.body !== undefined)
    h["Content-Type"] = "application/json";
  if (options.auth !== false)
    h.Authorization = `Bearer ${await token()}`;
  const r = await fetch(`${API_BASE()}${path}`, {
    ...options,
    headers: h,
    cache: "no-store",
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(d.error || "Request failed.");
  return d;
}

function styles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `.prof{width:min(100%,520px);min-height:100vh;margin:auto;background:#05070d;color:#f7f8ff;padding-bottom:82px}.prof-main{padding:12px 16px 28px}.prof-hero{text-align:center;padding:12px 0 4px}.prof-pic{position:relative;width:132px;height:132px;margin:8px auto 13px}.prof-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#6b4cff,#c83cff,#ff3e9c,#37b8ff,#6b4cff)}.prof-ring:after{content:'';position:absolute;inset:4px;border-radius:50%;background:#05070d}.prof-avatar{position:absolute;inset:8px;border-radius:50%;overflow:hidden;background:#171b28;border:2px solid #111625;display:grid;place-items:center;font-size:42px;font-weight:900}.prof-avatar img{width:100%;height:100%;object-fit:cover}.prof-online{position:absolute;right:2px;bottom:8px;width:14px;height:14px;border-radius:50%;background:#2cdf8a;border:3px solid #05070d}.prof-name{min-height:28px;font-size:25px;font-weight:900}.prof-id{margin-top:5px;color:#8e96aa;font-size:13px}.prof-bio{max-width:370px;margin:12px auto 0;color:#d9ddea;font-size:13px;line-height:1.45}.prof-location{display:inline-flex;margin-top:10px;padding:7px 12px;border:1px solid #252b3d;border-radius:999px;color:#9ca4b6;font-size:11px}.prof-line{height:1px;background:#171d2a;margin:20px 0 18px}.prof-stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #171d2a;border-bottom:1px solid #171d2a}.prof-stat{padding:12px 4px;text-align:center;border-right:1px solid #171d2a}.prof-stat:last-child{border-right:0}.prof-stat b{display:block;font-size:17px}.prof-stat span{display:block;margin-top:4px;color:#7f8798;font-size:9px;text-transform:uppercase;letter-spacing:.7px}.prof-actions{display:grid;grid-template-columns:1.9fr 1fr 46px;gap:8px;margin:18px 0 22px}.prof-btn{height:40px;border:1px solid #2a3042;border-radius:11px;background:#0b0f19;color:#fff;font-size:12px;font-weight:800;cursor:pointer}.prof-btn.primary{border:0;background:linear-gradient(105deg,#6748ff,#b43ce7,#ef3c9e)}.prof-section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px}.prof-section-title strong{font-size:16px}.prof-section-title button{border:0;background:transparent;color:#a778ff;font-size:11px;font-weight:800}.prof-videos{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.prof-empty{padding:44px 12px;text-align:center;color:#7e8799;border:1px dashed #20283a;border-radius:14px;grid-column:1/-1}.prof-video{aspect-ratio:4/5;border:1px solid #1e2534;border-radius:12px;overflow:hidden;background:#111625;padding:0}.prof-video img,.prof-video video{width:100%;height:100%;object-fit:cover}`;
  document.head.appendChild(s);
}

async function ownProfile() {
  const d = await api("/api/account/me");
  return d?.profile
    ? {
        ...d.profile,
        stats: d.stats || {},
        social: d.social || {},
      }
    : null;
}
async function profileById(id) {
  const d = await api(
    `/api/account/profile/${encodeURIComponent(String(id || "").replace(/^@/, ""))}`,
  );
  return d?.profile
    ? {
        ...d.profile,
        stats: d.stats || {},
        social: d.social || {},
      }
    : null;
}
async function loadVideos(uid) {
  try {
    const d = await api("/api/media/videos?limit=50", {
      auth: false,
    });
    return (d.videos || []).filter(
      (v) => String(v.ownerUid || "") === String(uid),
    );
  } catch {
    return [];
  }
}
function videoGrid(items) {
  if (!items.length)
    return '<div class="prof-empty">No videos uploaded yet.</div>';
  return items
    .slice(0, 9)
    .map(
      (v) =>
        `<button class="prof-video" type="button" data-video="${esc(v.secureUrl || v.videoUrl || v.url || "")}">${v.thumbnailUrl ? `<img src="${esc(v.thumbnailUrl)}" alt="">` : `<video src="${esc(v.secureUrl || v.videoUrl || v.url || "")}" muted playsinline preload="metadata"></video>`}</button>`,
    )
    .join("");
}
function go(screen) {
  if (window.__indoNavigate) {
    window.__indoNavigate(screen);
  } else
    import("../state.js").then(({ state }) => {
      state.screen = screen;
      location.reload();
    });
}

function applyLiveProfile(app, profile, own, id) {
  const me = auth.currentUser;
  const firebaseName = String(me?.displayName || "").trim();
  const backendName = String(
    profile?.name || profile?.displayName || "",
  ).trim();
  const emailName = String(me?.email || "")
    .split("@")[0]
    .trim();
  const nextName =
    (own
      ? firebaseName || backendName || emailName || id
      : backendName ||
        firebaseName ||
        id ||
        emailName ||
        "Profile"
    ).trim() || "Profile";
  const nextId = String(
    profile?.userId || profile?.username || id || "",
  ).replace(/^@/, "");
  const avatar = String(
    profile?.avatarUrl ||
      profile?.photoURL ||
      profile?.photoUrl ||
      "",
  ).trim();
  const bio = String(profile?.bio || "").trim();
  const location = String(profile?.location || "").trim();
  const nameEl = app.querySelector("[data-profile-name]");
  if (nameEl) nameEl.textContent = nextName;
  const idEl = app.querySelector("[data-profile-id]");
  if (idEl) idEl.textContent = `@${nextId}`;
  const bioEl = app.querySelector("[data-profile-bio]");
  if (bioEl) {
    bioEl.textContent = bio;
    bioEl.hidden = !bio;
  }
  const locEl = app.querySelector(
    "[data-profile-location]",
  );
  if (locEl) {
    locEl.textContent = `⌖ ${location}`;
    locEl.hidden = !location;
  }
  const avatarEl = app.querySelector(
    "[data-profile-avatar]",
  );
  if (avatarEl) {
    const initial = (nextName || nextId || "I")
      .replace(/^@/, "")
      .charAt(0)
      .toUpperCase();
    avatarEl.innerHTML = avatar
      ? `<img src="${esc(avatar)}" alt="Profile">`
      : esc(initial);
  }
}

export async function renderProfile(
  app,
  profileArg = null,
) {
  styles();
  if (window.__indoProfileLiveTimer)
    clearInterval(window.__indoProfileLiveTimer);
  const me = auth.currentUser;
  let profile = null,
    own = false;
  try {
    const requested = String(
      profileArg?.userId ||
        profileArg?.username ||
        profileArg?.uid ||
        "",
    ).replace(/^@/, "");
    if (
      requested &&
      String(profileArg?.uid || "") ===
        String(me?.uid || "")
    ) {
      own = true;
      profile = await ownProfile();
    } else if (requested) {
      profile = await profileById(requested);
      own =
        String(profile?.uid || "") ===
        String(me?.uid || "");
    } else {
      own = true;
      profile = await ownProfile();
    }
    if (!profile)
      throw Error("Profile could not be loaded.");
  } catch (e) {
    app.innerHTML = `<div class="prof"><main class="prof-main"><h2>Profile unavailable</h2><p>${esc(e.message)}</p></main>${nav("profile")}</div>`;
    return;
  }

  const uid = String(profile.uid || me?.uid || "");
  const id = String(
    profile.userId ||
      profile.username ||
      me?.email?.split("@")[0] ||
      "",
  ).replace(/^@/, "");
  const firebaseName = String(me?.displayName || "").trim();
  const backendName = String(
    profile.name || profile.displayName || "",
  ).trim();
  const emailName = String(me?.email || "")
    .split("@")[0]
    .trim();
  const name =
    (own
      ? firebaseName || backendName || emailName || id
      : backendName ||
        firebaseName ||
        id ||
        emailName ||
        "Profile"
    ).trim() || "Profile";
  const bio = String(profile.bio || "").trim();
  const location = String(profile.location || "").trim();
  const st = profile.stats || {},
    soc = profile.social || {};
  const items = await loadVideos(uid);
  const stats = {
    videos: Number(st.videosCount ?? st.postsCount ?? 0),
    followers: Number(
      st.followersCount ?? soc.followersCount ?? 0,
    ),
    following: Number(
      st.followingCount ?? soc.followingCount ?? 0,
    ),
    likes: Number(st.likesCount ?? profile.likesCount ?? 0),
  };
  const avatar = String(
    profile.avatarUrl ||
      profile.photoURL ||
      profile.photoUrl ||
      "",
  ).trim();
  const initial = (name || id || "I")
    .replace(/^@/, "")
    .charAt(0)
    .toUpperCase();
  app.innerHTML = `<div class="prof">${renderIndoBrandTopbar({ rightLabel: "Profile" })}<main class="prof-main"><section class="prof-hero"><div class="prof-pic"><div class="prof-ring"></div><div class="prof-avatar" data-profile-avatar>${avatar ? `<img src="${esc(avatar)}" alt="Profile">` : esc(initial)}</div><span class="prof-online"></span></div><div class="prof-name" data-profile-name>${esc(name)}</div><div class="prof-id" data-profile-id>@${esc(id)}</div><div class="prof-bio" data-profile-bio ${bio ? "" : "hidden"}>${esc(bio)}</div><div class="prof-location" data-profile-location ${location ? "" : "hidden"}>⌖ ${esc(location)}</div></section><div class="prof-line"></div><section class="prof-stats"><div class="prof-stat"><b data-stat="videos">${count(stats.videos)}</b><span>Videos</span></div><div class="prof-stat"><b data-stat="followers">${count(stats.followers)}</b><span>Followers</span></div><div class="prof-stat"><b data-stat="following">${count(stats.following)}</b><span>Following</span></div><div class="prof-stat"><b data-stat="likes">${count(stats.likes)}</b><span>Likes</span></div></section>${own ? `<div class="prof-actions"><button class="prof-btn primary" type="button" id="indo-edit-profile">✎ Edit Profile</button><button class="prof-btn" type="button" id="indo-share-profile">Share</button><button class="prof-btn" type="button" id="indo-settings">⚙</button></div>` : ""}<section><div class="prof-section-title"><strong>Recent Videos</strong><button type="button" id="indo-view-videos">View all</button></div><div class="prof-videos">${videoGrid(items)}</div></section></main>${nav("profile")}</div>`;

  app
    .querySelector("#indo-edit-profile")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      go("edit-profile");
    });
  app
    .querySelector("#indo-settings")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      go("settings");
    });
  app
    .querySelector("#indo-view-videos")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      go("video");
    });
  app
    .querySelector("#indo-share-profile")
    ?.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}?profile=${encodeURIComponent(id)}`;
      try {
        if (navigator.share)
          await navigator.share({
            title: `${name} on Indo`,
            url,
          });
        else await navigator.clipboard?.writeText(url);
      } catch {}
    });

  let busy = false;
  const refresh = async () => {
    if (busy || document.hidden) return;
    busy = true;
    try {
      const fresh = own
        ? await ownProfile()
        : await profileById(id);
      if (fresh) {
        applyLiveProfile(app, fresh, own, id);
        const s = fresh.stats || {},
          so = fresh.social || {};
        const vals = {
          videos: Number(
            s.videosCount ?? s.postsCount ?? 0,
          ),
          followers: Number(
            s.followersCount ?? so.followersCount ?? 0,
          ),
          following: Number(
            s.followingCount ?? so.followingCount ?? 0,
          ),
          likes: Number(
            s.likesCount ?? fresh.likesCount ?? 0,
          ),
        };
        for (const [k, v] of Object.entries(vals)) {
          const el = app.querySelector(
            `[data-stat="${k}"]`,
          );
          if (el) el.textContent = count(v);
        }
      }
    } catch (e) {
      console.warn("Profile refresh failed", e);
    } finally {
      busy = false;
    }
  };
  window.__indoProfileLiveTimer = setInterval(
    refresh,
    POLL_MS,
  );
  refresh();
}
