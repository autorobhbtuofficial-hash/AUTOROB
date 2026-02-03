# Firebase & Services Configuration Guide

This guide will help you set up Firebase, Cloudinary, and other services for the AUTOROB website.

---

## 🔥 Firebase Setup

Firebase will handle:
- **Authentication** (Email/Password, Google Sign-in)
- **Firestore Database** (Events, Team, Gallery, Users)
- **Storage** (Optional - for file uploads)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `autorob-hbtu`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Register Web App

1. In Firebase Console, click the **Web icon** (`</>`)
2. Register app name: `AUTOROB Website`
3. **Copy the configuration object** (you'll need this)

### Step 3: Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (you'll need to configure OAuth consent screen)

### Step 4: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Start in **Production mode**
3. Choose location: `asia-south1` (India) or closest to you
4. Click **Enable**

### Step 5: Set Security Rules

Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Events collection
    match /events/{eventId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin'];
    }
    
    // Team members collection
    match /team_members/{memberId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Gallery collection
    match /gallery/{imageId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin'];
    }
    
    // Registrations collection
    match /registrations/{registrationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'subadmin'];
    }
    
    // Quotes collection
    match /quotes/{quoteId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Settings collection
    match /settings/{settingId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Firebase config to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=autorob-hbtu.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=autorob-hbtu
   VITE_FIREBASE_STORAGE_BUCKET=autorob-hbtu.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

---

## ☁️ Cloudinary Setup (Optional - for Image Optimization)

Cloudinary will handle:
- Image optimization and compression
- CDN delivery
- Automatic format conversion (WebP, AVIF)

### Step 1: Create Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Verify email

### Step 2: Get Credentials

1. Go to **Dashboard**
2. Copy:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Add to Environment Variables

Add to `.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Upload Preset (Optional)

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Name: `autorob-uploads`
5. Signing Mode: **Unsigned**
6. Folder: `autorob`
7. Save

---

## 🗄️ Database Collections Structure

### Users Collection
```javascript
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  role: "user", // admin | subadmin | user
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Events Collection
```javascript
{
  id: "auto_generated",
  title: "Workshop on Robotics",
  description: "Learn basics of robotics...",
  imageUrl: "https://cloudinary.com/...",
  eventType: "workshop", // workshop | event | competition
  date: Timestamp,
  maxParticipants: 50,
  registrationFee: 500,
  isActive: true,
  createdAt: Timestamp,
  createdBy: "admin_uid"
}
```

### Team Members Collection
```javascript
{
  id: "auto_generated",
  name: "Jane Smith",
  role: "core", // faculty | core | member
  position: "President",
  imageUrl: "https://cloudinary.com/...",
  linkedIn: "https://linkedin.com/in/...",
  github: "https://github.com/...",
  order: 1,
  isActive: true
}
```

### Gallery Collection
```javascript
{
  id: "auto_generated",
  imageUrl: "https://cloudinary.com/...",
  caption: "Robotics Workshop 2024",
  category: "workshop", // workshop | event | project
  uploadedAt: Timestamp,
  uploadedBy: "admin_uid"
}
```

### Registrations Collection
```javascript
{
  id: "auto_generated",
  eventId: "event_id",
  userId: "user_uid",
  userName: "John Doe",
  userEmail: "user@example.com",
  phone: "+91 9876543210",
  college: "HBTU Kanpur",
  paymentStatus: "pending", // pending | completed | failed
  paymentId: "razorpay_payment_id",
  registeredAt: Timestamp
}
```

---

## 🔐 Creating First Admin User

After setting up Firebase Authentication:

1. **Sign up normally** through the website
2. **Go to Firestore Console**
3. Find your user in `users` collection
4. **Edit the document** and change `role` to `"admin"`
5. Save

Now you have admin access!

---

## 💳 Razorpay Setup (Future - for Payments)

### Step 1: Create Account
1. Go to [Razorpay](https://razorpay.com/)
2. Sign up for business account
3. Complete KYC verification

### Step 2: Get API Keys
1. Go to **Settings** → **API Keys**
2. Generate **Test Mode** keys first
3. Copy Key ID and Key Secret

### Step 3: Add to Environment
```env
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_RAZORPAY_KEY_SECRET=...
```

---

## 📊 Google Sheets Integration (Future)

For exporting registration data:

### Step 1: Enable Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable **Google Sheets API**
4. Create **Service Account**
5. Download JSON credentials

### Step 2: Share Sheet
1. Create Google Sheet
2. Share with service account email
3. Give **Editor** permissions

---

## 🚀 Deployment Configuration

### Netlify Environment Variables

Add these in Netlify Dashboard → Site Settings → Environment Variables:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLOUDINARY_CLOUD_NAME=...
```

### Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`

---

## 🧪 Testing Firebase Connection

After configuration, test with:

```javascript
// In browser console
import { db } from './services/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Test Firestore connection
const testConnection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    console.log('Connected! Documents:', querySnapshot.size);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};

testConnection();
```

---

## 📝 Next Steps

1. ✅ Configure Firebase project
2. ✅ Add credentials to `.env`
3. ✅ Set Firestore security rules
4. ✅ Create first admin user
5. 🔜 Build authentication UI
6. 🔜 Build admin dashboard
7. 🔜 Integrate Cloudinary for images
8. 🔜 Add Razorpay for payments

---

## 🆘 Troubleshooting

### Firebase Connection Issues
- Check if `.env` file exists
- Verify all credentials are correct
- Ensure no extra spaces in `.env`
- Restart dev server after changing `.env`

### Authentication Not Working
- Check if Email/Password is enabled in Firebase Console
- Verify domain is authorized in Firebase settings
- Check browser console for errors

### Firestore Permission Denied
- Verify security rules are published
- Check user role in Firestore
- Ensure user is authenticated

---

**Need Help?** Check Firebase documentation or contact the development team.
