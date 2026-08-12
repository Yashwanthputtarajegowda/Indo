import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXnkQ3JrBGu44HJxs6-Rflhxkqnh0V8Kw",
  authDomain: "indo-174f0.firebaseapp.com",
  databaseURL: "https://indo-174f0-default-rtdb.firebaseio.com",
  projectId: "indo-174f0",
  storageBucket: "indo-174f0.firebasestorage.app",
  messagingSenderId: "943630428817",
  appId: "1:943630428817:web:61a8152dfa4549f5f0ed30",
  measurementId: "G-TVK92L9S1R"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export async function ensureAuthenticated() {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);

  return result.user;
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function logout() {
  await signOut(auth);
}

export { auth };
