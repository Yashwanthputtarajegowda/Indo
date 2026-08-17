const OPENVERSE_URL = "https://api.openverse.org/v1/videos/";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const DEFAULT_LIMIT = 100;
const CACHE_TTL_MS = 55 * 1000;
const FIRST_BATCH = 5;
const MAX_FILE_SIZE = 700 * 1024 * 1024;

let cache = new Map();

function text(value) { return String(value || "").trim(); }
function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

async function fetchJson(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Video source request failed (${response.status}).`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function makeItem({ id, source, provider, title, description, url, mimeType, size, duration, creator, createdAt, license }) {
  const playable = safeUrl(url);
  if (!playable) return null;
  const bytes = Number(size || 0);
  if (bytes > MAX_FILE_SIZE) return null;
  return {
    id: `${source}:${id}`,
    source,
    provider,
    creator: text(creator) || provider,
    creatorName: text(creator) || provider,
    title: text(title) || "Kannada video",
    description: text(description),
    caption: text(description) || text(title),
    createdAt: Date.parse(text(createdAt)) || 0,
    videoUrl: playable,
    secureUrl: playable,
    url: playable,
    mimeType: text(mimeType) || "video/webm",
    size: bytes,
    duration: Number(duration || 0),
    license: text(license),
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    mediaType: "video",
  };
}

async function loadOpenverse(search, limit) {
  const params = new URLSearchParams({
    q: search ? `Kannada ${search}` : "Kannada",
    page: "1",
    page_size: String(Math.min(40, Math.max(limit, 20))),
  });
  const data = await fetchJson(`${OPENVERSE_URL}?${params.toString()}`);
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.map((item) => makeItem({
    id: text(item.id || item.identifier || item.detail_url),
    source: "openverse",
    provider: text(item.provider || item.source || "Openverse"),
    title: item.title,
    description: item.description || item.tags?.join?.(", "),
    url: item.url,
    mimeType: item.filetype || item.mimetype,
    size: item.filesize,
    duration: item.duration,
    creator: item.creator,
    createdAt: item.created_on || item.indexed_on,
    license: item.license,
  })).filter(Boolean);
}

async function loadCommons(search, limit) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: search ? `Kannada ${search}` : "Kannada",
    gsrnamespace: "6",
    gsrlimit: String(Math.min(30, Math.max(limit, 15))),
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: "720",
    format: "json",
    origin: "*",
  });
  const data = await fetchJson(`${COMMONS_API}?${params.toString()}`);
  const pages = Object.values(data?.query?.pages || {});
  return pages.map((page) => {
    const info = page?.imageinfo?.[0] || {};
    const meta = info.extmetadata || {};
    const title = text(page.title).replace(/^File:/i, "");
    const description = text(meta.ImageDescription?.value || meta.ObjectName?.value);
    const creator = text(meta.Artist?.value || meta.Creator?.value);
    return makeItem({
      id: text(page.pageid || page.title),
      source: "wikimedia-commons",
      provider: "Wikimedia Commons",
      title,
      description,
      url: info.url,
      mimeType: info.mime,
      size: info.size,
      duration: info.duration,
      creator,
      createdAt: meta.DateTimeOriginal?.value || meta.DateTime?.value,
      license: meta.LicenseShortName?.value,
    });
  }).filter((item) => item && /video\/(webm|mp4|ogg)|\.(webm|mp4|ogv)$/i.test(`${item.mimeType} ${item.url}`));
}

function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.videoUrl;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function loadArchiveKannadaVideosProgressive({ limit = DEFAULT_LIMIT, search = "", force = false, onBatch } = {}) {
  const wanted = Math.min(100, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const key = `${text(search).toLowerCase()}:${wanted}`;
  if (!force) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      const first = cached.items.slice(0, FIRST_BATCH);
      if (first.length) onBatch?.(first, true);
      if (cached.items.length > first.length) onBatch?.(cached.items, false);
      return cached.items;
    }
  }

  const [openverse, commons] = await Promise.allSettled([
    loadOpenverse(search, wanted),
    loadCommons(search, wanted),
  ]);
  const items = unique([
    ...(openverse.status === "fulfilled" ? openverse.value : []),
    ...(commons.status === "fulfilled" ? commons.value : []),
  ]).slice(0, wanted);

  if (items.length) onBatch?.(items.slice(0, FIRST_BATCH), true);
  onBatch?.(items, false);
  cache.set(key, { at: Date.now(), items });
  return items;
}

export async function loadArchiveKannadaVideos(options = {}) {
  let latest = [];
  await loadArchiveKannadaVideosProgressive({
    ...options,
    onBatch: (items) => { latest = items; },
  });
  return latest;
}

export function startArchiveRefresh({ intervalMs = 60000, onUpdate, getSearch } = {}) {
  const timer = window.setInterval(async () => {
    try {
      const items = await loadArchiveKannadaVideosProgressive({
        limit: 100,
        search: typeof getSearch === "function" ? getSearch() : "",
        force: true,
      });
      onUpdate?.(items);
    } catch (error) {
      console.warn("Kannada video source refresh failed:", error);
    }
  }, intervalMs);
  return () => window.clearInterval(timer);
}

export function clearArchiveCache() { cache = new Map(); }
