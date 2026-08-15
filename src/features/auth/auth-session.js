import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { auth } from './firebase-client.js';

const LOCAL_SESSION_KEY='indo:auth-session-v1';

export function watchAuthSession(onSignedIn, onSignedOut) {
  return onAuthStateChanged(auth, (user) => {
    if (user) onSignedIn(user);
    else onSignedOut();
  });
}

export async function logout() {
  try{localStorage.removeItem(LOCAL_SESSION_KEY)}catch{}
  await signOut(auth);
}
