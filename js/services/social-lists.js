import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

export async function getFollowLists(uid) {
  if (!uid) return { followers: [], following: [] };
  const [followersSnapshot, followingSnapshot] = await Promise.all([
    get(ref(database, `users/${uid}/followers`)),
    get(ref(database, `users/${uid}/following`))
  ]);

  const mapEntries = (snapshot) => Object.values(snapshot.val() || {}).map((entry) => {
    if (typeof entry === "string") return { uid: entry, userId: `@${entry.slice(0, 8)}`, name: "Indo User" };
    if (entry && typeof entry === "object") return {
      uid: entry.uid || "",
      userId: entry.userId || `@${String(entry.uid || "").slice(0, 8)}`,
      name: entry.name || "Indo User"
    };
    return null;
  }).filter((item) => item?.uid);

  return {
    followers: mapEntries(followersSnapshot),
    following: mapEntries(followingSnapshot)
  };
}
