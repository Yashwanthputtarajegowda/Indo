import { icons } from '../data.js';

export function nav(active) {
  return `<nav class="bottom-nav">
    <button data-screen="home" class="${active === 'home' ? 'active' : ''}">${icons.home}<span>Home</span></button>
    <button data-screen="search" class="${active === 'search' ? 'active' : ''}">${icons.search}<span>Search</span></button>
    <button data-screen="reels" class="${active === 'reels' ? 'active' : ''}">${icons.reel}<span>Reels</span></button>
    <button data-screen="create" class="${active === 'create' ? 'active' : ''}">${icons.create}<span>Create</span></button>
    <button data-screen="profile" class="${active === 'profile' ? 'active' : ''}">${icons.profile}<span>Profile</span></button>
  </nav>`;
}
