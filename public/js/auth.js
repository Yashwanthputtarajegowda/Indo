import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

export function bindAuth(){
  const form=document.querySelector('#loginForm');
  const signup=document.querySelector('#signupBtn');
  const message=document.querySelector('#authMessage');
  form?.addEventListener('submit',async e=>{e.preventDefault();message.textContent='';try{await signInWithEmailAndPassword(auth,form.email.value.trim(),form.password.value);message.textContent='Logged in.'}catch(err){message.textContent=err.message}});
  signup?.addEventListener('click',async()=>{message.textContent='';try{await createUserWithEmailAndPassword(auth,form.email.value.trim(),form.password.value);message.textContent='Account created.'}catch(err){message.textContent=err.message}});
}