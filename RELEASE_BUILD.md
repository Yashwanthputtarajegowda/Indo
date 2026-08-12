# Indo Android Release Build

The debug APK build is automated. A production release must be signed with a keystore that is never committed to the repository.

## Required GitHub Actions secrets

Set these repository secrets before enabling a signed release workflow:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `INDO_API_BASE`

`INDO_API_BASE` must be the real HTTPS production URL of `Indo-Backend`.

## Release outputs

Generate both:

- signed APK for direct Android installation
- signed AAB for Google Play distribution

## Security

Do not commit:

- `.jks` / `.keystore` files
- Firebase Admin private keys
- Cloudinary API secrets
- Android signing passwords
- production backend URLs containing credentials

The existing debug workflow should remain usable for development. Production signing should be a separate workflow so debug artifacts are never treated as release builds.
