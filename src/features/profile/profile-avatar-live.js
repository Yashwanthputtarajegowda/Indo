import { auth } from '../auth/firebase-client.js';

const CACHE = new Map();
const pending = new Map();
const STYLE_ID = 'indo-live-profile-avatar-v1';

function esc(value=''){return String(value).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));}
function apiBase(){return window.INDO_API_BASE||'';}
async function loadProfile(key,{byUid=false}={}){
  const clean=String(key||'').trim().replace(/^@/,'');
  if(!clean)return null;
  const cacheKey=`${byUid?'uid':'id'}:${clean}`;
  if(CACHE.has(cacheKey))return CACHE.get(cacheKey);
  if(pending.has(cacheKey))return pending.get(cacheKey);
  const promise=(async()=>{try{const user=auth.currentUser;const headers={};if(user)headers.Authorization=`Bearer ${await user.getIdToken(false)}`;const path=byUid?`/api/account/public-profile/${encodeURIComponent(clean)}`:`/api/account/profile/${encodeURIComponent(clean)}`;const r=await fetch(`${apiBase()}${path}`,{headers,cache:'no-store'});if(!r.ok)return null;const d=await r.json().catch(()=>({}));const p=d?.profile||null;if(p)CACHE.set(cacheKey,p);return p}catch{return null}})();pending.set(cacheKey,promise);try{return await promise}finally{pending.delete(cacheKey)}}
function paint(el,profile){const url=String(profile?.avatarUrl||profile?.photoURL||profile?.photoUrl||'').trim();if(!url)return;let img=el.querySelector('img.indo-live-avatar-img');if(!img){img=document.createElement('img');img.className='indo-live-avatar-img';img.alt='Profile';img.loading='lazy';el.appendChild(img)}if(img.src!==url)img.src=url;el.classList.add('indo-live-avatar-has-image');}
async function hydrateElement(el){if(!(el instanceof Element))return;let uid=el.dataset.profileUid||'';let userId=el.dataset.profileUsername||'';if(!uid){const story=el.closest('[data-story-owner]');if(story)uid=story.getAttribute('data-story-owner')||''}if(!uid&&!userId){const card=el.closest('.indo-notice-card');const actor=card?.querySelector('.indo-notice-line b')?.textContent?.trim();if(actor)userId=actor}if(!uid&&!userId){const comment=el.closest('.indo-comment');const actor=comment?.querySelector('.indo-comment-name')?.textContent?.trim();if(actor)userId=actor}if(!uid&&!userId){const watch=el.closest('.indo-watch-creator');const actor=watch?.querySelector('.indo-watch-creator-name')?.textContent?.trim();if(actor)userId=actor}if(!uid&&!userId)return;const p=uid?await loadProfile(uid,{byUid:true}):await loadProfile(userId);if(p)paint(el,p)}
function scan(root=document){const selectors=['.neon-edge-avatar','.indo-story-avatar','.indo-notice-avatar','.indo-comment','.indo-watch-avatar'];for(const selector of selectors)root.querySelectorAll?.(selector).forEach(el=>hydrateElement(el));root.querySelectorAll?.('[data-profile-uid]').forEach(host=>host.querySelectorAll('.neon-edge-avatar,.indo-watch-avatar,.indo-notice-avatar,.indo-comment').forEach(el=>hydrateElement(el)));}
function installStyles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='.indo-live-avatar-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}.indo-live-avatar-has-image>span:first-child{display:none!important}';document.head.appendChild(s)}
export function invalidateProfileAvatar(uid,userId){if(uid)CACHE.delete(`uid:${String(uid).trim()}`);if(userId)CACHE.delete(`id:${String(userId).replace(/^@/,'').trim()}`);scan(document)}
export function installLiveProfileAvatars(){if(window.__indoLiveProfileAvatarsInstalled)return;window.__indoLiveProfileAvatarsInstalled=true;installStyles();scan(document);const observer=new MutationObserver(mutations=>{for(const m of mutations){m.addedNodes.forEach(node=>{if(node instanceof Element)scan(node)})}});observer.observe(document.body||document.documentElement,{childList:true,subtree:true});window.addEventListener('indo:profile-updated',event=>{const d=event.detail||{};invalidateProfileAvatar(d.uid,d.userId)})}
installLiveProfileAvatars();
