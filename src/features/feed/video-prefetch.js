// Compatibility entrypoint intentionally kept side-effect free.
// The app now loads feed data only when the active screen requests it.
export async function prefetchVideoSection() {
  return { ok: true, skipped: true };
}
