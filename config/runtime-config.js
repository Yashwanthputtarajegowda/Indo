window.INDO_API_BASE =
  window.INDO_API_BASE || "https://indo-backend-456919073297.asia-south1.run.app";
(function () {
  if (window.__indoRuntimeV143) return;
  window.__indoRuntimeV143 = true;
  const s = document.createElement("style");
  s.id = "indo-runtime-v143";
  s.textContent =
    "html,body{width:100%;min-height:100%;-webkit-text-size-adjust:100%}body{overflow-x:hidden;overflow-y:auto}button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}.app-shell,.auth-shell{width:100%;max-width:520px;min-height:100dvh;min-height:100svh}#story-preview{position:relative!important;overflow:hidden!important}";
  document.head.appendChild(s);

  const nativeFetch = window.fetch.bind(window);
  const firebaseContextPromise = { value: null };

  function extractDeleteId(url) {
    const match = String(url || "").match(/\/api\/media\/videos\/([^/]+)\/delete(?:\?|$)/i);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function clean(value, max = 500) {
    return String(value ?? "").trim().slice(0, max);
  }

  function ownerUid(video = {}) {
    return clean(
      video.ownerUid || video.uid || video.userId || video.creatorUid || video.owner?.uid || video.user?.uid,
      180,
    );
  }

  function candidateValues(video = {}, key = "") {
    const googleDrive = video.googleDrive || {};
    const external = video.external || {};
    return [
      key,
      video.id,
      video.videoId,
      video.mediaId,
      video.publicId,
      video.recordId,
      video.sourceId,
      video.secureUrl,
      video.videoUrl,
      video.streamUrl,
      video.url,
      video.sourceUrl,
      external.sourceUrl,
      googleDrive.fileId,
    ].map((value) => clean(value)).filter(Boolean);
  }

  async function getFirebaseContext() {
    if (firebaseContextPromise.value) return firebaseContextPromise.value;
    firebaseContextPromise.value = (async () => {
      const [{ auth }, dbModule] = await Promise.all([
        import("../src/features/auth/firebase-client.js?v=20260822-auth-stable-v3"),
        import("https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js?v=20260822-delete-db-v1"),
      ]);
      return {
        auth,
        getDatabase: dbModule.getDatabase,
        ref: dbModule.ref,
        get: dbModule.get,
        update: dbModule.update,
        runTransaction: dbModule.runTransaction,
      };
    })();
    return firebaseContextPromise.value;
  }

  async function resolveVideoFromFirebase(requestedId) {
    const ctx = await getFirebaseContext();
    const user = ctx.auth.currentUser;
    if (!user) return null;
    const db = ctx.getDatabase();
    const uid = String(user.uid || "");
    const requested = clean(requestedId);
    if (!requested) return null;

    const legacySnap = await ctx.get(ctx.ref(db, "videos"));
    const legacy = legacySnap.val() || {};
    for (const [key, video] of Object.entries(legacy)) {
      if (!video || typeof video !== "object") continue;
      const candidateOwner = ownerUid(video);
      if (candidateOwner && candidateOwner !== uid) continue;
      if (candidateValues(video, key).includes(requested)) {
        return { key, video, ownerUid: candidateOwner || uid, source: "videos" };
      }
    }

    const [canonicalVideosSnap, canonicalPostsSnap] = await Promise.all([
      ctx.get(ctx.ref(db, `users/${uid}/content/videos`)),
      ctx.get(ctx.ref(db, `users/${uid}/content/posts`)),
    ]);
    const canonicalEntries = [
      ...Object.entries(canonicalVideosSnap.val() || {}),
      ...Object.entries(canonicalPostsSnap.val() || {}),
    ];
    for (const [key, video] of canonicalEntries) {
      if (!video || typeof video !== "object") continue;
      if (candidateValues(video, key).includes(requested)) {
        return { key, video, ownerUid: uid, source: "canonical" };
      }
    }

    return null;
  }

  async function directFirebaseDelete(found) {
    const ctx = await getFirebaseContext();
    const user = ctx.auth.currentUser;
    if (!user) throw new Error("Please login first.");
    if (!found) throw new Error("Video not found in Firebase.");
    if (String(found.ownerUid || user.uid) !== String(user.uid)) {
      throw new Error("You can delete only your own video.");
    }

    const db = ctx.getDatabase();
    const recordKey = clean(found.key);
    const video = found.video || {};
    const canonicalId = clean(video.id || video.publicId || video.videoId || recordKey);
    const updates = {
      [`videos/${recordKey}`]: null,
      [`users/${user.uid}/content/posts/${canonicalId}`]: null,
      [`users/${user.uid}/content/videos/${canonicalId}`]: null,
      [`users/${user.uid}/engagement/videos/${canonicalId}`]: null,
      [`videoLikes/${canonicalId}`]: null,
      [`videoComments/${canonicalId}`]: null,
      [`videoSaves/${canonicalId}`]: null,
    };
    if (recordKey !== canonicalId) {
      updates[`videos/${canonicalId}`] = null;
      updates[`users/${user.uid}/content/posts/${recordKey}`] = null;
      updates[`users/${user.uid}/content/videos/${recordKey}`] = null;
      updates[`users/${user.uid}/engagement/videos/${recordKey}`] = null;
      updates[`videoLikes/${recordKey}`] = null;
      updates[`videoComments/${recordKey}`] = null;
      updates[`videoSaves/${recordKey}`] = null;
    }

    await ctx.update(ctx.ref(db), updates);

    try {
      await Promise.all([
        ctx.runTransaction(ctx.ref(db, `users/${user.uid}/stats/postsCount`), (current) => Math.max(0, (Number(current) || 0) - 1)),
        ctx.runTransaction(ctx.ref(db, `users/${user.uid}/stats/videosCount`), (current) => Math.max(0, (Number(current) || 0) - 1)),
      ]);
    } catch {}

    return {
      ok: true,
      deleted: true,
      videoId: canonicalId,
      matchedRecordKey: recordKey,
      fallback: "firebase-direct",
      storageDeletion: "backend-attempted-first",
    };
  }

  async function deleteViaResolvedBackend(found, input, init) {
    if (!found) return null;
    const ctx = await getFirebaseContext();
    const user = ctx.auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken(true);
    const headers = new Headers((init && init.headers) || (input instanceof Request ? input.headers : undefined) || {});
    if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

    const retryUrl = `${window.INDO_API_BASE}/api/media/videos/${encodeURIComponent(found.key)}/delete`;
    try {
      const response = await nativeFetch(retryUrl, { ...(init || {}), method: "POST", headers, cache: "no-store" });
      if (response.ok) return response;
    } catch {}

    const result = await directFirebaseDelete(found);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  window.fetch = async function indoFetch(input, init) {
    const url = typeof input === "string" ? input : input?.url || "";
    const method = String((init && init.method) || (input instanceof Request && input.method) || "GET").toUpperCase();
    if (method === "POST" && /\/api\/media\/videos\/[^/]+\/delete(?:\?|$)/i.test(String(url))) {
      const requestedId = extractDeleteId(url);
      try {
        const found = await resolveVideoFromFirebase(requestedId);
        if (found) {
          const backendResponse = await deleteViaResolvedBackend(found, input, init);
          if (backendResponse) return backendResponse;
        }
      } catch (error) {
        console.warn("Firebase delete bridge failed:", error);
      }
    }
    return nativeFetch(input, init);
  };
})();
