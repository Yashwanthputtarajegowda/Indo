const STYLE_ID = "indo-thunder-theme-v1";

function install() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --indo-bg: #05070d;
      --indo-panel: #0b0f18;
      --indo-panel-2: #0f1420;
      --indo-line: rgba(151, 116, 255, .20);
      --indo-text: #f6f7fb;
      --indo-muted: #8d95a8;
      --indo-purple: #7c4dff;
      --indo-blue: #35a7ff;
      --indo-pink: #ff3da8;
      --indo-green: #38df9a;
      --indo-glow: 0 10px 34px rgba(41, 26, 85, .20);
    }

    body {
      background:
        radial-gradient(circle at 50% -10%, rgba(112, 78, 255, .10), transparent 34%),
        var(--indo-bg) !important;
    }

    .app-shell,
    .auth-shell {
      background:
        radial-gradient(circle at 100% 0%, rgba(53, 167, 255, .045), transparent 28%),
        radial-gradient(circle at 0% 15%, rgba(255, 61, 168, .035), transparent 26%),
        var(--indo-bg) !important;
    }

    .topbar,
    .page-head,
    .reels-top {
      height: 62px !important;
      background: rgba(5, 7, 13, .84) !important;
      border-bottom: 1px solid var(--indo-line) !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, .14);
    }

    .brand {
      letter-spacing: -1.5px !important;
      text-shadow: 0 0 18px rgba(124, 77, 255, .22);
    }

    .brand span {
      display: inline-block;
      width: 16px;
      margin-right: 3px !important;
      font-size: 0 !important;
      color: transparent !important;
    }

    .brand span::after {
      content: "ϟ";
      font-size: 17px;
      font-weight: 1000;
      color: #9d7cff;
      text-shadow:
        0 0 6px rgba(124, 77, 255, .95),
        0 0 16px rgba(53, 167, 255, .38);
    }

    .top-actions button,
    .notification-button,
    .search-button,
    .create-button,
    .page-head button,
    .reels-top button {
      border-radius: 12px !important;
      transition:
        transform .12s ease,
        filter .12s ease,
        box-shadow .12s ease;
    }

    .top-actions button:active,
    .notification-button:active,
    .search-button:active,
    .create-button:active,
    .page-head button:active,
    .reels-top button:active {
      transform: scale(.94);
      filter: brightness(1.15);
    }

    .bottom-nav,
    .indo-global-bottom-nav {
      background: rgba(7, 9, 15, .90) !important;
      border-top: 1px solid var(--indo-line) !important;
      box-shadow: 0 -10px 32px rgba(0, 0, 0, .22);
      backdrop-filter: blur(22px) saturate(135%);
    }

    .bottom-nav button,
    .indo-global-bottom-nav button {
      position: relative;
      transition:
        transform .12s ease,
        color .12s ease;
    }

    .bottom-nav button.active::after,
    .indo-global-bottom-nav button.active::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 5px;
      width: 22px;
      height: 3px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        var(--indo-blue),
        var(--indo-purple),
        var(--indo-pink)
      );
      box-shadow: 0 0 10px rgba(124, 77, 255, .65);
    }

    .bottom-nav button:active,
    .indo-global-bottom-nav button:active {
      transform: translateY(1px) scale(.95);
    }

    .create-card,
    .upload-form,
    .profile-card,
    .settings-card,
    .search-result,
    .notification-card,
    .message-card,
    .conversation-card {
      background: linear-gradient(150deg, rgba(14, 19, 30, .98), rgba(8, 11, 18, .98)) !important;
      border-color: rgba(130, 103, 220, .20) !important;
      box-shadow: var(--indo-glow);
    }

    .create-card,
    .primary-btn,
    .upload-form .primary-btn,
    .edit-btn,
    .prof-btn.primary {
      position: relative;
      overflow: hidden;
    }

    .create-card::before,
    .primary-btn::before,
    .upload-form .primary-btn::before,
    .edit-btn::before,
    .prof-btn.primary::before {
      content: "";
      position: absolute;
      top: -40%;
      left: -20%;
      width: 24%;
      height: 180%;
      transform: rotate(18deg);
      background: linear-gradient(
        180deg,
        transparent,
        rgba(255,255,255,.28),
        transparent
      );
      opacity: .42;
      pointer-events: none;
    }

    .primary-btn,
    .upload-form .primary-btn,
    .prof-btn.primary {
      background: linear-gradient(
        105deg,
        #5d40ff 0%,
        #7f4bff 38%,
        #c53de8 70%,
        #ef419f 100%
      ) !important;
      box-shadow:
        0 8px 24px rgba(110, 62, 255, .25),
        0 0 0 1px rgba(255,255,255,.06) inset;
    }

    .post-card {
      border-bottom-color: rgba(124, 77, 255, .12) !important;
    }

    .post-head,
    .post-copy,
    .post-actions {
      background: transparent;
    }

    .avatar.gradient,
    .avatar.ring,
    .profile-avatar {
      box-shadow:
        0 0 0 2px rgba(124,77,255,.35),
        0 0 18px rgba(124,77,255,.16);
    }

    .follow-btn {
      border-color: #8b63ff !important;
      color: #f0ecff !important;
      box-shadow: 0 0 0 1px rgba(124,77,255,.14) inset;
    }

    .profile-page,
    .settings-page,
    .search-page,
    .notifications,
    .create-page {
      background:
        radial-gradient(circle at 50% 0%, rgba(124,77,255,.06), transparent 28%),
        transparent;
    }

    .tabs button.active {
      color: #fff !important;
      border-bottom-color: #8d6cff !important;
      text-shadow: 0 0 10px rgba(124,77,255,.45);
    }

    .video-post.neon-edge-post {
      border-radius: 16px !important;
      border-color: rgba(124,77,255,.34) !important;
      background:
        linear-gradient(#080b12,#080b12) padding-box,
        linear-gradient(135deg,#39a8ff,#7b4cff 45%,#ff3da8) border-box !important;
      box-shadow:
        0 0 0 1px rgba(124,77,255,.10),
        0 12px 36px rgba(10, 8, 28, .30),
        0 0 26px rgba(124,77,255,.08);
    }

    .video-post.neon-edge-post .neon-edge-head {
      min-height: 58px !important;
      background: linear-gradient(180deg, rgba(14,17,27,.98), rgba(9,11,18,.98)) !important;
    }

    .video-post.neon-edge-post .neon-edge-head::after {
      content: "ϟ";
      position: absolute;
      right: 48px;
      top: 19px;
      color: #8f6bff;
      font-size: 13px;
      font-weight: 1000;
      opacity: .85;
      text-shadow:
        0 0 8px rgba(124,77,255,.85),
        0 0 16px rgba(53,167,255,.28);
      pointer-events: none;
    }

    .video-post.neon-edge-post .neon-edge-creator {
      border-radius: 12px !important;
      padding: 4px 6px !important;
    }

    .video-post.neon-edge-post .neon-edge-avatar {
      box-shadow: 0 0 0 1px rgba(124,77,255,.36);
    }

    .video-post.neon-edge-post .neon-edge-name {
      color: #f5f5fb;
      text-shadow: 0 0 8px rgba(124,77,255,.18);
    }

    .video-post.neon-edge-post .neon-edge-actions {
      min-height: 56px !important;
      background: linear-gradient(180deg, #090d15, #07090f) !important;
      border-top-color: rgba(124,77,255,.20) !important;
    }

    .video-post.neon-edge-post .neon-edge-actions button {
      height: 56px !important;
      color: #c8cede !important;
      transition:
        color .12s ease,
        transform .12s ease,
        background .12s ease;
    }

    .video-post.neon-edge-post .neon-edge-actions button:hover {
      color: #fff !important;
      background: rgba(124,77,255,.055) !important;
    }

    .video-post.neon-edge-post .neon-edge-actions button:active {
      transform: scale(.94);
    }

    .video-post.neon-edge-post .neon-edge-actions button.is-active {
      background: rgba(124,77,255,.07) !important;
    }

    .video-post.neon-edge-post .neon-edge-actions button.is-active.like-action {
      color: #ff54bc !important;
    }

    .video-post.neon-edge-post .neon-edge-actions button.is-active.save-action {
      color: #9a7dff !important;
    }

    .profile-page .userid,
    .prof-id,
    .profile-inline-username {
      color: #a786ff !important;
      text-shadow: 0 0 8px rgba(124,77,255,.20);
    }

    .profile-page .userid::before,
    .prof-id::before {
      content: "ϟ ";
      color: #6fbaff;
      font-weight: 1000;
    }

    .indo-nav-pressed {
      transform: scale(.95) !important;
      filter: brightness(1.15);
    }

    :is(button,[role="button"],[data-screen],[data-open-profile]):focus-visible {
      outline: 2px solid #7b9dff !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(124,77,255,.14) !important;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
    }
  `;

  document.head.appendChild(style);
}

install();

export { install };
