import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDXnkQ3JrGu44HJxs6-Rflhxkqnh0V8Kw',
  authDomain: 'indo-174f0.firebaseapp.com',
  databaseURL: 'https://indo-174f0-default-rtdb.firebaseio.com',
  projectId: 'indo-174f0',
  storageBucket: 'indo-174f0.firebasestorage.app',
  messagingSenderId: '943630428817',
  appId: '1:943630428817:web:61a8152dfa4549f5f0ed30',
  measurementId: 'G-TVK92L9S1R'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
