import { auth } from "../features/auth/firebase-client.js";
import { emitInterest } from "../features/feed/interest-engine.js";
import { renderWatchVideo as renderBaseWatchVideo } from "./watch-video-v225.js";

const API_BASE = () => String(window.INDO_API_BASE || "").replace(/\/$/, "");
const BOUND = "data-indo-watch-bound";

function currentVideo() {
  try { return JSON.parse(sessionStorage.getItem("indo:watch-video-current") || "null"); }
  catch { return null; }
}

async function token() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken(true);
}

async function request(path, { method = "GET", body, authRequired = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authRequired) headers.Authorization = `Bearer ${await token()}`;
  const response = await fetch(`${API_BASE()}${path}`, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function showStatus(app, text) {
  let el = app.querySelector(".indo-watch-live-status");
  if (!el) {
    el = document.createElement("div");
    el.className = "indo-watch-live-status";
    app.querySelector(".indo-watch-actions")?.after(el);
  }
  el.textContent = text || "";
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.textContent = ""; }, 2200);
}

function clearElementHandlers(node) {
  return node?.cloneNode(true) || null;
}

function bindBack(app) {
  const button = app.querySelector("[data-back]");
  if (!button || button.dataset[BOUND] === "back") return;
  const clean = clearElementHandlers(button);
  if (!clean) return;
  clean.dataset[BOUND] = "back";
  clean.type = "button";
  clean.style.touchAction = "manipulation";
  const goBack = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const navigate = window.__indoNavigate;
    if (typeof navigate === "function") Promise.resolve(navigate("video")).catch(() => window.history.back());
    else window.history.back();
  };
  clean.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") goBack(event);
  }, { passive: false });
  clean.addEventListener("click", goBack);
  button.replaceWith(clean);
}

function bindActions(app, video) {
  const current = app.querySelector(".indo-watch-actions");
  if (!current || current.dataset[BOUND] === "actions") return;
  const actions = clearElementHandlers(current);
  if (!actions) return;
  actions.dataset[BOUND] = "actions";
  current.replaceWith(actions);

  const like = actions.querySelector('[data-action="like"]');
  const save = actions.querySelector('[data-action="save"]');
  const comment = actions.querySelector('[data-action="comment"]');
  const share = actions.querySelector('[data-action="share"]');
  const views = actions.querySelector('[data-action="views"]');

  like?.addEventListener("click", async () => {
    if (like.dataset.busy === "1") return;
    like.dataset.busy = "1";
    const optimistic = !like.classList.contains("active-like");
    like.classList.toggle("active-like", optimistic);
    try {
      const result = await request(`/api/media/${encodeURIComponent(video.id)}/like`, { method: "POST", body: { like: optimistic } });
      like.classList.toggle("active-like", Boolean(result.liked));
      like.querySelector("span")?.replaceChildren(document.createTextNode(String(result.likes ?? 0)));
      emitInterest(video, result.liked ? "like" : "skip");
      showStatus(app, result.liked ? "Liked" : "Unliked");
    } catch (error) {
      like.classList.toggle("active-like", !optimistic);
      showStatus(app, error.message || "Like failed");
    } finally { delete like.dataset.busy; }
  });

  save?.addEventListener("click", async () => {
    if (save.dataset.busy === "1") return;
    save.dataset.busy = "1";
    const next = !save.classList.contains("active-save");
    save.classList.toggle("active-save", next);
    try {
      const result = await request(`/api/media/${encodeURIComponent(video.id)}/save`, { method: "POST", body: { save: next } });
      save.classList.toggle("active-save", Boolean(result.saved));
      showStatus(app, result.saved ? "Saved" : "Removed from saved");
    } catch (error) {
      save.classList.toggle("active-save", !next);
      showStatus(app, error.message || "Save failed");
    } finally { delete save.dataset.busy; }
  });

  comment?.addEventListener("click", () => app.querySelector("#comment-input")?.focus());
  share?.addEventListener("click", async () => {
    try {
      if (navigator.share) await navigator.share({ title: video.title || "Indo video", url: location.href });
      else await navigator.clipboard?.writeText(location.href);
      emitInterest(video, "share");
      showStatus(app, "Link shared");
    } catch {}
  });
  views?.addEventListener("click", () => app.querySelector(".indo-watch-player")?.scrollIntoView({ behavior: "smooth", block: "center" }));

  void request(`/api/media/${encodeURIComponent(video.id)}/engagement`)
    .then((data) => {
      like?.classList.toggle("active-like", Boolean(data.liked));
      save?.classList.toggle("active-save", Boolean(data.saved));
      const count = like?.querySelector("span");
      if (count) count.textContent = String(data.likes ?? 0);
    })
    .catch(() => {});
}

export function renderWatchVideo(app) {
  const video = currentVideo();
  if (!video) return;

  const renderPromise = renderBaseWatchVideo(app);

  // The base screen paints its DOM before its own async hydration. Bind immediately so controls never wait for APIs.
  queueMicrotask(() => {
    bindBack(app);
    bindActions(app, video);
  });

  // When the base renderer finishes, replace its handlers with this single canonical controller.
  void renderPromise.then(() => {
    bindBack(app);
    bindActions(app, video);
  }).catch((error) => console.warn("Watch base render failed:", error));
}