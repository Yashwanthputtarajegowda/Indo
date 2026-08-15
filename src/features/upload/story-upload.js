export function createStoryDraft({ userId, mediaUrl }) {
  return {
    type: "story",
    userId,
    mediaUrl,
    createdAt: new Date().toISOString(),
  };
}
