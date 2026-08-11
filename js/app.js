import { renderHomePage } from './pages/home.js';
import { renderReelsFeed } from './pages/reels-feed.js';
import { renderFollowingPage } from './pages/following.js';
import { renderProfilePage } from './pages/profile.js';

const app = document.getElementById('app');

const routes = {
  home: renderHomePage,
  reels: renderReelsFeed,
  following: renderFollowingPage,
  profile: renderProfilePage
};

function navigate(route) {
  const pageRenderer = routes[route];

  if (!pageRenderer || !app) {
    return;
  }

  pageRenderer(app);
}

function setupNavigation() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-route]');

    if (!button) {
      return;
    }

    const route = button.dataset.route;

    if (route === 'create') {
      return;
    }

    navigate(route);
  });
}

if (app) {
  setupNavigation();
  navigate('home');
}
