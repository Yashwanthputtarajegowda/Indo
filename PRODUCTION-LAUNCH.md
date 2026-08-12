# Indo Production Launch Checklist

## Backend (Railway)
- Set `FIREBASE_PROJECT_ID`
- Set `FIREBASE_CLIENT_EMAIL`
- Set `FIREBASE_PRIVATE_KEY`
- Set `FIREBASE_DATABASE_URL`
- Set `CORS_ORIGINS` to the production Indo web origin(s)
- Set `CLOUDINARY_CLOUD_NAME`
- Set `CLOUDINARY_API_KEY`
- Set `CLOUDINARY_API_SECRET`
- Do not commit any secret values to GitHub
- Verify `/api/health` returns `ok: true`

## Frontend
- Copy `config/runtime-config.production.example.js` to `config/runtime-config.js`
- Replace `YOUR-RAILWAY-BACKEND-URL` with the real Railway backend URL
- Keep `INDO_API_BASE` free of trailing `/`

## Cloudinary
- Use the signed upload endpoint from the backend
- Videos use `indo/videos`
- Stories use `indo/stories`
- Keep Cloudinary API secret backend-only

## Firebase
- Verify Authentication providers are enabled
- Verify Realtime Database rules for production
- Verify user/profile, follow, block, story, media and earning paths

## Android
- Generate a release-signed build only after the production runtime config is set
- Verify the release app points to the live backend
- Keep debug APK separate from release APK/AAB

## Final validation
- Login/signup
- Profile and privacy
- Search and follow
- Block/unblock
- Video/reel upload
- Story upload/view/expiry
- Like/comment/save/share
- Notifications
- Earning/watch-time
- Wallet/payout request
