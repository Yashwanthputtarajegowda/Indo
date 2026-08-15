if (!window.__indoProfileRelationNavigationBound) {
  window.__indoProfileRelationNavigationBound = true;

  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target
          : null;
      const stat = target?.closest(".prof-stat");

      if (!stat) return;

      const label = String(
        stat.querySelector("span")?.textContent || "",
      )
        .trim()
        .toLowerCase();

      if (
        label !== "followers" &&
        label !== "following"
      ) {
        return;
      }

      const profileId = String(
        document.querySelector("[data-profile-id]")
          ?.textContent ||
          "",
      )
        .trim()
        .replace(/^@/, "");

      if (!profileId) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      window.__indoProfileRelationContext = {
        targetUid: profileId,
        relation: label,
      };

      window.__indoNavigate?.("profile-relation");
    },
    true,
  );
}
