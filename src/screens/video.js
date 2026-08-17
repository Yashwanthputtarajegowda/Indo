import { renderIndoBrandTopbar } from "../components/indo-brand-topbar.js";
import { loadArchiveKannadaVideosProgressive } from "../features/archive/archive-videos.js?v=20260817-fast3";

const STYLE_ID = "indo-video-archive-v3";

function esc(value = "") { return String(value).replace(/[&<>\"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#039;"})[c]); }
function age(value){const t=Number(value||0);if(!t)return"Latest";const m=Math.max(0,Math.floor((Date.now()-t)/60000));if(m<1)return"Just now";if(m<60)return`${m}m ago`;const h=Math.floor(m/60);return h<24?`${h}h ago`:`${Math.floor(h/24)}d ago`;}

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style"); style.id=STYLE_ID;
  style.textContent=`
    .indo-archive-video-shell{min-height:100vh;background:#030308;color:#fff;padding-bottom:78px;overflow-x:hidden}
    .indo-archive-video-main{max-width:820px;margin:0 auto;padding:12px 10px 28px}
    .indo-archive-search{height:46px;display:flex;align-items:center;gap:9px;padding:0 13px;margin-bottom:15px;border:1px solid #2b2634;border-radius:13px;background:#111118;box-sizing:border-box}
    .indo-archive-search svg{width:19px;height:19px;fill:none;stroke:#dedbe5;stroke-width:1.8}
    .indo-archive-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#fff;font-size:13px}.indo-archive-search input::placeholder{color:#777381}
    .indo-archive-head{display:flex;justify-content:space-between;align-items:end;margin:4px 2px 10px}.indo-archive-head h2{margin:0;font-size:17px;font-weight:900}.indo-archive-head small{color:#8c8794;font-size:8px}
    .indo-archive-status{padding:20px;text-align:center;border:1px dashed #2a2733;border-radius:13px;color:#85808e;font-size:11px}.indo-archive-list{display:grid;gap:14px}
    .indo-archive-card{overflow:hidden;border:1px solid #26242d;border-radius:14px;background:#09090e;box-shadow:0 9px 25px rgba(0,0,0,.24)}
    .indo-archive-video-wrap{position:relative;width:100%;aspect-ratio:16/9;background:#000}.indo-archive-video{width:100%;height:100%;display:block;object-fit:cover;background:#000}.indo-archive-card-body{padding:10px 11px 12px}.indo-archive-title{margin:0;color:#f5f3fa;font-size:14px;font-weight:900;line-height:1.3}.indo-archive-meta{display:flex;gap:7px;margin-top:6px;color:#888392;font-size:9px}.indo-archive-source{color:#b85fff;font-weight:800}.indo-archive-top{padding:4px 6px;font-size:8px;font-weight:800;border-radius:999px;background:rgba(183,91,255,.16);color:#d3a1ff;border:1px solid rgba(183,91,255,.25)}
  `;
  document.head.appendChild(style);
}

function card(item){return `<article class="indo-archive-card" data-archive-id="${esc(item.id)}"><div class="indo-archive-video-wrap"><video class="indo-archive-video" src="${esc(item.videoUrl)}" preload="none" playsinline controls></video></div><div class="indo-archive-card-body"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><h3 class="indo-archive-title">${esc(item.title||"Kannada video")}</h3><span class="indo-archive-top">LATEST</span></div><div class="indo-archive-meta"><span class="indo-archive-source">Internet Archive</span><span>·</span><span>${esc(age(item.createdAt))}</span></div></div></article>`;}

export async function renderVideo(app){
  installStyles();
  const top=renderIndoBrandTopbar({rightHtml:'<button type="button" data-screen="create" aria-label="Create">＋</button>',rightLabel:"Create"});
  app.innerHTML=`<div class="app-shell indo-archive-video-shell">${top}<main class="indo-archive-video-main"><label class="indo-archive-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><input id="archive-video-search" type="search" placeholder="Search Kannada videos..." autocomplete="off"></label><div class="indo-archive-head"><div><h2>Latest Kannada Videos</h2><small>100 direct videos · refreshed every minute</small></div></div><div id="archive-video-status" class="indo-archive-status">Finding latest Kannada videos…</div><div id="archive-video-list" class="indo-archive-list"></div></main></div>`;

  const searchInput=app.querySelector("#archive-video-search"),status=app.querySelector("#archive-video-status"),list=app.querySelector("#archive-video-list");
  let stopped=false,refreshTimer=0,searchTimer=0,serial=0;

  const upsert=(items)=>{
    if(stopped||!items?.length)return;
    const existing=new Map([...list.querySelectorAll("[data-archive-id]")].map((el)=>[el.dataset.archiveId,el]));
    const fragment=document.createDocumentFragment();
    for(const item of items){
      if(existing.has(String(item.id)))continue;
      const wrap=document.createElement("div");wrap.innerHTML=card(item);fragment.appendChild(wrap.firstElementChild);
    }
    if(fragment.childNodes.length)list.appendChild(fragment);
    if(status.parentNode)status.remove();
  };

  const load=async(force=false)=>{
    const current=++serial;
    if(!list.children.length)status.textContent="Finding latest Kannada videos…";
    try{
      await loadArchiveKannadaVideosProgressive({limit:100,search:searchInput.value.trim(),force,onBatch:(items)=>{if(current!==serial||stopped)return;upsert(items);}});
    }catch(error){if(current===serial&&!list.children.length)status.textContent=error?.message||"Could not load Internet Archive videos.";}
  };

  await load(false);
  refreshTimer=window.setInterval(()=>load(true).catch(()=>{}),60000);
  searchInput.addEventListener("input",()=>{window.clearTimeout(searchTimer);searchTimer=window.setTimeout(()=>{list.innerHTML="";status.textContent="Searching…";load(true).catch(()=>{});},350);});
  const observer=new MutationObserver(()=>{if(!document.body.contains(app)){stopped=true;window.clearInterval(refreshTimer);window.clearTimeout(searchTimer);observer.disconnect();}});observer.observe(document.body,{childList:true,subtree:true});
}
