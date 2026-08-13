import { auth } from '../auth/firebase-client.js';
import { state } from '../../state.js';

const KEY = Symbol.for('indo.feedFollowButton');

function style() {
  if (document.getElementById('indo-feed-follow-button-style')) return;
  const node = document.createElement('style');
  node.id = 'indo-feed-follow-button-style';
  node.textContent = `
    .post-head{display:flex;align-items:center!important;gap:8px!important;}
    .post-creator{flex:0 1 auto!important;min-width:0!important;}
    .indo-feed-follow{flex:0 0 auto!important;width:auto!important;min-width:76px!important;height:30px!important;padding:0 12px!important;margin-left:auto!important;border:1px solid #303039!important;border-radius:8px!important;background:#17171d!important;color:#fff!important;font:700 12px/1 system-ui,sans-serif!important;cursor:pointer!important;}
    .indo-feed-follow.following{background:#2a2a31!important;}
    .indo-feed-follow:disabled{opacity:.65!important;cursor:default!important;}
    .post-more{flex:0 0 auto!important;margin-left:0!important;}
  `;
  document.head.appendChild(node);
}

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  return fetch(`${apiBase}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), 'Content-Type':'application/json', Authorization:`Bearer ${token}` }
  });
}

async function setupButton(button, ownerUid) {
  const uid = String(ownerUid || '').trim();
  const currentUid = String(auth.currentUser?.uid || '').trim();
  if (!uid || !currentUid || uid === currentUid) { button.remove(); return; }
  try {
    const response = await request(`/api/social/follow-status/${encodeURIComponent(uid)}`);
    const data = await response.json().catch(() => ({}));
    const following = Boolean(data.following || data.isFollowing);
    button.textContent = following ? 'Following' : 'Follow';
    button.classList.toggle('following', following);
  } catch {
    button.textContent = 'Follow';
  }
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = !button.classList.contains('following');
    button.disabled = true;
    try {
      const response = await request('/api/social/follow', { method:'POST', body:JSON.stringify({ targetUid:uid, follow:next }) });
      if (!response.ok) throw new Error('Could not update follow status.');
      button.classList.toggle('following', next);
      button.textContent = next ? 'Following' : 'Follow';
    } catch {
      button.textContent = button.classList.contains('following') ? 'Following' : 'Follow';
    } finally {
      button.disabled = false;
    }
  });
}

function process(root = document) {
  root.querySelectorAll?.('.post-card.video-post .post-head').forEach((head) => {
    if (head.querySelector('.indo-feed-follow')) return;
    const card = head.closest('.post-card.video-post');
    const ownerUid = card?.dataset.ownerUid || '';
    if (!ownerUid) return;
    const more = head.querySelector('.post-more');
    if (!more) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'indo-feed-follow';
    button.setAttribute('aria-label','Follow creator');
    button.textContent = 'Follow';
    head.insertBefore(button, more);
    setupButton(button, ownerUid);
  });
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  style();
  process(document);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) process(node);
      }
    }
  });
  observer.observe(document.getElementById('root') || document.body, { childList:true, subtree:true });
}

function relationEntries(value){
  return Object.values(value||{}).filter((item)=>item&&item.uid).map((item)=>({uid:String(item.uid),userId:String(item.userId||item.username||''),name:String(item.name||'Indo User')}));
}
async function relationToken(){const user=auth.currentUser;if(!user)throw new Error('Please login first.');return user.getIdToken(true);}
async function loadRelationDirect(targetUid, relation, token){
  const url=`https://indo-174f0-default-rtdb.firebaseio.com/users/${encodeURIComponent(targetUid)}/${relation}.json?auth=${encodeURIComponent(token)}`;
  const response=await fetch(url,{cache:'no-store'}); if(!response.ok)throw new Error('relation read failed');
  return relationEntries(await response.json().catch(()=>({})));
}
async function openProfileRelation(root,relation){
  const modal=document.createElement('div');modal.className='indo-rel-modal';
  if(!document.getElementById('indo-rel-direct-style')){const s=document.createElement('style');s.id='indo-rel-direct-style';s.textContent='.indo-rel-modal{position:fixed;inset:0;z-index:35001;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:14px}.indo-rel-card{width:min(100%,520px);height:min(80vh,640px);background:#101016;border:1px solid #282830;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}.indo-rel-head{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #24242b;color:#fff}.indo-rel-head button{width:34px;height:34px;border:0;background:transparent;color:#fff;font-size:22px}.indo-rel-list{flex:1;overflow:auto;padding:8px}.indo-rel-row{width:100%;display:flex;gap:12px;align-items:center;padding:11px 10px;border:0;background:transparent;color:#fff;text-align:left}.indo-rel-avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#2a2a31;font-weight:800}.indo-rel-empty{padding:36px 16px;text-align:center;color:#8d8d98;font-size:13px}.indo-rel-name{font-size:13px;font-weight:700}.indo-rel-id{font-size:11px;color:#92929d;margin-top:2px}';document.head.appendChild(s);}
  modal.innerHTML=`<section class="indo-rel-card"><header class="indo-rel-head"><strong>${relation==='followers'?'Followers':'Following'}</strong><button type="button" data-rclose>×</button></header><div class="indo-rel-list"><div class="indo-rel-empty">Loading...</div></div></section>`;
  document.body.appendChild(modal);modal.querySelector('[data-rclose]')?.addEventListener('click',()=>modal.remove());modal.addEventListener('click',(e)=>{if(e.target===modal)modal.remove();});
  const list=modal.querySelector('.indo-rel-list');
  try{
    const token=await relationToken(); const p=state.profile||{}; let uid=String(p.uid||p.ownerUid||'').trim(); let username=String(p.username||root.querySelector('.profile-direct-head h2')?.textContent||'').replace(/^@/,'').trim();
    if(!uid&&username){const r=await fetch(`${window.INDO_API_BASE||''}/api/account/profile/${encodeURIComponent(username)}?t=${Date.now()}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d.profile){uid=String(d.profile.uid||'');state.profile={...(state.profile||{}),...d.profile,uid,username:String(d.profile.username||username)};}}
    if(!uid)throw new Error('Profile UID is missing.');
    let items=[];try{items=await loadRelationDirect(uid,relation,token);}catch{}
    if(!items.length&&p[relation])items=relationEntries(p[relation]);
    if(!items.length){try{const r=await fetch(`${window.INDO_API_BASE||''}/api/social/${relation}/${encodeURIComponent(uid)}?t=${Date.now()}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok)items=Array.isArray(d.items)?d.items:[];}catch{}}
    if(!items.length){list.innerHTML='<div class="indo-rel-empty">No users yet.</div>';return;}
    list.innerHTML=items.map((item)=>{const id=String(item.userId||'').replace(/^@/,'');const name=String(item.name||'Indo User');return `<button class="indo-rel-row" type="button" data-ruser="${item.uid||''}" data-rid="${id}"><div class="indo-rel-avatar">${(name.charAt(0)||'U').toUpperCase()}</div><div><div class="indo-rel-name">${name}</div><div class="indo-rel-id">@${id||'user'}</div></div></button>`;}).join('');
    list.querySelectorAll('[data-ruser]').forEach((b)=>b.addEventListener('click',async()=>{const uid=b.dataset.ruser||'';const id=b.dataset.rid||'';modal.remove();state.profile={uid,ownerUid:uid,username:id};state.screen='profile';if(window.__indoNavigate)await window.__indoNavigate('profile');}));
  }catch(error){list.innerHTML=`<div class="indo-rel-empty">${String(error?.message||'Could not load list.')}</div>`;}
}

function installRelationOverride(){
  const KEY2=Symbol.for('indo.profileRelationOverride'); if(globalThis[KEY2])return; globalThis[KEY2]=true;
  document.addEventListener('click',(event)=>{const stat=event.target instanceof Element?event.target.closest('.profile-direct-stats > div'):null;if(!stat)return;const root=document.getElementById('root');const stats=stat.parentElement;if(!root?.contains(stat)||!stats?.classList.contains('profile-direct-stats'))return;const index=Array.prototype.indexOf.call(stats.children,stat);if(index!==1&&index!==2)return;event.preventDefault();event.stopImmediatePropagation();openProfileRelation(root,index===1?'followers':'following');},true);
}

install();
installRelationOverride();
