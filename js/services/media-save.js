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

export async function getSavedMediaStatus(mediaId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  const snapshot = await get(ref(database, `savedMedia/${user.uid}/${mediaId}`));
  return { saved: snapshot.exists() };
}

export async function toggleSavedMedia(mediaId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  const id = String(mediaId || "").trim();
  if (!id) throw new Error("Media ID is required.");
  const savedRef = ref(database, `savedMedia/${user.uid}/${id}`);
  const current = await get(savedRef);
  if (current.exists()) await remove(savedRef);
  else await set(savedRef, { mediaId: id, createdAt: Date.now() });
  return getSavedMediaStatus(id);
}

// Keep the named export available to all Reel actions on static hosts.
export const getSaveStatus = getSavedMediaStatus;
