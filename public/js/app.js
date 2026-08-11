import { auth, db } from './firebase.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';

const app = document.querySelector('#app');

const style = document.createElement('style');
style.textContent = `
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#080812;color:#f7f4ff;font-family:Inter,system-ui,sans-serif}button,input{font:inherit}button{cursor:pointer;color:inherit;border:0}.auth{min-height:100vh;display:grid;place-items:center;padding:22px}.auth-card{width:min(440px,100%);background:#111020;border:1px solid #29263e;border-radius:28px;padding:28px;box-shadow:0 20px 60px #0008}.logo{font-size:42px;font-weight:900;text-align:center;background:linear-gradient(90deg,#a879ff,#ff4fc4,#ff9250);-webkit-background-clip:text;color:transparent}.auth-card h1{margin:18px 0 6px;font-size:28px}.muted{color:#aaa6bd}.field{display:grid;gap:7px;margin:14px 0}.field input{width:100%;padding:14px 15px;border-radius:14px;border:1px solid #302d48;background:#0b0a14;color:#fff;outline:none}.field input:focus{border-color:#a879ff}.primary{width:100%;padding:14px 18px;border-radius:14px;background:linear-gradient(90deg,#805bff,#ff4fc4);font-weight:800;margin-top:8px}.switch{width:100%;background:transparent;color:#c5a8ff;margin-top:16px}.error{margin:12px 0;padding:11px 13px;border-radius:12px;background:#3a1624;color:#ffb6c9}.shell{min-height:100vh;padding-bottom:92px}.top{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #28263b;background:#0a0915}.top .logo{font-size:30px;text-align:left}.actions{display:flex;gap:9px}.icon{width:42px;height:42px;border-radius:14px;background:#151326;border:1px solid #29263f}.main{max-width:900px;margin:auto;padding:22px 16px}.card{border:1px solid #29263e;background:#111020;border-radius:24px;padding:22px}.hero h1{font-size:clamp(38px,8vw,68px);line-height:.94;margin:12px 0}.gradient{background:linear-gradient(90deg,#a879ff,#ff4fc4,#ff9250);-webkit-background-clip:text;color:transparent}.hero .primary{width:auto}.nav{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);width:min(700px,calc(100% - 20px));height:68px;border:1px solid #302d48;border-radius:22px;background:#0e0d19f2;display:flex;justify-content:space-around;align-items:center;z-index:20}.nav button{background:transparent;color:#89859e;min-width:60px}.nav button.active{color:#fff}.nav span{display:block;font-size:10px;margin-top:4px}.logout{position:absolute;right:16px;top:82px;padding:10px 14px;border-radius:12px;background:#191727}
`;
document.head.appendChild(style);

function authScreen(mode='login', message='') {
  const signup = mode === 'signup';
  app.innerHTML = `<main class="auth"><section class="auth-card"><div class="logo">Indo</div><h1>${signup ? 'Create your account' : 'Welcome back'}</h1><p class="muted">${signup ? 'Join Indo and share your world.' : 'Login to continue to Indo.'}</p>${message ? `<div class="error">${message}</div>` : ''}<form id="authForm">${signup ? `<label class="field"><span>Name</span><input id="name" required autocomplete="name" placeholder="Your name"></label>` : ''}<label class="field"><span>Email</span><input id="email" type="email" required autocomplete="email" placeholder="you@example.com"></label><label class="field"><span>Password</span><input id="password" type="password" required minlength="6" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="At least 6 characters"></label><button class="primary" type="submit">${signup ? 'Create account' : 'Login'}</button></form><button class="switch" id="switch">${signup ? 'Already have an account? Login' : 'New to Indo? Create account'}</button></section></main>`;
  document.querySelector('#switch').onclick = () => authScreen(signup ? 'login' : 'signup');
  document.querySelector('#authForm').onsubmit = async e => {
    e.preventDefault();
    const button = e.currentTarget.querySelector('button');
    button.disabled = true;
    button.textContent = signup ? 'Creating...' : 'Logging in...';
    try {
      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value;
      if (signup) {
        const name = document.querySelector('#name').value.trim();
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        await set(ref(db, `users/${credential.user.uid}`), { uid: credential.user.uid, name, email, createdAt: Date.now() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      const text = ({'auth/email-already-in-use':'Email already registered. Login instead.','auth/invalid-credential':'Invalid email or password.','auth/invalid-email':'Enter a valid email.','auth/weak-password':'Password must be at least 6 characters.'})[error.code] || error.message;
      authScreen(mode, text);
    }
  };
}

function renderHome(user) {
  app.innerHTML = `<div class="shell"><header class="top"><div class="logo">Indo</div><div class="actions"><button class="icon" aria-label="Search">⌕</button><button class="icon" aria-label="Notifications">♡</button><button class="icon" id="logout" aria-label="Logout">↪</button></div></header><button class="logout" id="logout2">Logout</button><main class="main"><section class="card hero"><div class="muted">WELCOME BACK</div><h1>Share your<br><span class="gradient">world.</span></h1><p class="muted">Hi ${user.displayName || user.email}. Indo is your social space for posts, stories, reels, videos and real conversations.</p><button class="primary" id="createPost">Create your first post</button></section></main><nav class="nav"><button class="active" data-page="home">⌂<span>Home</span></button><button data-page="videos">▶<span>Videos</span></button><button data-page="reels">◉<span>Reels</span></button><button data-page="messages">✉<span>Messages</span></button><button data-page="profile">●<span>Profile</span></button></nav></div>`;
  const logout = () => signOut(auth);
  document.querySelector('#logout').onclick = logout;
  document.querySelector('#logout2').onclick = logout;
}

onAuthStateChanged(auth, user => user ? renderHome(user) : authScreen('login'));
