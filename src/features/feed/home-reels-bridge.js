import { auth } from "../auth/firebase-client.js";

const STYLE_ID = "indo-home-reels-bridge-v1";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-home-reels-section{margin:4px 0 16px;padding:0}
    .indo-home-reels-title{display:flex;align-items:end;justify-content:space-between;padding:8px 2px 8px}
    .indo-home-reels-title h3{margin:0;font-size:13px;font-weight:900;color:#fff}
    .indo-home-reels-title span{font-size:8px;color:#8f8a98}
    .indo-home-reels-list{display:grid;gap:14px}
    .indo-home-reel-badge{position:absolute;top:9px;left:9px;z-index:4;padding:5px 8px;border-radius:999px;background:rgba(7,7,12,.72);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:8px;font-weight:900;backdrop-filter:blur(10px)}
  `;
  document.head.appendChild(style);
}

export async function installHomeReelsBridge(root = document) {
  const feed = root.querySelector?.("[data-home-feed]");
  if (!feed || feed.querySelector(".indo-home-reels-section")) return;

  installStyles();
  const apiBase = window.INDO_API_BASE || "";
  const headers = {};
  if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  try {
    const response = await fetch(`${apiBase}/api/media/videos?type=reel&limit=10`, { headers });
    if (!response.ok) return;
    const data = await response.json().catch(() => ({}));
    const reels = Array.isArray(data.videos) ? data.videos : [];
    if (!reels.length) return;

    const { renderVideoCard, bindVideoCards } = await import("./home-feed.js?v=20260815-home-reel-card-v1");
    const section = document.createElement("section");
    section.className = "indo-home-reels-section";
    section.innerHTML = `<div class="indo-home-reels-title"><h3>Fresh Reels</h3><span>Reels from the Indo community</span></div><div class="indo-home-reels-list"></div>`;
    const list = section.querySelector(".indo-home-reels-list");
    list.innerHTML = reels.map((reel) => renderVideoCard(reel)).join("");

    list.querySelectorAll(".video-post").forEach((card) => {
      const stage = card.querySelector(".neon-video-stage");
      if (stage && !stage.querySelector(".indo-home-reel-badge")) {
        const badge = document.createElement("span");
        badge.className = "indo-home-reel-badge";
        badge.textContent = "REEL";
        stage.appendChild(badge);
      }
    });

    feed.appendChild(section);
    bindVideoCards(list);
  } catch (error) {
    console.warn("Home reels bridge unavailable:", error);
  }
}
