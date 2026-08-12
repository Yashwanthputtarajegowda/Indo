# Indo Pre-Release Status

## Code
- Core product flows implemented.
- Firebase Realtime Database rules hardened.
- Frontend and backend CI validation present.
- Firebase Hosting deployment workflow present.
- Backend Docker/Render deployment configuration present.

## Manual blockers
- Configure GitHub `FIREBASE_TOKEN` secret.
- Configure backend Firebase Admin credentials.
- Configure Cloudinary credentials.
- Configure production `CORS_ORIGINS`.
- Deploy backend and record its `/api/health` URL.
- Set frontend runtime API URL if frontend/backend are on different origins.
- Set `BACKEND_HEALTH_URL` GitHub variable.

## Release gate
Do not mark production-ready until the deployed `/api/health` returns `ok: true` and the complete real-device E2E flow passes.
