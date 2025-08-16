# User synchronization

The Cloud Function `onAuthUserCreate` (see `functions/index.js`) keeps Firebase Authentication
and Firestore in sync. Whenever a user is created in Auth, the function writes a document
at `users/{uid}` with basic information such as `role`, `username` and `email`.

## Role resolution
- If the user has a `role` custom claim, that value is used.
- Otherwise the role falls back to `functions.config().defaults.role` or `user`.

## Manual user creation
Users added manually—through the Firebase Console, CLI or Admin SDK—also trigger this function,
so their corresponding Firestore document is created automatically.
To backfill accounts created before deploying this trigger, run a one-off script that
iterates over existing Auth users and writes the missing documents.
