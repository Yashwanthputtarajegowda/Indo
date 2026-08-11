const onboardingSlides = [
  {
    title: "Enjoy Unlimited Videos & Reels",
    description: "Watch, like, share and connect with creators.",
    icon: "▶"
  },
  {
    title: "Connect With People",
    description: "Follow creators and stay connected.",
    icon: "●●"
  },
  {
    title: "Share What You Love",
    description: "Share your moments with the world.",
    icon: "↗"
  }
];

export function renderOnboardingPage(container) {
  let currentSlide = 0;

  function renderSlide() {
    const slide = onboardingSlides[currentSlide];

    container.innerHTML = `
      <main class="onboarding-page">
        <section class="onboarding-card">
          <div class="onboarding-art" aria-hidden="true">
            <span>${slide.icon}</span>
          </div>

          <div class="onboarding-copy">
            <h1>${slide.title}</h1>
            <p>${slide.description}</p>
          </div>

          <div class="onboarding-dots" aria-label="Onboarding progress">
            ${onboardingSlides.map((_, index) => `
              <span class="onboarding-dot ${
                index === currentSlide ? "is-active" : ""
              }"></span>
            `).join("")}
          </div>

          <button
            class="onboarding-next"
            type="button"
            data-onboarding-next
          >
            ${currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
          </button>
        </section>
      </main>
    `;

    container
      .querySelector("[data-onboarding-next]")
      .addEventListener("click", () => {
        if (currentSlide < onboardingSlides.length - 1) {
          currentSlide += 1;
          renderSlide();
          return;
        }

        window.dispatchEvent(
          new CustomEvent("indo:onboarding-complete")
        );
      });
  }

  renderSlide();
}
