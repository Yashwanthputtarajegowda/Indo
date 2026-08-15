import { auth } from "../features/auth/firebase-client.js";
import { renderIndoBrandTopbar } from "../components/indo-brand-topbar.js";
import { nav } from "../components/nav.js";

const API_BASE = () => window.INDO_API_BASE || "";
const POLL_MS = 3000;
const STYLE_ID = "indo-profile";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );

const count = (value) => {
  const number = Number(value) || 0;

  if (number >= 1e6) {
    return `${(number / 1e6)
      .toFixed(1)
      .replace(".0", "")}M`;
  }

  if (number >= 1e3) {
    return `${(number / 1e3)
      .toFixed(1)
      .replace(".0", "")}K`;
  }

  return String(number);
};

async function token() {
  const user = auth.currentUser;
  if (!user) throw Error("Please login first.");
  return user.getIdToken(false);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false) {
    headers.Authorization = `Bearer ${await token()}`;
  }

  const response = await fetch(
    `${API_BASE()}${path}`,
    {
      ...options,
      headers,
      cache: "no-store",
    },
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw Error(data.error || "Request failed.");
  }

  return data;
}

function styles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .prof{
      width:min(100%,520px);
      min-height:100vh;
      margin:auto;
      background:#05070d;
      color:#f7f8ff;
      padding-bottom:82px;
    }
    .prof-main{
      padding:12px 16px 28px;
    }
    .prof-hero{
      text-align:center;
      padding:12px 0 4px;
    }
    .prof-pic{
      position:relative;
      width:132px;
      height:132px;
      margin:8px auto 13px;
    }
    .prof-ring{
      position:absolute;
      inset:0;
      border-radius:50%;
      background:conic-gradient(
        #6b4cff,
        #c83cff,
        #ff3e9c,
        #37b8ff,
        #6b4cff
      );
    }
    .prof-ring:after{
      content:'';
      position:absolute;
      inset:4px;
      border-radius:50%;
      background:#05070d;
    }
    .prof-avatar{
      position:absolute;
      inset:8px;
      border-radius:50%;
      overflow:hidden;
      background:#171b28;
      border:2px solid #111625;
      display:grid;
      place-items:center;
      font-size:42px;
      font-weight:900;
    }
    .prof-avatar img{
      width:100%;
      height:100%;
      object-fit:cover;
    }
    .prof-online{
      position:absolute;
      right:2px;
      bottom:8px;
      width:14px;
      height:14px;
      border-radius:50%;
      background:#2cdf8a;
      border:3px solid #05070d;
    }
    .prof-name{
      min-height:28px;
      font-size:25px;
      font-weight:900;
    }
    .prof-id{
      margin-top:5px;
      color:#8e96aa;
      font-size:13px;
    }
    .prof-loading{
      color:#777f92;
      font-size:11px;
      margin-top:7px;
    }
    .prof-bio{
      max-width:370px;
      margin:12px auto 0;
      color:#d9ddea;
      font-size:13px;
      line-height:1.45;
    }
    .prof-location{
      display:inline-flex;
      margin-top:10px;
      padding:7px 12px;
      border:1px solid #252b3d;
      border-radius:999px;
      color:#9ca4b6;
      font-size:11px;
    }
    .prof-line{
      height:1px;
      background:#171d2a;
      margin:20px 0 18px;
    }
    .prof-stats{
      display:grid;
      grid-template-columns:repeat(4,1fr);
      border-top:1px solid #171d2a;
      border-bottom:1px solid #171d2a;
    }
    .prof-stat{
      padding:12px 4px;
      text-align:center;
      border-right:1px solid #171d2a;
    }
    .prof-stat:last-child{
      border-right:0;
    }
    .prof-stat b{
      display:block;
      font-size:17px;
    }
    .prof-stat span{
      display:block;
      margin-top:4px;
      color:#7f8798;
      font-size:9px;
      text-transform:uppercase;
      letter-spacing:.7px;
    }
    .prof-actions{
      display:grid;
      grid-template-columns:1.9fr 1fr 46px;
      gap:8px;
      margin:18px 0 22px;
    }
    .prof-btn{
      height:40px;
      border:1px solid #2a3042;
      border-radius:11px;
      background:#0b0f19;
      color:#fff;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
    }
    .prof-btn.primary{
      border:0;
      background:linear-gradient(
        105deg,
        #6748ff,
        #b43ce7,
        #ef3c9e
      );
    }
    .prof-section-title{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:11px;
    }
    .prof-section-title strong{
      font-size:16px;
    }
    .prof-section-title button{
      border:0;
      background:transparent;
      color:#a778ff;
      font-size:11px;
      font-weight:800;
      cursor:pointer;
    }
    .prof-videos{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:7px;
    }
    .prof-empty{
      padding:44px 12px;
      text-align:center;
      color:#7e8799;
      border:1px dashed #20283a;
      border-radius:14px;
      grid-column:1/-1;
    }
    .prof-video{
      aspect-ratio:4/5;
      border:1px solid #1e2534;
      border-radius:12px;
      overflow:hidden;
      background:#111625;
      padding:0;
      cursor:pointer;
    }
    .prof-video img,
    .prof-video video{
      width:100%;
      height:100%;
      object-fit:cover;
    }
  `;

  document.head.appendChild(style);
}

async function ownProfile() {
  const data = await api("/api/account/me");

  return data?.profile
    ? {
        ...data.profile,
        stats: data.stats || {},
        social: data.social || {},
      }
    : null;
}

async function profileById(id) {
  const cleanId = String(id || "")
    .replace(/^@/, "");

  const data = await api(
    `/api/account/profile/${encodeURIComponent(cleanId)}`,
  );

  return data?.profile
    ? {
        ...data.profile,
        stats: data.stats || {},
        social: data.social || {},
      }
    : null;
}

async function loadVideos(uid) {
  try {
    const data = await api(
      "/api/media/videos?limit=50",
      { auth: false },
    );

    return (data.videos || []).filter(
      (video) =>
        String(video.ownerUid || "") ===
        String(uid || ""),
    );
  } catch {
    return [];
  }
}

function videoGrid(items) {
  if (!items.length) {
    return `
      <div class="prof-empty">
        No videos uploaded yet.
      </div>
    `;
  }

  return items
    .slice(0, 9)
    .map((video) => {
      const source =
        video.secureUrl ||
        video.videoUrl ||
        video.url ||
        "";

      return `
        <button
          class="prof-video"
          type="button"
          data-video="${esc(source)}"
        >
          ${
            video.thumbnailUrl
              ? `<img src="${esc(video.thumbnailUrl)}" alt="">`
              : `<video
                  src="${esc(source)}"
                  muted
                  playsinline
                  preload="metadata"
                ></video>`
          }
        </button>
      `;
    })
    .join("");
}

function go(screen) {
  if (window.__indoNavigate) {
    window.__indoNavigate(screen);
    return;
  }

  import("../state.js").then(({ state }) => {
    state.screen = screen;
    location.reload();
  });
}

function applyProfile(app, profile, own, fallbackId) {
  const me = auth.currentUser;
  const firebaseName = String(
    me?.displayName || "",
  ).trim();
  const backendName = String(
    profile?.name ||
      profile?.displayName ||
      "",
  ).trim();
  const emailName = String(me?.email || "")
    .split("@")[0]
    .trim();

  const nextName =
    (own
      ? firebaseName ||
        backendName ||
        emailName ||
        fallbackId
      : backendName ||
        firebaseName ||
        fallbackId ||
        emailName ||
        "Profile"
    ).trim() || "Profile";

  const nextId = String(
    profile?.userId ||
      profile?.username ||
      fallbackId ||
      "",
  ).replace(/^@/, "");

  const avatar = String(
    profile?.avatarUrl ||
      profile?.photoURL ||
      profile?.photoUrl ||
      "",
  ).trim();

  const bio = String(profile?.bio || "").trim();
  const location = String(
    profile?.location || "",
  ).trim();

  const nameEl = app.querySelector(
    "[data-profile-name]",
  );
  if (nameEl) nameEl.textContent = nextName;

  const idEl = app.querySelector(
    "[data-profile-id]",
  );
  if (idEl) idEl.textContent = `@${nextId}`;

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

  const bioEl = app.querySelector(
    "[data-profile-bio]",
  );
  if (bioEl) {
    bioEl.textContent = bio;
    bioEl.hidden = !bio;
  }

  const locationEl = app.querySelector(
    "[data-profile-location]",
  );
  if (locationEl) {
    locationEl.textContent = `⌖ ${location}`;
    locationEl.hidden = !location;
  }

  const stats = profile?.stats || {};
  const social = profile?.social || {};
  const values = {
    videos: Number(
      stats.videosCount ??
        stats.postsCount ??
        0,
    ),
    followers: Number(
      stats.followersCount ??
        social.followersCount ??
        0,
    ),
    following: Number(
      stats.followingCount ??
        social.followingCount ??
        0,
    ),
    likes: Number(
      stats.likesCount ??
        profile?.likesCount ??
        0,
    ),
  };

  for (const [key, value] of Object.entries(
    values,
  )) {
    const element = app.querySelector(
      `[data-stat="${key}"]`,
    );

    if (element) {
      element.textContent = count(value);
    }
  }
}

function fastShell(app, profileArg) {
  const me = auth.currentUser;
  const requestedId = String(
    profileArg?.userId ||
      profileArg?.username ||
      profileArg?.uid ||
      "",
  ).replace(/^@/, "");

  const existingName = String(
    profileArg?.name ||
      profileArg?.displayName ||
      "",
  ).trim();

  const own =
    Boolean(requestedId) &&
    String(profileArg?.uid || "") ===
      String(me?.uid || "");

  const name =
    existingName ||
    (own
      ? me?.displayName ||
        me?.email?.split("@")[0] ||
        requestedId
      : requestedId || "Profile");

  const initial = String(name || requestedId || "I")
    .replace(/^@/, "")
    .charAt(0)
    .toUpperCase();

  const avatar = String(
    profileArg?.avatarUrl ||
      profileArg?.photoURL ||
      profileArg?.photoUrl ||
      "",
  ).trim();

  app.innerHTML = `
    <div class="prof">
      ${renderIndoBrandTopbar({
        rightLabel: "Profile",
      })}
      <main class="prof-main">
        <section class="prof-hero">
          <div class="prof-pic">
            <div class="prof-ring"></div>
            <div
              class="prof-avatar"
              data-profile-avatar
            >
              ${
                avatar
                  ? `<img src="${esc(avatar)}" alt="Profile">`
                  : esc(initial)
              }
            </div>
            <span class="prof-online"></span>
          </div>
          <div
            class="prof-name"
            data-profile-name
          >
            ${esc(name || "Profile")}
          </div>
          <div
            class="prof-id"
            data-profile-id
          >
            @${esc(requestedId || "loading")}
          </div>
          <div
            class="prof-loading"
            data-profile-loading
          >
            Loading profile data…
          </div>
        </section>

        <div class="prof-line"></div>

        <section class="prof-stats">
          <div class="prof-stat">
            <b data-stat="videos">—</b>
            <span>Videos</span>
          </div>
          <div class="prof-stat">
            <b data-stat="followers">—</b>
            <span>Followers</span>
          </div>
          <div class="prof-stat">
            <b data-stat="following">—</b>
            <span>Following</span>
          </div>
          <div class="prof-stat">
            <b data-stat="likes">—</b>
            <span>Likes</span>
          </div>
        </section>

        <section>
          <div class="prof-section-title">
            <strong>Recent Videos</strong>
            <button
              type="button"
              id="indo-view-videos"
            >
              View all
            </button>
          </div>
          <div
            class="prof-videos"
            data-profile-videos
          >
            <div class="prof-empty">
              Loading videos…
            </div>
          </div>
        </section>
      </main>
      ${nav("profile")}
    </div>
  `;

  app
    .querySelector("#indo-view-videos")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      go("video");
    });

  return {
    requestedId,
    own,
  };
}

function bindOwnActions(app, name, id) {
  app
    .querySelector("#indo-edit-profile")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      go("edit-profile");
    });

  app
    .querySelector("#indo-settings")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      go("settings");
    });

  app
    .querySelector("#indo-share-profile")
    ?.addEventListener("click", async () => {
      const url =
        `${location.origin}${location.pathname}` +
        `?profile=${encodeURIComponent(id)}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title: `${name} on Indo`,
            url,
          });
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
        }
      } catch {}
    });
}

function showLoadedActions(app, profile, own) {
  if (!own) return;

  const actions = app.querySelector(
    ".prof-actions",
  );
  if (actions) return;

  const stats = app.querySelector(".prof-stats");
  if (!stats) return;

  const wrapper = document.createElement("div");
  wrapper.className = "prof-actions";
  wrapper.innerHTML = `
    <button
      class="prof-btn primary"
      type="button"
      id="indo-edit-profile"
    >
      ✎ Edit Profile
    </button>
    <button
      class="prof-btn"
      type="button"
      id="indo-share-profile"
    >
      Share
    </button>
    <button
      class="prof-btn"
      type="button"
      id="indo-settings"
    >
      ⚙
    </button>
  `;

  stats.insertAdjacentElement(
    "afterend",
    wrapper,
  );

  bindOwnActions(
    app,
    String(
      profile?.name ||
        profile?.displayName ||
        "Profile",
    ),
    String(
      profile?.userId ||
        profile?.username ||
        "",
    ).replace(/^@/, ""),
  );
}

async function hydrate(app, profileArg) {
  const me = auth.currentUser;
  const requestedId = String(
    profileArg?.userId ||
      profileArg?.username ||
      profileArg?.uid ||
      "",
  ).replace(/^@/, "");

  const own =
    Boolean(requestedId) &&
    String(profileArg?.uid || "") ===
      String(me?.uid || "");

  try {
    const profile = requestedId
      ? await profileById(requestedId)
      : await ownProfile();

    if (!profile) {
      throw Error("Profile could not be loaded.");
    }

    const realOwn =
      own ||
      String(profile.uid || "") ===
        String(me?.uid || "");

    applyProfile(
      app,
      profile,
      realOwn,
      requestedId,
    );
    showLoadedActions(app, profile, realOwn);

    const loading = app.querySelector(
      "[data-profile-loading]",
    );
    if (loading) loading.remove();

    const videos = await loadVideos(
      String(profile.uid || ""),
    );

    const grid = app.querySelector(
      "[data-profile-videos]",
    );
    if (grid) {
      grid.innerHTML = videoGrid(videos);
    }
  } catch (error) {
    const loading = app.querySelector(
      "[data-profile-loading]",
    );
    if (loading) {
      loading.textContent =
        "Profile data unavailable";
    }

    const grid = app.querySelector(
      "[data-profile-videos]",
    );
    if (grid) {
      grid.innerHTML =
        '<div class="prof-empty">Could not load videos.</div>';
    }

    console.warn(
      "Profile load failed:",
      error,
    );
    return;
  }

  let refreshing = false;

  const refresh = async () => {
    if (refreshing || document.hidden) return;
    refreshing = true;

    try {
      const fresh = requestedId
        ? await profileById(requestedId)
        : await ownProfile();

      if (fresh) {
        applyProfile(
          app,
          fresh,
          realOwnFromProfile(fresh, me),
          requestedId,
        );
      }
    } catch (error) {
      console.warn(
        "Profile refresh failed:",
        error,
      );
    } finally {
      refreshing = false;
    }
  };

  window.__indoProfileLiveTimer = setInterval(
    refresh,
    POLL_MS,
  );
}

function realOwnFromProfile(profile, me) {
  return (
    String(profile?.uid || "") ===
    String(me?.uid || "")
  );
}

export function renderProfile(
  app,
  profileArg = null,
) {
  styles();

  if (window.__indoProfileLiveTimer) {
    clearInterval(window.__indoProfileLiveTimer);
    window.__indoProfileLiveTimer = null;
  }

  const shell = fastShell(app, profileArg);

  const existingProfile =
    profileArg &&
    !profileArg.profileLoading &&
    profileArg.userId &&
    profileArg.stats
      ? profileArg
      : null;

  if (existingProfile) {
    applyProfile(
      app,
      existingProfile,
      String(existingProfile.uid || "") ===
        String(auth.currentUser?.uid || ""),
      shell.requestedId,
    );
  }

  void hydrate(app, profileArg);
}
