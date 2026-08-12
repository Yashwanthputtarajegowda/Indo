export function toggleLike(item) {
  return { ...item, liked: !item.liked };
}
