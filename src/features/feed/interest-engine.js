const STORAGE_KEY = "indo:feed-interest:v1";
const MAX_SCORE = 100;
const DECAY = 0.995;

function clean(value) { return String(value || "").trim().toLowerCase(); }

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      languages: parsed.languages && typeof parsed.languages === "object" ? parsed.languages : {},
      topics: parsed.topics && typeof parsed.topics === "object" ? parsed.topics : {},
      actions: parsed.actions && typeof parsed.actions === "object" ? parsed.actions : {},
      updatedAt: Number(parsed.updatedAt || Date.now()),
    };
  } catch {
    return { languages: {}, topics: {}, actions: {}, updatedAt: Date.now() };
  }
}

function writeState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function decayScores(state) {
  for (const bucket of [state.languages, state.topics]) {
    for (const key of Object.keys(bucket)) {
      bucket[key] = Number(bucket[key] || 0) * DECAY;
      if (bucket[key] < 0.05) delete bucket[key];
    }
  }
  return state;
}

export function getInterest() {
  return decayScores(readState());
}

export function recordInterest(item, action = "watch") {
  const language = clean(item?.language || item?.lang);
  const topic = clean(item?.topic);
  if (!language && !topic) return;
  const weights = { impression: 0.1, skip: -0.5, watch: 1, complete: 2, like: 3, save: 3, share: 4 };
  const weight = Number(weights[action] ?? 1);
  const state = decayScores(readState());
  if (language) state.languages[language] = Math.max(-MAX_SCORE, Math.min(MAX_SCORE, Number(state.languages[language] || 0) + weight));
  if (topic) state.topics[topic] = Math.max(-MAX_SCORE, Math.min(MAX_SCORE, Number(state.topics[topic] || 0) + weight));
  state.actions[action] = Number(state.actions[action] || 0) + 1;
  state.updatedAt = Date.now();
  writeState(state);
  return state;
}

export function preferredLanguage(fallback = "kn") {
  const state = getInterest();
  const entries = Object.entries(state.languages).sort((a, b) => Number(b[1]) - Number(a[1]));
  return entries[0]?.[0] || clean(fallback) || "kn";
}

export function rankVideos(items = []) {
  const state = getInterest();
  const topicScores = state.topics || {};
  const languageScores = state.languages || {};
  return items.map((item, index) => {
    const topic = clean(item?.topic);
    const language = clean(item?.language);
    const text = clean(`${item?.title || ""} ${item?.description || ""}`);
    let score = Number(topicScores[topic] || 0) * 2 + Number(languageScores[language] || 0);
    if (text.includes(topic) && topic) score += 0.5;
    score += Math.max(0, 0.25 - index * 0.001);
    return { item, score };
  }).sort((a, b) => b.score - a.score).map(({ item }) => item);
}

export function installInterestTracking() {
  if (globalThis.__indoInterestTrackingInstalled) return;
  globalThis.__indoInterestTrackingInstalled = true;
  window.addEventListener("indo:video-interest", (event) => {
    try { recordInterest(event.detail?.item, event.detail?.action || "watch"); } catch {}
  });
}

export function emitInterest(item, action = "watch") {
  try { window.dispatchEvent(new CustomEvent("indo:video-interest", { detail: { item, action } })); } catch {}
}

installInterestTracking();
