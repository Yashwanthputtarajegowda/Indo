import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const app = document.querySelector('#app');

const style = document.createElement('style');
style.textContent = `
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#080812;color:#f7f4ff;font-family:Inter,system-ui,sans-serif}button{font:inherit;color:inherit;border:0;cursor:pointer}.shell{min-height:100vh;padding-bottom:92px}.top{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #28263b;background:#0a0915}.logo{font-size:30px;font-weight:900;background:linear-gradient(90deg,#a879ff,#ff4fc4,#ff9250);-webkit-background-clip:text;color:transparent}.actions{display:flex;gap:9px}.icon{width:42px;height:42px;border-radius:14px;background:#151326;border:1px solid #29263f}.main{max-width:900px;margin:auto;padding:22px 16px}.card{border:1px solid #29263e;background:#111020;border-radius:24px;padding:22px}.hero h1{font-size:clamp(38px,8vw,68px);line-height:.94;margin:12px 0}.muted{color:#aaa6bd}.gradient{background:linear-gradient(90deg,#a879ff,#ff4fc4,#ff9250);-webkit-background-clip:text;color:transparent}.primary{padding:13px 18px;border-radius:14px;background:linear-gradient(90deg,#805bff,#ff4fc4);font-weight:800;margin-top:12px}.nav{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);width:min(700px,calc(100% - 20px));height:68px;border:1px solid #302d48;border-radius:22px;background:#0e0d19f2;display:flex;justify-content:space-around;align-items:center;z-index:20}.nav button{background:transparent;color:#89859e;min-width:60px}.nav button.active{color:#fff}.nav span{display:block;font-size:10px;margin-top:4px}
`;
document.head.appendChild(style);

function render(user) {
  app.innerHTML = `
    <div class="shell">
      <header class="top"><div class="logo">Indo</div><div class="actions"><button class="icon" aria-label="Search">⌕</button><button class="icon" aria-label="Notifications">♡</button><button class="icon" aria-label="Create">＋</button></div></header>
      <main class="main">
        <section class="card hero">
          <div class="muted">${user ? 'WELCOME BACK' : 'WELCOME TO'}</div>
          <h1>Share your<br><span class="gradient">world.</span></h1>
          <p class="muted">Indo is your social space for posts, stories, reels, videos and real conversations.</p>
          <button class="primary">Create your first post</button>
        </section>
      </main>
      <nav class="nav" aria-label="Main navigation">
        <button class="active" data-page="home">⌂<span>Home</span></button>
        <button data-page="videos">▶<span>Videos</span></button>
        <button data-page="reels">◉<span>Reels</span></button>
        <button data-page="messages">✉<span>Messages</span></button>
        <button data-page="profile">●<span>Profile</span></button>
      </nav>
    </div>`;

  document.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-page]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    });
  });
}

onAuthStateChanged(auth, user => render(user));
