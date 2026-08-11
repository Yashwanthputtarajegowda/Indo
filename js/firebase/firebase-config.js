import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_PLACEHOLDER",
  authDomain: "indo-174f0.firebaseapp.com",
  databaseURL: "https://indo-174f0-default-rtdb.firebaseio.com",
  projectId: "indo-174f0",
  storageBucket: "indo-174f0.firebasestorage.app",
  messagingSenderId: "943630428817",
  appId: "1:943630428817:web:61a8152dfa4549f5f0ed30",
  measurementId: "G-TVK92L9S1R1"
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const database = getDatabase(firebaseApp);
