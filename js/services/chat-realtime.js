import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue, query, limitToLast, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { auth } from "./firebase-auth.js";
import { createClientNotification } from "./notifications.js";

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

function safePart(value) {
  return String(value || "").replace(/[^A-Za-z0-9_-]/g, "_");
}

function conversationKey(otherUid) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || !otherUid) return "";
  return [currentUid, otherUid].map(safePart).sort().join("__");
}

async function writeConversationIndex(otherUid, otherUserId, otherName, preview) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || !otherUid) return;

  const key = conversationKey(otherUid);
  await set(ref(database, `userConversations/${currentUid}/${key}`), {
    conversationKey: key,
    otherUid,
    otherUserId,
    otherName: otherName || otherUserId,
    preview: preview || "",
    updatedAt: Date.now()
  });

  await set(ref(database, `userConversations/${otherUid}/${key}`), {
    conversationKey: key,
    otherUid: currentUid,
    otherUserId: "",
    otherName: "",
    preview: preview || "",
    updatedAt: Date.now(),
    unreadCount: 1
  });
}

export function watchConversation(otherUid, onMessages) {
  const currentUser = auth.currentUser;
  const key = conversationKey(otherUid);
  if (!currentUser || !key) return () => {};

  const messagesRef = query(ref(database, `conversations/${key}/messages`), limitToLast(100));
  return onValue(messagesRef, (snapshot) => {
    const raw = snapshot.val() || {};
    const messages = Object.entries(raw).map(([id, message]) => ({ id, ...message }));
    onMessages(messages);
  });
}

export function watchUserConversations(onConversations) {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  return onValue(ref(database, `userConversations/${currentUser.uid}`), (snapshot) => {
    const raw = snapshot.val() || {};
    const items = Object.values(raw).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    onConversations(items);
  });
}

export async function sendConversationMessage({ otherUid, otherUserId, otherName, text }) {
  const currentUser = auth.currentUser;
  const key = conversationKey(otherUid);
  if (!currentUser || !key) throw new Error("Authentication or recipient information is missing.");

  const cleanText = String(text || "").trim();
  if (!cleanText) throw new Error("Message cannot be empty.");

  await push(ref(database, `conversations/${key}/messages`), {
    senderUid: currentUser.uid,
    type: "outgoing",
    text: cleanText,
    createdAt: Date.now()
  });

  await writeConversationIndex(otherUid, otherUserId, otherName, cleanText);

  const actorName = currentUser.displayName || currentUser.email || "Indo User";
  await createClientNotification({
    recipientUid: otherUid,
    type: "message",
    actorUid: currentUser.uid,
    actorName,
    actorUserId: otherUserId,
    text: `New message from ${actorName}`,
    targetId: key
  }).catch(() => {});
}
