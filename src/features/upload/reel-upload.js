export function createReelDraft({ userId, videoUrl, caption = '' }) {
  return { type: 'reel', userId, videoUrl, caption, createdAt: new Date().toISOString() };
}
