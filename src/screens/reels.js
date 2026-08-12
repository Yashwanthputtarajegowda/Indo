import { icons } from '../data.js';
import { nav } from '../components/nav.js';

export function renderReels(app) {
  app.innerHTML = `<div class="app-shell reels-shell"><header class="reels-top"><button data-screen="home">${icons.back}</button><h2>Reels</h2><button>▣</button></header><main class="reel-view"><div class="reel-bg" style="background-image:url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=85')"></div><div class="reel-gradient"></div><div class="reel-info"><div class="reel-user"><div class="avatar small">A</div><b>@arjun_31</b><button class="follow-btn">Follow</button></div><p>Live your life 🔥</p><small>♪ Original audio</small></div><div class="reel-actions"><button>${icons.heart}<small>12.5K</small></button><button>${icons.comment}<small>320</small></button><button>${icons.share}<small>120</small></button><button>${icons.bookmark}</button></div></main>${nav('reels')}</div>`;
}
