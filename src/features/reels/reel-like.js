export function toggleReelLike(reel) {
  return { ...reel, liked: !reel.liked };
}
