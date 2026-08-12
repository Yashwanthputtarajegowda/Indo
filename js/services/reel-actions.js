import { getMediaLikeStatus, toggleMediaLike } from "./media-like.js";
import { getSavedMediaStatus, toggleSavedMedia } from "./media-save.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { auth } from "./firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBv8eQ9rX8xQ8oY0dYqKqf9mG7pKq7r7xY",
  authDomain: "indo-174f0.firebaseapp.com",
  databaseURL: "https://indo-174f0-default-rtdb.firebaseio.com",
  projectId: "indo-174f0",
  storageBucket: "indo-174f0.firebasestorage.app",
  messagingSenderId: "1053729027185",
  appId: "1:1053729027185:web:8b2d0a9a7c0b1e9f4c2d11"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);

export async function toggleLike(reelId) {
  return toggleMediaLike(reelId);
}

export async function getLikeStatus(reelId) {
  return getMediaLikeStatus(reelId);
}

export async function getSaveStatus(reelId) {
  return getSavedMediaStatus(reelId);
}

export async function toggleSave(reelId) {
  return toggleSavedMedia(reelId);
}

export function openComments(reelId) {
  window.dispatchEvent(new CustomEvent("indo:reel-comment", { detail: { reelId } }));
}

export async function shareReel(reelId) {
  const shareData = {
    title: "Indo Reel",
    text: "Watch this reel on Indo.",
    url: `${window.location.origin}/reel/${reelId}`
  };
  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }
  if (navigator.clipboard) await navigator.clipboard.writeText(shareData.url);
}

export function watchReelComments(reelId, onComments) {
  const commentsRef = ref(database, `reelComments/${reelId}`);
  return onValue(commentsRef, (snapshot) => {
    const comments = Object.values(snapshot.val() || {}).sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
    onComments(comments);
  });
}

export async function addReelComment(reelId, text) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  const cleanText = String(text || "").trim().slice(0, 500);
  if (!cleanText) throw new Error("Comment cannot be empty.");
  const commentRef = ref(database, `reelComments/${reelId}`);
  await push(commentRef, {
    uid: user.uid,
    userId: user.email || user.uid,
    text: cleanText,
    createdAt: Date.now()
  });
}
