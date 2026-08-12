# Indo Final QA Checklist

## Auth
- Create account with a unique User ID
- Reject duplicate User ID
- Login/logout
- Refresh and restore authenticated session

## Profile
- Load profile from backend
- Edit name/bio
- Open public profile from Home/Reels
- Follow/unfollow
- Followers/following counts and lists

## Media
- Upload video
- Upload reel
- Home feed filters video media
- Reels feed filters reel media
- Play media
- Record view once per player session
- Like/unlike
- Comment/add comment
- Save/unsave
- Saved Reels opens and plays media

## Messaging
- Search by @UserID
- Open/create conversation
- Send message
- Realtime receive
- Unread count appears
- Opening chat clears unread count
- Message notification appears

## Notifications
- Follow notification
- Comment notification
- Message notification
- Mark notification read

## Account lifecycle
- Activity timestamp updates
- Delete account confirmation
- Backend account deletion
- Local profile/activity cleared
- Auth transition after deletion
- Inactive-account cleanup job runs in production

## Production
- Frontend deploys to Firebase Hosting
- Backend environment variables are configured
- Production CORS origin is configured
- Cloudinary credentials are configured
- Firebase Admin credentials are configured
- `/api/health` returns healthy
- Frontend runtime API URL points at deployed backend

## Security
- Realtime Database rules are deployed
- Authenticated-only data boundaries work
- User-owned records cannot be written by another UID
- Conversation access is validated in production
