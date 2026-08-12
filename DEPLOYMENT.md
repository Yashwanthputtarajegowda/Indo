# Indo Production Deployment Checklist

## Frontend

- Firebase project: `indo-174f0`
- Firebase Hosting deploys from `.github/workflows/firebase-hosting.yml`.
- GitHub Actions secret required: `FIREBASE_TOKEN`.
- `config/runtime-config.js` defaults to `/api` for same-origin/proxy deployments.
- For a separate backend origin, set `window.INDO_API_BASE_URL` in `config/runtime-config.js` to the production API base URL before deployment.

## Backend

Required environment variables are documented in `Indo-Backend/.env.example`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_DATABASE_URL`
- `CORS_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET`

The backend exposes `/api/health` for a basic runtime readiness check.

## Firebase

- Realtime Database rules are in `database.rules.json`.
- `.github/workflows/firebase-rules.yml` deploys those rules.
- Firebase Hosting is configured by `firebase.json` and targets `indo-174f0`.

## Final verification

1. Open the hosted frontend.
2. Confirm `/api/health` is reachable from the frontend deployment when using a same-origin proxy.
3. Sign up and sign in.
4. Verify User ID creation and profile loading.
5. Verify follow, upload, reels, likes, comments, saves, messages, notifications, and delete-account flows.
6. Verify Cloudinary upload succeeds with production credentials.
7. Confirm CORS only allows the production frontend origin(s).
8. Confirm GitHub Actions deploys both Hosting and Database rules successfully.
