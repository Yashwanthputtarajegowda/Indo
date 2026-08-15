from pathlib import Path
import re

path = Path("src/features/feed/home-feed.js")
s = path.read_text()

s = s.replace(
    'const FEED_STYLE_ID = "indo-feed-neon-minimal-v3";',
    'const FEED_STYLE_ID = "indo-feed-neon-minimal-v4";',
)

css = r'''    style.textContent += `
    /* INDO FUTURISTIC VIDEO SECTION — header/stories/nav remain untouched */
    .video-post.neon-edge-post{
      border-radius:16px;
      background:
        linear-gradient(#07070c,#07070c) padding-box,
        linear-gradient(135deg,#ff37c9 0%,#8e5cff 46%,#2bdbff 100%) border-box;
      box-shadow:
        0 0 0 1px rgba(137,92,255,.16),
        0 0 24px rgba(224,56,216,.22),
        0 16px 44px rgba(0,0,0,.28);
    }

    .video-post.neon-edge-post .neon-edge-head{
      min-height:58px;
      padding:8px 10px;
      background:rgba(10,10,16,.96);
      border-bottom:1px solid rgba(170,102,255,.22);
      backdrop-filter:blur(10px);
    }

    .video-post.neon-edge-post .neon-edge-creator{gap:9px}

    .video-post.neon-edge-post .neon-edge-avatar{
      width:36px;height:36px;min-width:36px;
      border:1px solid rgba(204,135,255,.75);
      box-shadow:0 0 12px rgba(175,89,255,.3);
    }

    .video-post.neon-edge-post .neon-edge-name{
      font-size:13px;letter-spacing:.1px;
    }

    .video-post.neon-edge-post .neon-edge-follow{
      display:inline-flex;align-items:center;justify-content:center;
      height:32px;padding:0 13px;margin-left:auto;
      border:1px solid rgba(206,105,255,.85);border-radius:999px;
      color:#fff;
      background:linear-gradient(135deg,rgba(122,64,255,.3),rgba(255,55,194,.16));
      box-shadow:inset 0 0 14px rgba(174,93,255,.12),0 0 10px rgba(191,77,255,.16);
      font:800 11px/1 system-ui,sans-serif;letter-spacing:.35px;
      cursor:pointer;white-space:nowrap;
    }

    .video-post.neon-edge-post .neon-edge-follow:hover{
      border-color:#fff;box-shadow:0 0 14px rgba(222,130,255,.35);
    }

    .video-post.neon-edge-post .neon-edge-more{
      width:34px;height:34px;margin-left:8px;
      background:rgba(18,18,27,.72);
      border:1px solid rgba(255,255,255,.08);
      box-shadow:0 0 10px rgba(111,77,255,.12);
    }

    .video-post.neon-edge-post .neon-video-stage{
      position:relative;overflow:hidden;aspect-ratio:4/5;
      min-height:340px;max-height:70vh;background:#000;isolation:isolate;
    }

    .video-post.neon-edge-post .neon-video-stage::before{
      content:'';position:absolute;inset:0;z-index:1;pointer-events:none;
      background:
        linear-gradient(180deg,rgba(0,0,0,.02) 0%,rgba(0,0,0,.04) 46%,rgba(0,0,0,.48) 100%),
        radial-gradient(circle at 82% 12%,rgba(255,75,205,.16),transparent 28%),
        radial-gradient(circle at 10% 86%,rgba(69,194,255,.10),transparent 26%);
      mix-blend-mode:screen;
    }

    .video-post.neon-edge-post .neon-video-stage::after{
      content:'';position:absolute;inset:0;z-index:2;pointer-events:none;opacity:.24;
      background:repeating-linear-gradient(180deg,rgba(255,255,255,.12) 0,rgba(255,255,255,.12) 1px,transparent 1px,transparent 6px);
      mix-blend-mode:soft-light;
    }

    .video-post.neon-edge-post .neon-video-stage .post-video{
      position:relative;z-index:0;width:100%;height:100%;min-height:100%;
      object-fit:cover;object-position:center;background:#000;
    }

    .video-post.neon-edge-post .neon-edge-actions{
      grid-template-columns:repeat(4,minmax(0,1fr));
      min-height:58px;background:rgba(8,8,13,.98);
      border-top:1px solid rgba(226,51,207,.22);
    }

    .video-post.neon-edge-post .neon-edge-actions button{
      height:58px;gap:6px;color:#e2e2eb;font-size:11px;
      transition:color .16s ease,transform .16s ease,background .16s ease;
    }

    .video-post.neon-edge-post .neon-edge-actions button:hover{
      background:linear-gradient(180deg,rgba(120,67,255,.08),rgba(255,55,201,.03));
      transform:translateY(-1px);
    }

    .video-post.neon-edge-post .neon-edge-actions button svg{
      width:22px;height:22px;filter:drop-shadow(0 0 5px rgba(181,92,255,.18));
    }

    .video-post.neon-edge-post .neon-edge-actions small{
      font-size:10px;font-weight:800;letter-spacing:.15px;
    }

    .video-post.neon-edge-post .neon-edge-copy{
      padding:10px 12px 13px;background:#07070c;
      border-top:1px solid rgba(255,255,255,.04);
    }

    @media (max-width:520px){
      .video-post.neon-edge-post .neon-video-stage{min-height:320px;max-height:none;aspect-ratio:4/5}
      .video-post.neon-edge-post .neon-edge-follow{padding:0 11px;font-size:10px}
    }
    `;
'''

if '/* INDO FUTURISTIC VIDEO SECTION' not in s:
    marker = '  document.head.appendChild(style);\n'
    if marker not in s:
        raise SystemExit('Feed style insertion marker not found')
    s = s.replace(marker, css + '\n' + marker, 1)

follow_anchor = '''        <button
          class="icon-btn post-more neon-edge-more"
'''
follow_markup = '''        <button
          class="neon-edge-follow"
          type="button"
          data-follow-target="${ownerUid}"
          aria-label="Follow ${creator}"
        >
          Follow
        </button>

'''
if 'class="neon-edge-follow"' not in s:
    if follow_anchor not in s:
        raise SystemExit('Follow button insertion anchor not found')
    s = s.replace(follow_anchor, follow_markup + follow_anchor, 1)

if 'class="neon-video-stage">${source}' not in s:
    source_marker = '      ${source}\n\n      <div\n        class="post-actions neon-edge-actions"'
    source_replacement = '''      <div class="neon-video-stage">${source}</div>

      <div
        class="post-actions neon-edge-actions"'''
    if source_marker not in s:
        raise SystemExit('Video source wrapper anchor not found')
    s = s.replace(source_marker, source_replacement, 1)

view_pattern = r'\n\s*<button\n\s*class="views-action"\n\s*aria-label="Views"\n\s*>\n\s*\$\{svgIcon\("views"\)\}\n\s*<small>\$\{views\}</small>\n\s*</button>\n'
s, removed = re.subn(view_pattern, '\n', s, count=1)
if removed != 1:
    raise SystemExit('Views action removal failed')

path.write_text(s)
print('Applied futuristic video section patch.')
