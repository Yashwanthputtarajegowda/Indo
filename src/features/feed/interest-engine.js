const STORAGE_KEY = "indo:feed-interest:v2";
const LEGACY_KEY = "indo:feed-interest:v1";
const MAX_SCORE = 100;
const DAILY_DECAY = 0.985;

function clean(value) { return String(value || "").trim().toLowerCase(); }

function emptyState() {
  return { languages: {}, topics: {}, actions: {}, updatedAt: Date.now() };
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY) || "{}";
    const parsed = JSON.parse(raw);
    const state = {
      languages: parsed.languages && typeof parsed.languages === "object" ? parsed.languages : {},
      topics: parsed.topics && typeof parsed.topics === "object" ? parsed.topics : {},
      actions: parsed.actions && typeof parsed.actions === "object" ? parsed.actions : {},
      updatedAt: Number(parsed.updatedAt || Date.now()),
    };
    // Older scores were much more aggressive. Scale them down once when moving to v2.
    if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(LEGACY_KEY)) {
      for (const bucket of [state.languages, state.topics]) {
        for (const key of Object.keys(bucket)) bucket[key] = Number(bucket[key] || 0) * 0.35;
      }
    }
    return state;
  } catch {
    return emptyState();
  }
}

function writeState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function decayScores(state, now = Date.now()) {
  const elapsedHours = Math.max(0, (now - Number(state.updatedAt || now)) / 3600000);
  if (elapsedHours <= 0) return state;
  const factor = Math.pow(DAILY_DECAY, elapsedHours / 24);
  for (const bucket of [state.languages, state.topics]) {
    for (const key of Object.keys(bucket)) {
      bucket[key] = Number(bucket[key] || 0) * factor;
      if (Math.abs(bucket[key]) < 0.02) delete bucket[key];
    }
  }
  state.updatedAt = now;
  return state;
}

export function getInterest() {
  const state = decayScores(readState());
  writeState(state);
  return state;
}

export function recordInterest(item, action = "watch") {
  const language = clean(item?.language || item?.lang);
  const topic = clean(item?.topic);
  if (!language && !topic) return;

  // Small learning rates make interest change gradually instead of jumping after one video.
  const rates = {
    impression: 0.01,
    skip: 0.04,
    watch: 0.07,
    complete: 0.10,
    like: 0.13,
    save: 0.14,
    share: 0.16,
  };
  const targets = {
    impression: 0.5,
    skip: -1,
    watch: 1,
    complete: 2,
    like: 3,
    save: 3,
    share: 4,
  };
  const rate = Number(rates[action] ?? rates.watch);
  const target = Number(targets[action] ?? targets.watch);
  const state = decayScores(readState());

  function update(bucket, key) {
    if (!key) return;
    const current = Number(bucket[key] || 0);
    const next = current + (target - current) * rate;
    bucket[key] = Math.max(-MAX_SCORE, Math.min(MAX_SCORE, next));
  }

  update(state.languages, language);
  update(state.topics, topic);
  state.actions[action] = Number(state.actions[action] || 0) + 1;
  state.updatedAt = Date.now();
  writeState(state);
  return state;
}

export function preferredLanguage(fallback = "kn") {
  const state = getInterest();
  const entries = Object.entries(state.languages)
    .filter(([, score]) => Number(score) > 0.15)
    .sort((a, b) => Number(b[1]) - Number(a[1]));
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
    const topicScore = Number(topicScores[topic] || 0);
    const languageScore = Number(languageScores[language] || 0);
    let score = topicScore * 1.6 + languageScore * 0.8;
    if (text.includes(topic) && topic) score += 0.25;
    // Keep discovery/variety: personalization ranks content, but does not eliminate other topics.
    score += Math.max(0, 0.12 - index * 0.0005);
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
