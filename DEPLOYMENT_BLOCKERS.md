# Deployment blockers

The application code and deployment configuration are prepared, but these values must be supplied in the actual hosting environments before production verification can pass.

## Frontend
- Firebase Hosting deployment must succeed.
- The final backend URL must be set in `config/runtime-config.js` (or provided before `app.js` loads).

## Backend
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_DATABASE_URL`
- `CORS_ORIGINS` = production frontend origin
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET`

## GitHub
- `FIREBASE_TOKEN` repository secret for Firebase Hosting/database deployment.
- `BACKEND_HEALTH_URL` repository variable for production health smoke tests.

## Release gate
Do not mark production-ready until the deployed backend returns `{ "ok": true }` from `/api/health` and the critical end-to-end flow passes on the deployed frontend.
