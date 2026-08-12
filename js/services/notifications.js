import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
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

export function watchNotifications(onNotifications) {
  const user = auth.currentUser;
  if (!user) return () => {};
  return onValue(ref(database, `notifications/${user.uid}`), (snapshot) => {
    const items = Object.values(snapshot.val() || {})
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    onNotifications(items);
  });
}

export async function markNotificationRead(notificationId) {
  const user = auth.currentUser;
  if (!user || !notificationId) return;
  await update(ref(database, `notifications/${user.uid}/${notificationId}`), { read: true });
}

export async function createClientNotification({ recipientUid, type, actorUid, actorName = "", actorUserId = "", text = "", targetId = "" }) {
  const user = auth.currentUser;
  if (!user || !recipientUid || !type || !actorUid || user.uid !== actorUid || user.uid === recipientUid) return;
  const notificationRef = push(ref(database, `notifications/${recipientUid}`));
  await set(notificationRef, {
    id: notificationRef.key,
    type,
    actorUid,
    actorName,
    actorUserId,
    text,
    targetId,
    read: false,
    createdAt: Date.now()
  });
}
