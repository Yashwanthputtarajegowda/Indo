// Indo production runtime configuration.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

(function () {
  if (window.__indoStoryRuntimeV11) return;
  window.__indoStoryRuntimeV11 = true;

  const mobileStyle = document.createElement('style');
  mobileStyle.id = 'indo-mobile-runtime-v5';
  mobileStyle.textContent = `html,body{width:100%;min-height:100%;-webkit-text-size-adjust:100%}body{overflow-x:hidden;overflow-y:auto}button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}.app-shell,.auth-shell{width:100%;max-width:520px;min-height:100dvh;min-height:100svh}.story-preview{overflow:hidden!important}#story-text-button{position:absolute!important;right:14px!important;bottom:118px!important;z-index:140!important;width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(20,20,27,.88)!important;border:1px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:18px!important;font-weight:900!important;display:grid!important;place-items:center!important;box-shadow:0 8px 24px rgba(0,0,0,.45)!important;cursor:pointer!important}#story-publish-button,#indo-story-done-hit{pointer-events:auto!important}`;
  document.head.appendChild(mobileStyle);

  const warmScreens=()=>{const version='20260813-67';const screens=['./src/screens/home-v2.js','./src/screens/reels.js','./src/screens/create.js','./src/screens/story-create.js','./src/screens/profile-direct.js','./src/screens/settings.js','./src/screens/search.js','./src/screens/notifications.js','./src/screens/activity.js','./src/screens/wallet.js','./src/screens/blocked-users.js'];screens.forEach(path=>import(`${path}?v=${version}`).catch(()=>{}));};
  if('requestIdleCallback' in window)window.requestIdleCallback(warmScreens,{timeout:1800});else window.setTimeout(warmScreens,500);

  let publishing=false;
  const collectStoryEditor=preview=>{const title=preview.querySelector('.story-title-element');const photos=[...preview.querySelectorAll('.story-photo-element')];const emojis=[...preview.querySelectorAll('.story-emoji-element')];const crop=preview.querySelector('#story-crop')?.value||'portrait';return{title:title?.textContent?.trim()||'',titleFont:title?.dataset?.font||title?.style?.fontFamily||'Arial, sans-serif',titleX:Number(title?.dataset?.x||50),titleY:Number(title?.dataset?.y||14),crop,stickerDataUrl:photos[0]?.src||'',stickerX:Number(photos[0]?.dataset?.x||50),stickerY:Number(photos[0]?.dataset?.y||50),stickerScale:Number(photos[0]?.dataset?.gestureScale||1),elements:[...(title?[{type:'title',text:title.textContent||'',x:Number(title.dataset?.x||50),y:Number(title.dataset?.y||14),font:title.dataset?.font||title.style?.fontFamily||'Arial, sans-serif'}]:[]),...photos.map(node=>({type:'photo',dataUrl:node.src||'',x:Number(node.dataset?.x||50),y:Number(node.dataset?.y||50),scale:Number(node.dataset?.gestureScale||1)})),...emojis.map(node=>({type:'emoji',emoji:node.textContent||'',x:Number(node.dataset?.x||50),y:Number(node.dataset?.y||50)}))]};};

  async function directPublish(preview,publish,message){
    if(publishing)return;
    const file=window.__indoStoryDraftFile;
    if(!(file instanceof File)||!file.type.startsWith('video/')){message.textContent='Video is not ready. Please select the video again.';return;}
    publishing=true;publish.disabled=true;publish.textContent='Posting...';message.textContent='Uploading story...';
    try{
      // runtime-config.js lives in /config, so the app source is one level up.
      const mod=await import(`../src/features/upload/story-publish.js?v=20260813-67`);
      if(typeof mod.publishStory!=='function')throw new Error('Story publish module is invalid.');
      await mod.publishStory(file,()=>{},collectStoryEditor(preview));
      window.__indoStoryDraftFile=null;message.textContent='Story published successfully.';window.setTimeout(()=>window.__indoNavigate?.('home'),350);
    }catch(error){console.error('Direct Story publish failed:',error);message.textContent=error?.message||'Story upload failed. Please try again.';publish.disabled=false;publish.textContent='Done';publishing=false;}
  }

  function apply(){
    const preview=document.getElementById('story-preview'),publish=document.getElementById('story-publish-button'),add=document.getElementById('story-add-button');
    if(!preview||!publish||!add)return false;
    preview.style.position='relative';
    if(publish.parentElement!==preview)preview.appendChild(publish);
    publish.textContent=publishing?'Posting...':'Done';
    publish.style.setProperty('position','absolute','important');publish.style.setProperty('right','0','important');publish.style.setProperty('left','auto','important');publish.style.setProperty('bottom','0','important');publish.style.setProperty('width','20%','important');publish.style.setProperty('height','44px','important');publish.style.setProperty('z-index','100','important');publish.style.setProperty('display','block','important');publish.style.setProperty('visibility','visible','important');publish.style.setProperty('opacity','1','important');publish.style.setProperty('pointer-events','auto','important');
    add.style.setProperty('position','absolute','important');add.style.setProperty('right','14px','important');add.style.setProperty('bottom','62px','important');add.style.setProperty('z-index','101','important');
    const panel=document.getElementById('story-add-panel');if(panel)panel.style.bottom='118px';
    document.getElementById('story-create-select')?.style.setProperty('display','none','important');
    document.getElementById('indo-story-share-button')?.remove();

    let textButton=document.getElementById('story-text-button');
    if(!textButton||textButton.parentElement!==preview){
      textButton?.remove();textButton=document.createElement('button');textButton.id='story-text-button';textButton.type='button';textButton.textContent='T';textButton.setAttribute('aria-label','Add text');
      const openText=event=>{event.preventDefault();event.stopPropagation();const rect=preview.getBoundingClientRect();window.__indoStoryTextMode=true;window.__indoStoryStartTitle?.(rect.left+rect.width/2,rect.top+rect.height/2);};
      textButton.addEventListener('pointerup',openText,true);textButton.addEventListener('touchend',openText,{capture:true,passive:false});textButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},true);preview.appendChild(textButton);
    }

    let hit=document.getElementById('indo-story-done-hit');
    if(!hit||hit.parentElement!==preview){
      hit?.remove();hit=document.createElement('button');hit.id='indo-story-done-hit';hit.type='button';hit.setAttribute('aria-label','Done');hit.style.cssText='position:absolute;right:0;bottom:0;width:20%;height:44px;z-index:150;cursor:pointer;background:transparent;border:0;padding:0;margin:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;pointer-events:auto;';
      const trigger=e=>{e.preventDefault();e.stopPropagation();const p=document.getElementById('story-preview'),b=document.getElementById('story-publish-button'),m=document.getElementById('story-create-message');if(p&&b&&m)void directPublish(p,b,m);};
      hit.addEventListener('pointerup',trigger,true);hit.addEventListener('touchend',trigger,{capture:true,passive:false});hit.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},true);preview.appendChild(hit);
    }
    return true;
  }

  function start(){let attempts=0;const timer=setInterval(()=>{attempts+=1;if(apply()||attempts>=100)clearInterval(timer);},100);apply();}
  start();window.addEventListener('hashchange',start);document.addEventListener('click',()=>{if(document.getElementById('story-preview'))window.setTimeout(apply,0);},true);

  const swallowGenericStoryText=(event)=>{const target=event.target instanceof Element?event.target:null;const preview=target?.closest('#story-preview');if(!preview)return;if(target?.closest('#story-text-button,#indo-story-done-hit,#story-publish-button,#story-add-button,#story-add-panel,#story-font-picker,.story-title-element,.story-photo-element,.story-emoji-element,.story-trash-zone'))return;if(!window.__indoStoryTextMode&&(event.type==='pointerdown'||event.type==='click'))event.stopImmediatePropagation();};
  document.addEventListener('pointerdown',swallowGenericStoryText,true);document.addEventListener('click',swallowGenericStoryText,true);

  window.__indoStoryStartTitle=(x,y)=>{const preview=document.getElementById('story-preview');if(!preview)return;window.__indoStoryTextMode=true;preview.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:x,clientY:y}));window.setTimeout(()=>{window.__indoStoryTextMode=false;},250);};
})();