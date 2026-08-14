import { auth } from '../features/auth/firebase-client.js';
import { renderIndoBrandTopbar } from '../components/indo-brand-topbar.js';
import '../features/feed/cloudinary-video-fix.js';
import '../features/feed/cloudinary-playback-hardener.js';

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[c]));
}

function installStyles() {
  if (document.getElementById('indo-profile-direct-v11')) return;
  const s = document.createElement('style');
  s.id = 'indo-profile-direct-v11';
  s.textContent = `
    .profile-direct-shell{width:100%;max-width:520px;min-height:100vh;margin:0 auto;background:#07070a;position:relative;padding-bottom:78px;overflow-x:hidden}
    .profile-direct-page{width:100%;max-width:520px;min-height:calc(100vh - 58px);padding:20px 15px 20px;margin:0 auto;box-sizing:border-box}
    .profile-direct-name{font-size:15px;font-weight:800;line-height:1.15;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .profile-direct-follow{width:100%;height:38px;border:1px solid #303039;border-radius:7px;background:#17171d;color:#fff;font-weight:700;cursor:pointer}
    .profile-direct-follow.following{background:#2a2a31}
    .profile-direct-follow:disabled{opacity:.65}
    .profile-direct-row{display:flex;align-items:center;gap:24px;width:100%;margin:0 0 18px}
    .profile-direct-avatar{width:70px;height:70px;min-width:70px;flex:0 0 70px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#333,#121217);color:#fff;font-size:23px;font-weight:800}
    .profile-direct-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
    .profile-direct-stats{display:flex;justify-content:space-between;gap:14px;margin:0 0 20px;text-align:center}
    .profile-direct-stat{flex:1;border:0;background:transparent;color:#fff;padding:4px 0;cursor:pointer;font:inherit}
    .profile-direct-stat b{display:block;font-size:16px;line-height:1.1}.profile-direct-stat span{display:block;font-size:10px;color:#8e8e98;margin:0}
    .profile-direct-edit{width:100%;height:38px;border:1px solid #292931;border-radius:7px;background:#17171d;color:#fff;font-weight:700;margin:0 0 18px}
    .profile-direct-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:2px;width:100%}
    .profile-direct-item{aspect-ratio:1;border:0;padding:0;position:relative;overflow:hidden;background:#111;cursor:pointer}
    .profile-direct-item video{width:100%;height:100%;object-fit:cover;display:block;background:#111}
    .profile-direct-empty{grid-column:1/-1;padding:45px 15px;text-align:center;color:#858591;font-size:13px}
    .profile-relation-overlay{position:fixed;inset:0;z-index:32000;background:rgba(0,0,0,.82);display:grid;place-items:center;padding:14px}
    .profile-relation-card{width:min(100%,520px);height:min(78vh,640px);background:#101015;border:1px solid #282832;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}
    .profile-relation-head{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #24242c;color:#fff}
    .profile-relation-head strong{font-size:15px}.profile-relation-head button{width:36px;height:36px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer}
    .profile-relation-list{flex:1;overflow:auto;padding:8px}
    .profile-relation-row{display:flex;align-items:center;gap:12px;width:100%;min-height:60px;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:#fff;text-align:left;cursor:pointer}
    .profile-relation-row:hover{background:#19191f}
    .profile-relation-avatar{width:40px;height:40px;min-width:40px;border-radius:50%;display:grid;place-items:center;background:#2a2a33;color:#fff;font-weight:800}
    .profile-relation-meta{min-width:0}.profile-relation-user{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.profile-relation-name{font-size:11px;color:#8e8e98;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .profile-relation-empty{padding:40px 14px;text-align:center;color:#8e8e98;font-size:13px}
    .profile-video-viewer{position:fixed;inset:0;z-index:30000;background:#000;display:grid;place-items:center;padding:0;touch-action:none}
    .profile-video-viewer-card{position:relative;width:min(100%,520px);height:100vh;max-height:100vh;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center}
    .profile-video-viewer-card video{width:100%;height:100%;object-fit:contain;background:#000;display:block}
    .profile-video-viewer-close{position:absolute;top:12px;left:12px;z-index:5;width:38px;height:38px;border:0;border-radius:50%;background:rgba(0,0,0,.62);color:#fff;font-size:25px;line-height:1;cursor:pointer}
    .profile-video-viewer-actions{position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;align-items:center;justify-content:space-around;gap:8px;padding:10px 12px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(0,0,0,.88));}
    .profile-video-viewer-actions button{min-width:64px;height:44px;border:0;background:transparent;color:#fff;display:flex;align-items:center;justify-content:center;gap:6px;font-size:25px;cursor:pointer;text-shadow:0 2px 8px rgba(0,0,0,.6)}
    .profile-video-viewer-actions button span{font-size:11px;font-weight:700}.profile-video-viewer-actions button.active{color:#ff4f8a}
  `;
  document.head.appendChild(s);
}

async function authRequest(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  return fetch(`${apiBase}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
}

function profileVideoUrl(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url;
  const marker = '/video/upload/'; const index = url.indexOf(marker); if (index < 0) return url;
  const prefix = url.slice(0, index + marker.length); const rest = url.slice(index + marker.length);
  if (rest.startsWith('f_mp4,vc_h264,ac_aac/')) return url;
  return `${prefix}f_mp4,vc_h264,ac_aac/${rest}`;
}

function getActionKey(type, videoId) { return `indo:profile-action:${type}:${String(videoId || '')}`; }
function setActionState(button, active) { button?.classList.toggle('active', Boolean(active)); }
function closeProfileVideoViewer() { const viewer=document.querySelector('.profile-video-viewer'); if(!viewer)return; viewer.querySelector('video')?.pause(); viewer.remove(); }

function openProfileVideoViewer(video) {
  const src = String(video?.currentSrc || video?.src || '').trim(); const original = String(video?.dataset.originalSrc || '').trim(); const videoId = String(video?.closest('.profile-direct-item')?.dataset.videoId || '').trim();
  if (!src && !original) return; document.querySelector('.profile-video-viewer')?.remove(); document.querySelectorAll('.profile-direct-item video').forEach((item)=>item.pause());
  const viewer=document.createElement('div'); viewer.className='profile-video-viewer';
  viewer.innerHTML=`<div class="profile-video-viewer-card"><button type="button" class="profile-video-viewer-close" aria-label="Close">×</button><video controls playsinline preload="auto" src="${esc(src||original)}"></video><div class="profile-video-viewer-actions" aria-label="Video actions"><button type="button" data-viewer-action="like">♡<span>Like</span></button><button type="button" data-viewer-action="share">↗<span>Share</span></button><button type="button" data-viewer-action="save">🔖<span>Save</span></button></div></div>`;
  document.body.appendChild(viewer); const player=viewer.querySelector('video');
  viewer.querySelector('.profile-video-viewer-close')?.addEventListener('click',closeProfileVideoViewer); viewer.addEventListener('click',(event)=>{if(event.target===viewer)closeProfileVideoViewer();});
  const likeButton=viewer.querySelector('[data-viewer-action="like"]'),saveButton=viewer.querySelector('[data-viewer-action="save"]'),shareButton=viewer.querySelector('[data-viewer-action="share"]');
  const likeKey=getActionKey('like',videoId||src),saveKey=getActionKey('save',videoId||src); setActionState(likeButton,localStorage.getItem(likeKey)==='1'); setActionState(saveButton,localStorage.getItem(saveKey)==='1');
  likeButton?.addEventListener('click',()=>{const next=localStorage.getItem(likeKey)!=='1';localStorage.setItem(likeKey,next?'1':'0');setActionState(likeButton,next);});
  saveButton?.addEventListener('click',()=>{const next=localStorage.getItem(saveKey)!=='1';localStorage.setItem(saveKey,next?'1':'0');setActionState(saveButton,next);});
  shareButton?.addEventListener('click',async()=>{const shareData={title:'Indo video',text:'Watch this video on Indo',url:original||src||window.location.href};try{if(navigator.share)await navigator.share(shareData);else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareData.url);shareButton.querySelector('span').textContent='Copied';setTimeout(()=>{if(shareButton.isConnected)shareButton.querySelector('span').textContent='Share';},1200);}}catch{}});
  player?.addEventListener('error',()=>{if(original&&player.src!==original){player.src=original;player.load();player.play().catch(()=>{});}}, {once:true}); player?.play().catch(()=>{});
}

function bindProfileVideos(app) {
  const videos=Array.from(app.querySelectorAll('.profile-direct-item video')); if(!videos.length)return;
  const playInline=(video)=>{videos.forEach((other)=>{if(other!==video)other.pause();});video.preload='auto';video.playsInline=true;const tryPlay=()=>video.play().catch(()=>{});if(video.readyState>=2)tryPlay();else video.addEventListener('loadeddata',tryPlay,{once:true});};
  videos.forEach((video)=>{video.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();openProfileVideoViewer(video);});video.addEventListener('error',()=>{const raw=String(video.dataset.originalSrc||'');if(raw&&video.src!==raw){video.src=raw;video.load();}});});
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver((entries)=>entries.forEach((entry)=>{const video=entry.target;if(entry.isIntersecting&&entry.intersectionRatio>=0.6)playInline(video);else if(!entry.isIntersecting)video.pause();}),{threshold:[0,0.6,1]}):null;
  if(observer)videos.forEach((video)=>observer.observe(video));
}

function closeRelationViewer() { document.querySelector('.profile-relation-overlay')?.remove(); }
function relationLabel(relation) { return relation === 'followers' ? 'Followers' : 'Following'; }

async function openRelationViewer(targetUid, relation) {
  closeRelationViewer();
  const overlay=document.createElement('div'); overlay.className='profile-relation-overlay';
  overlay.innerHTML=`<div class="profile-relation-card"><header class="profile-relation-head"><strong>${relationLabel(relation)}</strong><button type="button" data-relation-close aria-label="Close">×</button></header><div class="profile-relation-list"><div class="profile-relation-empty">Loading...</div></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('[data-relation-close]')?.addEventListener('click',closeRelationViewer);
  overlay.addEventListener('click',(event)=>{if(event.target===overlay)closeRelationViewer();});
  const list=overlay.querySelector('.profile-relation-list');
  try {
    const response=await authRequest(`/api/social/${encodeURIComponent(relation)}/${encodeURIComponent(targetUid)}`);
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||`Could not load ${relation}.`);
    const items=Array.isArray(data.items)?data.items:[];
    if(!items.length){list.innerHTML='<div class="profile-relation-empty">No users yet.</div>';return;}
    list.innerHTML=items.map((item)=>{const userId=String(item.userId||'').replace(/^@/,'');const initial=(String(item.name||userId||'U').trim().charAt(0)||'U').toUpperCase();return `<button class="profile-relation-row" type="button" data-relation-profile="${esc(userId)}" data-relation-uid="${esc(item.uid||'')}"><div class="profile-relation-avatar">${esc(initial)}</div><div class="profile-relation-meta"><div class="profile-relation-user">${esc(item.name||'Indo User')}</div><div class="profile-relation-name">${userId ? '@'+esc(userId) : ''}</div></div></button>`;}).join('');
    list.querySelectorAll('[data-relation-profile]').forEach((button)=>button.addEventListener('click',async()=>{const username=button.dataset.relationProfile||'';const uid=button.dataset.relationUid||'';closeRelationViewer();const {state}=await import('../state.js');state.profile={username,uid,ownerUid:uid};state.screen='profile';await window.__indoNavigate?.('profile');}));
  } catch(error) { list.innerHTML=`<div class="profile-relation-empty">${esc(error?.message||'Could not load list.')}</div>`; }
}

async function loadTargetVideos(targetUid) {
  const apiBase = window.INDO_API_BASE || ''; const response = await fetch(`${apiBase}/api/media/videos?limit=50`); if(!response.ok)return [];
  const data=await response.json().catch(()=>({})); return Array.isArray(data.videos)?data.videos.filter((v)=>String(v.ownerUid||'')===String(targetUid||'')):[];
}

export async function renderProfile(app, profile=null) {
  installStyles();
  const currentUid=String(auth.currentUser?.uid||'').trim(); const requestedUid=String(profile?.uid||profile?.userId||profile?.ownerUid||'').trim(); const targetUid=requestedUid||currentUid; const own=!!currentUid&&!!targetUid&&currentUid===targetUid;
  const fallbackUsername=String(auth.currentUser?.displayName||auth.currentUser?.email?.split('@')[0]||currentUid.slice(0,8)||'user').replace(/^@/,'');
  const username=String(profile?.username||(own?fallbackUsername:'user')).replace(/^@/,'');
  let displayName=String(profile?.name||auth.currentUser?.displayName||username||'Indo User').trim()||'Indo User';
  const initial=(displayName.charAt(0)||'I').toUpperCase();
  let followers=Number(profile?.followersCount||0), following=Number(profile?.followingCount||0);
  if(targetUid){try{const apiBase=window.INDO_API_BASE||'';const response=await fetch(`${apiBase}/api/account/profile/${encodeURIComponent(username)}`,{headers:{Authorization:`Bearer ${await auth.currentUser.getIdToken()}`}});const data=await response.json().catch(()=>({}));if(response.ok&&data.profile){followers=Number(data.profile.followersCount||0);following=Number(data.profile.followingCount||0);profile={...(profile||{}),...data.profile};displayName=String(data.profile.name||displayName).trim()||displayName;}}catch{}}
  const profileTopbar=renderIndoBrandTopbar({rightLabel:'Profile actions',rightHtml:own?'<button type="button" data-screen="settings" aria-label="Settings">⚙</button>':''});

  app.innerHTML=`<div class="profile-direct-shell">${profileTopbar}<main class="profile-direct-page"><section class="profile-direct-row"><div class="profile-direct-avatar">${esc(initial)}</div><div class="profile-direct-info"><div class="profile-direct-name">${esc(displayName)}</div>${own?'': '<button class="profile-direct-follow" type="button" data-follow>Follow</button>'}</div></section><section class="profile-direct-stats"><button class="profile-direct-stat" type="button" data-relation="posts"><b data-posts>0</b><span>Posts</span></button><button class="profile-direct-stat" type="button" data-relation="followers"><b data-followers-count>${followers}</b><span>Followers</span></button><button class="profile-direct-stat" type="button" data-relation="following"><b data-following-count>${following}</b><span>Following</span></button></section>${own?'<button class="profile-direct-edit" type="button" data-screen="settings">Edit Profile</button>':''}<div class="profile-direct-grid" data-grid><div class="profile-direct-empty">Loading posts...</div></div></main></div><nav class="bottom-nav" aria-label="Primary navigation"><button data-screen="home">⌂<span>Home</span></button><button data-screen="search">⌕<span>Search</span></button><button data-screen="reels">▶<span>Reels</span></button><button data-screen="create">＋<span>Create</span></button><button data-screen="profile" class="active">●<span>Profile</span></button></nav>`;

  const followersButton=app.querySelector('[data-relation="followers"]'),followingButton=app.querySelector('[data-relation="following"]');
  followersButton?.addEventListener('click',()=>openRelationViewer(targetUid,'followers')); followingButton?.addEventListener('click',()=>openRelationViewer(targetUid,'following'));

  const followButton=app.querySelector('[data-follow]');
  if(followButton&&targetUid){try{const statusResponse=await authRequest(`/api/social/follow-status/${encodeURIComponent(targetUid)}`);const status=await statusResponse.json().catch(()=>({}));const isFollowing=Boolean(status.following||status.isFollowing);followButton.textContent=isFollowing?'Following':'Follow';followButton.classList.toggle('following',isFollowing);}catch{}
    followButton.addEventListener('click',async()=>{const next=!followButton.classList.contains('following');followButton.disabled=true;try{const response=await authRequest('/api/social/follow',{method:'POST',body:JSON.stringify({targetUid,follow:next})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Could not update follow status.');followButton.classList.toggle('following',next);followButton.textContent=next?'Following':'Follow';const count=app.querySelector('[data-followers-count]');if(count&&data.followersCount!==undefined)count.textContent=String(data.followersCount);}catch(error){followButton.textContent=error.message||'Try again';}finally{followButton.disabled=false;}});
  }

  try{const videos=await loadTargetVideos(targetUid);app.querySelector('[data-posts]').textContent=String(videos.length);const grid=app.querySelector('[data-grid]');grid.innerHTML=videos.length?videos.map((v)=>{const raw=v.secureUrl||v.videoUrl||v.url||'';const src=profileVideoUrl(raw);return `<button class="profile-direct-item" type="button" data-video-id="${esc(v.id||'')}"><video playsinline preload="metadata" src="${esc(src)}" data-original-src="${esc(raw)}"></video></button>`;}).join(''):'<div class="profile-direct-empty">No posts yet.</div>';bindProfileVideos(app);}catch{app.querySelector('[data-grid]').innerHTML='<div class="profile-direct-empty">Could not load posts right now.</div>';}
}
