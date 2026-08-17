const OPENVERSE_URL = "https://api.openverse.org/v1/videos/";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const SOURCE_PAGE_SIZE = 10;
const FIRST_BATCH = 1;
const MAX_FILE_SIZE = 700 * 1024 * 1024;
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = new Map();
let sessions = new Map();

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
    thumbnailUrl: safeUrl(thumbnailUrl), mimeType: text(mimeType) || "video/webm",
    size: bytes, duration: Number(duration || 0), license: text(license),
    views: 0, likes: 0, comments: 0, shares: 0, saves: 0, mediaType: "video",
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
    action: "query", generator: "search",
    gsrsearch: search ? `Kannada ${search} filetype:video` : "Kannada filetype:video",
    gsrnamespace: "6", gsrlimit: String(SOURCE_PAGE_SIZE), gsroffset: String(offset),
    gsrqiprofile: "classic_noboostlinks", prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata", iiurlwidth: "720", format: "json", origin: "*",
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

function sessionKey(search) { return text(search).toLowerCase(); }
function getSession(search, force = false) {
  const key = sessionKey(search);
  if (force || !sessions.has(key)) sessions.set(key, { nextPage: 1, nextOffset: 0, items: [], doneOpenverse: false, doneCommons: false, loading: false });
  return sessions.get(key);
}

export async function loadArchiveKannadaVideosProgressive({ limit = 12, search = "", force = false, onBatch } = {}) {
  const wanted = Math.max(1, Number(limit) || 12);
  const key = sessionKey(search);
  if (!force) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS && cached.items.length >= wanted) {
      onBatch?.(cached.items.slice(0, wanted), false);
      return cached.items.slice(0, wanted);
    }
  }

  const session = getSession(search, force);
  if (force) cache.delete(key);
  let firstSent = session.items.length > 0;

  while (session.items.length < wanted && (!session.doneOpenverse || !session.doneCommons)) {
    if (session.loading) break;
    session.loading = true;
    const page = session.nextPage;
    const offset = session.nextOffset;
    const results = await Promise.allSettled([
      session.doneOpenverse ? Promise.resolve([]) : loadOpenversePage(search, page),
      session.doneCommons ? Promise.resolve([]) : loadCommonsPage(search, offset),
    ]);
    session.loading = false;

    const openverse = results[0];
    const commons = results[1];
    const newItems = [];
    if (openverse.status === "fulfilled") {
      const items = openverse.value || [];
      newItems.push(...items);
      if (items.length < SOURCE_PAGE_SIZE) session.doneOpenverse = true;
    } else if (page >= 3) session.doneOpenverse = true;
    if (commons.status === "fulfilled") {
      const items = commons.value || [];
      newItems.push(...items);
      if (items.length < SOURCE_PAGE_SIZE) session.doneCommons = true;
    } else if (offset >= SOURCE_PAGE_SIZE * 2) session.doneCommons = true;

    session.items = unique([...session.items, ...newItems]);
    session.nextPage += 1;
    session.nextOffset += SOURCE_PAGE_SIZE;

    if (!firstSent && session.items.length) {
      firstSent = true;
      onBatch?.(session.items.slice(0, FIRST_BATCH), true);
    }
    onBatch?.(session.items.slice(), false);
    if (!newItems.length) break;
  }

  cache.set(key, { at: Date.now(), items: session.items.slice() });
  return session.items.slice(0, wanted);
}

export async function loadArchiveKannadaVideos(options = {}) {
  let latest = [];
  await loadArchiveKannadaVideosProgressive({ ...options, onBatch: (items) => { latest = items; } });
  return latest;
}

export function startArchiveRefresh({ intervalMs = 300000, onUpdate, getSearch } = {}) {
  const timer = window.setInterval(async () => {
    try {
      const items = await loadArchiveKannadaVideosProgressive({ limit: 12, search: typeof getSearch === "function" ? getSearch() : "", force: true });
      onUpdate?.(items);
    } catch {}
  }, intervalMs);
  return () => window.clearInterval(timer);
}

export function clearArchiveCache() { cache = new Map(); sessions = new Map(); }
