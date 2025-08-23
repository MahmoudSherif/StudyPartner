# Production Setup Guide for MotivaMate

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `motivamate-production`
4. Enable Google Analytics (recommended)
5. Create project

### 2. Enable Authentication
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Enable Google authentication (optional but recommended)
4. Configure authorized domains for production

### 3. Setup Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Get Firebase Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Click the web app icon (`</>`)
4. Register your app with name: `MotivaMate Web`
5. Copy the Firebase configuration object

### 5. Environment Variables
Create `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Deployment Considerations

### Security
- Never commit `.env` file to git
- Use environment variables in production hosting
- Configure Firebase security rules properly
- Enable App Check for additional security (optional)

### Performance
- Enable offline persistence for better UX
- Set up proper caching strategies
- Monitor Firebase usage and costs

### Monitoring
- Enable Firebase Analytics
- Set up error tracking
- Monitor authentication metrics
- Track user engagement

## Testing
1. Test authentication flows thoroughly
2. Verify data sync functionality
3. Test offline capabilities
4. Ensure PWA features work correctly
5. Test on various devices and browsers

## Production Checklist
- [ ] Firebase project created and configured
- [ ] Authentication providers enabled
- [ ] Firestore security rules configured
- [ ] Environment variables set
- [ ] App tested with real Firebase backend
- [ ] PWA features verified
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security review completed