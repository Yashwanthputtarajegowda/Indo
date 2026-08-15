if (!window.__indoReportHandlerBound) {
  window.__indoReportHandlerBound = true;

  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target
          : null;
      const button = target?.closest(
        '[data-feed-action="report"]',
      );

      if (!button) return;

      const card = button.closest("[data-video-id]");

      if (!card) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      window.__indoReportContext = {
        videoId: String(card.dataset.videoId || "").trim(),
        ownerUid: String(
          card.dataset.ownerUid || "",
        ).trim(),
        title: String(
          card.dataset.postTitle || "Video",
        ).trim(),
      };

      window.__indoNavigate?.("report");
    },
    true,
  );
}
