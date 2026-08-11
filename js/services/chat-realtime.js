import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  query,
  limitToLast
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
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

function conversationKey(userId) {
  return String(userId || "").replace(/^@/, "").replace(/[^A-Za-z0-9._-]/g, "_");
}

export function watchConversation(userId, onMessages) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return () => {};
  }

  const messagesRef = query(
    ref(database, `conversations/${conversationKey(userId)}/messages`),
    limitToLast(100)
  );

  return onValue(messagesRef, (snapshot) => {
    const raw = snapshot.val() || {};
    const messages = Object.entries(raw).map(([id, message]) => ({
      id,
      ...message
    }));

    onMessages(messages);
  });
}

export async function sendConversationMessage(userId, text) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Authentication required.");
  }

  const cleanText = String(text || "").trim();

  if (!cleanText) {
    throw new Error("Message cannot be empty.");
  }

  const messagesRef = ref(
    database,
    `conversations/${conversationKey(userId)}/messages`
  );

  await push(messagesRef, {
    senderUid: currentUser.uid,
    type: "outgoing",
    text: cleanText,
    createdAt: Date.now()
  });
}
