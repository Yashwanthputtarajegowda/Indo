# Indo Production Runbook

## 1. Railway backend

Create a Railway service from `Yashwanthputtarajegowda/Indo-Backend`.

Set these variables in Railway:

- `PORT` = Railway-provided port (do not hardcode)
- `FIREBASE_PROJECT_ID` = Firebase project ID
- `FIREBASE_CLIENT_EMAIL` = Firebase Admin service-account client email
- `FIREBASE_PRIVATE_KEY` = Firebase Admin service-account private key
- `FIREBASE_DATABASE_URL` = Firebase Realtime Database URL
- `CLOUDINARY_CLOUD_NAME` = Cloudinary cloud name
- `CLOUDINARY_API_KEY` = Cloudinary API key
- `CLOUDINARY_API_SECRET` = Cloudinary API secret
- `CORS_ORIGINS` = production frontend origin(s)

Verify `GET /api/health` returns `ok: true`.

## 2. Frontend

Deploy `Yashwanthputtarajegowda/Indo` to Firebase Hosting or another static host.

Set `window.INDO_API_BASE` in `config/runtime-config.js` to the public Railway backend URL before production launch.

## 3. Firebase

Deploy `firebase.json` and `database.rules.json` from this repository. The Realtime Database rules intentionally deny direct client reads/writes; authenticated backend code uses Firebase Admin.

Enable the required Firebase Authentication providers used by the app.

## 4. Cloudinary

Configure the production Cloudinary credentials only in the Railway backend environment. Never commit the API secret to GitHub.

## 5. End-to-end checks

- Splash -> Login/Signup
- Account creation with unique `@UserID`
- Public/private account toggle
- Private follow request -> accept/reject
- Upload video -> Cloudinary -> Firebase metadata
- Home video playback and views
- Reels playback and views
- Like/comment/save/share
- Profile and uploaded media
- Notifications
- Block/unblock and privacy enforcement
- Earning eligibility and toggle
- Wallet and payout request
- Logout/login session restore

Do not mark the release as production-ready until the Railway health endpoint and the real-device end-to-end flow both pass.
