import { auth } from '../auth/firebase-client.js';

const CACHE = new Map();
const pending = new Map();
const STYLE_ID = 'indo-live-profile-avatar-v5';
const REFRESH_MS = 2500;
const CHANNEL_NAME = 'indo-profile-avatar-live';
const API = () => window.INDO_API_BASE || '';
const norm = (v='') => String(v ?? '').trim().replace(/^@+/, '');
const valid = (v='') => /^[A-Za-z0-9._-]{2,80}$/.test(norm(v));
const esc = (v='') => String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));

async function loadProfile(key,{uid=false,force=false}={}){
  const clean=norm(key); if(!clean)return null;
  const cacheKey=`${uid?'uid':'id'}:${clean}`;
  if(!force&&CACHE.has(cacheKey))return CACHE.get(cacheKey);
  if(pending.has(cacheKey))return pending.get(cacheKey);
  const promise=(async()=>{try{
    const headers={}; if(auth.currentUser)headers.Authorization=`Bearer ${await auth.currentUser.getIdToken(false)}`;
    const path=uid?`/api/account/public-profile/${encodeURIComponent(clean)}`:`/api/account/profile/${encodeURIComponent(clean)}`;
    const r=await fetch(`${API()}${path}`,{headers,cache:'no-store'}); if(!r.ok)return null;
    const d=await r.json().catch(()=>({})); const p=d?.profile||null; if(p)CACHE.set(cacheKey,p); return p;
  }catch{return null}})();
  pending.set(cacheKey,promise); try{return await promise}finally{pending.delete(cacheKey)}
}

function avatarUrl(p){return String(p?.avatarUrl||p?.photoURL||p?.photoUrl||'').trim();}
function datasetIdentity(el){
  if(!(el instanceof Element))return null;
  const uid=norm(el.dataset.profileUid||el.dataset.ownerUid||el.dataset.actorUid||el.dataset.userUid||el.dataset.storyOwner||'');
  const id=norm(el.dataset.profileUsername||el.dataset.profileUser||el.dataset.userId||el.dataset.username||el.dataset.actorUserId||el.dataset.relUser||'');
  return uid||valid(id)?{uid,id}:null;
}
function textIdentity(el){
  if(!(el instanceof Element))return '';
  const selectors=['.search-profile-id','.indo-notice-line b','.indo-comment-name','.indo-watch-creator-name','.indo-rel-v7-id','.indo-rel-v7-row [class*="id"]','[class*="user-id"]','[class*="username"]','[data-user-id]','[data-username]'];
  for(const s of selectors){
    const nodes=el.matches?.(s)?[el]:[...(el.querySelectorAll?.(s)||[])];
    for(const n of nodes){const raw=n.getAttribute?.('data-user-id')||n.getAttribute?.('data-username')||n.textContent||'';const m=String(raw).match(/@?([A-Za-z0-9._-]{2,80})/);const id=norm(m?.[1]||'');if(valid(id)&&!['user','profile','users','indo'].includes(id.toLowerCase()))return id;}
  }
  return '';
}
function identity(el){
  const d=datasetIdentity(el); if(d)return d;
  const host=el.closest?.('[data-profile-uid],[data-owner-uid],[data-actor-uid],[data-user-uid],[data-story-owner],[data-profile-username],[data-profile-user],[data-user-id],[data-username],[data-actor-user-id]');
  const h=datasetIdentity(host); if(h)return h;
  const row=el.closest?.('.search-profile-card,.indo-notice-card,.indo-comment,.indo-rel-v7-row,.follower-row,.following-row,.user-row,.user-card,.profile-card,.conversation,.message,.creator-card,.author-card,.profile-link');
  const r=datasetIdentity(row); if(r)return r;
  const id=textIdentity(row||el); return id?{uid:'',id}:null;
}

function avatarHosts(root){
  const selectors=['.neon-edge-avatar','.indo-story-avatar','.indo-notice-avatar','.indo-watch-avatar','.search-profile-avatar','.indo-rel-v7-avatar','.indo-rel-avatar','.follower-avatar','.following-avatar','.message-avatar','.conversation-avatar','.user-avatar','.profile-avatar','[data-profile-avatar]','[data-user-avatar]','[data-avatar]'];
  const out=[]; for(const s of selectors){if(root?.matches?.(s))out.push(root); root?.querySelectorAll?.(s).forEach(x=>out.push(x));} return [...new Set(out)];
}
function paint(host,p){const url=avatarUrl(p);if(!(host instanceof Element)||!url)return;let img=host.querySelector(':scope > img.indo-live-avatar-img');if(!img){img=document.createElement('img');img.className='indo-live-avatar-img';img.alt='Profile';img.loading='lazy';img.decoding='async';host.insertBefore(img,host.firstChild)}if(img.src!==url)img.src=url;host.classList.add('indo-live-avatar-has-image');}

function ensureIdAvatar(row,p){
  if(!(row instanceof Element))return; const url=avatarUrl(p); if(!url)return;
  const idNode=[row,...row.querySelectorAll('*')].find(el=>/^@?[A-Za-z0-9._-]{2,80}$/.test(String(el.textContent||'').trim())&&String(el.textContent||'').trim().startsWith('@'));
  if(!idNode||idNode.closest?.('.indo-live-id-avatar-wrap'))return;
  const wrap=document.createElement('span');wrap.className='indo-live-id-avatar-wrap';wrap.setAttribute('aria-hidden','true');
  const img=document.createElement('img');img.className='indo-live-id-avatar';img.src=url;img.alt='';wrap.appendChild(img);
  idNode.parentElement?.insertBefore(wrap,idNode);
}

async function hydrate(root,force=false){
  const hosts=avatarHosts(root);
  const containers=[];
  if(root?.matches?.('[data-profile-uid],[data-owner-uid],[data-profile-username],[data-profile-user],[data-user-id],[data-username],.search-profile-card,.indo-notice-card,.indo-comment,.indo-rel-v7-row,.follower-row,.following-row,.user-row,.user-card,.profile-card,.conversation,.message,.creator-card,.author-card,.profile-link'))containers.push(root);
  root?.querySelectorAll?.('[data-profile-uid],[data-owner-uid],[data-profile-username],[data-profile-user],[data-user-id],[data-username],.search-profile-card,.indo-notice-card,.indo-comment,.indo-rel-v7-row,.follower-row,.following-row,.user-row,.user-card,.profile-card,.conversation,.message,.creator-card,.author-card,.profile-link').forEach(x=>containers.push(x));
  for(const host of hosts){const i=identity(host);if(!i)continue;const p=i.uid?await loadProfile(i.uid,{uid:true,force}):await loadProfile(i.id,{force});if(p)paint(host,p);}
  for(const c of containers){const i=identity(c);if(!i)continue;const p=i.uid?await loadProfile(i.uid,{uid:true,force}):await loadProfile(i.id,{force});if(p){for(const h of avatarHosts(c))paint(h,p);ensureIdAvatar(c,p);}}
}
function scan(root=document,force=false){hydrate(root,force).catch(()=>{});}
function invalidate(uid,id){if(uid)CACHE.delete(`uid:${norm(uid)}`);if(id)CACHE.delete(`id:${norm(id)}`);scan(document,true);}
function publish(p){const payload={uid:p?.uid||'',id:p?.username||p?.userId||'',avatarUrl:avatarUrl(p),ts:Date.now()};try{localStorage.setItem('indo:profile-avatar-update',JSON.stringify(payload))}catch{}try{window.__indoProfileAvatarChannel?.postMessage(payload)}catch{}}
function styles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
.indo-live-avatar-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}.indo-live-avatar-has-image>span:first-child{display:none!important}
.search-profile-avatar,.indo-notice-avatar,.indo-watch-avatar,.neon-edge-avatar,.indo-story-avatar,.indo-rel-v7-avatar,.indo-rel-avatar,.follower-avatar,.following-avatar,.message-avatar,.conversation-avatar,.user-avatar,.profile-avatar{overflow:hidden}
.indo-live-id-avatar-wrap{display:inline-grid;place-items:center;width:28px;height:28px;min-width:28px;margin-right:7px;border-radius:50%;overflow:hidden;vertical-align:middle;background:#171b28;box-shadow:0 0 0 1px rgba(255,255,255,.08) inset}.indo-live-id-avatar{width:100%;height:100%;object-fit:cover;display:block}
.indo-comment>.indo-live-avatar-img{width:28px;height:28px;float:left;margin:0 8px 4px 0;border-radius:50%}.indo-comment:after{content:"";display:block;clear:both}`;document.head.appendChild(s)}
function install(){if(window.__indoLiveProfileAvatarsInstalled)return;window.__indoLiveProfileAvatarsInstalled=true;styles();scan(document);const mo=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n instanceof Element)scan(n)})));mo.observe(document.body||document.documentElement,{childList:true,subtree:true});window.addEventListener('indo:profile-updated',e=>{const p=e.detail?.profile||e.detail||{};invalidate(p.uid,p.username||p.userId);publish(p)});window.addEventListener('storage',e=>{if(e.key==='indo:profile-avatar-update'&&e.newValue)try{const p=JSON.parse(e.newValue);invalidate(p.uid,p.id||p.userId)}catch{}});try{window.__indoProfileAvatarChannel=new BroadcastChannel(CHANNEL_NAME);window.__indoProfileAvatarChannel.addEventListener('message',e=>{const p=e.data||{};invalidate(p.uid,p.id||p.userId)})}catch{}setInterval(()=>{if(!document.hidden)scan(document,true)},REFRESH_MS)}
install();export function installLiveProfileAvatars(){install()}export function invalidateProfileAvatar(uid,userId){invalidate(uid,userId)}
