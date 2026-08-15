import { auth } from "../auth/firebase-client.js";
import { recordWatchProgress } from "../earning/earning.js";

export async function loadReels(limit = 20) {
  const apiBase = window.INDO_API_BASE || "";
  const headers = {};
  if (auth.currentUser) {
    headers.Authorization =
      `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  const response = await fetch(
    `${apiBase}/api/media/videos?type=reel&limit=${limit}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error("Could not load reels.");
  }

  const data = await response.json();
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function recordReelView(reelId) {
  const apiBase = window.INDO_API_BASE || "";
  const headers = {};

  if (auth.currentUser) {
    headers.Authorization =
      `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  const response = await fetch(
    `${apiBase}/api/media/videos/${encodeURIComponent(reelId)}/view`,
    {
      method: "POST",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Could not record reel view.");
  }

  return response.json();
}

function escapeHtml(value = "") {
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

function cleanUserId(value = "") {
  return String(value || "")
    .trim()
    .replace(/^@+/, "");
}

function bindWatchProgress(videoElement, mediaId) {
  let lastReportedAt = 0;

  const sendDelta = () => {
    const current = Number(videoElement.currentTime || 0);
    const delta = current - lastReportedAt;

    if (delta >= 10) {
      lastReportedAt = current;
      recordWatchProgress(
        mediaId,
        Math.min(15, delta),
      );
    }
  };

  videoElement.addEventListener(
    "timeupdate",
    sendDelta,
  );
  videoElement.addEventListener("pause", sendDelta);
  videoElement.addEventListener("ended", sendDelta);
}

export function renderReel(video) {
  const creatorRaw = String(
    video.userId ||
      video.username ||
      video.creator ||
      "@indo",
  );
  const creator = escapeHtml(
    creatorRaw.replace(/^@/, ""),
  );
  const userId = escapeHtml(
    cleanUserId(
      video.userId ||
        video.username ||
        video.creator ||
        "indo",
    ),
  );
  const targetUid = escapeHtml(video.ownerUid || "");
  const caption = escapeHtml(
    video.caption || video.title || "",
  );
  const id = escapeHtml(video.id);
  const likes = Number(video.likes || 0).toLocaleString();

  return `<article
    class="reel-view"
    data-video-id="${id}"
  >
    <video
      class="reel-video"
      src="${escapeHtml(video.secureUrl)}"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
    ></video>
    <div class="reel-gradient"></div>
    <div
      class="reel-info"
    >
      <div
        class="reel-user"
        data-profile-uid="${targetUid}"
        data-profile-username="${userId}"
      >
        <button
          class="avatar small reel-avatar"
          type="button"
          data-profile-avatar
          data-profile-uid="${targetUid}"
          data-profile-username="${userId}"
          data-open-profile="${userId}"
          aria-label="Open @${userId} profile"
        >
          ${escapeHtml(
            creator.charAt(0).toUpperCase() || "I",
          )}
        </button>
        <button
          class="reel-user-id"
          type="button"
          data-open-profile="${userId}"
          data-profile-uid="${targetUid}"
          data-profile-username="${userId}"
        >
          @${userId}
        </button>
        ${
          targetUid
            ? `<button
                class="follow-btn"
                data-follow-uid="${targetUid}"
                type="button"
              >Follow</button>`
            : ""
        }
      </div>
      <p>${caption}</p>
      <small>♪ Original audio</small>
    </div>
    <div class="reel-actions">
      <button
        data-engagement="like"
        type="button"
        aria-label="Like"
      >
        ♡<small>${likes}</small>
      </button>
      <button
        data-engagement="comment"
        type="button"
        aria-label="Comment"
      >
        ◯<small>Comment</small>
      </button>
      <button
        data-engagement="share"
        type="button"
        aria-label="Share"
      >
        ↗<small>Share</small>
      </button>
      <button
        data-engagement="save"
        type="button"
        aria-label="Save"
      >
        🔖
      </button>
    </div>
  </article>`;
}

export function bindReelWatchProgress(root) {
  root
    .querySelectorAll(".reel-view .reel-video")
    .forEach((video) => {
      const card = video.closest("[data-video-id]");
      if (card) {
        bindWatchProgress(
          video,
          card.dataset.videoId,
        );
      }
    });
}
