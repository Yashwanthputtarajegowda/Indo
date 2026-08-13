// Indo production runtime configuration.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

(function () {
  if (window.__indoStoryRuntimeV19) return;
  window.__indoStoryRuntimeV19 = true;

  const mobileStyle = document.createElement('style');
  mobileStyle.id = 'indo-mobile-runtime-v13';
  mobileStyle.textContent = `
    html,body{width:100%;min-height:100%;-webkit-text-size-adjust:100%}
    body{overflow-x:hidden;overflow-y:auto}
    button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .app-shell,.auth-shell{width:100%;max-width:520px;min-height:100dvh;min-height:100svh}
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

  const warmScreens=()=>{
    const version='20260813-75';
    const screens=['./src/screens/home-v2.js','./src/screens/reels.js','./src/screens/create.js','./src/screens/story-create.js','./src/screens/profile-direct.js','./src/screens/settings.js','./src/screens/search.js','./src/screens/notifications.js','./src/screens/activity.js','./src/screens/wallet.js','./src/screens/blocked-users.js'];
    screens.forEach(path=>import(`${path}?v=${version}`).catch(()=>{}));
  };
  if('requestIdleCallback' in window)window.requestIdleCallback(warmScreens,{timeout:1800});else window.setTimeout(warmScreens,500);

  function ensureDone(preview,publish){
    let done=document.getElementById('indo-story-done-hit');
    if(!done||done.parentElement!==preview){
      done?.remove();
      done=document.createElement('button');
      done.id='indo-story-done-hit';
      done.type='button';
      done.setAttribute('aria-label','Done');
      done.textContent='Done';
      done.addEventListener('pointerup',event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        if(done.disabled)return;
        done.disabled=true;
        done.textContent='Posting...';
        publish.disabled=false;
        publish.removeAttribute('disabled');
        try{publish.click();}
        catch(error){console.error('Story Done publish failed:',error);done.disabled=false;done.textContent='Done';}
      },true);
      done.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();},true);
      preview.appendChild(done);
    }
    done.textContent=done.disabled?'Posting...':'Done';
    return done;
  }

  function apply(){
    const preview=document.getElementById('story-preview');
    const publish=document.getElementById('story-publish-button');
    const add=document.getElementById('story-add-button');
    if(!preview||!publish||!add)return false;
    preview.style.setProperty('position','relative','important');
    publish.textContent='Publish story';
    publish.style.setProperty('display','none','important');
    publish.style.setProperty('visibility','hidden','important');
    publish.style.setProperty('opacity','0','important');
    publish.style.setProperty('pointer-events','none','important');
    publish.style.setProperty('width','0','important');
    publish.style.setProperty('height','0','important');
    publish.style.setProperty('max-width','0','important');
    publish.style.setProperty('max-height','0','important');
    publish.style.setProperty('padding','0','important');
    publish.style.setProperty('margin','0','important');
    publish.style.setProperty('border','0','important');
    publish.style.setProperty('box-shadow','none','important');
    ensureDone(preview,publish);
    add.style.setProperty('position','absolute','important');
    add.style.setProperty('left','auto','important');
    add.style.setProperty('right','14px','important');
    add.style.setProperty('top','auto','important');
    add.style.setProperty('bottom','62px','important');
    add.style.setProperty('transform','none','important');
    add.style.setProperty('z-index','101','important');
    const panel=document.getElementById('story-add-panel');
    if(panel){
      panel.style.setProperty('right','14px','important');
      panel.style.setProperty('left','auto','important');
      panel.style.setProperty('top','auto','important');
      panel.style.setProperty('bottom','118px','important');
    }
    document.getElementById('story-create-select')?.style.setProperty('display','none','important');
    document.getElementById('indo-story-share-button')?.remove();
    let textButton=document.getElementById('story-text-button');
    if(!textButton||textButton.parentElement!==preview){
      textButton?.remove();
      textButton=document.createElement('button');
      textButton.id='story-text-button';
      textButton.type='button';
      textButton.textContent='T';
      textButton.setAttribute('aria-label','Add text');
      const openText=event=>{
        event.preventDefault();
        event.stopPropagation();
        const rect=preview.getBoundingClientRect();
        window.__indoStoryTextMode=true;
        window.__indoStoryStartTitle?.(rect.left+rect.width/2,rect.top+rect.height/2);
      };
      textButton.addEventListener('pointerup',openText,true);
      textButton.addEventListener('touchend',openText,{capture:true,passive:false});
      textButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},true);
      preview.appendChild(textButton);
    }
    return true;
  }

  function start(){
    let attempts=0;
    const timer=setInterval(()=>{
      attempts+=1;
      if(apply()||attempts>=80)clearInterval(timer);
    },100);
    apply();
  }
  start();
  window.addEventListener('hashchange',start);
  document.addEventListener('click',()=>{
    if(document.getElementById('story-preview'))window.setTimeout(apply,0);
  },true);

  async function removeBrokenStory(video){
    const viewer=video.closest('.story-viewer-v2');
    const url=String(video?.currentSrc||video?.src||'').trim();
    const ownerItem=[...document.querySelectorAll('[data-story-open]')].find(item=>String(item.dataset.storyUrl||'').trim()===url);
    const storyId=String(ownerItem?.dataset?.storyId||'').trim();
    const ownerUid=String(ownerItem?.dataset?.storyOwner||'').trim();
    const uid=String(window.__indoCurrentUid||'').trim();
    viewer?.remove();
    ownerItem?.remove();
    if(storyId&&ownerUid&&uid&&ownerUid===uid){
      try{
        const {auth}=await import('../src/features/auth/firebase-client.js');
        if(auth.currentUser?.uid===uid){
          const token=await auth.currentUser.getIdToken();
          await fetch(`${window.INDO_API_BASE}/api/stories/${encodeURIComponent(storyId)}/delete`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});
        }
      }catch(error){console.warn('Broken story cleanup failed:',error);}
    }
  }

  document.addEventListener('error',event=>{
    const target=event.target;
    if(target instanceof HTMLVideoElement && target.closest('.story-viewer-v2'))void removeBrokenStory(target);
  },true);

  /* Deliberately no document-wide MutationObserver: the app has active DOM updates and
     observing the whole body caused a render loop / Page Unresponsive condition. */
  const swallowGenericStoryText=event=>{
    const target=event.target instanceof Element?event.target:null;
    const preview=target?.closest('#story-preview');
    if(!preview)return;
    if(target?.closest('#story-text-button,#indo-story-done-hit,#story-publish-button,#story-add-button,#story-add-panel,#story-font-picker,.story-title-element,.story-photo-element,.story-emoji-element,.story-trash-zone'))return;
    if(!window.__indoStoryTextMode&&(event.type==='pointerdown'||event.type==='click'))event.stopImmediatePropagation();
  };
  document.addEventListener('pointerdown',swallowGenericStoryText,true);
  document.addEventListener('click',swallowGenericStoryText,true);
  window.__indoStoryStartTitle=(x,y)=>{
    const preview=document.getElementById('story-preview');
    if(!preview)return;
    window.__indoStoryTextMode=true;
    preview.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:x,clientY:y}));
    window.setTimeout(()=>{window.__indoStoryTextMode=false;},250);
  };
})();
