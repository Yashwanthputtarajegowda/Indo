const IA_SEARCH_URL = "https://archive.org/advancedsearch.php";
const IA_METADATA_BASE = "https://archive.org/metadata/";
const DEFAULT_LIMIT = 100;
const METADATA_CONCURRENCY = 8;
const CACHE_TTL_MS = 55 * 1000;

let cache = new Map();

function encode(value) {
  return encodeURIComponent(String(value || ""));
}

function escapeFileName(value) {
  return String(value || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function pickVideoFile(files = []) {
  const candidates = files
    .filter((file) => file && file.name && !file.private)
    .map((file) => {
      const name = String(file.name);
      const format = String(file.format || "").toLowerCase();
      const source = `${name} ${format}`.toLowerCase();
      let score = 0;
      if (/\.mp4$/i.test(name)) score += 100;
      if (source.includes("mpeg4") || source.includes("h.264")) score += 60;
      if (source.includes("video")) score += 20;
      if (file.source === "original") score += 10;
      if (file.size) score += 5;
      return { file, score };
    })
    .filter(({ file }) => /\.(mp4|m4v|webm|mov)$/i.test(String(file.name || "")))
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.file || null;
}

function isLikelyPlayableUrl(url) {
  return /\.(mp4|m4v|webm|mov)(\?|$)/i.test(String(url || ""));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Archive request failed (${response.status}).`);
  return response.json();
}

function buildQuery(search = "") {
  const normalized = String(search || "").trim();
  const kannada = "(title:kannada OR subject:kannada OR description:kannada OR language:kannada)";
  if (!normalized) return `mediatype:movies AND ${kannada}`;
  const safe = normalized.replace(/([+\-!(){}\[\]^\"~*?:\\/])/g, "\\$1");
  return `mediatype:movies AND ${kannada} AND (title:${safe} OR subject:${safe} OR description:${safe})`;
}

async function searchIdentifiers(search, limit) {
  const params = new URLSearchParams();
  params.set("q", buildQuery(search));
  params.set("fl[]", "identifier");
  params.append("fl[]", "title");
  params.append("fl[]", "description");
  params.append("fl[]", "subject");
  params.append("fl[]", "date");
  params.set("rows", String(Math.min(200, Math.max(limit * 2, 120))));
  params.set("page", "1");
  params.set("output", "json");
  params.append("sort[]", "date desc");
  return fetchJson(`${IA_SEARCH_URL}?${params.toString()}`);
}

async function resolveItem(item) {
  const identifier = String(item?.identifier || "").trim();
  if (!identifier) return null;

  try {
    const data = await fetchJson(`${IA_METADATA_BASE}${encode(identifier)}`);
    const files = Array.isArray(data?.files) ? data.files : [];
    const file = pickVideoFile(files);
    if (!file) return null;

    const url = `https://archive.org/download/${encode(identifier)}/${escapeFileName(file.name)}`;
    if (!isLikelyPlayableUrl(url)) return null;

    return {
      id: `archive:${identifier}:${file.name}`,
      source: "internet-archive",
      archiveIdentifier: identifier,
      creator: "Internet Archive",
      creatorName: "Internet Archive",
      title: String(item.title || data?.metadata?.title || identifier),
      description: String(item.description || data?.metadata?.description || ""),
      caption: String(item.description || data?.metadata?.description || ""),
      createdAt: Date.parse(String(item.date || data?.metadata?.date || "")) || 0,
      videoUrl: url,
      secureUrl: url,
      url,
      mimeType: /\.webm$/i.test(file.name) ? "video/webm" : "video/mp4",
      size: Number(file.size || 0),
      duration: Number(file.length || 0),
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      mediaType: "video",
    };
  } catch (error) {
    console.warn("Internet Archive item unavailable:", identifier, error?.message || error);
    return null;
  }
}

async function mapConcurrent(items, worker, concurrency) {
  const output = [];
  let index = 0;
  async function runner() {
    while (true) {
      const current = index++;
      if (current >= items.length) return;
      const value = await worker(items[current]);
      if (value) output.push(value);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, runner));
  return output;
}

export async function loadArchiveKannadaVideos({ limit = DEFAULT_LIMIT, search = "", force = false } = {}) {
  const wanted = Math.min(100, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const key = `${String(search || "").trim().toLowerCase()}:${wanted}`;
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.items;

  const searchData = await searchIdentifiers(search, wanted);
  const docs = Array.isArray(searchData?.response?.docs) ? searchData.response.docs : [];
  const resolved = await mapConcurrent(docs, resolveItem, METADATA_CONCURRENCY);

  const seen = new Set();
  const items = resolved
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .filter((item) => {
      const keyValue = `${item.archiveIdentifier}:${item.videoUrl}`;
      if (seen.has(keyValue)) return false;
      seen.add(keyValue);
      return true;
    })
    .slice(0, wanted);

  cache.set(key, { at: Date.now(), items });
  return items;
}

export function startArchiveRefresh({ intervalMs = 60000, getItems, onUpdate, getSearch } = {}) {
  const timer = window.setInterval(async () => {
    try {
      const search = typeof getSearch === "function" ? getSearch() : "";
      const items = await loadArchiveKannadaVideos({ limit: 100, search, force: true });
      if (typeof onUpdate === "function" && typeof getItems === "function") onUpdate(items, getItems());
    } catch (error) {
      console.warn("Internet Archive refresh failed:", error);
    }
  }, intervalMs);
  return () => window.clearInterval(timer);
}

export function clearArchiveCache() {
  cache = new Map();
}
