import { state } from "../../state.js";

const STYLE_ID = "indo-profile-link-navigation-v233";
let installed = false;
let busy = false;

function normalizeUserId(value = "") {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function extractFromElement(element) {
  if (!(element instanceof Element)) return "";
  const explicit = element.getAttribute("data-user-id") || element.getAttribute("data-profile-user-id") || element.getAttribute("data-username") || element.getAttribute("data-userid");
  if (explicit) return normalizeUserId(explicit);
  const text = String(element.textContent || "").trim();
  const match = text.match(/@([a-z0-9._-]{1,50})/i);
  return match ? normalizeUserId(match[1]) : "";
}

function findIdentityTarget(element) {
  if (!(element instanceof Element)) return null;
  const direct = element.closest("[data-user-id],[data-profile-user-id],[data-username],[data-userid]");
  if (direct) return { element: direct, userId: extractFromElement(direct) };

  const selectors = [
    ".search-user-copy",
    ".search-user",
    ".notice p b",
    ".notice",
    ".indo-comment-name",
    ".profile-relation-row",
    ".neon-edge-creator",
    ".neon-edge-name",
    ".indo-story-card-body strong",
    ".indo-story-card",
    ".watch-creator",
    ".creator-user",
    ".post-creator",
    '[class*="creator"]',
  ];
  for (const selector of selectors) {
    const target = element.closest(selector);
    if (!target) continue;
    const userId = extractFromElement(target);
    if (userId) return { element: target, userId };
  }
  return null;
}

async function openProfile(userId) {
  const normalized = normalizeUserId(userId);
  if (!normalized || busy) return;
  busy = true;
  try {
    state.profile = { username: normalized, userId: normalized };
    window.__indoProfileTargetUserId = normalized;
    if (typeof window.__indoNavigate === "function") await window.__indoNavigate("profile");
    else state.screen = "profile";
  } finally {
    busy = false;
  }
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `[data-user-id],[data-profile-user-id],[data-username],[data-userid],.search-user-copy,.search-user,.notice p b,.notice,.indo-comment-name,.profile-relation-row,.neon-edge-creator,.neon-edge-name,.indo-story-card-body strong,.indo-story-card,.watch-creator,.creator-user,.post-creator{cursor:pointer}.profile-direct-user-link{cursor:pointer;color:inherit;text-decoration:none}`;
  document.head.appendChild(style);
}

export function installProfileLinkNavigation() {
  if (installed) return;
  installed = true;
  installStyles();
  document.addEventListener(
    "click",
    (event) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element) return;
      if (element.closest("button,[data-search-follow-uid],[data-follow-response],[data-action],[data-screen],input,textarea,select,a[href]")) return;
      const target = findIdentityTarget(element);
      if (!target?.userId) return;
      event.preventDefault();
      event.stopPropagation();
      openProfile(target.userId).catch((error) => console.error("Profile navigation failed:", error));
    },
    true,
  );
}

export function bindProfileIdentity(container = document) {
  installProfileLinkNavigation();
  if (!(container instanceof Element || container instanceof Document)) return;
  container.querySelectorAll("[data-profile-user-id],[data-user-id],[data-username],[data-userid]").forEach((el) => {
    const id = extractFromElement(el);
    if (id) el.setAttribute("data-profile-user-id", id);
  });
}
