import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const API_BASE_URL = 'https://indo-backend-production-41b1.up.railway.app';
const app = document.querySelector('#app');
let authMode = 'login';
let backendOnline = false;
let userIdCheckTimer;

async function checkBackend() { try { const response = await fetch(`${API_BASE_URL}/api/health`, { cache:'no-store' }); backendOnline = response.ok; } catch { backendOnline = false; } }
const cleanUserId = value => value.trim().toLowerCase().replace(/^@/, '');
const validUserId = value => value.length >= 1 && value.length <= 50;
const firebaseMessage = error => ({'auth/email-already-in-use':'This email is already registered.','auth/invalid-email':'Enter a valid email address.','auth/weak-password':'Password must be at least 6 characters.','auth/invalid-credential':'Email or password is incorrect.','auth/too-many-requests':'Too many attempts. Try again later.'}[error.code] || error.message || 'Something went wrong.');

function renderAuth(error='', success='', values={}) {
  const signup=authMode==='signup';
  app.innerHTML=`<main class="auth-page"><section class="auth-card"><div class="brand">Indo</div><h1>${signup?'Create your account':'Welcome back'}</h1><p class="muted">${signup?'Create your real Indo account.':'Login with your Indo account.'}</p><div class="muted small">Backend: ${backendOnline?'Connected':'Unavailable'}</div>${error?`<div class="error">${error}</div>`:''}${success?`<div class="success">${success}</div>`:''}${signup?`<div class="field"><label>User name</label><input id="name" maxlength="60" value="${values.name||''}" placeholder="Your name" autocomplete="name"></div><div class="field"><label>User ID</label><div class="prefix-wrap"><span>@</span><input id="username" maxlength="50" value="${values.username||''}" placeholder="Choose any User ID" autocomplete="username"><span id="userIdStatus" class="muted small"></span></div><div class="muted small">Type any User ID. We'll check availability as you type.</div></div>`:''}<div class="field"><label>Email</label><input id="email" type="email" value="${values.email||''}" placeholder="you@example.com" autocomplete="email"></div><div class="field"><label>Password</label><input id="password" type="password" placeholder="Minimum 6 characters" autocomplete="current-password"></div>${signup?`<div class="field"><label>Confirm password</label><input id="confirm" type="password" placeholder="Repeat password" autocomplete="new-password"></div><div class="field"><label>Account type</label><div class="choice-row"><label class="choice"><input type="radio" name="privacy" value="public" checked> Public</label><label class="choice"><input type="radio" name="privacy" value="private"> Private</label></div></div>`:''}<button id="submit" class="primary">${signup?'Create Account':'Login'}</button><button id="switch" class="link">${signup?'Already have an account? Login':'New to Indo? Create Account'}</button></section></main>`;
  document.querySelector('#switch').onclick=()=>{authMode=signup?'login':'signup';renderAuth();};
  document.querySelector('#submit').onclick=signup?createAccount:login;
  if(signup) document.querySelector('#username').addEventListener('input', liveUserIdCheck);
}

async function liveUserIdCheck(event){
 const input=event.target; const status=document.querySelector('#userIdStatus'); const username=cleanUserId(input.value); clearTimeout(userIdCheckTimer);
 if(!username){status.textContent='';return;}
 if(!validUserId(username)){status.textContent='';return;}
 status.textContent='Checking...';
 userIdCheckTimer=setTimeout(async()=>{
  try {
   const response=await fetch(`${API_BASE_URL}/api/account/check-user-id`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:username})});
   const data=await response.json();
   status.textContent=data.ok?(data.available?'Available':'Already exists'):(data.error||'Could not check');
  } catch { status.textContent='Could not check'; }
 },350);
}

async function createAccount(){
 const button=document.querySelector('#submit'); const name=document.querySelector('#name').value.trim(); const username=cleanUserId(document.querySelector('#username').value); const email=document.querySelector('#email').value.trim(); const password=document.querySelector('#password').value; const confirm=document.querySelector('#confirm').value; const privacy=document.querySelector('input[name="privacy"]:checked').value;
 const values={name,username,email};
 if(!name)return renderAuth('Please enter your User name.', '', values);
 if(!validUserId(username))return renderAuth('Please enter your User ID.', '', values);
 if(!email)return renderAuth('Please enter your email.', '', values);
 if(password.length<6)return renderAuth('Password must be at least 6 characters.', '', values);
 if(password!==confirm)return renderAuth('Passwords do not match.', '', values);
 button.disabled=true;button.textContent='Creating...';
 let createdUser=null;
 try{
  const availability=await fetch(`${API_BASE_URL}/api/account/check-user-id`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:username})});
  const availabilityData=await availability.json();
  if(!availabilityData.ok) throw new Error(availabilityData.error||'Could not verify User ID.');
  if(!availabilityData.available){renderAuth(`@${username} is already taken. Choose another User ID.`, '', values);return;}

  const credential=await createUserWithEmailAndPassword(auth,email,password); createdUser=credential.user;
  const token=await createdUser.getIdToken(true);
  const response=await fetch(`${API_BASE_URL}/api/account/claim-user-id`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({userId:username,name,accountType:privacy})});
  const data=await response.json();
  if(!response.ok||!data.ok) throw new Error(data.error||'Could not finish account creation.');

  await signOut(auth);authMode='login';renderAuth('',`Account created. Your Indo ID is ${data.indoId}. Please login.`);
 }catch(error){
  try { if(createdUser && auth.currentUser?.uid===createdUser.uid) await deleteUser(createdUser); } catch {}
  try { if(auth.currentUser) await signOut(auth); } catch {}
  renderAuth(error.message || firebaseMessage(error), '', values);
 }
}

async function login(){const button=document.querySelector('#submit');const email=document.querySelector('#email').value.trim();const password=document.querySelector('#password').value;if(!email||!password)return renderAuth('Enter your email and password.');button.disabled=true;button.textContent='Logging in...';try{await signInWithEmailAndPassword(auth,email,password);}catch(error){renderAuth(firebaseMessage(error));}}
function showLoggedIn(user){app.innerHTML=`<main class="auth-page"><section class="auth-card"><div class="brand">Indo</div><h1>Logged in</h1><p class="muted">${user.email}</p><p class="success">Firebase authentication and Railway backend are connected.</p><button id="logout" class="primary">Logout</button></section></main>`;document.querySelector('#logout').onclick=async()=>{await signOut(auth);authMode='login';renderAuth();};}
(async()=>{await checkBackend();onAuthStateChanged(auth,user=>user?showLoggedIn(user):renderAuth());})();
