const KEY = Symbol.for("indo.profileVideoNativeControlsHidden");

if (!globalThis[KEY]) {
  globalThis[KEY] = true;
  const style = document.createElement("style");
  style.id = "indo-profile-video-native-controls-hidden";
  style.textContent = `
    .profile-video-viewer video::-webkit-media-controls,
    .profile-video-viewer video::-webkit-media-controls-enclosure,
    .profile-video-viewer video::-webkit-media-controls-panel,
    .profile-video-viewer video::-webkit-media-controls-play-button,
    .profile-video-viewer video::-webkit-media-controls-timeline,
    .profile-video-viewer video::-webkit-media-controls-current-time-display,
    .profile-video-viewer video::-webkit-media-controls-time-remaining-display,
    .profile-video-viewer video::-webkit-media-controls-mute-button,
    .profile-video-viewer video::-webkit-media-controls-volume-slider,
    .profile-video-viewer video::-webkit-media-controls-fullscreen-button,
    .profile-video-viewer video::-webkit-media-controls-overflow-button {
      display:none !important;
      opacity:0 !important;
      pointer-events:none !important;
    }
  `;
  document.head.appendChild(style);
}

export {};
