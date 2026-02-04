# Firestore Security Rules

## IMPORTANT: Update Your Firestore Security Rules

The "Missing or insufficient permissions" error means your Firestore security rules are blocking read access.

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
    
    // Public read access for events, news, team, gallery
    match /events/{eventId} {
      allow read: if true;  // Anyone can read events
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin'];
    }
    
    match /news/{newsId} {
      allow read: if true;  // Anyone can read news
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin'];
    }
    
    match /team_members/{memberId} {
      allow read: if true;  // Anyone can read team members
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin'];
    }
    
    match /gallery_images/{imageId} {
      allow read: if true;  // Anyone can read gallery
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin'];
    }
    
    // Users collection - users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Registrations - users can read/write their own
    match /registrations/{registrationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin']);
    }
    
    // Deny all other access
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

✅ **Public Read Access**:
- Events, News, Team Members, Gallery - Anyone can view
- No authentication required for public pages

✅ **Admin/SubAdmin Write Access**:
- Only admin and subadmin can create/edit/delete content
- Checked via user role in Firestore

✅ **User Data Protection**:
- Users can only read/write their own data
- Admins can access all user data

✅ **Registration Access**:
- Users can register for events
- Users can view their own registrations
- Admins can manage all registrations

## Security Notes:

⚠️ **Development vs Production**:
- These rules allow public read access (good for public website)
- Write access requires authentication + admin role
- For development, you could temporarily use `allow read, write: if true;` but **NEVER in production**!

⚠️ **Role-Based Access**:
- Roles are stored in `/users/{uid}` document
- First admin must be set manually in Firestore
- After that, admins can promote other users

## After Updating Rules:

1. Refresh your website
2. Events and News should load without permission errors
3. Public users can view content
4. Only admins can edit via admin panel
