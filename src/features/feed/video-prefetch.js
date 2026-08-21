let started = false;
let cachedVideos = null;
let cachedFollowing = null;
let patched = false;

function apiBase() {
  return window.INDO_API_BASE || "";
}

function videoUrl() {
  return `${apiBase()}/api/media/videos?type=video&limit=50`;
}

function followingUrl(uid) {
  return `${apiBase()}/api/social/following/${encodeURIComponent(uid)}`;
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function isVideoRequest(input) {
  try {
    const url = typeof input === "string" ? input : input?.url;
    return url === videoUrl();
  } catch {
    return false;
  }
}

function followingRequestUid(input) {
  try {
    const url = typeof input === "string" ? input : input?.url;
    const prefix = `${apiBase()}/api/social/following/`;
    if (!String(url || "").startsWith(prefix)) return "";
    return decodeURIComponent(String(url).slice(prefix.length).split("?")[0]);
  } catch {
    return "";
  }
}

function patchFetch() {
  if (patched || typeof window.fetch !== "function") return;
  patched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const noStore = String(init?.cache || "").toLowerCase() === "no-store";

    if (isVideoRequest(input) && !noStore && cachedVideos) {
      return jsonResponse(cachedVideos);
    }

    const uid = followingRequestUid(input);
    if (uid && !noStore && cachedFollowing && cachedFollowing.uid === uid) {
      return jsonResponse(cachedFollowing.payload);
    }

    return originalFetch(input, init);
  };
}

async function fetchVideos() {
  const response = await fetch(videoUrl(), { cache: "no-store" });
  if (!response.ok) throw new Error(`Video prefetch failed: ${response.status}`);
  return response.json();
}

async function fetchFollowing() {
  try {
    const { auth } = await import("../auth/firebase-client.js");
    const user = auth.currentUser;
    if (!user) return { uid: "", payload: { ok: true, items: [] } };
    const token = await user.getIdToken();
    const response = await fetch(followingUrl(user.uid), {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await response.json().catch(() => ({}));
    return { uid: user.uid, payload: response.ok ? payload : { ok: true, items: [] } };
  } catch {
    return { uid: "", payload: { ok: true, items: [] } };
  }
}

function isGoogleDriveVideo(video) {
  const provider = String(video?.storage?.provider || video?.googleDrive?.provider || "").trim().toLowerCase();
  const fileId = String(video?.googleDrive?.fileId || "").trim();
  return provider === "google-drive" || Boolean(fileId);
}

function driveStreamUrl(video) {
  const base = apiBase();
  const id = String(video?.id || "").trim();
  if (!base || !id || !isGoogleDriveVideo(video)) return "";
  return `${base}/api/google-drive/videos/${encodeURIComponent(id)}/stream`;
}

function warmVideoMetadata(payload) {
  const videos = Array.isArray(payload?.videos) ? payload.videos : [];
  const driveVideos = videos.filter(isGoogleDriveVideo).slice(0, 4);
  if (!driveVideos.length) return;

  requestAnimationFrame(() => {
    driveVideos.forEach((video) => {
      const src = driveStreamUrl(video);
      if (!src) return;
      const el = document.createElement("video");
      el.preload = "auto";
      el.muted = true;
      el.playsInline = true;
      el.setAttribute("playsinline", "");
      el.setAttribute("muted", "");
      el.style.position = "fixed";
      el.style.width = "1px";
      el.style.height = "1px";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      el.style.left = "-9999px";
      el.src = src;
      document.body.appendChild(el);
      try { el.load(); } catch {}
      setTimeout(() => {
        try {
          el.pause();
          el.removeAttribute("src");
          el.load();
          el.remove();
        } catch {}
      }, 30000);
    });
  });
}

export function prefetchVideoSection() {
  patchFetch();
  if (started) return Promise.all([cachedVideos, cachedFollowing]);
  started = true;

  cachedVideos = fetchVideos()
    .then((payload) => {
      warmVideoMetadata(payload);
      return payload;
    })
    .catch((error) => {
      console.warn("Background video prefetch failed:", error);
      return { ok: false, videos: [] };
    });

  cachedFollowing = fetchFollowing();

  return Promise.all([cachedVideos, cachedFollowing]);
}
