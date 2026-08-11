import { getMediaLikeStatus, toggleMediaLike } from "./media-like.js";

export async function toggleLike(reelId) {
  return toggleMediaLike(reelId);
}

export async function getLikeStatus(reelId) {
  return getMediaLikeStatus(reelId);
}

export function openComments(reelId) {
  window.dispatchEvent(new CustomEvent("indo:reel-comment", { detail: { reelId } }));
}

export async function shareReel(reelId) {
  const shareData = {
    title: "Indo Reel",
    text: "Watch this reel on Indo.",
    url: `${window.location.origin}/reel/${reelId}`
  };
  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }
  if (navigator.clipboard) await navigator.clipboard.writeText(shareData.url);
}

export function toggleSave(reelId) {
  const saved = JSON.parse(localStorage.getItem("indo:saved-reels") || "[]");
  const index = saved.indexOf(reelId);
  if (index >= 0) saved.splice(index, 1);
  else saved.push(reelId);
  localStorage.setItem("indo:saved-reels", JSON.stringify(saved));
  return index < 0;
}
