import { auth } from "../features/auth/firebase-client.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const API_BASE = () => window.INDO_API_BASE || "";
const STYLE_ID = "indo-edit-profile-canonical-v2";
const esc = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );

async function token() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken(false);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body !== undefined && !(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";
  headers.Authorization = `Bearer ${await token()}`;
  const response = await fetch(`${API_BASE()}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-edit{width:min(100%,520px);min-height:100vh;margin:0 auto;background:#05070d;color:#f7f8ff;padding-bottom:30px}
    .indo-edit-head{position:sticky;top:0;z-index:10;height:58px;display:grid;grid-template-columns:44px 1fr 58px;align-items:center;padding:0 14px;border-bottom:1px solid #202739;background:#05070d}
    .indo-edit-head button{border:0;background:transparent;color:#fff;cursor:pointer}.indo-edit-title{text-align:center;font-weight:900}.indo-edit-top-save{color:#d46cff;font-weight:900}
    .indo-edit-main{padding:18px 14px 34px}.indo-edit-photo{text-align:center;margin-bottom:22px}.indo-edit-avatar{width:112px;height:112px;margin:auto;border-radius:50%;overflow:hidden;background:#171b28;display:grid;place-items:center;font-size:40px;font-weight:900;box-shadow:0 0 0 2px #8d4cff}.indo-edit-avatar img{width:100%;height:100%;object-fit:cover}.indo-edit-photo label{display:inline-block;margin-top:10px;color:#b66cff;font-size:11px;font-weight:800;cursor:pointer}.indo-edit-help{margin-top:5px;color:#687184;font-size:9px}
    .indo-edit-group{margin-bottom:14px}.indo-edit-label{display:block;color:#8d96aa;font-size:10px;font-weight:800;text-transform:uppercase;margin:0 4px 6px}.indo-edit-card{border:1px solid #232b40;border-radius:14px;background:#0a0f1b;padding:11px 12px}.indo-edit-input,.indo-edit-area,.indo-edit-select{width:100%;box-sizing:border-box;border:0;outline:0;background:transparent;color:#fff;font:inherit}.indo-edit-input,.indo-edit-select{font-size:13px}.indo-edit-area{min-height:80px;resize:vertical}.indo-edit-locked{display:flex;justify-content:space-between;gap:8px;font-size:13px}.indo-edit-lock{color:#7e879a;font-size:10px}.indo-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.indo-edit-actions{margin-top:18px}.indo-edit-actions button{width:100%;height:46px;border:0;border-radius:13px;background:linear-gradient(105deg,#6748ff,#b43ce7,#ef3c9e);color:#fff;font-weight:900;cursor:pointer}.indo-edit-actions button:disabled{opacity:.55;cursor:wait}.indo-edit-msg{text-align:center;font-size:11px;margin-top:10px;min-height:14px}.indo-edit-ok{color:#43df9a}.indo-edit-err{color:#ff6b8a}
  `;
  document.head.appendChild(style);
}

async function loadProfile() {
  const data = await api("/api/account/me");
  return data?.profile || {};
}

async function uploadAvatar(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error("Profile photo must be 5MB or smaller.");
  if (!/^image\/(png|jpeg|webp)$/.test(file.type))
    throw new Error("Use PNG, JPG or WebP for profile photo.");
  const signature = await api("/api/account/profile/avatar-signature", {
    method: "POST",
    body: JSON.stringify({ contentType: file.type }),
  });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("timestamp", String(signature.timestamp));
  form.append("folder", signature.folder);
  form.append("signature", signature.signature);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
    { method: "POST", body: form },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url)
    throw new Error(data.error?.message || "Profile photo upload failed.");
  return data.secure_url;
}

export async function renderEditProfile(app) {
  installStyles();
  const user = auth.currentUser;
  if (!user) {
    app.innerHTML =
      '<div class="indo-edit"><main class="indo-edit-main">Please login first.</main></div>';
    return;
  }

  let profile = {};
  try {
    profile = await loadProfile();
  } catch {}
  const name = String(user.displayName || profile.name || profile.displayName || "").trim();
  const id = String(profile.userId || profile.username || "").replace(/^@/, "");
  const avatar = String(
    profile.avatarUrl || profile.photoURL || profile.photoUrl || user.photoURL || "",
  ).trim();
  const initial = (name || id || "I").charAt(0).toUpperCase();
  const bio = String(profile.bio || "");
  const location = String(profile.location || "");
  const website = String(profile.website || "");
  const role = String(profile.role || "Content Creator");
  const interests = String(profile.interests || "");
  const language = String(profile.language || "English");
  const visibility =
    String(profile.accountType || profile.visibility || "public").toLowerCase() === "private"
      ? "private"
      : "public";

  app.innerHTML = `<div class="indo-edit"><header class="indo-edit-head"><button type="button" data-screen="profile">‹</button><div class="indo-edit-title">Edit Profile</div><button class="indo-edit-top-save" type="button" data-save-top>Save</button></header><main class="indo-edit-main"><section class="indo-edit-photo"><div class="indo-edit-avatar" data-avatar>${avatar ? `<img src="${esc(avatar)}" alt="Profile">` : esc(initial)}</div><label>Change Profile Photo<input type="file" accept="image/png,image/jpeg,image/webp" data-photo hidden></label><div class="indo-edit-help">Your profile photo is visible across Indo.</div></section><div class="indo-edit-group"><label class="indo-edit-label">Name</label><div class="indo-edit-card"><input class="indo-edit-input" name="name" value="${esc(name)}" maxlength="80"></div></div><div class="indo-edit-group"><label class="indo-edit-label">User ID</label><div class="indo-edit-card indo-edit-locked"><span>@${esc(id)}</span><span class="indo-edit-lock">Locked</span></div></div><div class="indo-edit-group"><label class="indo-edit-label">Bio</label><div class="indo-edit-card"><textarea class="indo-edit-area" name="bio" maxlength="160">${esc(bio)}</textarea></div></div><div class="indo-edit-group"><label class="indo-edit-label">Location</label><div class="indo-edit-card"><input class="indo-edit-input" name="location" value="${esc(location)}" maxlength="100" placeholder="Add location"></div></div><div class="indo-edit-group"><label class="indo-edit-label">Website / Link</label><div class="indo-edit-card"><input class="indo-edit-input" name="website" value="${esc(website)}" maxlength="200" placeholder="https://example.com"></div></div><div class="indo-edit-grid"><div class="indo-edit-group"><label class="indo-edit-label">Creator Role</label><div class="indo-edit-card"><select class="indo-edit-select" name="role"><option ${role === "Content Creator" ? "selected" : ""}>Content Creator</option><option ${role === "Video Creator" ? "selected" : ""}>Video Creator</option><option ${role === "Photographer" ? "selected" : ""}>Photographer</option><option ${role === "Artist" ? "selected" : ""}>Artist</option><option ${role === "Influencer" ? "selected" : ""}>Influencer</option><option ${role === "Business" ? "selected" : ""}>Business</option></select></div></div><div class="indo-edit-group"><label class="indo-edit-label">Language</label><div class="indo-edit-card"><select class="indo-edit-select" name="language"><option ${language === "English" ? "selected" : ""}>English</option><option ${language === "Kannada" ? "selected" : ""}>Kannada</option><option ${language === "Hindi" ? "selected" : ""}>Hindi</option><option ${language === "Telugu" ? "selected" : ""}>Telugu</option><option ${language === "Tamil" ? "selected" : ""}>Tamil</option><option ${language === "Malayalam" ? "selected" : ""}>Malayalam</option></select></div></div></div><div class="indo-edit-group"><label class="indo-edit-label">Interests</label><div class="indo-edit-card"><input class="indo-edit-input" name="interests" value="${esc(interests)}" maxlength="240"></div></div><div class="indo-edit-group"><label class="indo-edit-label">Profile Visibility</label><div class="indo-edit-card"><select class="indo-edit-select" name="visibility"><option value="public" ${visibility === "public" ? "selected" : ""}>Public</option><option value="private" ${visibility === "private" ? "selected" : ""}>Private</option></select></div></div><div class="indo-edit-actions"><button type="button" data-save>Save Changes</button><div class="indo-edit-msg" data-msg></div></div></main></div>`;

  const message = app.querySelector("[data-msg]");
  const photoInput = app.querySelector("[data-photo]");
  photoInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    app.querySelector("[data-avatar]").innerHTML = `<img src="${esc(localUrl)}" alt="Profile">`;
    message.textContent = "Photo selected. Save to publish it everywhere.";
    message.className = "indo-edit-msg";
  });

  const save = async () => {
    const top = app.querySelector("[data-save-top]");
    const button = app.querySelector("[data-save]");
    top.disabled = button.disabled = true;
    message.textContent = "Saving...";
    message.className = "indo-edit-msg";
    try {
      const payload = {
        name: app.querySelector("[name=name]").value.trim(),
        bio: app.querySelector("[name=bio]").value.trim(),
        location: app.querySelector("[name=location]").value.trim(),
        website: app.querySelector("[name=website]").value.trim(),
        role: app.querySelector("[name=role]").value,
        interests: app.querySelector("[name=interests]").value.trim(),
        language: app.querySelector("[name=language]").value,
        visibility: app.querySelector("[name=visibility]").value,
      };
      if (!payload.name) throw new Error("Name is required.");
      const selectedPhoto = photoInput?.files?.[0];
      if (selectedPhoto) {
        message.textContent = "Uploading profile photo...";
        payload.avatarUrl = await uploadAvatar(selectedPhoto);
        payload.photoURL = payload.avatarUrl;
      }
      const result = await api("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await updateProfile(user, {
        displayName: payload.name,
        ...(payload.avatarUrl ? { photoURL: payload.avatarUrl } : {}),
      });
      window.dispatchEvent(
        new CustomEvent("indo:profile-updated", {
          detail: { uid: user.uid, userId: id, profile: result.profile },
        }),
      );
      message.textContent = "Profile saved everywhere.";
      message.className = "indo-edit-msg indo-edit-ok";
      setTimeout(() => window.__indoNavigate?.("profile"), 350);
    } catch (error) {
      message.textContent = error?.message || "Could not save profile.";
      message.className = "indo-edit-msg indo-edit-err";
    } finally {
      top.disabled = button.disabled = false;
    }
  };
  app.querySelector("[data-save]")?.addEventListener("click", save);
  app.querySelector("[data-save-top]")?.addEventListener("click", save);
}
