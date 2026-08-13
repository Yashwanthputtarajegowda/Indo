// Indo production runtime configuration.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

(function () {
  if (window.__indoStoryRuntimeV22) return;
  window.__indoStoryRuntimeV22 = true;

  const mobileStyle = document.createElement('style');
  mobileStyle.id = 'indo-mobile-runtime-v16';
  mobileStyle.textContent = `
    html,body{width:100%;min-height:100%;-webkit-text-size-adjust:100%}
    body{overflow-x:hidden;overflow-y:auto}
    button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .app-shell,.auth-shell{width:100%;max-width:520px;min-height:100dvh;min-height:100svh}
    .top-actions{display:flex!important;align-items:center!important;gap:0!important}
    .top-actions .indo-merged-alerts{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-width:62px!important;height:38px!important;padding:0 10px!important;border:0!important;background:transparent!important;color:#fff!important;font-size:21px!important;line-height:1!important;cursor:pointer!important}
    .top-actions .indo-merged-alerts .merged-alert-heart{font-size:22px!important;line-height:1!important}
    .top-actions .indo-merged-alerts .merged-alert-bell{font-size:20px!important;line-height:1!important}
    #story-preview{position:relative!important;overflow:hidden!important}
    #story-preview #story-publish-button,
    #story-preview .story-publish{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;max-width:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;outline:0!important}
    #indo-story-done-hit{position:absolute!important;left:auto!important;right:0!important;top:auto!important;bottom:0!important;width:20%!important;height:44px!important;min-height:44px!important;margin:0!important;padding:0!important;border:0!important;border-radius:10px!important;background:#7b3cff!important;color:#fff!important;font-weight:800!important;display:block!important;visibility:visible!important;opacity:1!important;z-index:200!important;cursor:pointer!important;pointer-events:auto!important}
    #indo-story-done-hit:disabled{opacity:.65!important}
    #story-text-button{position:absolute!important;left:auto!important;right:14px!important;top:auto!important;bottom:118px!important;z-index:140!important;width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(20,20,27,.88)!important;border:1px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:18px!important;font-weight:900!important;display:grid!important;place-items:center!important;box-shadow:0 8px 24px rgba(0,0,0,.45)!important;cursor:pointer!important}
    #story-preview #story-add-button{position:absolute!important;left:auto!important;right:14px!important;top:auto!important;bottom:62px!important;transform:none!important;z-index:101!important;width:48px!important;height:48px!important;margin:0!important}
    #story-preview #story-add-panel{right:14px!important;bottom:118px!important;left:auto!important;top:auto!important;z-index:120!important}
  `;
  document.head.appendChild(mobileStyle);

  function mergeHeaderAlerts(){
    const topActions=document.querySelector('.top-actions');
    if(!topActions)return;
    const activity=topActions.querySelector('[data-screen="activity"]');
    const notifications=topActions.querySelector('[data-screen="notifications"]');
    if(!activity&&!notifications)return;
    let merged=topActions.querySelector('.indo-merged-alerts');
    if(merged)return;
    merged=document.createElement('button');
    merged.type='button';
    merged.className='indo-merged-alerts';
    merged.setAttribute('aria-label','Activity and notifications');
    merged.innerHTML='<span class="merged-alert-heart" aria-hidden="true">♡</span><span class="merged-alert-bell" aria-hidden="true">♧</span>';
    merged.addEventListener('click',(event)=>{
      event.preventDefault();
      event.stopPropagation();
      const target=document.querySelector('[data-screen="activity"]')||document.querySelector('[data-screen="notifications"]');
      target?.click();
    });
    topActions.innerHTML='';
    topActions.appendChild(merged);
  }

  const warmScreens = () => {
    const version = '20260813-76';
    const modules = [
      './src/screens/home-v2.js','./src/screens/reels.js','./src/screens/create.js',
      './src/screens/story-create.js','./src/screens/profile-direct.js','./src/screens/settings.js',
      './src/screens/search.js','./src/screens/notifications.js','./src/screens/activity.js',
      './src/screens/wallet.js','./src/screens/blocked-users.js','./src/features/stories/story-stack-enhancer.js',
      './src/features/stories/stories.js','./src/features/feed/home-feed.js','./src/features/auth/firebase-client.js'
    ];
    Promise.allSettled(modules.map((path) => import(`${path}?v=${version}`).catch(() => undefined))).catch(() => {});
  };
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => { setTimeout(warmScreens, 0); setTimeout(mergeHeaderAlerts, 0); }, { once:true });
  else { setTimeout(warmScreens, 0); setTimeout(mergeHeaderAlerts, 0); }

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
    let backendError = '';
    try {
      const response = await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok !== false) return;
      backendError = String(data.detail || data.error || `Backend delete failed (${response.status}).`);
    } catch (error) {
      backendError = error?.message || 'Backend delete request failed.';
    }
    const databaseUrl = 'https://indo-174f0-default-rtdb.firebaseio.com';
    const probe = await fetch(`${databaseUrl}/videos/${encodeURIComponent(videoId)}.json?auth=${encodeURIComponent(token)}`);
    const currentVideo = await probe.json().catch(() => null);
    if (!probe.ok) throw new Error(backendError || `Could not verify video (${probe.status}).`);
    if (!currentVideo) return;
    if (String(currentVideo.ownerUid || '') !== String(user.uid)) throw new Error('You can delete only your own video.');
    const removeResponse = await fetch(`${databaseUrl}/videos/${encodeURIComponent(videoId)}.json?auth=${encodeURIComponent(token)}`, { method: 'DELETE' });
    if (!removeResponse.ok) throw new Error(backendError || `Database delete failed (${removeResponse.status}).`);
  }

  document.addEventListener('click', async (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-feed-action="delete"]') : null;
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (target.dataset.indoDeleteBusy === '1') return;
    target.dataset.indoDeleteBusy = '1';
    const originalText = target.textContent || 'Delete video';
    target.disabled = true;
    target.textContent = 'Deleting...';
    try {
      await hardDeleteFeedVideo(target);
      const card = target.closest('[data-video-id]');
      const videoId = String(card?.dataset?.videoId || '').trim();
      const uid = String((await import('../src/features/auth/firebase-client.js')).auth.currentUser?.uid || '');
      if (uid && videoId) {
        const key = `indo:feed-seen:${uid}`;
        try {
          const seen = JSON.parse(localStorage.getItem(key) || '{}');
          delete seen[videoId];
          localStorage.setItem(key, JSON.stringify(seen));
        } catch {}
      }
      card?.querySelector('video')?.pause();
      card?.remove();
      target.closest('.indo-feed-menu')?.remove();
    } catch (error) {
      console.error('Indo hard video delete failed:', error);
      target.disabled = false;
      target.dataset.indoDeleteBusy = '0';
      target.textContent = error?.message || originalText;
    }
  }, true);

  function ensureDone(preview,publish){
    let done=document.getElementById('indo-story-done-hit');
    if(!done||done.parentElement!==preview){
      done?.remove();
      done=document.createElement('button'); done.id='indo-story-done-hit'; done.type='button'; done.setAttribute('aria-label','Done'); done.textContent='Done';
      done.addEventListener('pointerup',event=>{event.preventDefault();event.stopImmediatePropagation();if(done.disabled)return;done.disabled=true;done.textContent='Posting...';publish.disabled=false;publish.removeAttribute('disabled');try{publish.click();}catch(error){console.error('Story Done publish failed:',error);done.disabled=false;done.textContent='Done';}},true);
      done.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();},true); preview.appendChild(done);
    }
    done.textContent=done.disabled?'Posting...':'Done'; return done;
  }

  function apply(){
    mergeHeaderAlerts();
    const preview=document.getElementById('story-preview'),publish=document.getElementById('story-publish-button'),add=document.getElementById('story-add-button');
    if(!preview||!publish||!add)return false;
    preview.style.setProperty('position','relative','important');
    publish.textContent='Publish story';
    for(const [property,value] of Object.entries({display:'none',visibility:'hidden',opacity:'0',pointerEvents:'none',width:'0',height:'0',maxWidth:'0',maxHeight:'0',padding:'0',margin:'0',border:'0',boxShadow:'none'})) publish.style.setProperty(property,value,'important');
    ensureDone(preview,publish);
    for(const [property,value] of Object.entries({position:'absolute',left:'auto',right:'14px',top:'auto',bottom:'62px',transform:'none',zIndex:'101'})) add.style.setProperty(property,value,'important');
    const panel=document.getElementById('story-add-panel'); if(panel) for(const [property,value] of Object.entries({right:'14px',left:'auto',top:'auto',bottom:'118px',zIndex:'120'})) panel.style.setProperty(property,value,'important');
    document.getElementById('story-create-select')?.style.setProperty('display','none','important'); document.getElementById('indo-story-share-button')?.remove();
    let textButton=document.getElementById('story-text-button');
    if(!textButton||textButton.parentElement!==preview){
      textButton?.remove(); textButton=document.createElement('button'); textButton.id='story-text-button'; textButton.type='button'; textButton.textContent='T'; textButton.setAttribute('aria-label','Add text');
      const openText=event=>{event.preventDefault();event.stopPropagation();const rect=preview.getBoundingClientRect();window.__indoStoryTextMode=true;window.__indoStoryStartTitle?.(rect.left+rect.width/2,rect.top+rect.height/2);};
      textButton.addEventListener('pointerup',openText,true); textButton.addEventListener('touchend',openText,{capture:true,passive:false}); textButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},true); preview.appendChild(textButton);
    }
    return true;
  }

  function start(){let attempts=0;const timer=setInterval(()=>{attempts+=1;if(apply()||attempts>=80)clearInterval(timer);},100);apply();}
  start(); window.addEventListener('hashchange',start); document.addEventListener('click',()=>{if(document.getElementById('story-preview'))window.setTimeout(apply,0);},true);

  const swallowGenericStoryText=event=>{const target=event.target instanceof Element?event.target:null;const preview=target?.closest('#story-preview');if(!preview)return;if(target?.closest('#story-text-button,#indo-story-done-hit,#story-publish-button,#story-add-button,#story-add-panel,#story-font-picker,.story-title-element,.story-photo-element,.story-emoji-element,.story-trash-zone'))return;if(!window.__indoStoryTextMode&&(event.type==='pointerdown'||event.type==='click'))event.stopImmediatePropagation();};
  document.addEventListener('pointerdown',swallowGenericStoryText,true); document.addEventListener('click',swallowGenericStoryText,true);
  window.__indoStoryStartTitle=(x,y)=>{const preview=document.getElementById('story-preview');if(!preview)return;window.__indoStoryTextMode=true;preview.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:x,clientY:y}));window.setTimeout(()=>{window.__indoStoryTextMode=false;},250);};
})();
