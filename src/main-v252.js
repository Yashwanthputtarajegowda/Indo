import { bindAuthSwitches, bindLoginForm, bindSignupForm } from './features/auth/auth-controller.js?v=252';

const app=document.getElementById('root');
const V='252';
let busy=false;

async function render(){
  const {state}=await import('./state.js');
  const {render}=await import(`./router-v252.js?v=${V}`);
  await render(app);
}

async function navigate(screen){
  if(busy) return;
  busy=true;
  try{
    const {state}=await import('./state.js');
    if(screen==='profile') state.profile=null;
    state.screen=String(screen||'home');
    await render();
    window.scrollTo({top:0,behavior:'auto'});
  } finally { busy=false; }
}

if(!window.__indoUniversalNavigationV252){
  window.__indoUniversalNavigationV252=true;
  document.addEventListener('click',(event)=>{
    const el=event.target instanceof Element?event.target:null;
    const button=el?.closest('[data-screen]');
    if(!button) return;
    const screen=button.getAttribute('data-screen');
    if(!screen) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(screen==='profile' && button.hasAttribute('data-own-profile')){
      import('./state.js').then(({state})=>{state.profile=null;state.screen='profile';return render()}).then(()=>window.scrollTo({top:0,behavior:'auto'})).catch(console.error);
      return;
    }
    navigate(screen).catch(console.error);
  },true);
}

async function start(){
  try{
    const {auth}=await import('./features/auth/firebase-client.js');
    const {onAuthStateChanged}=await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js');
    onAuthStateChanged(auth,async user=>{
      const {state}=await import('./state.js');
      state.authenticated=Boolean(user);
      if(user&&(state.screen==='auth-login'||state.screen==='auth-signup')) state.screen='home';
      if(!user&&!String(state.screen||'').startsWith('auth-')) state.screen='auth-login';
      try{
        await render();
        bindAuthSwitches();bindLoginForm();bindSignupForm();
      }catch(error){
        console.error('Indo startup failed:',error);
        app.innerHTML='<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>Indo could not start.</p><small>Please reload the app.</small></main>';
      }
    });
  }catch(error){
    console.error('Indo startup failed:',error);
    app.innerHTML='<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>Indo could not start.</p><small>Please reload the app.</small></main>';
  }
}

window.__indoNavigate=navigate;
start();
