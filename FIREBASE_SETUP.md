# 🔥 Firebase Setup Guide

## 🚀 **Step 1: Create Firebase Project**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Click "Create a project"**
3. **Enter project name:** `student-productivity-hub`
4. **Enable Google Analytics** (optional)
5. **Click "Create project"**

## 🔐 **Step 2: Enable Authentication**

1. **In Firebase Console, go to "Authentication"**
2. **Click "Get started"**
3. **Go to "Sign-in method" tab**
4. **Enable "Email/Password"**
5. **Click "Save"**

## 📊 **Step 3: Create Firestore Database**

1. **Go to "Firestore Database"**
2. **Click "Create database"**
3. **Choose "Start in test mode"** (for development)
4. **Select a location** (choose closest to your users)
5. **Click "Done"**

## ⚙️ **Step 4: Get Your Firebase Config**

1. **Go to Project Settings** (gear icon)
2. **Scroll down to "Your apps"**
3. **Click "Add app" → Web**
4. **Register app with name:** `Student Productivity Hub`
5. **Copy the config object**

## 🔧 **Step 5: Update Firebase Config**

Replace the config in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🔒 **Step 6: Set Up Firestore Rules**

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User's tasks, achievements, etc.
    match /users/{userId}/{collection}/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 **Step 7: Deploy**

1. **Update the Firebase config** in your code
2. **Push to GitHub**
3. **Deploy to Netlify/Vercel**

## ✅ **Features You'll Get:**

- ✅ **User registration and login**
- ✅ **Individual data storage per user**
- ✅ **Secure authentication**
- ✅ **Real-time data sync**
- ✅ **Password reset functionality**
- ✅ **Email verification**

## 🔧 **Next Steps:**

1. **Set up Firebase project**
2. **Update the config**
3. **Test authentication**
4. **Deploy your app**

**Need help with any step?** Let me know! 🚀 