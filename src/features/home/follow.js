export function toggleFollow(followingIds, userId) {
  return followingIds.includes(userId)
    ? followingIds.filter((id) => id !== userId)
    : [...followingIds, userId];
}
