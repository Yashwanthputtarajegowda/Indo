export function createShareData(itemId, userId) {
  return { itemId, userId, sharedAt: new Date().toISOString() };
}
