import { bindAuthSwitches, bindSignupForm } from './features/auth/auth-controller.js';

const app = document.getElementById('root');
const ROUTER_VERSION = '20260814-132';

async function render(){
  const { render } = await import(`./router.js?v=${ROUTER_VERSION}`);
  await render(app);
  bindAuthSwitches();
  bindSignupForm();
}

async function start(){
  try{
    const { auth } = await import('./features/auth/firebase-client.js');
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js');
    onAuthStateChanged(auth, async (user)=>{
      const { state } = await import('./state.js');
      state.authenticated = Boolean(user);
      if(user && (state.screen === 'auth-login' || state.screen === 'auth-signup')) state.screen = 'home';
      if(!user && !String(state.screen || '').startsWith('auth-')) state.screen = 'auth-login';
      try { await render(); } catch(error){ console.error('Indo render failed:', error); app.innerHTML = '<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p></main>'; }
    });
  }catch(error){
    console.error('Indo startup failed:', error);
    app.innerHTML = '<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not start.</p></main>';
  }
}

window.__indoNavigate = async (screen)=>{ const { state } = await import('./state.js'); state.screen = screen; await render(); };
start();
