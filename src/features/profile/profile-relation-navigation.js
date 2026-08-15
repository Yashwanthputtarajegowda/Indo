import { auth } from "../auth/firebase-client.js";

async function openRelation(relation, userId) {
  const user = auth.currentUser;
  if (!user || !userId) return;

  const token = await user.getIdToken();
  const response = await fetch(
    `${window.INDO_API_BASE || ""}/api/account/profile/${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.profile) {
    throw new Error(
      data?.error || "Could not open this list.",
    );
  }

  const targetUid = String(
    data.profile.uid || "",
  ).trim();

  if (!targetUid) {
    throw new Error("Profile UID is missing.");
  }

  window.__indoProfileRelationContext = {
    relation,
    targetUid,
    returnProfile: {
      userId: String(
        data.profile.userId ||
          data.profile.username ||
          userId,
      ).replace(/^@/, ""),
      uid: targetUid,
    },
  };

  window.__indoNavigate?.("profile-relation");
}

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
        document
          .querySelector("[data-profile-id]")
          ?.textContent || "",
      )
        .trim()
        .replace(/^@/, "");

      if (!profileId) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      openRelation(label, profileId).catch((error) => {
        console.warn(
          "Profile relation navigation failed:",
          error,
        );
      });
    },
    true,
  );
}
