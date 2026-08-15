const STORAGE_PREFIX = "indo:recommendation:v4:";
const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_LIFE_MS = 14 * DAY_MS;
const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "your",
  "you",
  "are",
  "was",
  "has",
  "have",
  "into",
  "about",
  "video",
  "videos",
  "reel",
  "reels",
  "indo",
  "user",
  "new",
  "latest",
  "more",
  "than",
  "just",
  "here",
  "what",
  "when",
  "where",
  "will",
  "their",
  "they",
  "then",
  "also",
  "only",
  "very",
]);
function currentUserId() {
  return (
    String(
      window.__indoRecommendationUid || "guest",
    ).trim() || "guest"
  );
}
function storageKey() {
  return `${STORAGE_PREFIX}${currentUserId()}`;
}
function tokenise(value = "") {
  return [
    ...new Set(
      String(value)
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/[@#]/g, " ")
        .split(
          /[^a-z0-9\u0C80-\u0CFF\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F]+/,
        )
        .filter(
          (token) =>
            token.length >= 2 && !STOP_WORDS.has(token),
        ),
    ),
  ];
}
function loadProfile() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(storageKey()) || "{}",
    );
    return raw && typeof raw === "object"
      ? raw
      : {
          tokens: {},
          creators: {},
          searches: {},
          media: {},
          language: {},
        };
  } catch {
    return {
      tokens: {},
      creators: {},
      searches: {},
      media: {},
      language: {},
    };
  }
}
function saveProfile(profile) {
  try {
    const clean = {
      tokens: profile.tokens || {},
      creators: profile.creators || {},
      searches: profile.searches || {},
      media: profile.media || {},
      language: profile.language || {},
    };
    clean.tokens = Object.fromEntries(
      Object.entries(clean.tokens)
        .sort(
          (a, b) =>
            Number(b[1]?.weight || 0) -
            Number(a[1]?.weight || 0),
        )
        .slice(0, 260),
    );
    clean.media = Object.fromEntries(
      Object.entries(clean.media)
        .sort(
          (a, b) =>
            Number(b[1]?.last || 0) -
            Number(a[1]?.last || 0),
        )
        .slice(0, 500),
    );
    localStorage.setItem(
      storageKey(),
      JSON.stringify(clean),
    );
  } catch {}
}
function decay(value, last) {
  const age = Math.max(
    0,
    Date.now() - Number(last || Date.now()),
  );
  return (
    Number(value || 0) * Math.pow(0.5, age / HALF_LIFE_MS)
  );
}
function addWeightedTokens(profile, tokens, weight) {
  const now = Date.now();
  for (const token of tokens) {
    const item = profile.tokens[token] || {
      weight: 0,
      last: now,
    };
    item.weight = decay(item.weight, item.last) + weight;
    item.last = now;
    profile.tokens[token] = item;
  }
}
function mediaText(media = {}) {
  return [
    media.title,
    media.caption,
    media.creator,
    media.creatorName,
    media.userId,
    media.username,
    media.category,
    media.tags,
  ]
    .flatMap((value) =>
      Array.isArray(value) ? value : [value],
    )
    .filter(Boolean)
    .join(" ");
}
export function recordInterestText(
  text,
  weight = 1,
  meta = {},
) {
  const profile = loadProfile();
  addWeightedTokens(profile, tokenise(text), weight);
  if (meta.creator) {
    const creator = String(meta.creator)
      .replace(/^@/, "")
      .toLowerCase();
    if (creator)
      profile.creators[creator] =
        decay(profile.creators[creator], Date.now()) +
        weight;
  }
  if (meta.mediaId)
    profile.media[String(meta.mediaId)] = {
      last: Date.now(),
      weight:
        (Number(
          profile.media[String(meta.mediaId)]?.weight,
        ) || 0) + weight,
    };
  saveProfile(profile);
}
export function recordMediaInteraction(
  media,
  kind = "view",
) {
  const weight =
    {
      view: 1,
      watch: 1.5,
      complete: 2.5,
      like: 5,
      save: 5,
      share: 6,
      comment: 3,
      follow: 4,
      skip: -1,
    }[kind] ?? 1;
  recordInterestText(mediaText(media), weight, {
    mediaId: media?.id,
    creator:
      media?.creator || media?.userId || media?.username,
  });
}
export function recordSearchQuery(query) {
  const tokens = tokenise(query);
  if (!tokens.length) return;
  const profile = loadProfile();
  addWeightedTokens(profile, tokens, 4);
  for (const token of tokens)
    profile.searches[token] =
      (Number(profile.searches[token]) || 0) + 1;
  saveProfile(profile);
}
export function setPreferenceLanguage(language) {
  const profile = loadProfile();
  const lang = String(language || "")
    .toLowerCase()
    .trim();
  if (!lang) return;
  profile.language[lang] = {
    weight:
      decay(
        profile.language[lang]?.weight,
        profile.language[lang]?.last,
      ) + 3,
    last: Date.now(),
  };
  saveProfile(profile);
}
export function getLanguagePreference() {
  const profile = loadProfile();
  const list = Object.entries(profile.language || {})
    .map(([lang, item]) => [
      lang,
      decay(item?.weight, item?.last),
    ])
    .sort((a, b) => b[1] - a[1]);
  return (
    list[0]?.[0] ||
    String(navigator.language || "en")
      .split("-")[0]
      .toLowerCase()
  );
}
function languageScore(media, language) {
  const text = mediaText(media);
  const lang = String(language || "").toLowerCase();
  if (lang === "kn")
    return /[\u0C80-\u0CFF]/.test(text) ? 1 : 0;
  if (lang === "hi")
    return /[\u0900-\u097F]/.test(text) ? 1 : 0;
  if (lang === "ta")
    return /[\u0B80-\u0BFF]/.test(text) ? 1 : 0;
  if (lang === "te")
    return /[\u0C00-\u0C7F]/.test(text) ? 1 : 0;
  if (lang === "ml")
    return /[\u0D00-\u0D7F]/.test(text) ? 1 : 0;
  if (lang === "bn")
    return /[\u0980-\u09FF]/.test(text) ? 1 : 0;
  if (lang === "gu")
    return /[\u0A80-\u0AFF]/.test(text) ? 1 : 0;
  if (lang === "pa")
    return /[\u0A00-\u0A7F]/.test(text) ? 1 : 0;
  if (lang === "mr")
    return /[\u0900-\u097F]/.test(text) ? 1 : 0.15;
  if (lang === "en")
    return /\b(the|is|are|and|with|travel|food|news|music|how|why|best|life|tech)\b/i.test(
      text,
    )
      ? 1
      : 0.15;
  return 0.05;
}
function interestScore(media, profile) {
  const tokens = tokenise(mediaText(media));
  if (!tokens.length) return 0;
  let score = 0;
  for (const token of tokens)
    score += decay(
      profile.tokens?.[token]?.weight,
      profile.tokens?.[token]?.last,
    );
  const creator = String(
    media.creator || media.userId || media.username || "",
  )
    .replace(/^@/, "")
    .toLowerCase();
  const creatorBoost = creator
    ? Math.min(
        2,
        decay(profile.creators?.[creator], Date.now()) / 5,
      )
    : 0;
  return score / Math.sqrt(tokens.length) + creatorBoost;
}
function engagementScore(media) {
  return (
    Math.log1p(Math.max(0, Number(media.views || 0))) *
      0.55 +
    Math.log1p(Math.max(0, Number(media.likes || 0))) *
      1.1 +
    Math.log1p(Math.max(0, Number(media.comments || 0))) *
      0.85
  );
}
function recencyScore(createdAt) {
  return Math.max(
    0,
    1 -
      Math.max(0, Date.now() - Number(createdAt || 0)) /
        (7 * DAY_MS),
  );
}
export function rankMedia(
  items,
  {
    type = "",
    limit = 50,
    query = "",
    language = getLanguagePreference(),
  } = {},
) {
  const profile = loadProfile();
  const q = String(query || "")
    .trim()
    .toLowerCase();
  return (Array.isArray(items) ? [...items] : [])
    .sort((a, b) => {
      const score = (media) => {
        const hay = mediaText(media).toLowerCase();
        if (q && !hay.includes(q)) return -100000;
        const personal = interestScore(media, profile);
        const lang = languageScore(media, language);
        const engagement = engagementScore(media);
        const recent = recencyScore(media.createdAt);
        const trending = engagement * (recent + 0.35);
        return (
          (q ? 20 : 1) * personal +
          lang * 2.4 +
          trending * 0.9 +
          recent * 1.2 +
          Math.random() * 0.08
        );
      };
      return score(b) - score(a);
    })
    .slice(0, Math.max(0, Number(limit) || 50));
}
function cloneInit(init) {
  return init
    ? {
        ...init,
        headers: init.headers
          ? { ...init.headers }
          : init.headers,
      }
    : undefined;
}
export function installRecommendationFetch() {
  if (window.__indoRecommendationFetchInstalled) return;
  window.__indoRecommendationFetchInstalled = true;
  const original = window.fetch.bind(window);
  window.__indoOriginalFetch = original;
  window.fetch = async (input, init = {}) => {
    const rawUrl =
      input instanceof Request
        ? input.url
        : String(input || "");
    if (!/\/api\/media\/videos(?:\?|$)/.test(rawUrl))
      return original(input, init);
    let parsed;
    try {
      parsed = new URL(rawUrl, window.location.origin);
    } catch {
      return original(input, init);
    }
    const type = String(
      parsed.searchParams.get("type") || "",
    ).toLowerCase();
    const q = String(parsed.searchParams.get("q") || "");
    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(parsed.searchParams.get("limit") || 50),
      ),
    );
    const screen = String(
      window.__indoRecommendationScreen || "",
    );
    if (screen === "home") {
      const videoUrl = new URL(parsed);
      videoUrl.searchParams.set("type", "video");
      videoUrl.searchParams.set(
        "limit",
        String(Math.max(limit, 50)),
      );
      const reelUrl = new URL(parsed);
      reelUrl.searchParams.set("type", "reel");
      reelUrl.searchParams.set(
        "limit",
        String(Math.max(limit, 50)),
      );
      const [videoResponse, reelResponse] =
        await Promise.all([
          original(videoUrl.toString(), cloneInit(init)),
          original(reelUrl.toString(), cloneInit(init)),
        ]);
      const [videoData, reelData] = await Promise.all([
        videoResponse.json().catch(() => ({})),
        reelResponse.json().catch(() => ({})),
      ]);
      const merged = [
        ...(Array.isArray(videoData.videos)
          ? videoData.videos
          : []),
        ...(Array.isArray(reelData.videos)
          ? reelData.videos
          : []),
      ];
      return new Response(
        JSON.stringify({
          ok: true,
          videos: rankMedia(merged, { limit, query: q }),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    if (type === "video" || type === "reel") {
      const response = await original(input, init);
      if (!response.ok) return response;
      const data = await response.json().catch(() => ({}));
      const onlyVideos = Array.isArray(data.videos)
        ? data.videos
        : [];
      return new Response(
        JSON.stringify({
          ...data,
          videos: rankMedia(onlyVideos, {
            type,
            limit,
            query: q,
          }),
        }),
        {
          status: response.status,
          statusText: response.statusText,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    return original(input, init);
  };
}
export function initRecommendationEngine() {
  if (window.__indoRecommendationInitialized) return;
  window.__indoRecommendationInitialized = true;
  setPreferenceLanguage(
    String(
      localStorage.getItem(
        `${STORAGE_PREFIX}${currentUserId()}:language`,
      ) || "",
    ).trim() ||
      String(navigator.language || "en")
        .split("-")[0]
        .toLowerCase(),
  );
  installRecommendationFetch();
  document.addEventListener(
    "input",
    (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const placeholder = String(
        input.placeholder || "",
      ).toLowerCase();
      if (!placeholder.includes("search")) return;
      clearTimeout(input.__indoSearchTimer);
      input.__indoSearchTimer = setTimeout(
        () => recordSearchQuery(input.value || ""),
        400,
      );
    },
    true,
  );
  document.addEventListener(
    "click",
    (event) => {
      const element =
        event.target instanceof Element
          ? event.target
          : null;
      if (!element) return;
      const action = element.closest("[data-engagement]");
      if (action) {
        const root = action.closest(
          "[data-video-id],.reel-view,.video-post,.indo-video-card,.indo-video-mini",
        );
        if (root)
          recordMediaInteraction(
            {
              id:
                root.dataset.videoId ||
                root.dataset.videoOpen,
              title: root.textContent || "",
              creator:
                root.querySelector?.(
                  ".indo-video-user-id,.indo-video-mini-name,.reel-user b",
                )?.textContent || "",
            },
            action.dataset.engagement,
          );
        return;
      }
      const open = element.closest("[data-video-open]");
      if (open) {
        const root = open.closest(
          "[data-video-id],.indo-video-card,.indo-video-mini",
        );
        if (root)
          recordMediaInteraction(
            {
              id: open.dataset.videoOpen,
              title: root.textContent || "",
              creator:
                root.querySelector?.(
                  ".indo-video-user-id,.indo-video-mini-name",
                )?.textContent || "",
            },
            "view",
          );
      }
    },
    true,
  );
}
