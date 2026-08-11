export function renderSplashPage(container) {
  container.innerHTML = `
    <main class="splash-page">
      <div class="splash-page__backdrop" aria-hidden="true"></div>

      <section class="splash-page__content">
        <div class="splash-logo" aria-label="Indo">
          <span>Indo</span>
          <i aria-hidden="true">▶</i>
        </div>

        <div class="splash-page__bottom">
          <h1>Movies, Videos & Reels</h1>
          <p>All in one place</p>

          <button
            type="button"
            class="splash-start"
            data-route="login"
          >
            Get Started
          </button>
        </div>
      </section>
    </main>
  `;

  const style = document.createElement("style");

  style.textContent = `
    .splash-page {
      position: relative;
      min-height: 100dvh;
      overflow: hidden;
      background: #050507;
    }

    .splash-page__backdrop {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 50% 38%, rgba(70, 70, 82, 0.22), transparent 38%),
        linear-gradient(180deg, #101014 0%, #050507 72%);
    }

    .splash-page__backdrop::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.82));
    }

    .splash-page__content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 100dvh;
      padding: 0 24px 38px;
    }

    .splash-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding-top: 42dvh;
      font-size: clamp(52px, 15vw, 82px);
      font-weight: 800;
      letter-spacing: -4px;
    }

    .splash-logo i {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 0.5em;
      height: 0.5em;
      margin-top: 8px;
      border-radius: 50%;
      background: #ffffff;
      color: #08080a;
      font-size: 0.28em;
      font-style: normal;
      letter-spacing: 0;
    }

    .splash-page__bottom {
      width: min(100%, 430px);
      margin: 0 auto;
      text-align: center;
    }

    .splash-page__bottom h1 {
      margin: 0 0 7px;
      font-size: 18px;
      font-weight: 700;
    }

    .splash-page__bottom p {
      margin: 0 0 28px;
      color: #b8b8bf;
      font-size: 14px;
    }

    .splash-start {
      width: 100%;
      min-height: 52px;
      border: 0;
      border-radius: 14px;
      background: #ffffff;
      color: #08080a;
      font-size: 16px;
      font-weight: 700;
    }

    .splash-start:active {
      transform: scale(0.98);
    }
  `;

  container.appendChild(style);
}
