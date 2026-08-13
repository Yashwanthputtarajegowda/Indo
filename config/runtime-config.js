// Indo production runtime configuration.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

(function () {
  if (window.__indoStoryRuntimeV15) return;
  window.__indoStoryRuntimeV15 = true;

  const mobileStyle = document.createElement('style');
  mobileStyle.id = 'indo-mobile-runtime-v9';
  mobileStyle.textContent = `
    html,body{width:100%;min-height:100%;-webkit-text-size-adjust:100%}
    body{overflow-x:hidden;overflow-y:auto}
    button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .app-shell,.auth-shell{width:100%;max-width:520px;min-height:100dvh;min-height:100svh}
    #story-preview{position:relative!important;overflow:hidden!important}
    #story-preview #story-publish-button{position:absolute!important;left:auto!important;right:0!important;top:auto!important;bottom:0!important;transform:none!important;width:20%!important;max-width:none!important;height:44px!important;min-height:44px!important;margin:0!important;padding:0!important;border:0!important;border-radius:10px!important;background:#7b3cff!important;color:#fff!important;font-weight:800!important;display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;z-index:150!important}
    #story-publish-button.story-publish{width:20%!important}
    #story-text-button{position:absolute!important;right:14px!important;bottom:62px!important;z-index:140!important;width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(20,20,27,.88)!important;border:1px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:18px!important;font-weight:900!important;display:grid!important;place-items:center!important;box-shadow:0 8px 24px rgba(0,0,0,.45)!important;cursor:pointer!important}
    #story-preview #story-add-button{position:absolute!important;right:14px!important;bottom:62px!important;left:auto!important;top:auto!important;transform:none!important;z-index:101!important;width:48px!important;height:48px!important;margin:0!important}
    #story-preview #story-add-panel{right:14px!important;bottom:118px!important;left:auto!important;top:auto!important;z-index:120!important}
    #story-preview .story-message{display:block!important}
  `;
  document.head.appendChild(mobileStyle);

  const warmScreens=()=>{const version='20260813-70';const screens=['./src/screens/home-v2.js','./src/screens/reels.js','./src/screens/create.js','./src/screens/story-create.js','./src/screens/profile-direct.js','./src/screens/settings.js','./src/screens/search.js','./src/screens/notifications.js','./src/screens/activity.js','./src/screens/wallet.js','./src/screens/blocked-users.js'];screens.forEach(path=>import(`${path}?v=${version}`).catch(()=>{}));};
  if('requestIdleCallback' in window)window.requestIdleCallback(warmScreens,{timeout:1800});else window.setTimeout(warmScreens,500);

  function apply(){
    const preview=document.getElementById('story-preview');
    const publish=document.getElementById('story-publish-button');
    const add=document.getElementById('story-add-button');
    if(!preview||!publish||!add)return false;
    preview.style.setProperty('position','relative','important');

    // Use the real publish button as Done. Do not create a second publish/hit button.
    if(publish.parentElement!==preview)preview.appendChild(publish);
    publish.textContent=publish.disabled?'Done':'Done';
    publish.setAttribute('aria-label','Done');
    publish.style.setProperty('position','absolute','important');
    publish.style.setProperty('left','auto','important');
    publish.style.setProperty('right','0','important');
    publish.style.setProperty('top','auto','important');
    publish.style.setProperty('bottom','0','important');
    publish.style.setProperty('transform','none','important');
    publish.style.setProperty('width','20%','important');
    publish.style.setProperty('max-width','none','important');
    publish.style.setProperty('height','44px','important');
    publish.style.setProperty('min-height','44px','important');
    publish.style.setProperty('margin','0','important');
    publish.style.setProperty('padding','0','important');
    publish.style.setProperty('z-index','150','important');
    publish.style.setProperty('display','block','important');
    publish.style.setProperty('visibility','visible','important');
    publish.style.setProperty('opacity','1','important');
    publish.style.setProperty('pointer-events','auto','important');

    add.style.setProperty('position','absolute','important');
    add.style.setProperty('left','auto','important');
    add.style.setProperty('right','14px','important');
    add.style.setProperty('top','auto','important');
    add.style.setProperty('bottom','62px','important');
    add.style.setProperty('transform','none','important');
    add.style.setProperty('z-index','101','important');
    const panel=document.getElementById('story-add-panel');
    if(panel){panel.style.setProperty('right','14px','important');panel.style.setProperty('left','auto','important');panel.style.setProperty('top','auto','important');panel.style.setProperty('bottom','118px','important');}
    document.getElementById('story-create-select')?.style.setProperty('display','none','important');
    document.getElementById('indo-story-share-button')?.remove();
    document.getElementById('indo-story-done-hit')?.remove();

    let textButton=document.getElementById('story-text-button');
    if(!textButton||textButton.parentElement!==preview){
      textButton?.remove();
      textButton=document.createElement('button');
      textButton.id='story-text-button';textButton.type='button';textButton.textContent='T';textButton.setAttribute('aria-label','Add text');
      const openText=event=>{event.preventDefault();event.stopPropagation();const rect=preview.getBoundingClientRect();window.__indoStoryTextMode=true;window.__indoStoryStartTitle?.(rect.left+rect.width/2,rect.top+rect.height/2);};
      textButton.addEventListener('pointerup',openText,true);textButton.addEventListener('touchend',openText,{capture:true,passive:false});textButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},true);preview.appendChild(textButton);
    }
    textButton.style.setProperty('position','absolute','important');textButton.style.setProperty('left','auto','important');textButton.style.setProperty('right','14px','important');textButton.style.setProperty('top','auto','important');textButton.style.setProperty('bottom','118px','important');textButton.style.setProperty('transform','none','important');
    return true;
  }

  function start(){let attempts=0;const timer=setInterval(()=>{attempts+=1;if(apply()||attempts>=100)clearInterval(timer);},100);apply();}
  start();window.addEventListener('hashchange',start);
  document.addEventListener('click',()=>{if(document.getElementById('story-preview'))window.setTimeout(apply,0);},true);

  const swallowGenericStoryText=(event)=>{const target=event.target instanceof Element?event.target:null;const preview=target?.closest('#story-preview');if(!preview)return;if(target?.closest('#story-text-button,#story-publish-button,#story-add-button,#story-add-panel,#story-font-picker,.story-title-element,.story-photo-element,.story-emoji-element,.story-trash-zone'))return;if(!window.__indoStoryTextMode&&(event.type==='pointerdown'||event.type==='click'))event.stopImmediatePropagation();};
  document.addEventListener('pointerdown',swallowGenericStoryText,true);document.addEventListener('click',swallowGenericStoryText,true);
  window.__indoStoryStartTitle=(x,y)=>{const preview=document.getElementById('story-preview');if(!preview)return;window.__indoStoryTextMode=true;preview.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:x,clientY:y}));window.setTimeout(()=>{window.__indoStoryTextMode=false;},250);};
})();
