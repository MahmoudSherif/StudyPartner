# MotivaMate - Netlify Deployment Guide

This document explains how to deploy MotivaMate to Netlify with Firebase integration.

## Prerequisites

1. A Netlify account
2. A Firebase project (using the same project as StudyPartner)
3. Git repository with this code

## Firebase Configuration

This app is configured to use the same Firebase project as StudyPartner for seamless data synchronization.

### Firebase Project Settings

The app is configured to connect to the StudyPartner Firebase project:
- Project ID: `studypartner-16cb7`
- Auth Domain: `studypartner-16cb7.firebaseapp.com`

### Environment Variables

The following environment variables are configured in `.env`:

```
VITE_FIREBASE_API_KEY=AIzaSyBk_A5JbO1nUhFHF4WkJ3FE_-9Q1L2RoKY
VITE_FIREBASE_AUTH_DOMAIN=studypartner-16cb7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studypartner-16cb7
VITE_FIREBASE_STORAGE_BUCKET=studypartner-16cb7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1050515097987
VITE_FIREBASE_APP_ID=1:1050515097987:web:abc123def456ghi789
```

## Netlify Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to your Netlify dashboard
2. Click "New site from Git"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select this repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### 2. Environment Variables Setup

In your Netlify site settings, go to "Environment variables" and add:

```
VITE_FIREBASE_API_KEY=AIzaSyBk_A5JbO1nUhFHF4WkJ3FE_-9Q1L2RoKY
VITE_FIREBASE_AUTH_DOMAIN=studypartner-16cb7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studypartner-16cb7
VITE_FIREBASE_STORAGE_BUCKET=studypartner-16cb7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1050515097987
VITE_FIREBASE_APP_ID=1:1050515097987:web:abc123def456ghi789
VITE_ENVIRONMENT=production
```

### 3. Domain Configuration

If you want to use a custom domain:

1. In Netlify, go to "Domain settings"
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Enable HTTPS (automatic with Let's Encrypt)

### 4. Firebase Security Rules

Make sure your Firebase Firestore security rules allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own data
    match /userData/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Firebase Authentication Configuration

In the Firebase Console:

1. Go to Authentication > Settings > Authorized domains
2. Add your Netlify domain (e.g., `your-app.netlify.app`)
3. Add any custom domains you're using

For Google Sign-In:
1. Go to Authentication > Sign-in method
2. Enable Google provider
3. Add your Netlify domain to authorized domains

## Features

### Data Synchronization

- **Offline-first**: Works without internet connection using local storage
- **Real-time sync**: Automatically syncs with Firebase when online
- **Cross-platform**: Data is shared between MotivaMate and StudyPartner web app
- **User isolation**: Each user's data is completely separated

### PWA Support

- **Mobile optimized**: Responsive design for all screen sizes
- **Installable**: Can be installed as a mobile app
- **Offline capable**: Works without internet connection
- **Push notifications**: For achievements and reminders

### Security

- **Firebase Authentication**: Secure user authentication
- **Data encryption**: All data encrypted in transit and at rest
- **User isolation**: Users can only access their own data
- **Secure headers**: Content Security Policy and other security headers

## Monitoring and Analytics

### Build Status

You can monitor build status and deployments in the Netlify dashboard.

### Error Tracking

The app includes error boundaries and proper error handling for production use.

### Performance

- Optimized build process
- Asset optimization
- Proper caching headers
- CDN distribution via Netlify

## Troubleshooting

### Build Failures

1. Check that all environment variables are set correctly
2. Verify Node.js version (should be 18+)
3. Check for any TypeScript errors in the build logs

### Firebase Connection Issues

1. Verify Firebase configuration in environment variables
2. Check Firebase project settings and security rules
3. Ensure domains are authorized in Firebase Authentication

### Runtime Errors

1. Check browser console for JavaScript errors
2. Verify Firebase connection status
3. Check network connectivity for sync issues

## Support

For issues related to:
- **Deployment**: Check Netlify documentation
- **Firebase**: Check Firebase documentation
- **App functionality**: Check the application logs and error messages

## Data Migration

Users who have accounts on the StudyPartner web app can log in with the same credentials and their data will automatically sync to MotivaMate.