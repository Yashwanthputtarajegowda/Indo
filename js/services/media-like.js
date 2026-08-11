import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
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

async function getLikeSnapshot(mediaId) {
  const snapshot = await get(ref(database, `mediaLikes/${mediaId}`));
  const users = snapshot.val() || {};
  return { users, count: Object.keys(users).length };
}

export async function getMediaLikeStatus(mediaId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  const { users, count } = await getLikeSnapshot(mediaId);
  return { liked: Boolean(users[user.uid]), likes: count };
}

export async function toggleMediaLike(mediaId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  if (!mediaId) throw new Error("Media ID is required.");

  const userLikeRef = ref(database, `mediaLikes/${mediaId}/${user.uid}`);
  const current = await get(userLikeRef);
  if (current.exists()) {
    await remove(userLikeRef);
  } else {
    await set(userLikeRef, { uid: user.uid, createdAt: Date.now() });
  }
  return getMediaLikeStatus(mediaId);
}
