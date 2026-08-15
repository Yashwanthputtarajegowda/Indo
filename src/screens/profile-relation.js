import { auth } from "../features/auth/firebase-client.js";

function esc(value = "") {
  return String(value).replace(
    /[&<>\"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

function context() {
  const value = window.__indoProfileRelationContext;
  return value && typeof value === "object" ? value : {};
}

function backToProfile() {
  const value = context();
  const profile = value.returnProfile;
  window.__indoProfileRelationContext = null;

  if (
    profile?.userId &&
    window.__indoOpenProfile
  ) {
    window.__indoOpenProfile(profile).catch(() => {
      window.__indoNavigate?.("profile");
    });
    return;
  }

  window.__indoNavigate?.("profile");
}

function renderError(list, message) {
  list.innerHTML = `
    <div class="indo-relation-empty">
      ${esc(message)}
    </div>
  `;
}

export async function renderProfileRelation(app) {
  const value = context();
  const relation =
    value.relation === "following"
      ? "following"
      : "followers";
  const title =
    relation === "followers"
      ? "Followers"
      : "Following";
  const currentUser = auth.currentUser;
  const targetUid = String(
    value.targetUid ||
      (value.returnProfile?.uid ||
        currentUser?.uid ||
        ""),
  ).trim();

  app.innerHTML = `
    <main class="indo-relation-page">
      <section class="indo-relation-card">
        <header class="indo-relation-header">
          <button
            type="button"
            data-relation-back
            aria-label="Back to profile"
          >
            ←
          </button>
          <h1>${title}</h1>
          <span></span>
        </header>
        <div
          class="indo-relation-list"
          data-relation-list
        >
          Loading...
        </div>
      </section>
    </main>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .indo-relation-page {
      min-height: 100vh;
      background: #08080d;
      color: #f4f4f7;
    }
    .indo-relation-card {
      width: min(520px, 100%);
      min-height: 100vh;
      margin: auto;
      background: #101017;
    }
    .indo-relation-header {
      position: sticky;
      top: 0;
      z-index: 2;
      display: grid;
      grid-template-columns: 42px 1fr 42px;
      align-items: center;
      height: 58px;
      padding: 0 12px;
      border-bottom: 1px solid #292934;
      background: #101017;
      box-sizing: border-box;
    }
    .indo-relation-header h1 {
      margin: 0;
      text-align: center;
      font-size: 17px;
    }
    .indo-relation-header button {
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 50%;
      background: #1b1b25;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
    .indo-relation-list {
      padding: 12px 14px 80px;
      display: grid;
      gap: 8px;
    }
    .indo-relation-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px;
      border: 1px solid #222630;
      border-radius: 12px;
      background: #12141c;
      color: #fff;
      text-align: left;
      cursor: pointer;
      box-sizing: border-box;
    }
    .indo-relation-avatar {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      flex: 0 0 42px;
      overflow: hidden;
      border-radius: 50%;
      background: #242938;
      font-weight: 900;
    }
    .indo-relation-meta {
      min-width: 0;
    }
    .indo-relation-name {
      font-size: 13px;
      font-weight: 800;
    }
    .indo-relation-id {
      margin-top: 3px;
      color: #858d9f;
      font-size: 11px;
    }
    .indo-relation-empty {
      padding: 44px 16px;
      color: #858d9f;
      text-align: center;
    }
  `;
  app.appendChild(style);

  const list = app.querySelector(
    "[data-relation-list]",
  );
  app
    .querySelector("[data-relation-back]")
    ?.addEventListener("click", backToProfile);

  if (!currentUser) {
    renderError(list, "Please login first.");
    return;
  }

  if (!targetUid) {
    renderError(
      list,
      "Profile information is missing.",
    );
    return;
  }

  try {
    const token = await currentUser.getIdToken();
    const response = await fetch(
      `${window.INDO_API_BASE || ""}/api/social/${relation}/${encodeURIComponent(targetUid)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error ||
          `Could not load ${title.toLowerCase()}.`,
      );
    }

    const items = Array.isArray(data.items)
      ? data.items
      : [];

    if (!items.length) {
      renderError(
        list,
        `No ${title.toLowerCase()} yet.`,
      );
      return;
    }

    list.innerHTML = items
      .map((item) => {
        const userId = String(
          item.userId || "",
        ).replace(/^@/, "");
        const name = String(
          item.name ||
            userId ||
            "Indo User",
        );
        const initial = esc(
          name.charAt(0).toUpperCase(),
        );
        return `
          <button
            type="button"
            class="indo-relation-item"
            data-profile-user="${esc(userId)}"
            data-profile-uid="${esc(item.uid || "")}" 
          >
            <span class="indo-relation-avatar">
              ${initial}
            </span>
            <span class="indo-relation-meta">
              <span class="indo-relation-name">
                ${esc(name)}
              </span>
              <span class="indo-relation-id">
                ${userId ? `@${esc(userId)}` : ""}
              </span>
            </span>
          </button>
        `;
      })
      .join("");

    list
      .querySelectorAll("[data-profile-user]")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const userId =
            item.dataset.profileUser || "";
          const uid =
            item.dataset.profileUid || "";

          window.__indoOpenProfile?.({
            userId,
            uid,
          });
        });
      });
  } catch (error) {
    renderError(
      list,
      error?.message ||
        `Could not load ${title.toLowerCase()}.`,
    );
  }
}
