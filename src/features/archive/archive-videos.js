import { preferredLanguage, rankVideos } from "../feed/interest-engine.js";

const OPENVERSE_URL = "https://api.openverse.org/v1/videos/";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const SOURCE_PAGE_SIZE = 20;
const FIRST_BATCH = 1;
const MAX_FILE_SIZE = 700 * 1024 * 1024;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_PAGES_PER_SOURCE = 100;

const LANGUAGE_NAMES = {
  kn: "Kannada", en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil",
  ml: "Malayalam", mr: "Marathi", bn: "Bengali", gu: "Gujarati", pa: "Punjabi",
};

const ALL_TOPICS = [
  "news", "entertainment", "cinema", "music", "comedy", "education", "technology",
  "sports", "history", "culture", "travel", "food", "business", "jobs", "agriculture",
  "health", "science", "nature", "art", "books", "literature", "devotional", "spirituality",
  "interviews", "speeches", "documentary", "kids", "lifestyle", "fashion", "gaming", "local",
];

let cache = new Map();
let sessions = new Map();

function text(value) { return String(value || "").trim(); }
function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}
function normaliseLanguage(language) {
  const raw = text(language).toLowerCase();
  if (LANGUAGE_NAMES[raw]) return raw;
  const hit = Object.entries(LANGUAGE_NAMES).find(([, name]) => name.toLowerCase() === raw);
  return hit?.[0] || "kn";
}
function detectPreferredLanguage() {
  try {
    const keys = ["indo:language", "indo-language", "preferredLanguage", "language", "userLanguage"];
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) return normaliseLanguage(value);
    }
  } catch {}
  return normaliseLanguage(preferredLanguage("kn"));
}
function getTopics(topic = "") {
  const requested = text(topic).toLowerCase();
  return requested ? [requested, ...ALL_TOPICS.filter((item) => item !== requested)] : ALL_TOPICS.slice();
}
function queryFor(language, topic, search = "") {
  const languageName = LANGUAGE_NAMES[normaliseLanguage(language)] || LANGUAGE_NAMES.kn;
  const cleanSearch = text(search);
  return `${languageName} ${cleanSearch} ${text(topic)}`.trim();
}
async function fetchJson(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`Video source request failed (${response.status}).`);
    return response.json();
  } finally { clearTimeout(timer); }
}
function makeItem({ id, source, provider, title, description, url, thumbnailUrl, mimeType, size, duration, creator, createdAt, license, language, topic }) {
  const playable = safeUrl(url);
  if (!playable || Number(size || 0) > MAX_FILE_SIZE) return null;
  return {
    id: `${source}:${id}`, source, provider, language: normaliseLanguage(language), topic: text(topic) || "general",
    creator: text(creator) || provider, creatorName: text(creator) || provider,
    title: text(title) || `${LANGUAGE_NAMES[normaliseLanguage(language)] || "Language"} video`,
    description: text(description), caption: text(description) || text(title),
    createdAt: Date.parse(text(createdAt)) || 0, videoUrl: playable, secureUrl: playable, url: playable,
    thumbnailUrl: safeUrl(thumbnailUrl), mimeType: text(mimeType) || "video/webm", size: Number(size || 0),
    duration: Number(duration || 0), license: text(license), views: 0, likes: 0, comments: 0,
    shares: 0, saves: 0, mediaType: "video",
  };
}
async function loadOpenversePage(language, topic, search, page) {
  const params = new URLSearchParams({ q: queryFor(language, topic, search), page: String(page), page_size: String(SOURCE_PAGE_SIZE), unstable__sort_by: "indexed_on", unstable__sort_dir: "desc" });
  const data = await fetchJson(`${OPENVERSE_URL}?${params.toString()}`);
  return (Array.isArray(data?.results) ? data.results : []).map((item) => makeItem({
    id: text(item.id || item.identifier || item.detail_url), source: "openverse", provider: text(item.provider || item.source || "Openverse"),
    title: item.title, description: item.description || item.tags?.join?.(", "), url: item.url,
    thumbnailUrl: item.thumbnail || item.thumbnail_url || item.thumb, mimeType: item.filetype || item.mimetype,
    size: item.filesize, duration: item.duration, creator: item.creator, createdAt: item.created_on || item.indexed_on,
    license: item.license, language, topic,
  })).filter(Boolean);
}
async function loadCommonsPage(language, topic, search, offset) {
  const params = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: `${queryFor(language, topic, search)} filetype:video`, gsrnamespace: "6",
    gsrlimit: String(SOURCE_PAGE_SIZE), gsroffset: String(offset), gsrqiprofile: "classic_noboostlinks", prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata", iiurlwidth: "720", format: "json", origin: "*",
  });
  const data = await fetchJson(`${COMMONS_API}?${params.toString()}`);
  const pages = Object.values(data?.query?.pages || {});
  return pages.map((page) => {
    const info = page?.imageinfo?.[0] || {}, meta = info.extmetadata || {};
    return makeItem({
      id: text(page.pageid || page.title), source: "wikimedia-commons", provider: "Wikimedia Commons",
      title: text(page.title).replace(/^File:/i, ""), description: text(meta.ImageDescription?.value || meta.ObjectName?.value),
      url: info.url, thumbnailUrl: info.thumburl || info.url, mimeType: info.mime, size: info.size, duration: info.duration,
      creator: text(meta.Artist?.value || meta.Creator?.value), createdAt: meta.DateTimeOriginal?.value || meta.DateTime?.value,
      license: meta.LicenseShortName?.value, language, topic,
    });
  }).filter((item) => item && /video\/(webm|mp4|ogg)|\.(webm|mp4|ogv)$/i.test(`${item.mimeType} ${item.url}`));
}
function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = text(item?.videoUrl).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
function sessionKey({ language, search, topic }) { return `${normaliseLanguage(language)}|${text(search).toLowerCase()}|${text(topic).toLowerCase()}`; }
function getSession(options, force = false) {
  const key = sessionKey(options);
  if (force || !sessions.has(key)) sessions.set(key, {
    language: normaliseLanguage(options.language), search: text(options.search), topics: getTopics(options.topic), topicIndex: 0,
    nextPage: 1, nextOffset: 0, items: [], doneOpenverse: false, doneCommons: false, loading: false,
  });
  return sessions.get(key);
}
function sessionQuery(session) {
  return { language: session.language, topic: session.topics[session.topicIndex % session.topics.length] || "general", search: session.search };
}

export async function loadArchiveKannadaVideosProgressive({ limit = 12, search = "", language = detectPreferredLanguage(), topic = "", force = false, onBatch } = {}) {
  const wanted = Math.max(1, Number(limit) || 12);
  const options = { language: normaliseLanguage(language), search, topic };
  const key = sessionKey(options);
  if (!force) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS && cached.items.length >= wanted) {
      const ranked = rankVideos(cached.items.slice(0, wanted));
      onBatch?.(ranked, false);
      return ranked;
    }
  }
  const session = getSession(options, force);
  if (force) cache.delete(key);
  let firstSent = session.items.length > 0;
  let roundsWithoutNewItems = 0;

  while (session.items.length < wanted && roundsWithoutNewItems < session.topics.length * 2) {
    if (session.loading) break;
    session.loading = true;
    const query = sessionQuery(session);
    const page = session.nextPage;
    const offset = session.nextOffset;
    const results = await Promise.allSettled([
      !session.doneOpenverse && page <= MAX_PAGES_PER_SOURCE ? loadOpenversePage(query.language, query.topic, query.search, page) : Promise.resolve([]),
      !session.doneCommons && offset / SOURCE_PAGE_SIZE < MAX_PAGES_PER_SOURCE ? loadCommonsPage(query.language, query.topic, query.search, offset) : Promise.resolve([]),
    ]);
    session.loading = false;
    const newItems = [];
    if (results[0].status === "fulfilled") {
      const items = results[0].value || [];
      newItems.push(...items);
      if (items.length === 0 || (items.length < SOURCE_PAGE_SIZE && page >= 2)) session.doneOpenverse = true;
    }
    if (results[1].status === "fulfilled") {
      const items = results[1].value || [];
      newItems.push(...items);
      if (items.length === 0 || (items.length < SOURCE_PAGE_SIZE && offset > 0)) session.doneCommons = true;
    }
    const before = session.items.length;
    session.items = unique([...session.items, ...newItems]);
    session.nextPage += 1;
    session.nextOffset += SOURCE_PAGE_SIZE;
    if (session.items.length === before) roundsWithoutNewItems += 1; else roundsWithoutNewItems = 0;
    const ranked = rankVideos(session.items.slice(0, wanted));
    if (!firstSent && session.items.length) { firstSent = true; onBatch?.(ranked.slice(0, FIRST_BATCH), true); }
    onBatch?.(ranked, false);

    session.topicIndex += 1;
    if (session.topicIndex % session.topics.length === 0) {
      session.doneOpenverse = false;
      session.doneCommons = false;
      session.nextPage = 1;
      session.nextOffset = 0;
    }
    if (!newItems.length && session.topicIndex >= session.topics.length * 2) break;
  }
  cache.set(key, { at: Date.now(), items: session.items.slice() });
  return rankVideos(session.items.slice(0, wanted));
}
export async function loadArchiveKannadaVideos(options = {}) {
  let latest = [];
  await loadArchiveKannadaVideosProgressive({ ...options, onBatch: (items) => { latest = items; } });
  return latest;
}
export function startArchiveRefresh({ intervalMs = 300000, onUpdate, getSearch, getLanguage, getTopic } = {}) {
  const timer = window.setInterval(async () => {
    try {
      const items = await loadArchiveKannadaVideosProgressive({ limit: 12, search: typeof getSearch === "function" ? getSearch() : "", language: typeof getLanguage === "function" ? getLanguage() : detectPreferredLanguage(), topic: typeof getTopic === "function" ? getTopic() : "", force: true });
      onUpdate?.(items);
    } catch {}
  }, intervalMs);
  return () => window.clearInterval(timer);
}
export function clearArchiveCache() { cache = new Map(); sessions = new Map(); }
export { detectPreferredLanguage, normaliseLanguage, ALL_TOPICS };
