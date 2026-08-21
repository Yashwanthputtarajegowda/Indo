import { auth } from "../auth/firebase-client.js";
import { getApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  get,
  query,
  ref,
  orderByChild,
  equalTo,
  remove,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const DELETE_PATH_RE = /\/api\/media\/videos\/([^/?#]+)\/delete(?:[/?#]|$)/;
let installed = false;

function extractVideoId(input) {
  try {
    const url = new URL(typeof input === "string" ? input : input?.url || "", window.location.href);
    const match = url.pathname.match(DELETE_PATH_RE);
    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

async function removeFirebaseVideoRecord(videoId) {
  const cleanId = String(videoId || "").trim();
  const user = auth.currentUser;
  if (!cleanId || !user) return;

  const db = getDatabase(getApp());
  const directRef = ref(db, `videos/${cleanId}`);
  const directSnapshot = await get(directRef);

  // Current records normally use the API video id as the RTDB key.
  if (directSnapshot.exists()) {
    await remove(directRef);
    return;
  }

  // Compatibility path for older records that used an auto-generated key.
  const snapshot = await get(
    query(ref(db, "videos"), orderByChild("id"), equalTo(cleanId)),
  );
  if (!snapshot.exists()) return;

  const removals = [];
  snapshot.forEach((child) => {
    if (child.key) removals.push(remove(child.ref));
  });
  await Promise.all(removals);
}

function installVideoDeleteFirebaseSync() {
  if (installed || typeof window.fetch !== "function") return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    const videoId = extractVideoId(input);

    if (!videoId || !response.ok) return response;

    try {
      await removeFirebaseVideoRecord(videoId);
    } catch (error) {
      console.error("Indo Firebase video-delete sync failed:", error);
    }

    return response;
  };
}

installVideoDeleteFirebaseSync();
