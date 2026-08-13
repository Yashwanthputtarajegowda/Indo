export function renderHomeTopbar() {
  return `
    <header class="topbar">
      <div class="brand"><span>♥</span>Indo</div>
      <div class="top-actions" aria-label="Home actions">
        <button class="create-button top-action-button" data-screen="create" aria-label="Create" title="Create"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        <button class="search-button top-action-button" data-screen="search" aria-label="Search" title="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        <button class="notification-button top-action-button" data-screen="notifications" aria-label="Notifications" title="Notifications"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10a5 5 0 0 1 10 0v4l2 2H5l2-2zM10 19h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </header>`;
}

export function installHomeTopbarStyles() {
  const id = 'indo-home-topbar-v2';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .top-actions{display:flex;align-items:center;justify-content:flex-end;gap:18px;padding-left:8px}
    .top-action-button{width:32px;height:32px;display:grid;place-items:center;padding:0;flex:0 0 32px;line-height:0}
    .top-action-button svg{width:20px;height:20px;display:block;overflow:visible}
    .top-action-button.create-button svg,.top-action-button.notification-button svg{width:21px;height:21px}
  `;
  document.head.appendChild(style);
}