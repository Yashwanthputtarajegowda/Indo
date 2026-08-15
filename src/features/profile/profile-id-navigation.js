import { state } from "../../state.js";
import { auth } from "../auth/firebase-client.js";

const API = () => window.INDO_API_BASE || "";
const PROFILE_SELECTOR = [
  "[data-profile-link]",
  "[data-open-profile]",
  "[data-profile-user]",
  "[data-profile-username]",
  "[data-user-id]",
  "[data-username]",
  ".search-profile-id-link",
  ".search-profile-id",
  ".indo-notice-line b",
  ".indo-comment-name",
  ".indo-watch-creator-name",
  ".indo-rel-id",
  ".profile-direct-id",
  ".message-user-id",
  ".conversation-user-id",
  ".reel-user-id",
  ".story-user-id",
].join(",");
const ID_RE = /^@?[A-Za-z0-9._-]{2,80}$/;
function clean(value = "") {
  return String(value ?? "")
    .trim()
    .replace(/^@+/, "");
}
function validId(value = "") {
  const id = clean(value);
  return ID_RE.test(id) && !["user", "profile", "users", "indo"].includes(id.toLowerCase());
}
function findIdentity(start) {
  if (!(start instanceof Element)) return null;
  let node = start;
  let fallbackUid = "";
  for (let i = 0; i < 8 && node; i += 1) {
    const uid = clean(node.dataset?.profileUid || node.dataset?.ownerUid || node.dataset?.actorUid || node.dataset?.userUid || node.dataset?.uid || "");
    if (uid && !fallbackUid) fallbackUid = uid;
    const userId = clean(
      node.dataset?.openProfile ||
        node.dataset?.profileUser ||
        node.dataset?.profileUsername ||
        node.dataset?.userId ||
        node.dataset?.username ||
        node.dataset?.relUser ||
        node.dataset?.actorUserId ||
        node.dataset?.profileLink ||
        "",
    );
    if (validId(userId)) return { uid: fallbackUid || uid, userId };
    node = node.parentElement;
  }
  const exact = String(start.textContent || "").trim();
  if (validId(exact)) return { uid: fallbackUid, userId: clean(exact) };
  return fallbackUid ? { uid: fallbackUid, userId: "" } : null;
}
async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return { Authorization: `Bearer ${await user.getIdToken()}` };
}
async function fetchProfile(identity) {
  const userId = clean(identity?.userId || "");
  const uid = clean(identity?.uid || "");
  if (!userId && !uid) throw new Error("User ID is missing.");
  const headers = await authHeaders();
  const candidates = [];
  if (userId) candidates.push(`/api/account/profile/${encodeURIComponent(userId)}?t=${Date.now()}`);
  if (uid) candidates.push(`/api/account/public-profile/${encodeURIComponent(uid)}?t=${Date.now()}`);
  let lastError = null;
  for (const path of candidates) {
    try {
      const response = await fetch(`${API()}${path}`, {
        headers,
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.profile)
        return {
          ...data.profile,
          stats: data.stats || {},
          social: data.social || {},
        };
      lastError = new Error(data?.error || `Could not open profile (${response.status}).`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Could not open profile.");
}
async function openProfile(identity) {
  const profile = await fetchProfile(identity);
  state.profile = profile;
  state.screen = "profile";
  const { render } = await import("../../router.js?v=20260815-profile-id-v3");
  await render(document.getElementById("root"));
  window.scrollTo({ top: 0, behavior: "auto" });
}
function shouldHandle(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest('input,textarea,select,[contenteditable="true"]')) return false;
  if (target.closest(".search-follow-button,.profile-follow-button,button[data-follow-user]")) return false;
  return Boolean(target.closest(PROFILE_SELECTOR)) || validId(String(target.textContent || "").trim());
}
function install() {
  if (window.__indoProfileIdNavigationInstalled === "v4") return;
  window.__indoProfileIdNavigationInstalled = "v4";
  window.__indoOpenProfile = openProfile;
  document.addEventListener(
    "click",
    async (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!shouldHandle(target)) return;
      const identity = findIdentity(target);
      if (!identity) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        await openProfile(identity);
      } catch (error) {
        console.warn("Profile navigation failed:", error);
      }
    },
    true,
  );
  document.addEventListener(
    "keydown",
    async (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target || !target.matches(".search-profile-id-link,[data-profile-link]")) return;
      const identity = findIdentity(target);
      if (!identity) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        await openProfile(identity);
      } catch (error) {
        console.warn("Profile navigation failed:", error);
      }
    },
    true,
  );
}
install();
export { openProfile, install };
