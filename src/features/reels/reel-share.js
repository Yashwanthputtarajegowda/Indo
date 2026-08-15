export function createReelShareData(reelId, userId) {
  return {
    reelId,
    sharedBy: userId,
    sharedAt: new Date().toISOString(),
  };
}
