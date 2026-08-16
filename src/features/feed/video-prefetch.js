const CACHE_KEY = "videos:type=video&limit=50";
let started = false;
let cached = null;
let patched = false;

function apiBase() {
  return window.INDO_API_BASE || "";
}

function targetUrl() {
  return `${apiBase()}/api/media/videos?type=video&limit=50`;
}

function sameTarget(input) {
  try {
    const url = typeof input === "string" ? input : input?.url;
    return url === targetUrl();
  } catch {
    return false;
  }
}

function patchFetch() {
  if (patched || typeof window.fetch !== "function") return;
  patched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    if (sameTarget(input) && !init?.cache?.includes?.("no-store")) {
      if (!cached) {
        cached = prefetchVideoData();
      }
      try {
        const payload = await cached;
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return originalFetch(input, init);
      }
    }
    return originalFetch(input, init);
  };
}

async function prefetchVideoData() {
  const response = await fetch(targetUrl(), { cache: "no-store" });
  if (!response.ok) throw new Error(`Video prefetch failed: ${response.status}`);
  const payload = await response.json();
  const videos = Array.isArray(payload?.videos) ? payload.videos : [];

  // Warm browser media metadata for the first few videos so the Video section
  // can paint faster after navigation without downloading full files.
  requestAnimationFrame(() => {
    videos.slice(0, 8).forEach((video) => {
      const src = String(video?.secureUrl || video?.videoUrl || video?.url || "").trim();
      if (!src) return;
      const el = document.createElement("video");
      el.preload = "metadata";
      el.muted = true;
      el.playsInline = true;
      el.src = src;
      el.load();
      setTimeout(() => {
        try {
          el.removeAttribute("src");
          el.load();
        } catch {}
      }, 15000);
    });
  });

  return payload;
}

export function prefetchVideoSection() {
  patchFetch();
  if (started) return cached;
  started = true;
  cached = prefetchVideoData().catch((error) => {
    console.warn("Background video prefetch failed:", error);
    return { ok: false, videos: [] };
  });
  return cached;
}
