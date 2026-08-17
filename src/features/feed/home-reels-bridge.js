// Home feed intentionally contains only normal video uploads.
// Reels are rendered exclusively by the dedicated Reels screen.
// Keep this bridge as a no-op so older imports remain compatible.

export async function installHomeReelsBridge() {
  return undefined;
}
