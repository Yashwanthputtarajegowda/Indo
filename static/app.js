import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';
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

const style = document.createElement('style');
style.textContent = `
*{box-sizing:border-box}html,body{margin:0;background:#080812;color:#f8f7ff;font-family:Inter,system-ui,-apple-system,sans-serif}body{min-height:100vh;padding-bottom:90px}button{font:inherit;color:inherit;border:0;cursor:pointer}.app{max-width:1180px;margin:auto}.top{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid #25243a;background:#090914e8;position:sticky;top:0;z-index:10;backdrop-filter:blur(18px)}.brand{font-size:30px;font-weight:900;letter-spacing:-1px;background:linear-gradient(90deg,#a978ff,#ff4fc4,#ff8d4d);-webkit-background-clip:text;background-clip:text;color:transparent}.top-actions{display:flex;gap:10px}.icon{width:42px;height:42px;border-radius:14px;background:#151426;border:1px solid #29273e}.main{padding:28px 18px}.hero{display:grid;grid-template-columns:1.25fr .75fr;gap:18px;align-items:stretch}.panel{background:linear-gradient(145deg,#111022,#0b0b15);border:1px solid #27263d;border-radius:28px;padding:24px;box-shadow:0 18px 60px #0006}.hero h1{font-size:clamp(38px,6vw,70px);line-height:.95;margin:10px 0}.gradient{background:linear-gradient(90deg,#a978ff,#ff4fc4,#ff8d4d);-webkit-background-clip:text;background-clip:text;color:transparent}.muted{color:#a5a2b8}.cta{display:inline-flex;padding:13px 19px;border-radius:15px;background:linear-gradient(90deg,#8d62ff,#ff4fc4);font-weight:800;margin-top:14px}.phones{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.phone{min-height:260px;border:1px solid #302d4a;border-radius:24px;padding:14px;background:linear-gradient(160deg,#17152a,#090910)}.phone-head{display:flex;justify-content:space-between;align-items:center;font-weight:800}.avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#8d62ff,#ff4fc4);display:grid;place-items:center;font-weight:900}.stories{display:flex;gap:12px;overflow:hidden;margin:18px 0}.story{text-align:center;font-size:11px;min-width:58px}.story .avatar{width:50px;height:50px;border:2px solid #ff4fc4;margin:auto auto 5px}.post{margin-top:12px;padding:12px;border-radius:17px;background:#11101d;border:1px solid #27253b}.post-line{height:9px;border-radius:9px;background:#2a2840;margin:8px 0}.media{height:100px;border-radius:14px;background:linear-gradient(135deg,#2c1c50,#7b245e,#d76537);margin-top:10px}.nav{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);width:min(700px,calc(100% - 22px));height:68px;border:1px solid #302d49;border-radius:22px;background:#0e0d19e8;backdrop-filter:blur(18px);display:flex;justify-content:space-around;align-items:center;z-index:20}.nav button{background:transparent;min-width:70px;color:#8e8aa3}.nav button.active{color:#fff}.nav span{display:block;font-size:10px;margin-top:4px}.features{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}.feature{padding:18px;border-radius:20px;background:#11101d;border:1px solid #27253b}.feature b{display:block;margin-bottom:6px}@media(max-width:760px){.hero{grid-template-columns:1fr}.features{grid-template-columns:repeat(2,1fr)}.main{padding:18px 12px}.top{padding:0 14px}}@media(max-width:430px){.features{grid-template-columns:1fr 1fr}.phone{min-height:220px}.nav button{min-width:55px}}
`;
document.head.appendChild(style);

const app = document.querySelector('#app');

function screen(title, active='home') {
  app.innerHTML = `
  <div class="app">
    <header class="top"><div class="brand">indo</div><div class="top-actions"><button class="icon">⌕</button><button class="icon">♡</button><button class="icon">＋</button></div></header>
    <main class="main">
      <section class="hero">
        <div class="panel"><div class="muted">WELCOME TO</div><h1><span class="gradient">Indo</span><br>Share your world.</h1><p class="muted">A fast, modern social space for photos, videos, stories, reels and real conversations.</p><button class="cta">Create your first post</button></div>
        <div class="phones">
          <div class="phone"><div class="phone-head"><span>Stories</span><span>•••</span></div><div class="stories"><div class="story"><div class="avatar">Y</div>You</div><div class="story"><div class="avatar">A</div>Arun</div><div class="story"><div class="avatar">S</div>Sneha</div></div><div class="post"><b>@arun</b><div class="media"></div><div class="post-line" style="width:70%"></div><div class="post-line" style="width:45%"></div></div></div>
          <div class="phone"><div class="phone-head"><span>Messages</span><span>＋</span></div><div class="post"><b>@sneha</b><p class="muted">Hey! Welcome to Indo 👋</p></div><div class="post"><b>@rahul</b><p class="muted">Sent you a photo</p></div><div class="post"><b>@megha</b><p class="muted">Let's connect!</p></div></div>
        </div>
      </section>
      <section class="features"><div class="feature"><b>⚡ Fast & Smooth</b><span class="muted">Clean responsive experience.</span></div><div class="feature"><b>🔒 Secure & Private</b><span class="muted">Firebase authentication.</span></div><div class="feature"><b>☁ Cloud Sync</b><span class="muted">Real-time data and media.</span></div><div class="feature"><b>📱 Responsive</b><span class="muted">Built for every screen.</span></div></section>
    </main>
    <nav class="nav">
      <button class="${active==='home'?'active':''}">⌂<span>Home</span></button><button>▶<span>Videos</span></button><button>◉<span>Reels</span></button><button>✉<span>Messages</span></button><button>●<span>Profile</span></button>
    </nav>
  </div>`;
}

screen('Home');

// Firebase instances are intentionally initialized now so real authentication,
// database and storage features can be added to the same clean app without
// replacing the visual shell later.
window.indo = { firebaseApp, auth, db, storage };
