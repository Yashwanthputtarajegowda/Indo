import { auth } from '../features/auth/firebase-client.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const STYLE_ID = 'indo-edit-profile-v243';
const API_BASE = () => window.INDO_API_BASE || '';

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[c]));
}

function avatarUrl(profile = {}) {
  return String(profile.avatarUrl || profile.photoURL || profile.photoUrl || '').trim();
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .ep243-shell{width:min(100%,520px);min-height:100vh;margin:0 auto;background:#05070d;color:#f7f8ff;padding-bottom:24px;box-sizing:border-box}
    .ep243-head{position:sticky;top:0;z-index:30;height:58px;display:grid;grid-template-columns:44px 1fr 64px;align-items:center;padding:0 14px;border-bottom:1px solid #202739;background:rgba(5,7,13,.95);backdrop-filter:blur(12px)}
    .ep243-head button{border:0;background:transparent;color:#fff;cursor:pointer}.ep243-head .title{text-align:center;font-weight:900;font-size:16px}.ep243-head .save{color:#d46cff;font-weight:900;font-size:12px}
    .ep243-main{padding:18px 14px 28px}.ep243-avatar-area{text-align:center;padding:6px 0 22px}.ep243-avatar-wrap{position:relative;width:118px;height:118px;margin:0 auto}.ep243-avatar{width:118px;height:118px;border-radius:50%;overflow:hidden;background:#13192a;border:3px solid transparent;background-clip:padding-box;box-shadow:0 0 0 2px #8d4cff,0 0 26px rgba(141,76,255,.25);display:grid;place-items:center}.ep243-avatar img{width:100%;height:100%;object-fit:cover}.ep243-avatar.fallback{font-size:42px;font-weight:900}.ep243-photo-btn{position:absolute;right:-3px;bottom:1px;width:38px;height:38px;border:3px solid #05070d;border-radius:50%;background:linear-gradient(135deg,#6f49ff,#ea37af);color:#fff;display:grid;place-items:center;cursor:pointer}.ep243-photo-note{margin-top:10px;color:#9aa2b5;font-size:11px}.ep243-photo-note strong{display:block;color:#f2f3f8;font-size:13px;margin-bottom:3px}
    .ep243-group{margin:0 0 14px}.ep243-label{display:block;color:#8d96aa;font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;margin:0 4px 6px}.ep243-card{width:100%;box-sizing:border-box;min-height:54px;border:1px solid #232b40;border-radius:14px;background:#0a0f1b;color:#fff;padding:11px 12px}.ep243-input,.ep243-select,.ep243-textarea{width:100%;border:0;outline:0;background:transparent;color:#fff;font:inherit}.ep243-input{font-size:13px}.ep243-textarea{min-height:82px;resize:vertical;line-height:1.45}.ep243-select{font-size:13px;appearance:auto}.ep243-locked{display:flex;align-items:center;justify-content:space-between;gap:10px}.ep243-locked .value{font-size:13px;word-break:break-all}.ep243-locked .lock{color:#7e879a;font-size:11px}
    .ep243-row{display:flex;align-items:center;gap:11px}.ep243-icon{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#11182a;color:#b873ff;flex:0 0 28px;font-size:14px}.ep243-row-main{min-width:0;flex:1}.ep243-row-main .small{display:block;color:#8992a7;font-size:9px;margin-bottom:3px}.ep243-row-main .main{display:block;color:#fff;font-size:13px}.ep243-chevron{color:#717b90;font-size:16px}
    .ep243-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ep243-error{color:#ff6b8a;font-size:11px;margin-top:8px}.ep243-success{color:#43df9a;font-size:11px;margin-top:8px}.ep243-preview{margin-top:18px;border:1px solid #34305b;border-radius:18px;padding:14px;background:radial-gradient(circle at 0% 0%,rgba(137,65,255,.18),transparent 42%),#0b0f1c}.ep243-preview-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.ep243-preview-head strong{font-size:13px}.ep243-preview-head span{font-size:10px;color:#9c7cff}.ep243-preview-card{display:flex;align-items:center;gap:12px}.ep243-preview-avatar{width:52px;height:52px;border-radius:50%;overflow:hidden;background:#172038;display:grid;place-items:center;font-weight:900}.ep243-preview-avatar img{width:100%;height:100%;object-fit:cover}.ep243-preview-name{font-size:14px;font-weight:900}.ep243-preview-id{font-size:10px;color:#8c95aa;margin-top:2px}.ep243-preview-bio{font-size:10px;color:#c5cada;margin-top:5px;line-height:1.4}
    .ep243-footer-note{margin:16px 3px 0;color:#778198;font-size:10px;line-height:1.45;text-align:center}.ep243-savebar{margin-top:18px}.ep243-savebar button{width:100%;height:46px;border:0;border-radius:13px;background:linear-gradient(105deg,#6748ff,#b43ce7,#ef3c9e);color:#fff;font-weight:900;cursor:pointer}.ep243-savebar button:disabled{opacity:.65;cursor:wait}
  `;
  document.head.appendChild(style);
}

async function fetchProfile(userId) {
  const token = await auth.currentUser.getIdToken(true);
  const response = await fetch(`${API_BASE()}/api/account/profile/${encodeURIComponent(userId)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  return response.ok ? (data?.profile || null) : null;
}

async function saveProfile(payload) {
  const token = await auth.currentUser.getIdToken(true);
  const options = { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(payload) };
  const candidates = [`${API_BASE()}/api/account/profile`, `${API_BASE()}/api/account/profile/${encodeURIComponent(payload.userId || '')}`];
  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));
      if (response.ok) return data;
      if (![404,405].includes(response.status)) throw new Error(data?.error || 'Could not save profile.');
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error('Profile update endpoint is unavailable.');
}

export async function renderEditProfile(app, profileArg = null) {
  installStyles();
  const user = auth.currentUser;
  if (!user) { app.innerHTML = '<div class="ep243-shell"><main class="ep243-main"><p>Please login first.</p></main></div>'; return; }

  const fallbackId = String(user.displayName || user.email?.split('@')[0] || 'user').replace(/^@/,'');
  let profile = profileArg || null;
  if (!profile || !profile.userId) profile = await fetchProfile(fallbackId).catch(() => null) || {};
  const userId = String(profile.userId || profile.username || fallbackId).replace(/^@/,'');
  const name = String(profile.name || user.displayName || fallbackId);
  const bio = String(profile.bio || profile.about || '');
  const location = String(profile.location || '');
  const website = String(profile.website || profile.websiteUrl || profile.link || '');
  const role = String(profile.role || 'Content Creator');
  const interests = String(profile.interests || '');
  const language = String(profile.language || 'English');
  const visibility = String(profile.visibility || 'public').toLowerCase() === 'private' ? 'private' : 'public';
  const avatar = avatarUrl(profile);
  const initial = (name.trim().charAt(0) || 'I').toUpperCase();

  app.innerHTML = `<div class="ep243-shell">
    <header class="ep243-head"><button type="button" data-screen="profile" aria-label="Back">‹</button><div class="title">Edit Profile</div><button type="button" class="save" data-save-top>Save</button></header>
    <main class="ep243-main">
      <section class="ep243-avatar-area">
        <div class="ep243-avatar-wrap"><div class="ep243-avatar" data-avatar-preview>${avatar ? `<img src="${esc(avatar)}" alt="Profile photo">` : esc(initial)}</div><label class="ep243-photo-btn" title="Change profile photo">✎<input type="file" accept="image/png,image/jpeg,image/webp" data-avatar-input hidden></label></div>
        <div class="ep243-photo-note"><strong>Change Profile Photo</strong>JPG, PNG or WEBP · Max 5MB</div>
      </section>

      <div class="ep243-group"><label class="ep243-label">Name</label><div class="ep243-card"><input class="ep243-input" name="name" value="${esc(name)}" maxlength="80" autocomplete="name"></div></div>
      <div class="ep243-group"><label class="ep243-label">User ID</label><div class="ep243-card ep243-locked"><span class="value">@${esc(userId)}</span><span class="lock">🔒 Not editable</span></div></div>
      <div class="ep243-group"><label class="ep243-label">Bio</label><div class="ep243-card"><textarea class="ep243-textarea" name="bio" maxlength="160" placeholder="Tell people about yourself">${esc(bio)}</textarea></div></div>
      <div class="ep243-group"><label class="ep243-label">Location</label><div class="ep243-card ep243-row"><span class="ep243-icon">⌖</span><div class="ep243-row-main"><input class="ep243-input" name="location" value="${esc(location)}" maxlength="100" placeholder="Add your location"></div></div></div>
      <div class="ep243-group"><label class="ep243-label">Website / Link</label><div class="ep243-card ep243-row"><span class="ep243-icon">↗</span><div class="ep243-row-main"><input class="ep243-input" name="website" value="${esc(website)}" maxlength="200" placeholder="https://example.com"></div></div></div>
      <div class="ep243-two">
        <div class="ep243-group"><label class="ep243-label">Creator Role</label><div class="ep243-card"><select class="ep243-select" name="role"><option ${role==='Content Creator'?'selected':''}>Content Creator</option><option ${role==='Video Creator'?'selected':''}>Video Creator</option><option ${role==='Photographer'?'selected':''}>Photographer</option><option ${role==='Artist'?'selected':''}>Artist</option><option ${role==='Influencer'?'selected':''}>Influencer</option><option ${role==='Business'?'selected':''}>Business</option></select></div></div>
        <div class="ep243-group"><label class="ep243-label">Language</label><div class="ep243-card"><select class="ep243-select" name="language"><option ${language==='English'?'selected':''}>English</option><option ${language==='Kannada'?'selected':''}>Kannada</option><option ${language==='Hindi'?'selected':''}>Hindi</option><option ${language==='Telugu'?'selected':''}>Telugu</option><option ${language==='Tamil'?'selected':''}>Tamil</option><option ${language==='Malayalam'?'selected':''}>Malayalam</option></select></div></div>
      </div>
      <div class="ep243-group"><label class="ep243-label">Interests</label><div class="ep243-card"><input class="ep243-input" name="interests" value="${esc(interests)}" maxlength="240" placeholder="Travel, Nature, Music"></div></div>
      <div class="ep243-group"><label class="ep243-label">Profile Visibility</label><div class="ep243-card ep243-row"><span class="ep243-icon">◉</span><div class="ep243-row-main"><select class="ep243-select" name="visibility"><option value="public" ${visibility==='public'?'selected':''}>Public</option><option value="private" ${visibility==='private'?'selected':''}>Private</option></select></div><span class="ep243-chevron">›</span></div></div>

      <section class="ep243-preview"><div class="ep243-preview-head"><strong>Profile Preview</strong><span>Live preview</span></div><div class="ep243-preview-card"><div class="ep243-preview-avatar" data-preview-avatar>${avatar ? `<img src="${esc(avatar)}" alt="">` : esc(initial)}</div><div><div class="ep243-preview-name" data-preview-name>${esc(name)}</div><div class="ep243-preview-id">@${esc(userId)}</div><div class="ep243-preview-bio" data-preview-bio>${esc(bio || 'Your bio will appear here.')}</div></div></div></section>
      <div class="ep243-savebar"><button type="button" data-save>Save Changes</button></div>
      <div class="ep243-footer-note">Changes to your profile become visible after you save them. Your User ID remains locked.</div>
      <div class="ep243-error" data-message></div>
    </main>
  </div>`;

  const setMessage = (text, ok = false) => { const node=app.querySelector('[data-message]'); if(!node)return; node.textContent=text; node.className=ok?'ep243-success':'ep243-error'; };
  const syncPreview = () => {
    app.querySelector('[data-preview-name]').textContent = app.querySelector('[name=name]').value.trim() || 'Indo User';
    app.querySelector('[data-preview-bio]').textContent = app.querySelector('[name=bio]').value.trim() || 'Your bio will appear here.';
  };
  app.querySelector('[name=name]')?.addEventListener('input', syncPreview);
  app.querySelector('[name=bio]')?.addEventListener('input', syncPreview);
  app.querySelector('[data-avatar-input]')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage('Profile photo must be 5MB or smaller.'); event.target.value=''; return; }
    const url = URL.createObjectURL(file);
    const preview = app.querySelector('[data-avatar-preview]'); const mini=app.querySelector('[data-preview-avatar]');
    preview.innerHTML=`<img src="${esc(url)}" alt="Profile photo">`; mini.innerHTML=`<img src="${esc(url)}" alt="">`;
  });
  const save = async () => {
    const button = app.querySelector('[data-save]'); if (!button || button.disabled) return;
    button.disabled = true; setMessage('Saving...');
    const payload = {
      uid: user.uid,
      userId,
      name: app.querySelector('[name=name]').value.trim(),
      bio: app.querySelector('[name=bio]').value.trim(),
      location: app.querySelector('[name=location]').value.trim(),
      website: app.querySelector('[name=website]').value.trim(),
      role: app.querySelector('[name=role]').value,
      interests: app.querySelector('[name=interests]').value.trim(),
      language: app.querySelector('[name=language]').value,
      visibility: app.querySelector('[name=visibility]').value
    };
    try {
      if (!payload.name) throw new Error('Name is required.');
      await updateProfile(user, { displayName: payload.name });
      try { await saveProfile(payload); } catch (apiError) { console.warn('Profile API save unavailable:', apiError); }
      setMessage('Profile saved.', true);
      const { state } = await import('../state.js');
      state.profile = null;
      setTimeout(() => window.__indoNavigate?.('profile'), 500);
    } catch (error) { setMessage(error?.message || 'Could not save profile.'); }
    finally { button.disabled = false; }
  };
  app.querySelector('[data-save]')?.addEventListener('click', save);
  app.querySelector('[data-save-top]')?.addEventListener('click', save);
}
