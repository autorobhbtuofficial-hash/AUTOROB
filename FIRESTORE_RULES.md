# Firestore Security Rules

## IMPORTANT: Update Your Firestore Security Rules

## Steps to Fix:

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com
- Select your project: **autorob-hbtu**

### 2. Update Firestore Rules
1. Click **Firestore Database** in left sidebar
2. Click **Rules** tab
3. Replace the existing rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ─────────────────────────────────────────────────────────────
    // HELPER FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    // Check if the caller is the supreme admin (only this email can change roles)
    function isSupremeAdmin() {
      return request.auth != null && request.auth.token.email == 'autorobhbtuofficial@gmail.com';
    }

    // Check if caller has sensei (admin) role
    function isSensei() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'sensei';
    }

    // Check if caller has senpai (subadmin) role
    function isSenpai() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'senpai';
    }

    // Check if caller has elevated privileges (sensei OR senpai)
    function hasElevatedAccess() {
      return isSensei() || isSenpai();
    }

    // ─────────────────────────────────────────────────────────────
    // PUBLIC COLLECTIONS (read-only for everyone)
    // ─────────────────────────────────────────────────────────────

    match /events/{eventId} {
      allow read: if true;
      allow write: if hasElevatedAccess();
    }

    match /news/{newsId} {
      allow read: if true;
      allow write: if hasElevatedAccess();
    }

    match /team_members/{memberId} {
      allow read: if true;
      allow write: if hasElevatedAccess();
    }

    match /gallery_images/{imageId} {
      allow read: if true;
      allow write: if hasElevatedAccess();
    }

    // ─────────────────────────────────────────────────────────────
    // USERS COLLECTION
    // ─────────────────────────────────────────────────────────────

    match /users/{userId} {
      // Users can read their own document; sensei can read all
      allow read: if (request.auth != null && request.auth.uid == userId) || isSensei();

      // Self-update: user can update their own doc BUT cannot change role or isBanned
      allow update: if request.auth != null
        && request.auth.uid == userId
        && !('role' in request.resource.data.diff(resource.data).affectedKeys())
        && !('isBanned' in request.resource.data.diff(resource.data).affectedKeys());

      // Only the supreme admin email can change role or isBanned fields
      allow update: if isSupremeAdmin();

      // Sensei can update anything EXCEPT changing the supreme admin's role
      allow update: if isSensei()
        && resource.data.email != 'autorobhbtuofficial@gmail.com';

      // Sensei can read/write all users (create, delete)
      allow create, delete: if isSensei();

      // Deny all other writes
    }

    // ─────────────────────────────────────────────────────────────
    // CONTACTS COLLECTION
    // ─────────────────────────────────────────────────────────────

    match /contacts/{contactId} {
      // Allow create only if required fields present and within size limits
      allow create: if request.resource.data.keys().hasAll(['name','email','subject','message'])
        && request.resource.data.name is string && request.resource.data.name.size() <= 100
        && request.resource.data.email is string && request.resource.data.email.size() <= 200
        && request.resource.data.subject is string && request.resource.data.subject.size() <= 200
        && request.resource.data.message is string && request.resource.data.message.size() <= 2000;
      allow read, update, delete: if isSensei();
    }

    // ─────────────────────────────────────────────────────────────
    // REGISTRATIONS COLLECTION
    // ─────────────────────────────────────────────────────────────

    // NOTE: The legacy flat /registrations collection is no longer used.
    // All registrations are stored under form_responses/{eventId}/registrations/{responseId}.

    // ─────────────────────────────────────────────────────────────
    // FORM RESPONSES (nested: form_responses/{eventId}/registrations/{responseId})
    // ─────────────────────────────────────────────────────────────

    match /form_responses/{eventId}/registrations/{responseId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || hasElevatedAccess());
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (resource.data.userId == request.auth.uid || hasElevatedAccess());
      allow delete: if hasElevatedAccess();
    }

    // ─────────────────────────────────────────────────────────────
    // DENY ALL OTHER ACCESS
    // ─────────────────────────────────────────────────────────────

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Publish Rules
- Click **Publish** button
- Wait for confirmation

## What These Rules Do:

✅ **Role Obfuscation**:
- `sensei` = admin (replaces `admin` keyword — harder to guess)
- `senpai` = subadmin (replaces `subadmin` keyword — harder to guess)

✅ **Supreme Admin Lock**:
- Only `autorobhbtuofficial@gmail.com` can change any user's `role` or `isBanned` field
- Even other `sensei` users CANNOT change roles (except deleting/creating non-critical docs)
- No one can change the supreme admin's role

✅ **Self-Write Protection**:
- Users can update their own profile (name, photo etc.)
- But they CANNOT change their own `role` or `isBanned` — blocked at database level

✅ **Public Read Access**:
- Events, News, Team Members, Gallery — Anyone can view

✅ **Elevated Write Access**:
- Only `sensei` and `senpai` users can create/edit/delete content

✅ **Registration Access**:
- Users can register for events
- Users can view their own registrations
- `sensei`/`senpai` can manage all registrations

## Security Notes:

⚠️ **Role Keywords**:
- Never use `admin` or `subadmin` anywhere in code — use `sensei`/`senpai`
- These terms are non-obvious and provide security through obscurity

⚠️ **First Time Setup**:
- Set the first `sensei` role manually:
  1. Go to Firestore → `users` collection
  2. Find `autorobhbtuofficial@gmail.com`'s document
  3. Set `role` field to `sensei`
- After that, the rules enforce everything automatically

## After Updating Rules:

1. Publish the rules in Firebase Console
2. All existing `admin`/`subadmin` roles in Firestore must be updated to `sensei`/`senpai`
3. Run the one-time migration in Firestore console or code
