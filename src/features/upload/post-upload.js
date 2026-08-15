export function createPostDraft({ userId, mediaUrl, caption = "" }) {
  return {
    type: "post",
    userId,
    mediaUrl,
    caption,
    createdAt: new Date().toISOString(),
  };
}
