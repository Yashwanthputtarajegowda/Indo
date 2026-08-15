export function toggleSavedReel(savedReels, reelId) {
  return savedReels.includes(reelId) ? savedReels.filter((id) => id !== reelId) : [...savedReels, reelId];
}
