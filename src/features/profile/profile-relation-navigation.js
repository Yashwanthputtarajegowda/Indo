import { auth } from "../auth/firebase-client.js";

function clean(value = "") {
  return String(value ?? "")
    .trim()
    .replace(/^@+/, "");
}

async function resolveRelationTarget(userId) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Please login first.");
  }

  const cleanUserId = clean(userId);
  const currentEmailId = clean(
    currentUser.email?.split("@")[0] || "",
  );

  if (
    cleanUserId &&
    (cleanUserId === currentEmailId ||
      cleanUserId === clean(currentUser.displayName))
  ) {
    return {
      uid: currentUser.uid,
      userId: cleanUserId,
    };
  }

  const token = await currentUser.getIdToken();
  const response = await fetch(
    `${window.INDO_API_BASE || ""}/api/account/profile/${encodeURIComponent(cleanUserId)}`,
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

  const uid = clean(data.profile.uid);

  if (!uid) {
    throw new Error("Profile UID is missing.");
  }

  return {
    uid,
    userId: clean(
      data.profile.userId ||
        data.profile.username ||
        cleanUserId,
    ),
  };
}

async function openRelation(relation, userId) {
  const target = await resolveRelationTarget(userId);

  window.__indoProfileRelationContext = {
    relation:
      relation === "following"
        ? "following"
        : "followers",
    targetUid: target.uid,
    returnProfile: target,
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

      const profileId = clean(
        document.querySelector("[data-profile-id]")
          ?.textContent || "",
      );

      event.preventDefault();
      event.stopImmediatePropagation();

      openRelation(
        label,
        profileId,
      ).catch((error) => {
        console.warn(
          "Profile relation navigation failed:",
          error,
        );
      });
    },
    true,
  );
}
