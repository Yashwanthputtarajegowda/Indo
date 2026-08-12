# Indo Production Test Matrix

Run this only after the real Railway backend URL and production Firebase/Cloudinary credentials are configured.

## Authentication & account
- Signup/login with valid credentials
- Invalid credentials show an actionable error
- User ID claim works and duplicate User IDs are rejected
- Public/private account selection persists
- Profile load/edit works after refresh

## Social graph
- Follow public account -> Following
- Follow private account -> Requested
- Accept/reject private request
- Repeated follow action is idempotent
- Block prevents further social interaction
- Unblock restores allowed interaction

## Feed & media
- Home feed loads from backend
- Video upload: signed Cloudinary upload -> Firebase media record
- Reel upload/playback
- Video view count increments
- Like/save/comment work once and remain consistent after refresh
- Private/blocked media is not readable or engageable

## Stories
- Story upload to Cloudinary
- Story record saved to backend
- Active stories appear in Stories row
- Story viewer opens/closes correctly
- Story expires after 24 hours
- Private/blocked visibility rules are respected

## Search & profile
- Search by @User ID
- Existing user profile summary loads
- Follow/Requested/Following state updates correctly
- Non-existent user shows a clear result

## Notifications
- Follow/like/comment notifications appear
- Duplicate actions do not create duplicate notifications
- Read state/unread count updates correctly

## Earnings & wallet
- Earnings data loads
- Wallet balance loads
- Withdrawal request validation works
- Invalid payout data is rejected

## Production checks
- `/api/health` reports backend and Firebase readiness
- CORS allows only configured production origins
- Cloudinary secrets remain backend-only
- No placeholder/localhost API URL is used in production build
- Android debug APK launches against configured backend
- Signed release APK/AAB build succeeds

## Final acceptance
All critical flows above must pass on a real Android device before release approval.
