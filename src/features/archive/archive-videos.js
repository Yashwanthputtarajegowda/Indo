const OPENVERSE_URL = "https://api.openverse.org/v1/videos/";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const DEFAULT_LIMIT = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FIRST_BATCH = 1;
const SOURCE_PAGE_SIZE = 10;
const MAX_PAGES = 8;
const MAX_FILE_SIZE = 700 * 1024 * 1024;

let cache = new Map();

function text(value) { return String(value || "").trim(); }
function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

async function fetchJson(url, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "force-cache", signal: controller.signal });
    if (!response.ok) throw new Error(`Video source request failed (${response.status}).`);
    return response.json();
  } finally { clearTimeout(timer); }
}

function makeItem({ id, source, provider, title, description, url, thumbnailUrl, mimeType, size, duration, creator, createdAt, license }) {
  const playable = safeUrl(url);
  if (!playable) return null;
  const bytes = Number(size || 0);
  if (bytes > MAX_FILE_SIZE) return null;
  return {
    id: `${source}:${id}`, source, provider,
    creator: text(creator) || provider, creatorName: text(creator) || provider,
    title: text(title) || "Kannada video", description: text(description),
    caption: text(description) || text(title), createdAt: Date.parse(text(createdAt)) || 0,
    videoUrl: playable, secureUrl: playable, url: playable,
    thumbnailUrl: safeUrl(thumbnailUrl),
    mimeType: text(mimeType) || "video/webm", size: bytes, duration: Number(duration || 0),
    license: text(license), views: 0, likes: 0, comments: 0, shares: 0, saves: 0, mediaType: "video",
  };
}

async function loadOpenversePage(search, page) {
  const params = new URLSearchParams({
    q: search ? `Kannada ${search}` : "Kannada",
    page: String(page), page_size: String(SOURCE_PAGE_SIZE),
    unstable__sort_by: "indexed_on", unstable__sort_dir: "desc",
  });
  const data = await fetchJson(`${OPENVERSE_URL}?${params.toString()}`);
  return (Array.isArray(data?.results) ? data.results : []).map((item) => makeItem({
    id: text(item.id || item.identifier || item.detail_url), source: "openverse",
    provider: text(item.provider || item.source || "Openverse"), title: item.title,
    description: item.description || item.tags?.join?.(", "), url: item.url,
    thumbnailUrl: item.thumbnail || item.thumbnail_url || item.thumb,
    mimeType: item.filetype || item.mimetype, size: item.filesize, duration: item.duration,
    creator: item.creator, createdAt: item.created_on || item.indexed_on, license: item.license,
  })).filter(Boolean);
}

async function loadCommonsPage(search, offset) {
  const params = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: search ? `Kannada ${search} filetype:video` : "Kannada filetype:video",
    gsrnamespace: "6", gsrlimit: String(SOURCE_PAGE_SIZE), gsroffset: String(offset),
    gsrqiprofile: "classic_noboostlinks", prop: "imageinfo", iiprop: "url|mime|size|extmetadata",
    iiurlwidth: "720", format: "json", origin: "*",
  });
  const data = await fetchJson(`${COMMONS_API}?${params.toString()}`);
  const pages = Object.values(data?.query?.pages || {});
  return pages.map((page) => {
    const info = page?.imageinfo?.[0] || {}, meta = info.extmetadata || {};
    return makeItem({
      id: text(page.pageid || page.title), source: "wikimedia-commons", provider: "Wikimedia Commons",
      title: text(page.title).replace(/^File:/i, ""),
      description: text(meta.ImageDescription?.value || meta.ObjectName?.value),
      url: info.url, thumbnailUrl: info.thumburl || info.url, mimeType: info.mime, size: info.size,
      duration: info.duration, creator: text(meta.Artist?.value || meta.Creator?.value),
      createdAt: meta.DateTimeOriginal?.value || meta.DateTime?.value, license: meta.LicenseShortName?.value,
    });
  }).filter((item) => item && /video\/(webm|mp4|ogg)|\.(webm|mp4|ogv)$/i.test(`${item.mimeType} ${item.url}`));
}

function unique(items) {
  const seen = new Set();
  return items.filter((item) => item?.videoUrl && !seen.has(item.videoUrl) && seen.add(item.videoUrl));
}

export async function loadArchiveKannadaVideosProgressive({ limit = DEFAULT_LIMIT, search = "", force = false, onBatch } = {}) {
  const wanted = Math.min(100, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const key = `${text(search).toLowerCase()}:${wanted}`;
  if (!force) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      if (cached.items.length) onBatch?.(cached.items.slice(0, FIRST_BATCH), true);
      if (cached.items.length > FIRST_BATCH) onBatch?.(cached.items, false);
      return cached.items;
    }
  }

  const all = [];
  let firstSent = false;
  const publish = (newItems) => {
    const merged = unique([...all, ...newItems]).slice(0, wanted);
    all.splice(0, all.length, ...merged);
    if (!firstSent && merged.length) {
      firstSent = true;
      onBatch?.(merged.slice(0, FIRST_BATCH), true);
    }
    onBatch?.(merged, false);
  };

  // First pages race for the first thumbnail. Extra pages fill the feed in the background.
  const firstPage = await Promise.allSettled([
    loadOpenversePage(search, 1),
    loadCommonsPage(search, 0),
  ]);
  for (const result of firstPage) if (result.status === "fulfilled") publish(result.value);

  const remaining = [];
  for (let page = 2; page <= MAX_PAGES; page += 1) {
    remaining.push(loadOpenversePage(search, page));
    remaining.push(loadCommonsPage(search, (page - 1) * SOURCE_PAGE_SIZE));
  }
  for (const result of await Promise.allSettled(remaining)) {
    if (result.status === "fulfilled") publish(result.value);
    if (all.length >= wanted) break;
  }

  cache.set(key, { at: Date.now(), items: all.slice() });
  return all;
}

export async function loadArchiveKannadaVideos(options = {}) {
  let latest = [];
  await loadArchiveKannadaVideosProgressive({ ...options, onBatch: (items) => { latest = items; } });
  return latest;
}

export function startArchiveRefresh({ intervalMs = 300000, onUpdate, getSearch } = {}) {
  const timer = window.setInterval(async () => {
    try {
      const items = await loadArchiveKannadaVideosProgressive({ limit: 100, search: typeof getSearch === "function" ? getSearch() : "", force: true });
      onUpdate?.(items);
    } catch {}
  }, intervalMs);
  return () => window.clearInterval(timer);
}

export function clearArchiveCache() { cache = new Map(); }
