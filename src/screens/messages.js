export function renderMessages(app) {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"></div></header>
      <main style="padding:32px 16px 96px;min-height:calc(100vh - 70px);">
        <h1 style="font-size:20px;margin:0 0 8px;">Message</h1>
        <p style="color:#8d8d98;font-size:13px;margin:0;">Messages section.</p>
      </main>
    </div>`;
}
