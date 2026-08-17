const IA_SEARCH_URL = "https://archive.org/advancedsearch.php";
const IA_METADATA_BASE = "https://archive.org/metadata/";
const DEFAULT_LIMIT = 100;
const CACHE_TTL_MS = 55 * 1000;
const FIRST_BATCH = 3;
const METADATA_CONCURRENCY = 20;

let cache = new Map();

function encode(value) { return encodeURIComponent(String(value || "")); }
function escapeFileName(value) { return String(value || "").split("/").map((part) => encodeURIComponent(part)).join("/"); }

function videoFileScore(file) {
  if (!file || file.private || !file.name) return -Infinity;
  const name = String(file.name);
  const lower = `${name} ${String(file.format || "")}`.toLowerCase();
  if (!/\.(mp4|m4v|webm|mov)$/i.test(name)) return -Infinity;
  let score = 0;
  if (/\.mp4$/i.test(name)) score += 1000;
  if (lower.includes("mpeg4") || lower.includes("h.264") || lower.includes("h264")) score += 250;
  if (lower.includes("video")) score += 40;
  if (lower.includes("original")) score -= 30;
  if (file.source === "original") score -= 20;
  const size = Number(file.size || 0);
  if (size > 0 && size < 500 * 1024 * 1024) score += 20;
  if (size > 1024 * 1024 * 1024) score -= 50;
  return score;
}

function pickVideoFiles(files = []) {
  return files
    .filter((file) => videoFileScore(file) > -Infinity)
    .sort((a, b) => videoFileScore(b) - videoFileScore(a))
    .slice(0, 6);
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
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
  params.set("fl[]", "identifier"); params.append("fl[]", "title"); params.append("fl[]", "description"); params.append("fl[]", "subject"); params.append("fl[]", "date");
  params.set("rows", String(Math.min(60, Math.max(limit, FIRST_BATCH * 8))));
  params.set("page", "1"); params.set("output", "json"); params.append("sort[]", "date desc");
  return fetchJson(`${IA_SEARCH_URL}?${params.toString()}`);
}

async function resolveItem(item) {
  const identifier = String(item?.identifier || "").trim();
  if (!identifier) return null;
  try {
    const data = await fetchJson(`${IA_METADATA_BASE}${encode(identifier)}`);
    const files = pickVideoFiles(Array.isArray(data?.files) ? data.files : []);
    if (!files.length) return null;
    const candidates = files.map((file) => `https://archive.org/download/${encode(identifier)}/${escapeFileName(file.name)}`);
    const primary = candidates[0];
    const primaryFile = files[0];
    return {
      id: `archive:${identifier}:${primaryFile.name}`,
      source: "internet-archive",
      archiveIdentifier: identifier,
      archiveVideoCandidates: candidates,
      creator: "Internet Archive",
      creatorName: "Internet Archive",
      title: String(item.title || data?.metadata?.title || identifier),
      description: String(item.description || data?.metadata?.description || ""),
      caption: String(item.description || data?.metadata?.description || ""),
      createdAt: Date.parse(String(item.date || data?.metadata?.date || "")) || 0,
      videoUrl: primary,
      secureUrl: primary,
      url: primary,
      mimeType: /\.webm$/i.test(primaryFile.name) ? "video/webm" : "video/mp4",
      size: Number(primaryFile.size || 0),
      duration: Number(primaryFile.length || 0),
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      mediaType: "video",
    };
  } catch { return null; }
}

function addUnique(items, value, seen) {
  if (!value) return false;
  const key = `${value.archiveIdentifier}:${value.videoUrl}`;
  if (seen.has(key)) return false;
  seen.add(key); items.push(value); return true;
}

export async function loadArchiveKannadaVideosProgressive({ limit=DEFAULT_LIMIT, search="", force=false, onBatch } = {}) {
  const wanted = Math.min(100, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const key = `${String(search||"").trim().toLowerCase()}:${wanted}`;
  if (!force) {
    const cached = cache.get(key);
    if (cached && Date.now()-cached.at < CACHE_TTL_MS) {
      const first = cached.items.slice(0,FIRST_BATCH); if (first.length) onBatch?.(first,true); if (cached.items.length>first.length) onBatch?.(cached.items,false); return cached.items;
    }
  }
  const searchData = await searchIdentifiers(search,wanted);
  const docs = Array.isArray(searchData?.response?.docs) ? searchData.response.docs : [];
  const items=[], seen=new Set(); let firstBatchSent=false, cursor=0;
  const worker = async () => {
    while (true) {
      const index=cursor++; if (index>=docs.length || items.length>=wanted) return;
      const resolved=await resolveItem(docs[index]); if (!resolved || !addUnique(items,resolved,seen)) continue;
      items.sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
      if (!firstBatchSent && items.length>=FIRST_BATCH) { firstBatchSent=true; onBatch?.(items.slice(0,FIRST_BATCH),true); }
      else if (firstBatchSent && items.length<Math.min(wanted,20)) onBatch?.(items.slice(),false);
    }
  };
  await Promise.all(Array.from({length:Math.min(METADATA_CONCURRENCY,docs.length)},worker));
  items.sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
  const finalItems=items.slice(0,wanted); cache.set(key,{at:Date.now(),items:finalItems});
  if (!firstBatchSent && finalItems.length) onBatch?.(finalItems.slice(0,FIRST_BATCH),true);
  onBatch?.(finalItems,false); return finalItems;
}

export async function loadArchiveKannadaVideos(options={}) { let latest=[]; await loadArchiveKannadaVideosProgressive({...options,onBatch:(items)=>{latest=items;}}); return latest; }
export function startArchiveRefresh({intervalMs=60000,onUpdate,getSearch}={}) { const timer=window.setInterval(async()=>{ try { const items=await loadArchiveKannadaVideosProgressive({limit:100,search:typeof getSearch==="function"?getSearch():"",force:true}); onUpdate?.(items); } catch(error){ console.warn("Internet Archive refresh failed:",error); } },intervalMs); return ()=>window.clearInterval(timer); }
export function clearArchiveCache(){ cache=new Map(); }
