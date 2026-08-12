export function addComment(comments, text, userId) {
  const value = text.trim();
  if (!value) return comments;
  return [...comments, { text: value, userId }];
}
