import { auth } from '../features/auth/firebase-client.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const API_BASE=()=>window.INDO_API_BASE||'';
const STYLE='indo-edit-profile';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function token(){const u=auth.currentUser;if(!u)throw Error('Please login first.');return u.getIdToken(false)}
async function api(path,options={}){const h={...(options.headers||{})};if(options.body!==undefined&&!(options.body instanceof FormData))h['Content-Type']='application/json';h.Authorization=`Bearer ${await token()}`;const r=await fetch(`${API_BASE()}${path}`,{...options,headers:h,cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Request failed.');return d}

function styles(){
  if(document.getElementById(STYLE))return;
  const s=document.createElement('style');s.id=STYLE;s.textContent=`
    .epro{width:min(100%,520px);min-height:100vh;margin:auto;background:#05070d;color:#f7f8ff;padding-bottom:24px}
    .epro-head{position:sticky;top:0;z-index:3;height:58px;display:grid;grid-template-columns:44px 1fr 58px;align-items:center;padding:0 14px;border-bottom:1px solid #202739;background:#05070d}
    .epro-head button{border:0;background:transparent;color:#fff;cursor:pointer}.epro-title{text-align:center;font-weight:900}.epro-save{color:#d46cff;font-weight:900}
    .epro-main{padding:18px 14px 34px}.epro-photo{text-align:center;margin-bottom:20px}.epro-avatar{width:112px;height:112px;margin:auto;border-radius:50%;overflow:hidden;background:#171b28;display:grid;place-items:center;font-size:40px;font-weight:900;box-shadow:0 0 0 2px #8d4cff}.epro-avatar img{width:100%;height:100%;object-fit:cover}.epro-photo label{display:inline-block;margin-top:9px;color:#b66cff;font-size:11px;font-weight:800;cursor:pointer}.epro-photo-help{margin-top:5px;color:#687184;font-size:9px}
    .epro-group{margin-bottom:14px}.epro-label{display:block;color:#8d96aa;font-size:10px;font-weight:800;text-transform:uppercase;margin:0 4px 6px}.epro-card{border:1px solid #232b40;border-radius:14px;background:#0a0f1b;padding:11px 12px}.epro-input,.epro-area,.epro-select{width:100%;box-sizing:border-box;border:0;outline:0;background:transparent;color:#fff;font:inherit}.epro-input,.epro-select{font-size:13px}.epro-area{min-height:80px;resize:vertical}.epro-locked{display:flex;justify-content:space-between;gap:8px;color:#fff;font-size:13px}.epro-lock{color:#7e879a;font-size:10px}.epro-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.epro-actions{margin-top:18px}.epro-actions button{width:100%;height:46px;border:0;border-radius:13px;background:linear-gradient(105deg,#6748ff,#b43ce7,#ef3c9e);color:#fff;font-weight:900;cursor:pointer}.epro-actions button:disabled{opacity:.55;cursor:wait}.epro-msg{text-align:center;font-size:11px;margin-top:10px;min-height:14px}.epro-ok{color:#43df9a}.epro-err{color:#ff6b8a}
  `;document.head.appendChild(s)
}

async function load(){const d=await api('/api/account/me');return d?.profile||{}}

async function uploadAvatar(file,msgEl){
  if(file.size>5*1024*1024)throw Error('Profile photo must be 5MB or smaller.');
  if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('Use PNG, JPG or WebP for profile photo.');
  const sig=await api('/api/account/profile/avatar-signature',{method:'POST',body:JSON.stringify({contentType:file.type})});
  const form=new FormData();form.append('file',file);form.append('api_key',sig.apiKey);form.append('timestamp',String(sig.timestamp));form.append('folder',sig.folder);form.append('signature',sig.signature);
  const response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/image/upload`,{method:'POST',body:form});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.secure_url)throw Error(data.error?.message||'Profile photo upload failed.');
  await api('/api/account/profile',{method:'PATCH',body:JSON.stringify({name:document.querySelector('[name=name]')?.value?.trim()||'Profile',avatarUrl:data.secure_url,photoURL:data.secure_url})});
  return data.secure_url;
}

export async function renderEditProfile(app){
  styles();
  const u=auth.currentUser;if(!u){app.innerHTML='<div class="epro"><main class="epro-main">Please login first.</main></div>';return}
  let p={};try{p=await load()}catch{}
  const name=String(u.displayName||p.name||p.displayName||'').trim();
  const id=String(p.userId||p.username||'').replace(/^@/,'');
  const bio=String(p.bio||'');const location=String(p.location||'');const website=String(p.website||'');const role=String(p.role||'Content Creator');const interests=String(p.interests||'');const language=String(p.language||'English');const visibility=String(p.visibility||'public').toLowerCase()==='private'?'private':'public';const avatar=String(p.avatarUrl||p.photoURL||p.photoUrl||u.photoURL||'').trim();const initial=(name||id||'I').charAt(0).toUpperCase();
  app.innerHTML=`<div class="epro"><header class="epro-head"><button type="button" data-screen="profile">‹</button><div class="epro-title">Edit Profile</div><button class="epro-save" type="button" data-save-top>Save</button></header><main class="epro-main"><section class="epro-photo"><div class="epro-avatar" data-avatar>${avatar?`<img src="${esc(avatar)}" alt="Profile">`:esc(initial)}</div><label>Change Profile Photo<input type="file" accept="image/png,image/jpeg,image/webp" data-photo hidden></label><div class="epro-photo-help">Your profile photo is visible across Indo.</div></section><div class="epro-group"><label class="epro-label">Name</label><div class="epro-card"><input class="epro-input" name="name" value="${esc(name)}" maxlength="80"></div></div><div class="epro-group"><label class="epro-label">User ID</label><div class="epro-card epro-locked"><span>@${esc(id)}</span><span class="epro-lock">Locked</span></div></div><div class="epro-group"><label class="epro-label">Bio</label><div class="epro-card"><textarea class="epro-area" name="bio" maxlength="160">${esc(bio)}</textarea></div></div><div class="epro-group"><label class="epro-label">Location</label><div class="epro-card"><input class="epro-input" name="location" value="${esc(location)}" maxlength="100" placeholder="Add location"></div></div><div class="epro-group"><label class="epro-label">Website / Link</label><div class="epro-card"><input class="epro-input" name="website" value="${esc(website)}" maxlength="200" placeholder="https://example.com"></div></div><div class="epro-grid"><div class="epro-group"><label class="epro-label">Creator Role</label><div class="epro-card"><select class="epro-select" name="role"><option ${role==='Content Creator'?'selected':''}>Content Creator</option><option ${role==='Video Creator'?'selected':''}>Video Creator</option><option ${role==='Photographer'?'selected':''}>Photographer</option><option ${role==='Artist'?'selected':''}>Artist</option><option ${role==='Influencer'?'selected':''}>Influencer</option><option ${role==='Business'?'selected':''}>Business</option></select></div></div><div class="epro-group"><label class="epro-label">Language</label><div class="epro-card"><select class="epro-select" name="language"><option ${language==='English'?'selected':''}>English</option><option ${language==='Kannada'?'selected':''}>Kannada</option><option ${language==='Hindi'?'selected':''}>Hindi</option><option ${language==='Telugu'?'selected':''}>Telugu</option><option ${language==='Tamil'?'selected':''}>Tamil</option><option ${language==='Malayalam'?'selected':''}>Malayalam</option></select></div></div></div><div class="epro-group"><label class="epro-label">Interests</label><div class="epro-card"><input class="epro-input" name="interests" value="${esc(interests)}" maxlength="240"></div></div><div class="epro-group"><label class="epro-label">Profile Visibility</label><div class="epro-card"><select class="epro-select" name="visibility"><option value="public" ${visibility==='public'?'selected':''}>Public</option><option value="private" ${visibility==='private'?'selected':''}>Private</option></select></div></div><div class="epro-actions"><button type="button" data-save>Save Changes</button><div class="epro-msg" data-msg></div></div></main></div>`;

  const msg=app.querySelector('[data-msg]');const photo=app.querySelector('[data-photo]');
  photo?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const local=URL.createObjectURL(f);app.querySelector('[data-avatar]').innerHTML=`<img src="${esc(local)}" alt="Profile">`;msg.textContent='Photo selected. Save to publish it everywhere.';msg.className='epro-msg';}catch(err){msg.textContent=err.message;msg.className='epro-msg epro-err'}});

  const save=async()=>{
    const top=app.querySelector('[data-save-top]');const btn=app.querySelector('[data-save]');top.disabled=btn.disabled=true;msg.textContent='Saving...';msg.className='epro-msg';
    const payload={name:app.querySelector('[name=name]').value.trim(),bio:app.querySelector('[name=bio]').value.trim(),location:app.querySelector('[name=location]').value.trim(),website:app.querySelector('[name=website]').value.trim(),role:app.querySelector('[name=role]').value,interests:app.querySelector('[name=interests]').value.trim(),language:app.querySelector('[name=language]').value,visibility:app.querySelector('[name=visibility]').value};
    try{
      if(!payload.name)throw Error('Name is required.');
      await updateProfile(u,{displayName:payload.name});
      const selected=photo?.files?.[0];
      if(selected){msg.textContent='Uploading profile photo...';await uploadAvatar(selected,msg);}
      const d=await api('/api/account/profile',{method:'PATCH',body:JSON.stringify(payload)});
      if(d.profile?.avatarUrl&&selected)await updateProfile(u,{photoURL:d.profile.avatarUrl,displayName:payload.name});
      else await updateProfile(u,{displayName:payload.name});
      if(d.profile)window.dispatchEvent(new CustomEvent('indo:profile-updated',{detail:{profile:d.profile}}));
      msg.textContent='Profile saved everywhere.';msg.className='epro-msg epro-ok';
      setTimeout(()=>window.__indoNavigate?.('profile'),350);
    }catch(e){msg.textContent=e.message||'Could not save profile.';msg.className='epro-msg epro-err'}finally{top.disabled=btn.disabled=false}
  };
  app.querySelector('[data-save]')?.addEventListener('click',save);app.querySelector('[data-save-top]')?.addEventListener('click',save);
}
