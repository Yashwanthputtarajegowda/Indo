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

export async function removeFirebaseVideoRecord(videoId) {
  const cleanId = String(videoId || "").trim();
  const user = auth.currentUser;
  if (!cleanId || !user) throw new Error("Please login first.");

  const db = getDatabase(getApp());
  const directRef = ref(db, `videos/${cleanId}`);
  const directSnapshot = await get(directRef);

  if (directSnapshot.exists()) {
    await remove(directRef);
    return { removed: true, mode: "direct" };
  }

  const snapshot = await get(
    query(ref(db, "videos"), orderByChild("id"), equalTo(cleanId)),
  );

  if (!snapshot.exists()) {
    return { removed: false, mode: "not-found" };
  }

  const removals = [];
  snapshot.forEach((child) => {
    if (child.key) removals.push(remove(child.ref));
  });
  await Promise.all(removals);
  return { removed: removals.length > 0, mode: "legacy" };
}
