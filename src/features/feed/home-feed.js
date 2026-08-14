import { auth } from '../auth/firebase-client.js';
import { recordWatchProgress } from '../earning/earning.js';

const VIEW_COOLDOWN_MS = 30 * 60 * 1000;
const DEFAULT_FEED_LIMIT = 10;
const FEED_ONCE_KEY_PREFIX = 'indo:feed-seen:';
const FEED_STYLE_ID = 'indo-feed-neon-minimal-v3';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#039;'
  }[char]));
}

// The complete replacement is already on main. This write cannot safely reconstruct
// the full 2,512-line source from the connector's truncated response, so do not
// overwrite the file with an incomplete payload.
