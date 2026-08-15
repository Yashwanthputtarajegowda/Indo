import { icons } from "../data.js";

export function nav(active) {
  const isActive = (screen) => (active === screen ? "active" : "");
  return `<nav class="bottom-nav" aria-label="Primary navigation">
    <button type="button" data-screen="home" class="${isActive("home")}">${icons.home}<span>Home</span></button>
    <button type="button" data-screen="messages" class="${isActive("messages")}">⌕<span>Message</span></button>
    <button type="button" data-screen="reels" class="${isActive("reels")}">${icons.reel}<span>Reel</span></button>
    <button type="button" data-screen="video" class="${isActive("video")}">▣<span>Video</span></button>
    <button type="button" data-screen="profile" data-own-profile="1" class="${isActive("profile")}">${icons.profile}<span>Profile</span></button>
  </nav>`;
}
