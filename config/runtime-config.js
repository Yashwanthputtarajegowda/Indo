// Indo production runtime configuration.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

(function () {
  if (window.__indoStoryRuntimeV23) return;
  window.__indoStoryRuntimeV23 = true;

  const mobileStyle = document.createElement('style');
  mobileStyle.id = 'indo-mobile-runtime-v17';
  mobileStyle.textContent = `
    html,body{width:100%;min-height:100%;-webkit-text-size-adjust:100%}
    body{overflow-x:hidden;overflow-y:auto}
    button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .app-shell,.auth-shell{width:100%;max-width:520px;min-height:100dvh;min-height:100svh}
    .top-actions{display:flex!important;align-items:center!important;gap:0!important}
    #story-preview{position:relative!important;overflow:hidden!important}
    #story-preview #story-publish-button,.story-publish{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;max-width:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;outline:0!important}
    #indo-story-done-hit{position:absolute!important;right:0!important;bottom:0!important;width:20%!important;height:44px!important;min-height:44px!important;margin:0!important;padding:0!important;border:0!important;border-radius:10px!important;background:#7b3cff!important;color:#fff!important;font-weight:800!important;display:block!important;z-index:200!important}
    #story-text-button{position:absolute!important;right:14px!important;bottom:118px!important;z-index:140!important;width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(20,20,27,.88)!important;border:1px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:18px!important;font-weight:900!important;display:grid!important;place-items:center!important}
    #story-preview #story-add-button{position:absolute!important;right:14px!important;bottom:62px!important;z-index:101!important;width:48px!important;height:48px!important}
    #story-preview #story-add-panel{right:14px!important;bottom:118px!important;left:auto!important;top:auto!important;z-index:120!important}
  `;
  document.head.appendChild(mobileStyle);

  // Unlock media audio from the first real user gesture, then immediately
  // unmute/play the video currently occupying the feed viewport. Browsers
  // generally block audible autoplay before a gesture, so this is the earliest
  // reliable point at which sound can be enabled.
  let audioGestureBound = false;
  const unlockFeedAudio = (event) => {
    if (event?.target instanceof Element && event.target.closest('button,input,textarea,select,a')) return;
    if (audioGestureBound) return;
    audioGestureBound = true;
    window.__indoAudioUnlocked = true;
    const videos = Array.from(document.querySelectorAll('#root video.post-video'));
    const current = videos.find((video) => {
      const rect = video.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
    }) || videos[0];
    if (!current) return;
    document.querySelectorAll('#root video.post-video').forEach((video) => { if (video !== current && !video.paused) video.pause(); });
    current.muted = false;
    current.defaultMuted = false;
    current.volume = 1;
    current.play().catch(() => {});
  };
  document.addEventListener('pointerdown', unlockFeedAudio, { capture: true, passive: true });
  document.addEventListener('touchstart', unlockFeedAudio, { capture: true, passive: true });
  document.addEventListener('keydown', unlockFeedAudio, { capture: true });

  const warmScreens = () => {
    const version = '20260813-85';
    const modules = [
      './src/screens/home-v2.js','./src/screens/reels.js','./src/screens/create.js','./src/screens/story-create.js',
      './src/screens/profile-direct.js','./src/screens/settings.js','./src/screens/search.js','./src/screens/notifications.js',
      './src/screens/activity.js','./src/screens/wallet.js','./src/screens/blocked-users.js',
      './src/features/stories/story-stack-enhancer.js','./src/features/stories/stories.js','./src/features/feed/home-feed.js',
      './src/features/auth/firebase-client.js'
    ];
    Promise.allSettled(modules.map((path) => import(`${path}?v=${version}`).catch(() => undefined))).catch(() => {});
  };
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => setTimeout(warmScreens, 0), { once:true });
  else setTimeout(warmScreens, 0);

  async function hardDeleteFeedVideo(button) {
    const card = button?.closest?.('[data-video-id]');
    const videoId = String(card?.dataset?.videoId || '').trim();
    if (!card || !videoId) return;
    const { auth } = await import('../src/features/auth/firebase-client.js');
    const user = auth.currentUser;
    if (!user) throw new Error('Please login first.');
    const token = await user.getIdToken(true);
    const ownerUid = String(card.dataset.ownerUid || '');
    if (ownerUid && ownerUid !== String(user.uid)) throw new Error('You can delete only your own video.');
    const apiBase = window.INDO_API_BASE || '';
    const response = await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/delete`, { method:'POST', headers:{Authorization:`Bearer ${token}`} });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(String(data.detail || data.error || `Delete failed (${response.status}).`));
  }

  document.addEventListener('click', async (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-feed-action="delete"]') : null;
    if (!target || target.dataset.indoDeleteBusy === '1') return;
    event.preventDefault(); event.stopImmediatePropagation();
    target.dataset.indoDeleteBusy = '1'; target.disabled = true; target.textContent = 'Deleting...';
    try {
      await hardDeleteFeedVideo(target);
      const card = target.closest('[data-video-id]');
      const videoId = String(card?.dataset?.videoId || '').trim();
      const uid = String((await import('../src/features/auth/firebase-client.js')).auth.currentUser?.uid || '');
      if (uid && videoId) { try { const key=`indo:feed-seen:${uid}`; const seen=JSON.parse(localStorage.getItem(key)||'{}'); delete seen[videoId]; localStorage.setItem(key,JSON.stringify(seen)); } catch {} }
      card?.querySelector('video')?.pause(); card?.remove(); target.closest('.indo-feed-menu')?.remove();
    } catch (error) {
      target.disabled = false; target.dataset.indoDeleteBusy='0'; target.textContent=error?.message || 'Delete video';
    }
  }, true);

  function ensureDone(preview,publish){
    let done=document.getElementById('indo-story-done-hit');
    if(!done||done.parentElement!==preview){
      done?.remove(); done=document.createElement('button'); done.id='indo-story-done-hit'; done.type='button'; done.textContent='Done'; done.setAttribute('aria-label','Done');
      done.addEventListener('pointerup',event=>{event.preventDefault();event.stopImmediatePropagation();if(done.disabled)return;done.disabled=true;done.textContent='Posting...';publish.disabled=false;publish.removeAttribute('disabled');try{publish.click();}catch{done.disabled=false;done.textContent='Done';}},true);
      done.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();},true); preview.appendChild(done);
    }
    done.textContent=done.disabled?'Posting...':'Done'; return done;
  }

  function apply(){
    const preview=document.getElementById('story-preview'),publish=document.getElementById('story-publish-button'),add=document.getElementById('story-add-button');
    if(!preview||!publish||!add)return false;
    preview.style.setProperty('position','relative','important');
    for(const [property,value] of Object.entries({display:'none',visibility:'hidden',opacity:'0',pointerEvents:'none',width:'0',height:'0',maxWidth:'0',maxHeight:'0',padding:'0',margin:'0',border:'0',boxShadow:'none'})) publish.style.setProperty(property,value,'important');
    ensureDone(preview,publish);
    for(const [property,value] of Object.entries({position:'absolute',right:'14px',bottom:'62px',zIndex:'101'})) add.style.setProperty(property,value,'important');
    const panel=document.getElementById('story-add-panel'); if(panel) { panel.style.setProperty('right','14px','important'); panel.style.setProperty('bottom','118px','important'); panel.style.setProperty('left','auto','important'); panel.style.setProperty('top','auto','important'); }
    document.getElementById('story-create-select')?.style.setProperty('display','none','important'); document.getElementById('indo-story-share-button')?.remove();
  }
  let attempts=0; const timer=setInterval(()=>{attempts+=1;apply();if(attempts>=80)clearInterval(timer);},100); apply(); window.addEventListener('hashchange',()=>{attempts=0;apply();});
})();
