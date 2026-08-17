import { preferredLanguage, rankVideos } from "../feed/interest-engine.js";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const PEERTUBE_API = "https://peertube.cpy.re/api/v1/search/videos";
const ARCHIVE_API = "https://archive.org/advancedsearch.php";
const LOC_API = "https://www.loc.gov/film-and-videos/";
const PAGE_SIZE = 12;
const MAX_FILE_SIZE = 700 * 1024 * 1024;
const CACHE_TTL_MS = 5 * 60 * 1000;
const API_TIMEOUT_MS = 4500;

const LANGUAGE_NAMES = {
  kn: "Kannada", en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil",
  ml: "Malayalam", mr: "Marathi", bn: "Bengali", gu: "Gujarati", pa: "Punjabi",
};
const ALL_TOPICS = ["news","entertainment","cinema","music","comedy","education","technology","sports","history","culture","travel","food","business","jobs","agriculture","health","science","nature","art","books","literature","devotional","spirituality","interviews","speeches","documentary","kids","lifestyle","fashion","gaming","local"];

let cache = new Map();
let sessions = new Map();

const text = (v) => String(v || "").trim();
function safeUrl(v) { try { const u = new URL(String(v || "")); return u.protocol === "https:" ? u.href : ""; } catch { return ""; } }
function normaliseLanguage(language) {
  const raw = text(language).toLowerCase();
  if (LANGUAGE_NAMES[raw]) return raw;
  return Object.entries(LANGUAGE_NAMES).find(([, n]) => n.toLowerCase() === raw)?.[0] || "kn";
}
function detectPreferredLanguage() {
  try { for (const k of ["indo:language","indo-language","preferredLanguage","language","userLanguage"]) { const v = localStorage.getItem(k); if (v) return normaliseLanguage(v); } } catch {}
  return normaliseLanguage(preferredLanguage("kn"));
}
function queryFor(language, topic, search = "") { return `${LANGUAGE_NAMES[normaliseLanguage(language)] || "Kannada"} ${text(search)} ${text(topic)}`.trim(); }
async function fetchJson(url, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" }, cache: "force-cache", signal: controller.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(timer); }
}
function playable(v) { const u = safeUrl(v); return u && (/\.(mp4|webm|ogv|ogg)(?:$|[?#])/i.test(u) || /video\//i.test(u)) ? u : ""; }
function makeItem({ id, source, provider, title, description, url, thumbnailUrl, mimeType, size, duration, creator, createdAt, license, language, topic }) {
  const videoUrl = playable(url);
  if (!videoUrl || Number(size || 0) > MAX_FILE_SIZE) return null;
  if (mimeType && !/^video\/(mp4|webm|ogg)/i.test(mimeType) && !/\.(mp4|webm|ogv|ogg)(?:$|[?#])/i.test(videoUrl)) return null;
  return { id: `${source}:${text(id || videoUrl)}`, source, provider, language: normaliseLanguage(language), topic: text(topic) || "general", creator: text(creator) || provider, creatorName: text(creator) || provider, title: text(title) || `${LANGUAGE_NAMES[normaliseLanguage(language)] || "Language"} video`, description: text(description), caption: text(description) || text(title), createdAt: Date.parse(text(createdAt)) || 0, videoUrl, secureUrl: videoUrl, url: videoUrl, sourceCandidates: [videoUrl], thumbnailUrl: safeUrl(thumbnailUrl), mimeType: text(mimeType) || "video/mp4", size: Number(size || 0), duration: Number(duration || 0), license: text(license), views: 0, likes: 0, comments: 0, shares: 0, saves: 0, mediaType: "video" };
}
async function loadCommons(language, topic, search, offset = 0) {
  const p = new URLSearchParams({ action:"query", generator:"search", gsrsearch:`${queryFor(language,topic,search)} filetype:video`, gsrnamespace:"6", gsrlimit:String(PAGE_SIZE), gsroffset:String(offset), prop:"imageinfo", iiprop:"url|mime|size|extmetadata", iiurlwidth:"480", format:"json", formatversion:"2", origin:"*" });
  const data = await fetchJson(`${COMMONS_API}?${p}`);
  const pages = Array.isArray(data?.query?.pages) ? data.query.pages : Object.values(data?.query?.pages || {});
  return pages.map(page => { const i=page?.imageinfo?.[0]||{}, m=i.extmetadata||{}; return makeItem({ id:page?.pageid||page?.title, source:"wikimedia-commons", provider:"Wikimedia Commons", title:text(page?.title).replace(/^File:/i,""), description:text(m.ImageDescription?.value||m.ObjectName?.value), url:i.url, thumbnailUrl:i.thumburl||i.url, mimeType:i.mime, size:i.size, creator:text(m.Artist?.value||m.Creator?.value), createdAt:m.DateTimeOriginal?.value||m.DateTime?.value, license:m.LicenseShortName?.value, language, topic }); }).filter(Boolean);
}
async function loadPeerTube(language, topic, search, offset = 0) {
  const p = new URLSearchParams({ search:queryFor(language,topic,search), count:String(PAGE_SIZE), start:String(offset), nsfw:"false", hasWebVideoFiles:"true", sort:"-publishedAt" });
  const data = await fetchJson(`${PEERTUBE_API}?${p}`);
  return (Array.isArray(data?.data) ? data.data : []).map(v => {
    const files = (Array.isArray(v?.files) ? v.files : []).filter(f => playable(f?.fileUrl||f?.fileDownloadUrl||f?.url) && Number(f?.size||0) <= MAX_FILE_SIZE).sort((a,b)=>Number(a?.size||0)-Number(b?.size||0));
    const f=files[0]; if (!f) return null;
    return makeItem({ id:v?.uuid||v?.id, source:"peertube", provider:"PeerTube", title:v?.name, description:v?.description, url:f?.fileUrl||f?.fileDownloadUrl||f?.url, thumbnailUrl:v?.thumbnailPath, mimeType:f?.mimeType||f?.type, size:f?.size, duration:v?.duration, creator:v?.account?.displayName||v?.account?.name, createdAt:v?.publishedAt||v?.createdAt, license:v?.licence?.label||v?.licence?.id||"", language, topic });
  }).filter(Boolean);
}
async function loadArchiveBackground(language, topic, search, page = 1) {
  const words=queryFor(language,topic,search).split(/\s+/).filter(Boolean).slice(0,5);
  const q=encodeURIComponent(`mediatype:movies AND ${words.map(w=>`(title:"${w}" OR subject:"${w}")`).join(" AND ")}`);
  const data=await fetchJson(`${ARCHIVE_API}?q=${q}&fl[]=identifier&fl[]=title&fl[]=description&fl[]=creator&rows=${PAGE_SIZE}&page=${page}&output=json`, API_TIMEOUT_MS);
  const docs=Array.isArray(data?.response?.docs)?data.response.docs:[];
  const items=await Promise.all(docs.slice(0,4).map(async d=>{
    try {
      const meta=await fetchJson(`https://archive.org/metadata/${encodeURIComponent(text(d?.identifier))}`, API_TIMEOUT_MS);
      const f=(Array.isArray(meta?.files)?meta.files:[]).filter(x=>playable(`https://archive.org/download/${encodeURIComponent(text(d.identifier))}/${String(x?.name||"").split("/").map(encodeURIComponent).join("/")}`)&&Number(x?.size||0)>0&&Number(x?.size||0)<=MAX_FILE_SIZE&&!/(thumb|sample|preview)/i.test(text(x?.name))).sort((a,b)=>Number(a?.size||0)-Number(b?.size||0))[0];
      if(!f) return null;
      return makeItem({id:d.identifier,source:"internet-archive",provider:"Internet Archive",title:d.title,description:d.description,creator:d.creator,url:`https://archive.org/download/${encodeURIComponent(text(d.identifier))}/${String(f.name).split("/").map(encodeURIComponent).join("/")}`,mimeType:"video/mp4",size:f.size,license:meta?.metadata?.licenseurl||meta?.metadata?.license,language,topic});
    } catch { return null; }
  }));
  return items.filter(Boolean);
}
function unique(items) { const seen=new Set(); return items.filter(i=>{const k=text(i?.videoUrl).toLowerCase(); if(!k||seen.has(k)) return false; seen.add(k); return true;}); }
function key({language,search,topic}) { return `${normaliseLanguage(language)}|${text(search).toLowerCase()}|${text(topic).toLowerCase()}`; }
function getSession(options, reset=false) { const k=key(options); if(reset||!sessions.has(k)) sessions.set(k,{commonsOffset:0,peerTubeOffset:0,archivePage:1,items:[],loading:false}); return sessions.get(k); }

export async function loadArchiveKannadaVideosProgressive({ limit=12, search="", language=detectPreferredLanguage(), topic="", force=false, onBatch }={}) {
  const wanted=Math.max(1,Number(limit)||12), options={language:normaliseLanguage(language),search,topic}, k=key(options);
  const cached=cache.get(k);
  if(!force && cached && Date.now()-cached.at<CACHE_TTL_MS && cached.items.length>=wanted) { const r=rankVideos(cached.items.slice(0,wanted)); onBatch?.(r,false); return r; }
  const s=getSession(options,force); if(force) cache.delete(k);
  if(s.loading) return rankVideos(unique(s.items).slice(0,wanted));
  s.loading=true;
  try {
    // Fast path: only the two quickest public video indexes block the first paint.
    const fast=await Promise.allSettled([loadCommons(language,topic,search,s.commonsOffset),loadPeerTube(language,topic,search,s.peerTubeOffset)]);
    const fresh=[]; for(const r of fast) if(r.status==="fulfilled") fresh.push(...r.value);
    s.items=unique([...s.items,...fresh]); s.commonsOffset+=PAGE_SIZE; s.peerTubeOffset+=PAGE_SIZE;
    const first=rankVideos(s.items.slice(0,wanted)); onBatch?.(first,true);
    cache.set(k,{at:Date.now(),items:s.items.slice()});
    // Slow indexes never delay the first batch; they enrich the feed in the background.
    Promise.allSettled([loadArchiveBackground(language,topic,search,s.archivePage++)]).then(results=>{
      for(const r of results) if(r.status==="fulfilled") s.items=unique([...s.items,...r.value]);
      cache.set(k,{at:Date.now(),items:s.items.slice()}); onBatch?.(rankVideos(s.items.slice(0,wanted)),false);
    }).catch(()=>{});
    return first;
  } finally { s.loading=false; }
}
export async function loadArchiveKannadaVideos(options={}) { let latest=[]; await loadArchiveKannadaVideosProgressive({...options,onBatch:items=>{latest=items;}}); return latest; }
export async function refreshArchiveVideoBatch(options={}) { return loadArchiveKannadaVideosProgressive({...options,force:true}); }
export function startArchiveRefresh({intervalMs=300000,onUpdate,getSearch,getLanguage,getTopic}={}) { const timer=window.setInterval(async()=>{try{const items=await refreshArchiveVideoBatch({limit:12,search:typeof getSearch==="function"?getSearch():"",language:typeof getLanguage==="function"?getLanguage():detectPreferredLanguage(),topic:typeof getTopic==="function"?getTopic():""});onUpdate?.(items);}catch{}} ,intervalMs); return ()=>window.clearInterval(timer); }
export function clearArchiveCache(){cache=new Map();sessions=new Map();}
export { detectPreferredLanguage, normaliseLanguage, ALL_TOPICS };