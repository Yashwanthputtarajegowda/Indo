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

  // Fast path: the API's video id is normally the Realtime Database key.
  await remove(ref(db, `videos/${cleanId}`));

  // Compatibility path: older records may use an auto-generated key while
  // storing the API id inside the record itself.
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

    if (!videoId) return response;
    if (!response.ok) return response;

    try {
      await removeFirebaseVideoRecord(videoId);
    } catch (error) {
      // The API delete already succeeded. Keep the normal UI behavior, but
      // surface the Firebase sync failure for diagnostics instead of blocking
      // the response that the delete UI is already awaiting.
      console.error("Indo Firebase video-delete sync failed:", error);
    }

    return response;
  };
}

installVideoDeleteFirebaseSync();
