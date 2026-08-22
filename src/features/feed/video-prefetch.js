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

// Do not preload Google Drive media in the background.
// The previous implementation created hidden <video> elements with
// preload="auto" for several Drive files, which could stall the browser
// while the page was rendering. Video playback is now strictly lazy and
// handled by the feed card when a video becomes visible.
function warmVideoMetadata() {
  return;
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
