import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXnkQ3JrBGu44HJxs6-Rflhxkqnh0V8Kw",
  authDomain: "indo-174f0.firebaseapp.com",
  databaseURL:
    "https://indo-174f0-default-rtdb.firebaseio.com",
  projectId: "indo-174f0",
  storageBucket: "indo-174f0.firebasestorage.app",
  messagingSenderId: "943630428817",
  appId: "1:943630428817:web:61a8152dfa4549f5f0ed30",
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

// Canonical Indo login persistence: keep the Firebase session across reloads
// and normal browser restarts. Never store ID/access tokens in localStorage.
export const authPersistenceReady = setPersistence(
  auth,
  browserLocalPersistence,
);

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
};
