import { auth } from '../auth/firebase-client.js';

const CACHE = new Map();
const pending = new Map();
const STYLE_ID = 'indo-live-profile-avatar-v3';
const REFRESH_MS = 5000;
const CHANNEL_NAME = 'indo-profile-avatar-live';

function apiBase(){return window.INDO_API_BASE||'';}

function normalize(value=''){
  return String(value||'').trim().replace(/^@/,'');
}

async function loadProfile(key,{byUid=false,force=false}={}){
  const clean=normalize(key);
  if(!clean)return null;
  const cacheKey=`${byUid?'uid':'id'}:${clean}`;
  if(!force && CACHE.has(cacheKey))return CACHE.get(cacheKey);
  if(pending.has(cacheKey))return pending.get(cacheKey);
  const promise=(async()=>{
    try{
      const user=auth.currentUser;
      const headers={};
      if(user) headers.Authorization=`Bearer ${await user.getIdToken(false)}`;
      const path=byUid
        ? `/api/account/public-profile/${encodeURIComponent(clean)}`
        : `/api/account/profile/${encodeURIComponent(clean)}`;
      const response=await fetch(`${apiBase()}${path}`,{headers,cache:'no-store'});
      if(!response.ok)return null;
      const data=await response.json().catch(()=>({}));
      const profile=data?.profile||null;
      if(profile)CACHE.set(cacheKey,profile);
      return profile;
    }catch{return null}
  })();
  pending.set(cacheKey,promise);
  try{return await promise}finally{pending.delete(cacheKey)}
}

function avatarUrl(profile){
  return String(profile?.avatarUrl||profile?.photoURL||profile?.photoUrl||'').trim();
}

function paint(host,profile){
  if(!(host instanceof Element)||!profile)return;
  const url=avatarUrl(profile);
  if(!url)return;
  let img=host.querySelector(':scope > img.indo-live-avatar-img');
  if(!img){
    img=document.createElement('img');
    img.className='indo-live-avatar-img';
    img.alt='Profile';
    img.loading='lazy';
    host.appendChild(img);
  }
  if(img.src!==url)img.src=url;
  host.classList.add('indo-live-avatar-has-image');
}

function findAvatarHosts(host){
  const list=[];
  if(!(host instanceof Element))return list;
  const ownSelectors=[
    '.neon-edge-avatar','.indo-story-avatar','.indo-notice-avatar','.indo-watch-avatar',
    '.search-profile-avatar','.profile-avatar','.avatar','.avatar.small','.avatar.gradient','.avatar.ring'
  ];
  for(const selector of ownSelectors){
    if(host.matches(selector))list.push(host);
    host.querySelectorAll?.(selector).forEach(el=>list.push(el));
  }
  const generic=host.querySelector?.('[data-profile-avatar],[data-avatar]');
  if(generic)list.push(generic);
  return [...new Set(list)];
}

function resolveIdentity(el){
  if(!(el instanceof Element))return null;
  const ownUid=normalize(el.dataset.profileUid||el.dataset.actorUid||el.dataset.userUid||el.dataset.storyOwner||'');
  const ownUserId=normalize(el.dataset.profileUsername||el.dataset.profileUser||el.dataset.userId||el.dataset.username||el.dataset.actorUserId||'');
  if(ownUid||ownUserId)return {uid:ownUid,userId:ownUserId};

  const host=el.closest?.('[data-profile-uid],[data-profile-username],[data-profile-user],[data-user-id],[data-username],[data-story-owner],[data-actor-uid],[data-actor-user-id]');
  if(host){
    const uid=normalize(host.dataset.profileUid||host.dataset.actorUid||host.dataset.userUid||host.dataset.storyOwner||'');
    const userId=normalize(host.dataset.profileUsername||host.dataset.profileUser||host.dataset.userId||host.dataset.username||host.dataset.actorUserId||'');
    if(uid||userId)return {uid,userId};
  }

  const notice=el.closest('.indo-notice-card');
  if(notice){
    const uid=normalize(notice.dataset.actorUid||'');
    const userId=normalize(notice.dataset.actorUserId||notice.querySelector('.indo-notice-line b')?.textContent||'');
    if(uid||userId)return {uid,userId};
  }

  const searchCard=el.closest('.search-profile-card');
  if(searchCard){
    const userId=normalize(searchCard.dataset.profileUser||searchCard.querySelector('.search-profile-id')?.textContent||'');
    const uid=normalize(searchCard.dataset.profileUid||'');
    if(uid||userId)return {uid,userId};
  }

  const comment=el.closest('.indo-comment');
  if(comment){
    const uid=normalize(comment.dataset.profileUid||'');
    const userId=normalize(comment.dataset.profileUsername||comment.querySelector('.indo-comment-name')?.textContent||'');
    if(uid||userId)return {uid,userId};
  }

  return null;
}

async function hydrateHost(host,identityOverride=null,force=false){
  const identity=identityOverride||resolveIdentity(host);
  if(!identity)return;
  const profile=identity.uid
    ? await loadProfile(identity.uid,{byUid:true,force})
    : await loadProfile(identity.userId,{force});
  if(profile){
    for(const avatar of findAvatarHosts(host))paint(avatar,profile);
  }
}

function scan(root=document,force=false){
  if(!root)return;
  const selectors=[
    '.neon-edge-avatar','.indo-story-avatar','.indo-notice-avatar','.indo-watch-avatar',
    '.search-profile-avatar','.profile-avatar','.avatar.small','.avatar.gradient','.avatar.ring',
    '[data-profile-avatar]','[data-avatar]'
  ];
  for(const selector of selectors){
    root.querySelectorAll?.(selector).forEach(el=>hydrateHost(el,null,force));
    if(root.matches?.(selector))hydrateHost(root,null,force);
  }
  const identityHosts='[data-profile-uid],[data-profile-username],[data-profile-user],[data-user-id],[data-username],[data-story-owner],[data-actor-uid],[data-actor-user-id]';
  root.querySelectorAll?.(identityHosts).forEach(host=>{
    const avatars=findAvatarHosts(host);
    if(avatars.length)hydrateHost(host,null,force);
  });
}

function invalidateProfileAvatar(uid,userId){
  if(uid)CACHE.delete(`uid:${normalize(uid)}`);
  if(userId)CACHE.delete(`id:${normalize(userId)}`);
  scan(document,true);
}

function broadcastProfileUpdate(profile){
  const payload={
    uid:profile?.uid||'',
    userId:profile?.username||profile?.userId||'',
    avatarUrl:avatarUrl(profile),
    ts:Date.now()
  };
  try{window.localStorage.setItem('indo:profile-avatar-update',JSON.stringify(payload));}catch{}
  try{window.__indoProfileAvatarChannel?.postMessage(payload)}catch{}
}

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .indo-live-avatar-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
    .indo-live-avatar-has-image>span:first-child{display:none!important}
    .search-profile-avatar{overflow:hidden}
    .indo-notice-avatar,.indo-watch-avatar,.neon-edge-avatar,.indo-story-avatar{overflow:hidden}
    .indo-comment>.indo-live-avatar-img{width:28px;height:28px;float:left;margin:0 8px 4px 0;border-radius:50%}
    .indo-comment:after{content:"";display:block;clear:both}
  `;
  document.head.appendChild(style);
}

function installLive(){
  if(window.__indoLiveProfileAvatarsInstalled)return;
  window.__indoLiveProfileAvatarsInstalled=true;
  installStyles();
  scan(document);

  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      mutation.addedNodes.forEach(node=>{if(node instanceof Element)scan(node);});
    }
  });
  observer.observe(document.body||document.documentElement,{childList:true,subtree:true});

  window.addEventListener('indo:profile-updated',event=>{
    const profile=event.detail?.profile||event.detail||{};
    invalidateProfileAvatar(profile.uid,profile.username||profile.userId);
    broadcastProfileUpdate(profile);
  });

  window.addEventListener('storage',event=>{
    if(event.key!=='indo:profile-avatar-update'||!event.newValue)return;
    try{const payload=JSON.parse(event.newValue);invalidateProfileAvatar(payload.uid,payload.userId);}catch{}
  });

  try{
    window.__indoProfileAvatarChannel=new BroadcastChannel(CHANNEL_NAME);
    window.__indoProfileAvatarChannel.addEventListener('message',event=>{
      const payload=event.data||{};
      invalidateProfileAvatar(payload.uid,payload.userId);
    });
  }catch{}

  setInterval(()=>{if(!document.hidden)scan(document,true)},REFRESH_MS);
}

installLive();

export { invalidateProfileAvatar, installLiveProfileAvatars };
export function installLiveProfileAvatars(){installLive()}
