export function toggleReelFollow(following, userId) {
  return following.includes(userId) ? following.filter((id) => id !== userId) : [...following, userId];
}
