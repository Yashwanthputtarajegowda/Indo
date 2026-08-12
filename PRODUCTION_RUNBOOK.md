# Indo Production Runbook

## Before deploy
- Set GitHub `FIREBASE_TOKEN` secret.
- Deploy the backend with all values from `Indo-Backend/.env.example` configured in the hosting provider.
- Set production `CORS_ORIGINS` to the deployed frontend origin.
- Set `BACKEND_HEALTH_URL` GitHub repository variable to the backend `/api/health` URL.
- Verify Firebase Realtime Database rules deployment.
- Verify Cloudinary credentials and signed upload endpoint.

## After deploy
1. Open the Firebase Hosting URL.
2. Create a test account and claim a unique `@UserID`.
3. Log out and log back in.
4. Open Profile and verify account data persists.
5. Follow/unfollow a second test user.
6. Upload a video and verify it appears in Home.
7. Upload a reel and verify it appears in Reels.
8. Play media and verify views increment once per player session.
9. Like, comment, save, and share a reel.
10. Open Saved Reels and play a saved item.
11. Send a message to another test user and verify unread count + notification.
12. Open the chat and verify unread count clears.
13. Open Notifications and mark items read.
14. Test logout/login persistence.
15. Test Delete Account only with a dedicated test account.

## Release blocker
Do not call the release production-ready until backend health returns `ok: true`, Firebase/Cloudinary configuration is present, and the critical end-to-end flow above passes on a real device/browser.
