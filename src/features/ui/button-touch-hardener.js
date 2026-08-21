let installed = false;

function installButtonTouchHardener() {
  if (installed) return;
  installed = true;

  const style = document.createElement("style");
  style.id = "indo-button-touch-hardener-v1";
  style.textContent = `
    button,
    [role="button"],
    a[data-screen],
    [data-watch-video-id],
    [data-engagement],
    [data-follow-uid],
    [data-search-follow-uid] {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    button:not(:disabled),
    [role="button"],
    a[data-screen],
    [data-watch-video-id],
    [data-engagement],
    [data-follow-uid],
    [data-search-follow-uid] {
      cursor: pointer;
    }

    .indo-nav-pressed {
      transform: scale(.97);
      opacity: .82;
      transition: transform 80ms ease, opacity 80ms ease;
    }
  `;
  document.head.appendChild(style);

  let lastActivation = 0;
  document.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") return;
    const target = event.target instanceof Element
      ? event.target.closest("button,[role=\"button\"],[data-screen],[data-watch-video-id],[data-engagement],[data-follow-uid],[data-search-follow-uid]")
      : null;
    if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
    lastActivation = Date.now();
    target.classList.add("indo-nav-pressed");
    window.setTimeout(() => target.classList.remove("indo-nav-pressed"), 120);
  }, { passive: true });

  document.addEventListener("touchend", (event) => {
    if (Date.now() - lastActivation < 250) return;
    const target = event.target instanceof Element
      ? event.target.closest("button,[role=\"button\"],[data-screen],[data-watch-video-id],[data-engagement],[data-follow-uid],[data-search-follow-uid]")
      : null;
    if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
    if (target.dataset.touchClickSent === "true") return;
    target.dataset.touchClickSent = "true";
    window.setTimeout(() => delete target.dataset.touchClickSent, 350);
  }, { passive: true });
}

installButtonTouchHardener();
