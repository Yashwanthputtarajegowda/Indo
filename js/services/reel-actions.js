export function handleReelLike(reelId) {
  window.dispatchEvent(
    new CustomEvent("indo:reel-like", {
      detail: {
        reelId
      }
    })
  );
}

export function handleReelComment(reelId) {
  window.dispatchEvent(
    new CustomEvent("indo:reel-comment", {
      detail: {
        reelId
      }
    })
  );
}

export async function handleReelShare(reelId) {
  const shareData = {
    title: "Indo Reel",
    text: "Watch this reel on Indo.",
    url: `${window.location.origin}/reel/${reelId}`
  };

  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }

  await navigator.clipboard.writeText(shareData.url);
}

export function handleReelSave(reelId) {
  const savedReels = JSON.parse(
    localStorage.getItem("indo:saved-reels") || "[]"
  );

  if (!savedReels.includes(reelId)) {
    savedReels.push(reelId);
  }

  localStorage.setItem(
    "indo:saved-reels",
    JSON.stringify(savedReels)
  );
}
