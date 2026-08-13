import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDXnkQ3JrBGu44HJxs6-Rflhxkqnh0V8Kw',
  authDomain: 'indo-174f0.firebaseapp.com',
  databaseURL: 'https://indo-174f0-default-rtdb.firebaseio.com',
  projectId: 'indo-174f0',
  storageBucket: 'indo-174f0.firebasestorage.app',
  messagingSenderId: '943630428817',
  appId: '1:943630428817:web:61a8152dfa4549f5f0ed30'
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail };

// Own the story-add gesture at the earliest shared app module so duplicate
// home/index click handlers cannot steal the file picker or navigation.
if (typeof document !== 'undefined' && !window.__indoStoryPickerGuardBound) {
  window.__indoStoryPickerGuardBound = true;

  const launchStoryPicker = (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-story-add]') : null;
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (target.dataset.storyPickerBusy === '1') return;
    target.dataset.storyPickerBusy = '1';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.width = '1px';
    input.style.height = '1px';
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const file = input.files?.[0] || null;
      input.remove();
      window.setTimeout(() => { target.dataset.storyPickerBusy = '0'; }, 250);
      if (!file || !file.type.startsWith('video/')) return;

      try {
        window.__indoStoryDraftFile = file;
        const app = document.getElementById('root');
        if (!app) throw new Error('App root is missing.');
        const { renderStoryCreate } = await import('../../screens/story-create.js?v=51');
        await renderStoryCreate(app, file);
      } catch (error) {
        console.error('Direct story preview launch failed:', error);
      }
    }, { once: true });

    try {
      if (typeof input.showPicker === 'function') input.showPicker();
      else input.click();
    } catch {
      input.click();
    }
  };

  document.addEventListener('pointerdown', launchStoryPicker, true);
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-story-add]') : null;
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}
