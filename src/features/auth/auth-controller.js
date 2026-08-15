import { state } from '../../state.js';
import { auth, authPersistenceReady, signInWithEmailAndPassword, sendPasswordResetEmail } from './firebase-client.js';
import { submitSignup } from './signup-form.js';

const ROUTER_VERSION='20260815-211';
const LOCAL_SESSION_KEY='indo:auth-session-v1';
function getRoot(){return document.getElementById('root')}
function saveLocalSession(user){
  try{localStorage.setItem(LOCAL_SESSION_KEY,JSON.stringify({uid:user?.uid||'',email:user?.email||'',savedAt:Date.now()}));}catch{}
}
export function hasLocalSession(){
  try{return Boolean(JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY)||'null')?.uid)}catch{return false}
}

async function goTo(screen){
  state.screen=screen;
  const {render}=await import(`../../router.js?v=${ROUTER_VERSION}`);
  await render(getRoot());
}

function loginErrorText(error){
  const code=error?.code||'';
  if(code==='auth/invalid-credential'||code==='auth/user-not-found'||code==='auth/wrong-password')return 'Email ID or password is incorrect.';
  if(code==='auth/invalid-email')return 'Enter a valid email ID.';
  if(code==='auth/user-disabled')return 'This account has been disabled.';
  if(code==='auth/too-many-requests')return 'Too many login attempts. Please try again later.';
  if(code==='auth/network-request-failed')return 'Network error. Check your internet connection and try again.';
  return error?.message||'Could not login. Please try again.';
}

function bindLoginForm(){
  const root=getRoot();
  const form=root?.querySelector('#login-form');
  if(!form||form.dataset.authControllerBound==='1')return;
  form.dataset.authControllerBound='1';
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    event.stopPropagation();
    const emailInput=form.querySelector('#login-email');
    const passwordInput=form.querySelector('#login-password');
    const button=form.querySelector('.auth-submit');
    const message=form.querySelector('#login-message');
    const email=String(emailInput?.value||'').trim().toLowerCase();
    const password=String(passwordInput?.value||'');
    if(!email){if(message)message.textContent='Enter your email ID.';emailInput?.focus();return}
    if(!password){if(message)message.textContent='Enter your password.';passwordInput?.focus();return}
    if(button)button.disabled=true;
    if(message)message.textContent='Logging in...';
    try{
      await authPersistenceReady;
      const credential=await signInWithEmailAndPassword(auth,email,password);
      saveLocalSession(credential.user);
      state.authenticated=true;
      state.profile=null;
      await goTo('home');
    }catch(error){
      console.error('Login failed:',error);
      if(message)message.textContent=loginErrorText(error);
      if(button)button.disabled=false;
    }
  });
  const resetButton=form.querySelector('[data-password-reset]');
  resetButton?.addEventListener('click',async()=>{
    const emailInput=form.querySelector('#login-email');
    const message=form.querySelector('#login-message');
    const email=String(emailInput?.value||'').trim().toLowerCase();
    if(!email){if(message)message.textContent='Enter your email ID first.';emailInput?.focus();return}
    resetButton.disabled=true;
    if(message)message.textContent='Sending password reset email...';
    try{
      await sendPasswordResetEmail(auth,email);
      if(message)message.textContent='Password reset email sent. Check your inbox.';
    }catch(error){
      console.error('Password reset failed:',error);
      if(message)message.textContent=loginErrorText(error);
    }finally{resetButton.disabled=false}
  });
}

function bindSignupForm(){
  const form=getRoot()?.querySelector('#signup-form');
  if(!form||form.dataset.authControllerBound==='1')return;
  form.dataset.authControllerBound='1';
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    const button=form.querySelector('.auth-submit');
    const message=form.querySelector('#signup-message');
    if(button)button.disabled=true;
    if(message)message.textContent='Creating account...';
    try{
      await authPersistenceReady;
      const user=await submitSignup(form);
      saveLocalSession(user||auth.currentUser);
      state.authenticated=true;
      state.profile=null;
      await goTo('home');
    }catch(error){
      console.error('Signup failed:',error);
      const code=error?.code||'';
      const text=code==='auth/email-already-in-use'?'This email ID is already registered.':code==='auth/weak-password'?'Password must be at least 8 characters.':code==='auth/invalid-email'?'Enter a valid email ID.':(error?.message||'Could not create account. Please try again.');
      if(message)message.textContent=text;
      if(button)button.disabled=false;
    }
  });
}

function bindAuthSwitches(){
  const root=getRoot();
  if(!root)return;
  root.querySelectorAll('[data-auth]').forEach((button)=>{
    if(button.dataset.authControllerBound==='1')return;
    button.dataset.authControllerBound='1';
    button.addEventListener('click',async(event)=>{
      event.preventDefault();
      event.stopPropagation();
      const screen=button.dataset.auth==='signup'?'auth-signup':'auth-login';
      await goTo(screen);
      bindAuthSwitches();
    });
  });
  bindLoginForm();
  bindSignupForm();
}

export{bindAuthSwitches,bindLoginForm,bindSignupForm};
