import { state } from "../../state.js";

const STYLE_ID = "indo-profile-link-navigation-v236";
let installed = false;
let busy = false;

function normalizeUserId(value = "") {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function extractUserId(element) {
  if (!(element instanceof Element)) return "";
  const explicit =
    element.getAttribute("data-user-id") ||
    element.getAttribute("data-profile-user-id") ||
    element.getAttribute("data-username") ||
    element.getAttribute("data-userid") ||
    element.getAttribute("data-profile-user");
  if (explicit) return normalizeUserId(explicit);
  const text = String(element.textContent || "").trim();
  const match = text.match(/@([a-z0-9._-]{1,50})\b/i);
  return match ? normalizeUserId(match[1]) : "";
}

function findIdentityTarget(element) {
  if (!(element instanceof Element)) return null;
  const selectors = [
    "[data-user-id]",
    "[data-profile-user-id]",
    "[data-username]",
    "[data-userid]",
    "[data-profile-user]",
    ".search-profile-id",
    ".search-profile-name",
    ".search-profile-main",
    ".search-profile-card",
    ".search-user-copy",
    ".search-user",
    ".notice p b",
    ".notice",
    ".indo-comment-name",
    ".indo-comment",
    ".profile-relation-row",
    ".neon-edge-creator",
    ".neon-edge-name",
    ".indo-story-card-body strong",
    ".indo-story-card",
    ".watch-creator",
    ".creator-user",
    ".post-creator",
    ".creator",
    ".video-creator",
    ".video-creator-name",
    ".video-author",
    ".profile-direct-user-link",
    ".profile-user-id",
    ".profile-username",
    '[class*="user-id"]',
    '[class*="username"]',
    '[class*="creator"]',
    '[class*="author"]',
  ];
  for (const selector of selectors) {
    const target = element.closest(selector);
    if (!target) continue;
    const userId = extractUserId(target);
    if (userId) return { element: target, userId };
  }
  return null;
}

async function openProfile(userId) {
  const normalized = normalizeUserId(userId);
  if (!normalized || busy) return;
  busy = true;
  try {
    const apiBase = window.INDO_API_BASE || "";
    const response = await fetch(
      `${apiBase}/api/account/profile/${encodeURIComponent(normalized)}`,
      { cache: "no-store" },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.ok || !data?.profile)
      throw new Error(
        data?.error || "Could not open profile.",
      );
    state.profile = {
      ...data.profile,
      uid: data.profile.uid || data.profile.ownerUid || "",
      username: normalizeUserId(
        data.profile.userId ||
          data.profile.username ||
          normalized,
      ),
      userId: normalizeUserId(
        data.profile.userId ||
          data.profile.username ||
          normalized,
      ),
      stats: data.stats || {},
      social: data.social || {},
      __isOwnProfile: false,
    };
    state.screen = "profile";
    window.__indoProfileTargetUserId = normalized;
    if (typeof window.__indoNavigate === "function")
      await window.__indoNavigate("profile");
  } catch (error) {
    console.error("Profile navigation failed:", error);
  } finally {
    busy = false;
  }
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-user-id],[data-profile-user-id],[data-username],[data-userid],[data-profile-user],
    .search-profile-id,.search-profile-name,.search-profile-main,.search-profile-card,
    .search-user-copy,.search-user,.notice p b,.notice,.indo-comment-name,.indo-comment,
    .profile-relation-row,.neon-edge-creator,.neon-edge-name,.indo-story-card-body strong,
    .indo-story-card,.watch-creator,.creator-user,.post-creator,.creator,.video-creator,
    .video-creator-name,.video-author,.profile-direct-user-link,.profile-user-id,
    .profile-username,[class*="user-id"],[class*="username"],[class*="creator"],[class*="author"]{
      cursor:pointer;
    }
    .profile-direct-user-link{color:inherit;text-decoration:none}
  `;
  document.head.appendChild(style);
}

export function installProfileLinkNavigation() {
  if (installed) return;
  installed = true;
  installStyles();
  document.addEventListener(
    "click",
    (event) => {
      const element =
        event.target instanceof Element
          ? event.target
          : null;
      if (!element) return;
      const target = findIdentityTarget(element);
      if (!target?.userId) return;
      const targetElement = target.element;
      const identityButton =
        targetElement?.matches(
          ".search-profile-main,.search-profile-card,.notice,.profile-relation-row,.indo-story-card,.search-user",
        ) ||
        targetElement?.matches(
          "[data-user-id],[data-profile-user-id],[data-username],[data-userid],[data-profile-user]",
        );
      const actionControl = element.closest(
        "[data-search-follow-uid],[data-follow-response],[data-action],[data-screen],input,textarea,select,a[href]",
      );
      if (actionControl && !identityButton) return;
      if (
        element.closest(
          ".search-follow-button,.follow-btn,button[data-search-follow-uid]",
        )
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      openProfile(target.userId);
    },
    true,
  );
}

export function bindProfileIdentity(container = document) {
  installProfileLinkNavigation();
  if (!(
    container instanceof Element ||
    container instanceof Document
  ))
    return;
  container
    .querySelectorAll(
      "[data-profile-user-id],[data-user-id],[data-username],[data-userid],[data-profile-user]",
    )
    .forEach((el) => {
      const id = extractUserId(el);
      if (id) el.setAttribute("data-profile-user-id", id);
    });
}
