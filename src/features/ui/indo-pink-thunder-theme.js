const STYLE_ID = "indo-pink-thunder-theme-v1";

const CSS = `
:root{
  --indo-pink:#ff3fae;
  --indo-pink-2:#ff70c7;
  --indo-magenta:#d52cff;
  --indo-violet:#7d55ff;
  --indo-cyan:#6fdcff;
  --indo-bg:#05040a;
  --indo-surface:#0d0a13;
  --indo-surface-2:#15101d;
  --indo-line:rgba(255,79,190,.20);
  --indo-text:#f8f5fb;
  --indo-muted:#9f97a8;
  --indo-thunder:#fff5a6;
}

html,body{
  background:
    radial-gradient(circle at 50% -10%,rgba(255,63,174,.09),transparent 34%),
    radial-gradient(circle at 10% 45%,rgba(125,85,255,.06),transparent 26%),
    var(--indo-bg)!important;
  color:var(--indo-text)!important;
}

.app-shell{
  background:
    linear-gradient(180deg,rgba(255,63,174,.025),transparent 160px),
    var(--indo-bg)!important;
}

.topbar,.page-head,.reels-top{
  background:rgba(8,5,12,.90)!important;
  border-bottom:1px solid var(--indo-line)!important;
}

.brand{
  text-shadow:0 0 16px rgba(255,63,174,.18);
}
.brand span,
.notification-badge,
.profile-inline-username,
.userid,
.indo-post-details-close,
.neon-edge-title-more{
  color:var(--indo-pink)!important;
}

.bottom-nav,
.indo-global-bottom-nav{
  background:rgba(8,5,12,.95)!important;
  border-top:1px solid var(--indo-line)!important;
  box-shadow:0 -8px 28px rgba(213,44,255,.08)!important;
}

.bottom-nav button.active,
.indo-global-bottom-nav button.active{
  color:var(--indo-pink-2)!important;
  text-shadow:0 0 12px rgba(255,63,174,.45);
}

.post-card,
.video-post.neon-edge-post{
  border-radius:18px!important;
  background:
    linear-gradient(#0c0811,#0c0811) padding-box,
    linear-gradient(135deg,#ff3fae 0%,#8b4dff 48%,#ff6bc9 100%) border-box!important;
  box-shadow:
    0 0 0 1px rgba(255,63,174,.08),
    0 12px 34px rgba(0,0,0,.30),
    0 0 24px rgba(213,44,255,.11)!important;
}

.video-post.neon-edge-post .neon-edge-head{
  min-height:56px!important;
  padding:0 13px!important;
  background:linear-gradient(180deg,#120a17,#0e0912)!important;
  border-bottom:1px solid rgba(255,63,174,.18)!important;
}

.video-post.neon-edge-post .neon-edge-head::before{
  height:2px!important;
  background:linear-gradient(90deg,transparent,#ff3fae,#d52cff,#7d55ff,transparent)!important;
  box-shadow:0 0 10px rgba(255,63,174,.45)!important;
}

.video-post.neon-edge-post .neon-edge-avatar{
  background:linear-gradient(135deg,#2a182b,#17111f)!important;
  box-shadow:0 0 0 1px rgba(255,63,174,.28),0 0 12px rgba(255,63,174,.15)!important;
}

.video-post.neon-edge-post .neon-edge-more{
  background:#17101d!important;
  color:#f3eafa!important;
  border:1px solid rgba(255,63,174,.16)!important;
}

.video-post.neon-edge-post .post-video{
  border-radius:0!important;
}

.video-post.neon-edge-post .neon-edge-actions{
  min-height:58px!important;
  background:linear-gradient(180deg,#100b15,#0b0810)!important;
  border-top:1px solid rgba(255,63,174,.18)!important;
}

.video-post.neon-edge-post .neon-edge-actions button{
  height:58px!important;
  color:#dcd5e2!important;
  transition:transform .14s ease,background .14s ease,color .14s ease,box-shadow .14s ease!important;
}

.video-post.neon-edge-post .neon-edge-actions button:hover{
  color:#fff!important;
  background:rgba(255,63,174,.055)!important;
  text-shadow:0 0 10px rgba(255,63,174,.55)!important;
}

.video-post.neon-edge-post .neon-edge-actions button:active{
  transform:scale(.94)!important;
}

.video-post.neon-edge-post .neon-edge-actions button.is-active.like-action{
  color:#ff4fae!important;
  text-shadow:0 0 14px rgba(255,79,174,.75)!important;
}

.video-post.neon-edge-post .neon-edge-actions button.is-active.save-action{
  color:#c68cff!important;
  text-shadow:0 0 14px rgba(198,140,255,.7)!important;
}

.video-post.neon-edge-post .neon-edge-copy{
  padding:10px 13px 14px!important;
  background:linear-gradient(180deg,#0b0810,#09070d)!important;
}

.video-post.neon-edge-post .neon-edge-title{
  color:#f7f2fa!important;
}

.video-post.neon-edge-post .neon-edge-title-more:hover{
  color:var(--indo-pink-2)!important;
}

.video-post.neon-edge-post .neon-edge-creator{
  border-radius:999px!important;
  padding:4px 8px 4px 4px!important;
  background:rgba(255,63,174,.045)!important;
}

.video-post.neon-edge-post .neon-edge-name{
  color:#fff!important;
}

.indo-post-details-sheet,
.indo-comments-sheet{
  background:linear-gradient(180deg,#160c18,#0d0911)!important;
  border-color:rgba(255,63,174,.25)!important;
  box-shadow:0 -20px 60px rgba(0,0,0,.7),0 0 26px rgba(213,44,255,.12)!important;
}

.primary-btn,
.create-icon,
.plus{
  background:linear-gradient(135deg,#ff3fae,#d52cff,#7d55ff)!important;
  box-shadow:0 6px 18px rgba(213,44,255,.18)!important;
}

.upload-form input:focus,
.upload-form textarea:focus,
.upload-form select:focus,
.indo-comment-form input:focus{
  border-color:rgba(255,63,174,.72)!important;
  box-shadow:0 0 0 3px rgba(255,63,174,.08)!important;
}

.profile-page,
.settings-page,
.search-page,
.notifications,
.create-page{
  background:linear-gradient(180deg,rgba(255,63,174,.025),transparent 260px)!important;
}

.profile-avatar,
.avatar.gradient,
.avatar.ring,
.story-avatar{
  box-shadow:0 0 0 2px rgba(255,63,174,.24),0 0 16px rgba(255,63,174,.12)!important;
}

.prof{
  background:
    radial-gradient(circle at 50% 0,rgba(255,63,174,.08),transparent 220px),
    #05040a!important;
}

.prof-ring{
  background:conic-gradient(#ff3fae,#d52cff,#7d55ff,#ff73c9,#ff3fae)!important;
  box-shadow:0 0 22px rgba(255,63,174,.20)!important;
}

.prof-stat b{
  color:#fff!important;
}

.prof-stat span{
  color:#a59bab!important;
}

.prof-btn{
  background:#110b15!important;
  border-color:rgba(255,63,174,.20)!important;
}

.prof-btn.primary{
  background:linear-gradient(135deg,#ff3fae,#d52cff,#7d55ff)!important;
  box-shadow:0 7px 18px rgba(213,44,255,.18)!important;
}

.prof-actions button:active,
.prof-btn:active,
.primary-btn:active,
.create-card:active,
.bottom-nav button:active{
  transform:scale(.97)!important;
}

/* Indo thunder accent: small brand spark, never a full yellow theme. */
.indo-thunder-accent::before{
  content:'ϟ';
  display:inline-block;
  margin-right:4px;
  color:var(--indo-thunder);
  text-shadow:0 0 10px rgba(255,245,166,.7);
  font-weight:900;
}

.neon-edge-post::after,
.prof::after{
  content:'ϟ';
  position:absolute;
  pointer-events:none;
  color:rgba(255,245,166,.58);
  font-size:12px;
  line-height:1;
  text-shadow:0 0 9px rgba(255,245,166,.6);
}

.neon-edge-post::after{
  right:10px;
  top:8px;
}

.prof::after{
  right:12px;
  top:76px;
}
`;

export function applyIndoPinkThunderTheme() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
