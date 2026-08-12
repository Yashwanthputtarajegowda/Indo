import { signInWithEmailAndPassword, auth } from './firebase-client.js';

export async function submitLogin(form) {
  const email = form.querySelector('#login-email')?.value?.trim();
  const password = form.querySelector('#login-password')?.value || '';

  if (!email) throw new Error('Email ID is required.');
  if (!password) throw new Error('Password is required.');

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}
