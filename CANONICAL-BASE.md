# Indo Canonical Base

This repository's `main` branch is the only supported application base.

## Rules for future updates

1. Build every frontend change from the current canonical files on `main`.
2. Do not restore, copy, or import legacy/versioned screen implementations from old snapshots or historical commits.
3. Do not introduce another `main-v*`, `router-v*`, profile-version, edit-profile-version, home-topbar-version, or similar runtime snapshot as a new source of truth.
4. Keep the active entrypoints canonical (`index.html` -> `src/main.js` -> `src/router.js`).
5. Preserve currently working routes/features unless the next requested change explicitly replaces them.
6. Frontend changes must remain compatible with the current backend API contract; do not copy old backend behavior to fix a frontend regression.
7. Before a release, verify the app starts, authentication works, navigation works, profile/edit-profile/settings work, video/watch flows work, and no old snapshot is reintroduced into the active import graph.

## Baseline

This file marks the current `main` state as the permanent starting point for the next feature update. Historical files/commits are reference history only, not implementation sources.
