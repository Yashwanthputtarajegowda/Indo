import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  onValue,
  query,
  orderByChild,
  limitToLast
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDXnkQ3JrBGu44HJxs6-Rflhxkqnh0V8Kw',
  authDomain: 'indo-174f0.firebaseapp.com',
  projectId: 'indo-174f0',
  storageBucket: 'indo-174f0.firebasestorage.app',
  messagingSenderId: '943630428817',
  appId: '1:943630428817:web:61a8152dfa4549f5f0ed30',
  measurementId: 'G-TVK92L9S1R'
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);
window.indo = { firebaseApp, auth, db, storage };

const style = document.createElement('style');
style.textContent = `
:root{--bg:#070812;--panel:#101122;--panel2:#15162b;--line:#292a42;--muted:#9b9db5;--text:#f8f8ff;--p:#9b63ff;--pink:#ff4fc4;--orange:#ff8b4d}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:radial-gradient(circle at 20% 0%,#1a1230 0,#070812 35%,#05060d 100%);color:var(--text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input{font:inherit}button{cursor:pointer}.app{min-height:100vh;padding-bottom:92px}.top{height:72px;position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:#080912dd;border-bottom:1px solid var(--line);backdrop-filter:blur(18px)}.brand{font-size:31px;font-weight:950;letter-spacing:-1.5px;background:linear-gradient(90deg,var(--p),var(--pink),var(--orange));-webkit-background-clip:text;background-clip:text;color:transparent}.actions{display:flex;gap:8px}.icon{width:42px;height:42px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:#fff}.main{width:min(1040px,100%);margin:auto;padding:24px 16px}.hero{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}.card{background:linear-gradient(145deg,#121326e8,#0c0d18e8);border:1px solid var(--line);border-radius:28px;padding:24px;box-shadow:0 25px 70px #0005}.eyebrow{color:#b8b5c9;font-size:12px;letter-spacing:2px;font-weight:800}.hero h1{font-size:clamp(42px,7vw,76px);line-height:.92;letter-spacing:-3px;margin:12px 0}.gradient{background:linear-gradient(90deg,var(--p),var(--pink),var(--orange));-webkit-background-clip:text;background-clip:text;color:transparent}.muted{color:var(--muted);line-height:1.55}.primary{margin-top:14px;padding:13px 18px;border:0;border-radius:15px;background:linear-gradient(90deg,#8758ff,#ff4fc4);color:#fff;font-weight:850}.stories{display:flex;gap:14px;overflow:auto;padding:4px 0 12px}.story{text-align:center;min-width:60px;font-size:11px;color:#c8c7d5}.avatar{width:52px;height:52px;margin:auto auto 6px;border-radius:50%;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#8358ff,#ff4fc4,#ff8b4d);border:2px solid #fff2}.feed{display:grid;gap:12px;margin-top:16px}.post{border:1px solid var(--line);border-radius:22px;background:#0e0f1c;padding:16px}.post-head{display:flex;gap:10px;align-items:center}.small-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#8358ff,#ff4fc4);font-weight:900}.post-media{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:16px;margin-top:12px;background:#17182a}.post-actions{display:flex;gap:8px;margin-top:10px}.action{background:#17182a;border:1px solid var(--line);border-radius:12px;padding:8px 11px;color:#fff}..empty{padding:30px 16px;text-align:center;color:var(--muted);border:1px dashed #303149;border-radius:20px}.auth-wrap{min-height:100vh;display:grid;place-items:center;padding:20px}.auth{width:min(430px,100%);padding:28px}.auth h1{margin:0 0 8px;font-size:44px}.field{width:100%;margin-top:10px;padding:14px 15px;border-radius:14px;border:1px solid var(--line);background:#0b0c17;color:#fff;outline:none}.field:focus{border-color:#9b63ff}.auth .primary{width:100%}.switch{margin-top:14px;text-align:center;color:var(--muted)}.link{background:none;border:0;color:#c28cff}.nav{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);width:min(720px,calc(100% - 20px));height:68px;display:flex;align-items:center;justify-content:space-around;background:#0d0e19e8;border:1px solid var(--line);border-radius:23px;backdrop-filter:blur(20px);z-index:30;box-shadow:0 20px 60px #0007}.nav button{min-width:62px;background:none;border:0;color:#85879e}.nav button.active{color:#fff}.nav .symbol{font-size:21px;display:block}.nav span{display:block;font-size:10px;margin-top:3px}.profile-top{display:flex;align-items:center;gap:14px}.profile-avatar{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;font-size:27px;font-weight:900;background:linear-gradient(135deg,#8358ff,#ff4fc4,#ff8b4d)}.stats{display:flex;gap:22px;margin-top:18px}.stats b{display:block;font-size:19px}.stats span{font-size:11px;color:var(--muted)}
@media(max-width:760px){.hero{grid-template-columns:1fr}.main{padding:18px 12px}.hero h1{letter-spacing:-2px}.top{padding:0 14px}.nav button{min-width:54px}}
`;
document.head.appendChild(style);

const app = document.querySelector('#app');
let activePage = 'home';
let unsubscribeFeed = null;

const esc = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const initials = name => (name || 'U').trim().slice(0,1).toUpperCase();

function authScreen(mode='login', message='') {
  const login = mode === 'login';
  app.innerHTML = `<div class="auth-wrap"><div class="card auth"><div class="brand">indo</div><h1>${login ? 'Welcome back' : 'Join Indo'}</h1><p class="muted">${login ? 'Sign in to your real Indo account.' : 'Create your real Indo account.'}</p>${message ? `<div class="empty">${esc(message)}</div>` : ''}${!login ? '<input id="name" class="field" placeholder="Your name" autocomplete="name">' : ''}<input id="email" class="field" type="email" placeholder="Email" autocomplete="email"><input id="password" class="field" type="password" placeholder="Password" autocomplete="current-password"><button id="authSubmit" class="primary">${login ? 'Sign in' : 'Create account'}</button><div class="switch">${login ? 'New to Indo?' : 'Already have an account?'} <button id="authSwitch" class="link">${login ? 'Create account' : 'Sign in'}</button></div></div></div>`;
  document.querySelector('#authSubmit').onclick = async () => {
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    const name = document.querySelector('#name')?.value.trim() || '';
    if (!email || password.length < 6 || (!login && !name)) return authScreen(mode, 'Enter valid details. Password must be at least 6 characters.');
    try {
      if (login) await signInWithEmailAndPassword(auth, email, password);
      else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        await set(ref(db, `indoUsers/${credential.user.uid}`), { uid: credential.user.uid, name, email, createdAt: Date.now() });
      }
    } catch (error) { authScreen(mode, error.message); }
  };
  document.querySelector('#authSwitch').onclick = () => authScreen(login ? 'signup' : 'login');
}

function nav() {
  return `<nav class="nav">
    <button data-page="home" class="${activePage==='home'?'active':''}"><span class="symbol">⌂</span><span>Home</span></button>
    <button data-page="videos" class="${activePage==='videos'?'active':''}"><span class="symbol">▶</span><span>Videos</span></button>
    <button data-page="reels" class="${activePage==='reels'?'active':''}"><span class="symbol">◉</span><span>Reels</span></button>
    <button data-page="messages" class="${activePage==='messages'?'active':''}"><span class="symbol">✉</span><span>Messages</span></button>
    <button data-page="profile" class="${activePage==='profile'?'active':''}"><span class="symbol">●</span><span>Profile</span></button>
  </nav>`;
}

function shell(content) {
  app.innerHTML = `<div class="app"><header class="top"><div class="brand">indo</div><div class="actions"><button id="searchBtn" class="icon">⌕</button><button id="logoutBtn" class="icon">↪</button></div></header><main class="main">${content}</main>${nav()}</div>`;
  document.querySelectorAll('[data-page]').forEach(button => button.onclick = () => renderPage(button.dataset.page));
  document.querySelector('#logoutBtn').onclick = () => signOut(auth);
}

async function getUserProfile(user) {
  const snap = await get(ref(db, `indoUsers/${user.uid}`));
  return snap.exists() ? snap.val() : { uid:user.uid, name:user.displayName || 'Indo User', email:user.email || '' };
}

function homePage() {
  shell(`<section class="hero"><div class="card"><div class="eyebrow">WELCOME TO INDO</div><h1>Share your <span class="gradient">world.</span></h1><p class="muted">Real people. Real posts. Real conversations. Your Indo experience starts here.</p><button id="createBtn" class="primary">＋ Create post</button></div><div class="card"><div class="eyebrow">STORIES</div><div class="stories" id="stories"><div class="story"><div class="avatar">+</div>Your story</div></div><div class="empty">Stories will appear here when real users post them.</div></div></section><section class="feed" id="feed"><div class="empty">Loading real posts…</div></section>`);
  document.querySelector('#createBtn').onclick = createPost;
  loadFeed();
}

function simplePage(title, description) {
  shell(`<section class="card"><div class="eyebrow">INDO</div><h1>${esc(title)}</h1><p class="muted">${esc(description)}</p><div class="empty">No real content yet. This page is connected to the app shell and will only show Firebase data when it exists.</div></section>`);
}

async function profilePage() {
  const user = auth.currentUser;
  const profile = await getUserProfile(user);
  shell(`<section class="card"><div class="profile-top"><div class="profile-avatar">${initials(profile.name)}</div><div><h2>${esc(profile.name || 'Indo User')}</h2><p class="muted">${esc(profile.email || '')}</p></div></div><div class="stats"><div><b id="postCount">0</b><span>Posts</span></div><div><b id="followerCount">0</b><span>Followers</span></div><div><b id="followingCount">0</b><span>Following</span></div></div><button id="logoutProfile" class="primary">Sign out</button></section>`);
  document.querySelector('#logoutProfile').onclick = () => signOut(auth);
  const posts = await get(ref(db, 'indoPosts'));
  if (posts.exists()) document.querySelector('#postCount').textContent = Object.values(posts.val()).filter(p => p.uid === user.uid).length;
  const followers = await get(ref(db, `indoFollowers/${user.uid}`));
  const following = await get(ref(db, `indoFollowing/${user.uid}`));
  document.querySelector('#followerCount').textContent = followers.exists() ? Object.keys(followers.val()).length : 0;
  document.querySelector('#followingCount').textContent = following.exists() ? Object.keys(following.val()).length : 0;
}

async function createPost() {
  const text = prompt('Write your post');
  if (!text?.trim()) return;
  const user = auth.currentUser;
  const postRef = push(ref(db, 'indoPosts'));
  await set(postRef, { uid:user.uid, authorName:user.displayName || 'Indo User', text:text.trim(), createdAt:Date.now(), likes:0, comments:0 });
  loadFeed();
}

function loadFeed() {
  if (unsubscribeFeed) unsubscribeFeed();
  const feed = document.querySelector('#feed');
  if (!feed) return;
  const postsQuery = query(ref(db, 'indoPosts'), orderByChild('createdAt'), limitToLast(30));
  unsubscribeFeed = onValue(postsQuery, snapshot => {
    if (!snapshot.exists()) { feed.innerHTML = '<div class="empty">No posts yet. Create the first real post.</div>'; return; }
    const rows = Object.entries(snapshot.val()).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0));
    feed.innerHTML = rows.map(([id,p]) => `<article class="post"><div class="post-head"><div class="small-avatar">${initials(p.authorName)}</div><div><b>${esc(p.authorName || 'Indo User')}</b><div class="muted" style="font-size:11px">${p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div></div></div><p>${esc(p.text || '')}</p><div class="post-actions"><button class="action">♡ ${Number(p.likes||0)}</button><button class="action">💬 ${Number(p.comments||0)}</button></div></article>`).join('');
  });
}

async function renderPage(page) {
  activePage = page;
  if (page === 'home') homePage();
  else if (page === 'profile') await profilePage();
  else if (page === 'videos') simplePage('Videos','Watch video posts from real Indo users.');
  else if (page === 'reels') simplePage('Reels','Short-form video content from real Indo users.');
  else if (page === 'messages') simplePage('Messages','Real-time conversations will appear here.');
}

onAuthStateChanged(auth, user => {
  if (!user) authScreen('login');
  else renderPage(activePage);
});
