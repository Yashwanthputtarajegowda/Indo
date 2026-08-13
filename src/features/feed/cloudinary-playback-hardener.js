const installed = Symbol.for('indo.cloudinaryPlaybackHardener');

function variants(raw) {
  const url = String(raw || '').trim();
  if (!url) return [];
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return [url];
  const marker = '/video/upload/';
  const i = url.indexOf(marker);
  if (i < 0) return [url];
  const prefix = url.slice(0, i + marker.length);
  const rest = url.slice(i + marker.length);
  const qi = rest.indexOf('?');
  const path = qi >= 0 ? rest.slice(0, qi) : rest;
  const query = qi >= 0 ? rest.slice(qi) : '';
  return [...new Set([
    `${prefix}f_mp4,vc_h264,ac_aac,q_auto/${path}${query}`,
    `${prefix}f_mp4,vc_h264,ac_aac/${path}${query}`,
    `${prefix}f_mp4,vc_h264/${path}${query}`,
    url,
  ])];
}

function getCandidates(video) {
  let stored = [];
  try { stored = JSON.parse(video.dataset.indoCloudinaryCandidates || '[]'); } catch { stored = []; }
  if (stored.length) return stored;
  const original = video.dataset.originalVideoSrc || video.dataset.videoSrc || video.currentSrc || video.src || video.querySelector('source')?.src || '';
  const list = variants(original);
  video.dataset.indoCloudinaryCandidates = JSON.stringify(list);
  return list;
}

function makeAudible(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  video.autoplay = true;
  video.removeAttribute('muted');
  video.defaultMuted = false;
  video.muted = false;
  video.volume = 1;
}

function activate(video, index = 0, autoplay = true) {
  if (!(video instanceof HTMLVideoElement)) return false;
  const list = getCandidates(video);
  if (!list.length || index >= list.length) return false;
  const shouldBeAudible = Boolean(window.__indoAudioUnlocked);
  video.dataset.indoCloudinaryIndex = String(index);
  video.dataset.indoCloudinaryBusy = '1';
  video.dataset.loaded = '0';
  const url = list[index];
  video.dataset.videoSrc = url;
  video.removeAttribute('src');
  video.querySelectorAll('source').forEach((node) => node.remove());
  video.src = url;
  video.preload = 'auto';
  if (shouldBeAudible) makeAudible(video);
  video.load();
  if (autoplay) video.play().catch(() => {});
  return true;
}

function next(video, autoplay = true) {
  const current = Number(video.dataset.indoCloudinaryIndex || 0);
  video.dataset.indoCloudinaryBusy = '0';
  return activate(video, current + 1, autoplay);
}

function isCloudinaryVideo(target) {
  const video = target instanceof HTMLVideoElement ? target : null;
  if (!video) return null;
  const raw = video.dataset.originalVideoSrc || video.dataset.videoSrc || video.currentSrc || video.src || '';
  return raw.includes('res.cloudinary.com/') ? video : null;
}

function prepareVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  const raw = video.dataset.originalVideoSrc || video.dataset.videoSrc || video.currentSrc || video.src || video.querySelector('source')?.src || '';
  if (!raw.includes('res.cloudinary.com/')) return;
  if (!video.dataset.indoCloudinaryCandidates) {
    video.dataset.indoCloudinaryCandidates = JSON.stringify(variants(raw));
    video.dataset.indoCloudinaryIndex = '0';
  }
}

function install() {
  if (globalThis[installed]) return;
  globalThis[installed] = true;

  document.addEventListener('error', (event) => {
    const video = isCloudinaryVideo(event.target);
    if (!video) return;
    const index = Number(video.dataset.indoCloudinaryIndex || 0);
    const list = getCandidates(video);
    if (index + 1 < list.length) {
      event.preventDefault();
      event.stopImmediatePropagation();
      next(video, true);
    }
  }, true);

  document.addEventListener('abort', (event) => {
    const video = isCloudinaryVideo(event.target);
    if (!video) return;
    const index = Number(video.dataset.indoCloudinaryIndex || 0);
    const list = getCandidates(video);
    if (index + 1 < list.length) {
      event.preventDefault();
      event.stopImmediatePropagation();
      next(video, true);
    }
  }, true);

  document.addEventListener('stalled', (event) => {
    const video = isCloudinaryVideo(event.target);
    if (!video) return;
    if (video.dataset.indoCloudinaryStallTimer) return;
    video.dataset.indoCloudinaryStallTimer = '1';
    window.setTimeout(() => {
      video.dataset.indoCloudinaryStallTimer = '';
      if (video.isConnected && video.readyState < 2 && !video.paused) next(video, true);
    }, 2200);
  }, true);

  document.addEventListener('canplay', (event) => {
    const video = isCloudinaryVideo(event.target);
    if (!video) return;
    video.dataset.indoCloudinaryBusy = '0';
    if (window.__indoAudioUnlocked) makeAudible(video);
  }, true);

  document.addEventListener('playing', (event) => {
    const video = isCloudinaryVideo(event.target);
    if (!video) return;
    if (window.__indoAudioUnlocked) makeAudible(video);
  }, true);

  const unlockAudio = () => {
    window.__indoAudioUnlocked = true;
    const videos = Array.from(document.querySelectorAll('#root video.post-video'));
    const current = videos.find((video) => !video.paused) || videos.find((video) => video.readyState >= 2);
    if (!current) return;
    videos.forEach((video) => { if (video !== current) video.pause(); });
    makeAudible(current);
    current.play().catch(() => {});
  };

  document.addEventListener('pointerup', unlockAudio, { capture: true, passive: true });
  document.addEventListener('touchend', unlockAudio, { capture: true, passive: true });
  document.addEventListener('click', unlockAudio, { capture: true, passive: true });
  document.addEventListener('keydown', unlockAudio, { capture: true, passive: true });

  let queued = false;
  function prepareAddedNodes(nodes) {
    for (const node of nodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches?.('video')) prepareVideo(node);
      node.querySelectorAll?.('video').forEach(prepareVideo);
    }
  }

  document.querySelectorAll('#root video.post-video, #root video[data-video-src]').forEach(prepareVideo);
  const root = document.getElementById('root');
  if (!root) return;
  const observer = new MutationObserver((records) => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      for (const record of records) prepareAddedNodes(record.addedNodes);
    });
  });
  observer.observe(root, { childList: true, subtree: true });
}

install();
export { install };
