window.INDO_API_BASE =
  window.INDO_API_BASE || "https://indo-backend-456919073297.asia-south1.run.app";

(function installRuntimeConfig() {
  if (window.__indoRuntimeV130) return;
  window.__indoRuntimeV130 = true;

  const style = document.createElement("style");
  style.id = "indo-runtime-v130";
  style.textContent = `
    html,body{width:100%;min-height:100%;-webkit-text-size-adjust:100%}
    body{overflow-x:hidden;overflow-y:auto}
    button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .app-shell,.auth-shell{width:100%;max-width:520px;min-height:100dvh;min-height:100svh}
    #story-preview{position:relative!important;overflow:hidden!important}
    #story-preview #story-publish-button,.story-publish{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;max-width:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;outline:0!important}
    #indo-story-done-hit{position:absolute!important;right:0!important;bottom:0!important;width:20%!important;height:44px!important;min-height:44px!important;margin:0!important;padding:0!important;border:0!important;border-radius:10px!important;background:#7b3cff!important;color:#fff!important;font-weight:800!important;display:block!important;z-index:200!important}
    #story-preview #story-add-button{position:absolute!important;right:14px!important;bottom:62px!important;z-index:101!important;width:48px!important;height:48px!important}
    #story-preview #story-add-panel{right:14px!important;bottom:118px!important;left:auto!important;top:auto!important;z-index:120!important}
  `;
  document.head.appendChild(style);

  function installStoryControls() {
    const preview = document.getElementById("story-preview");
    const publish = document.getElementById("story-publish-button");
    const add = document.getElementById("story-add-button");
    if (!preview || !publish || !add || preview.dataset.runtimeControls === "1") return;
    preview.dataset.runtimeControls = "1";
    publish.style.setProperty("display", "none", "important");
    publish.style.setProperty("visibility", "hidden", "important");
    publish.style.setProperty("pointer-events", "none", "important");
    add.style.setProperty("position", "absolute", "important");
    add.style.setProperty("right", "14px", "important");
    add.style.setProperty("bottom", "62px", "important");
    const done = document.createElement("button");
    done.id = "indo-story-done-hit";
    done.type = "button";
    done.textContent = "Done";
    done.setAttribute("aria-label", "Done");
    done.addEventListener("pointerup", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (done.disabled) return;
      done.disabled = true;
      done.textContent = "Posting...";
      publish.disabled = false;
      publish.removeAttribute("disabled");
      try { publish.click(); } catch { done.disabled = false; done.textContent = "Done"; }
    }, true);
    done.addEventListener("click", (event) => { event.preventDefault(); event.stopImmediatePropagation(); }, true);
    preview.appendChild(done);
  }

  const root = document.getElementById("root") || document.body;
  const observer = new MutationObserver(() => installStoryControls());
  observer.observe(root, { childList: true, subtree: true });
  installStoryControls();
})();
