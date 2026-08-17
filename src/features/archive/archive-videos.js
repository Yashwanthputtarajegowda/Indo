import { preferredLanguage, rankVideos } from "../feed/interest-engine.js";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const ARCHIVE_API = "https://archive.org/advancedsearch.php";
const SOURCE_PAGE_SIZE = 20;
const MAX_FILE_SIZE = 700 * 1024 * 1024;
const CACHE_TTL_MS = 90 * 1000;
const MAX_PAGES_PER_SOURCE = 20;

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
    for (const key of ["indo:language", "indo-language", "preferredLanguage", "language", "userLanguage"]) {
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
  return `${languageName} ${text(search)} ${text(topic)}`.trim();
}
async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`Source request failed (${response.status}).`);
    return await response.json();
  } finally { clearTimeout(timer); }
}
function makeItem({ id, source, provider, title, description, url, thumbnailUrl, mimeType, size, duration, creator, createdAt, license, language, topic }) {
  const playable = safeUrl(url);
  if (!playable || Number(size || 0) > MAX_FILE_SIZE) return null;
  if (!/^(video\/(mp4|webm|ogg)|application\/ogg)$/i.test(text(mimeType)) && !/\.(mp4|webm|ogv|ogg)(?:$|[?#])/i.test(playable)) return null;
  return {
    id: `${source}:${text(id || playable)}`,
    source, provider, language: normaliseLanguage(language), topic: text(topic) || "general",
    creator: text(creator) || provider, creatorName: text(creator) || provider,
    title: text(title) || `${LANGUAGE_NAMES[normaliseLanguage(language)] || "Language"} video`,
    description: text(description), caption: text(description) || text(title),
    createdAt: Date.parse(text(createdAt)) || 0, videoUrl: playable, secureUrl: playable, url: playable,
    thumbnailUrl: safeUrl(thumbnailUrl), mimeType: text(mimeType) || "video/webm", size: Number(size || 0),
    duration: Number(duration || 0), license: text(license), views: 0, likes: 0, comments: 0,
    shares: 0, saves: 0, mediaType: "video",
  };
}
async function loadCommonsPage(language, topic, search, offset) {
  const query = `${queryFor(language, topic, search)} filetype:video`;
  const params = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: query, gsrnamespace: "6",
    gsrlimit: String(SOURCE_PAGE_SIZE), gsroffset: String(offset), prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata", iiurlwidth: "720", format: "json", formatversion: "2", origin: "*",
  });
  const data = await fetchJson(`${COMMONS_API}?${params.toString()}`);
  const pages = Array.isArray(data?.query?.pages) ? data.query.pages : Object.values(data?.query?.pages || {});
  return pages.map((page) => {
    const info = page?.imageinfo?.[0] || {}, meta = info.extmetadata || {};
    return makeItem({
      id: page?.pageid || page?.title, source: "wikimedia-commons", provider: "Wikimedia Commons",
      title: text(page?.title).replace(/^File:/i, ""), description: text(meta.ImageDescription?.value || meta.ObjectName?.value),
      url: info.url, thumbnailUrl: info.thumburl || info.url, mimeType: info.mime, size: info.size,
      creator: text(meta.Artist?.value || meta.Creator?.value), createdAt: meta.DateTimeOriginal?.value || meta.DateTime?.value,
      license: meta.LicenseShortName?.value, language, topic,
    });
  }).filter(Boolean);
}
async function loadArchivePage(language, topic, search, page) {
  const query = encodeURIComponent(`mediatype:movies AND (${queryFor(language, topic, search).split(/\s+/).filter(Boolean).map((word) => `title:"${word}" OR subject:"${word}"`).join(" OR ")})`);
  const data = await fetchJson(`${ARCHIVE_API}?q=${query}&fl[]=identifier&fl[]=title&fl[]=description&fl[]=creator&rows=${SOURCE_PAGE_SIZE}&page=${page}&output=json`);
  const docs = Array.isArray(data?.response?.docs) ? data.response.docs : [];
  const results = await Promise.all(docs.map(async (doc) => {
    const identifier = text(doc?.identifier);
    if (!identifier) return null;
    try {
      const meta = await fetchJson(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
      const files = Array.isArray(meta?.files) ? meta.files : [];
      const candidates = files.filter((file) => {
        const name = text(file?.name);
        const format = text(file?.format).toLowerCase();
        const size = Number(file?.size || 0);
        return size > 0 && size <= MAX_FILE_SIZE && (format.includes("mpeg4") || format.includes("h.264") || /\.(mp4|webm|ogv)$/i.test(name)) && !/(thumb|sample|preview|_files\.xml)/i.test(name);
      }).sort((a, b) => Number(a?.size || 0) - Number(b?.size || 0));
      const file = candidates[0];
      if (!file) return null;
      const path = text(file.name).split("/").map(encodeURIComponent).join("/");
      return makeItem({
        id: identifier, source: "internet-archive", provider: "Internet Archive", title: doc?.title,
        description: doc?.description, creator: doc?.creator, url: `https://archive.org/download/${encodeURIComponent(identifier)}/${path}`,
        mimeType: "video/mp4", size: file?.size, license: meta?.metadata?.licenseurl || meta?.metadata?.license, language, topic,
      });
    } catch { return null; }
  }));
  return results.filter(Boolean);
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
    commonsOffset: 0, archivePage: 1, items: [], loading: false,
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
      const ranked = rankVideos(unique(cached.items).slice(0, wanted));
      onBatch?.(ranked, false);
      return ranked;
    }
  }
  const session = getSession(options, force);
  if (force) cache.delete(key);
  let roundsWithoutNewItems = 0;
  while (session.items.length < wanted && roundsWithoutNewItems < Math.max(6, session.topics.length)) {
    if (session.loading) break;
    session.loading = true;
    const query = sessionQuery(session);
    const [commonsResult, archiveResult] = await Promise.allSettled([
      loadCommonsPage(query.language, query.topic, query.search, session.commonsOffset),
      loadArchivePage(query.language, query.topic, query.search, session.archivePage),
    ]);
    session.loading = false;
    const newItems = [];
    if (commonsResult.status === "fulfilled") newItems.push(...commonsResult.value);
    if (archiveResult.status === "fulfilled") newItems.push(...archiveResult.value);
    const before = session.items.length;
    session.items = unique([...session.items, ...newItems]);
    session.commonsOffset += SOURCE_PAGE_SIZE;
    session.archivePage += 1;
    if (session.items.length === before) roundsWithoutNewItems += 1; else roundsWithoutNewItems = 0;
    const ranked = rankVideos(session.items.slice(0, wanted));
    onBatch?.(ranked, false);
    session.topicIndex += 1;
  }
  const result = rankVideos(unique(session.items).slice(0, wanted));
  cache.set(key, { at: Date.now(), items: session.items.slice() });
  return result;
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
