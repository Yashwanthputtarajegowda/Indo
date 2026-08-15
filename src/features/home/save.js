export function toggleSaved(savedIds, itemId) {
  return savedIds.includes(itemId)
    ? savedIds.filter((id) => id !== itemId)
    : [...savedIds, itemId];
}
