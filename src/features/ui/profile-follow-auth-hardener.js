import { auth } from "../auth/firebase-client.js";
import { state } from "../../state.js";

const KEY = Symbol.for("indo.profileFollowAuthHardenerV1");

function esc(value = "") {
  return String(value).replace(
    /[&<>\"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}

function getTargetUid() {
  return String(
    state.profile?.uid ||
      state.profile?.ownerUid ||
      state.profile?.userId ||
      "",
  ).trim();
}

async function freshToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken(true);
}

async function api(path, options = {}) {
  const token = await freshToken();
  const response = await fetch(
    `${window.INDO_API_BASE || ""}${path}`,
    {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error || `Request failed (${response.status}).`,
    );
  return data;
}

function closeRelation() {
  document
    .querySelector(".indo-auth-relations-hardener")
    ?.remove();
}

async function openRelation(relation, targetUid) {
  closeRelation();
  const overlay = document.createElement("div");
  overlay.className = "indo-auth-relations-hardener";
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:40000;background:rgba(0,0,0,.82);display:grid;place-items:center;padding:14px;";
  overlay.innerHTML = `<section style="width:min(100%,520px);height:min(78vh,640px);background:#101015;border:1px solid #282832;border-radius:16px;overflow:hidden;display:flex;flex-direction:column"><header style="height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #24242c;color:#fff"><strong>${relation === "followers" ? "Followers" : "Following"}</strong><button type="button" data-hardener-close style="width:36px;height:36px;border:0;background:transparent;color:#fff;font-size:24px">×</button></header><div data-hardener-list style="flex:1;overflow:auto;padding:8px;color:#8e8e98;text-align:center">Loading...</div></section>`;
  document.body.appendChild(overlay);
  overlay
    .querySelector("[data-hardener-close]")
    ?.addEventListener("click", closeRelation);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeRelation();
  });
  const list = overlay.querySelector(
    "[data-hardener-list]",
  );
  try {
    const data = await api(
      `/api/social/${encodeURIComponent(relation)}/${encodeURIComponent(targetUid)}`,
    );
    const items = Array.isArray(data.items)
      ? data.items
      : [];
    if (!items.length) {
      list.textContent = "No users yet.";
      return;
    }
    list.style.textAlign = "left";
    list.innerHTML = items
      .map((item) => {
        const uid = String(item.uid || "").trim();
        const username = String(
          item.userId || item.username || "",
        ).replace(/^@/, "");
        const name = String(item.name || "Indo User");
        const initial = (
          name.trim().charAt(0) ||
          username.charAt(0) ||
          "U"
        ).toUpperCase();
        return `<button type="button" data-hardener-uid="${esc(uid)}" data-hardener-user="${esc(username)}" style="display:flex;width:100%;align-items:center;gap:12px;min-height:60px;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:#fff;text-align:left;cursor:pointer"><span style="width:40px;height:40px;min-width:40px;border-radius:50%;display:grid;place-items:center;background:#2a2a33;font-weight:800">${esc(initial)}</span><span><b style="display:block;font-size:13px">@${esc(username || "user")}</b><small style="color:#8e8e98">${esc(name)}</small></span></button>`;
      })
      .join("");
    list
      .querySelectorAll("[data-hardener-uid]")
      .forEach((button) =>
        button.addEventListener("click", async () => {
          const uid = String(
            button.dataset.hardenerUid || "",
          ).trim();
          const username = String(
            button.dataset.hardenerUser || "",
          ).trim();
          closeRelation();
          state.profile = { uid, ownerUid: uid, username };
          state.screen = "profile";
          if (window.__indoNavigate)
            await window.__indoNavigate("profile");
        }),
      );
  } catch (error) {
    list.textContent =
      error?.message || "Could not load list.";
  }
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  document.addEventListener(
    "click",
    async (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(
              ".profile-direct-stat[data-relation], [data-follow]",
            )
          : null;
      if (!target) return;
      const root = document.getElementById("root");
      if (!root?.contains(target)) return;
      if (
        target.matches(
          ".profile-direct-stat[data-relation]",
        )
      ) {
        const relation = target.dataset.relation;
        if (
          relation !== "followers" &&
          relation !== "following"
        )
          return;
        const uid = getTargetUid();
        if (!uid) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        await openRelation(relation, uid);
        return;
      }
      if (target.matches("[data-follow]")) {
        const uid = getTargetUid();
        if (!uid) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const next =
          !target.classList.contains("following");
        target.disabled = true;
        try {
          const data = await api("/api/social/follow", {
            method: "POST",
            body: JSON.stringify({
              targetUid: uid,
              follow: next,
            }),
          });
          target.classList.toggle(
            "following",
            Boolean(data.following),
          );
          target.textContent = data.pending
            ? "Requested"
            : data.following
              ? "Following"
              : "Follow";
          const count = root.querySelector(
            "[data-followers-count]",
          );
          if (count && data.followersCount !== undefined)
            count.textContent = String(data.followersCount);
        } catch (error) {
          target.textContent =
            error?.message || "Try again";
        } finally {
          target.disabled = false;
        }
      }
    },
    true,
  );
}

install();
export { install };
