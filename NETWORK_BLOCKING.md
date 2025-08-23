# Network Blocking Issues

## What is `ERR_BLOCKED_BY_CLIENT`?

The `ERR_BLOCKED_BY_CLIENT` error occurs when browser extensions (typically ad blockers) block network requests to Firebase/Google services. This is a common issue with privacy-focused browser extensions.

## Common Causes

1. **Ad Blockers** (uBlock Origin, Adblock Plus, etc.)
2. **Privacy Extensions** (Privacy Badger, DuckDuckGo Privacy Essentials)
3. **Tracking Protection** (built into browsers like Firefox)
4. **Corporate Firewalls** or Network Restrictions

## How MotivaMate Handles This

The app has been enhanced with:

- **Graceful Error Handling**: Failed requests are logged with user-friendly messages
- **Offline-First Approach**: Data is saved locally when cloud sync fails
- **User Notifications**: Clear warnings when blocking is detected
- **Fallback Mechanisms**: App continues to function even when Firebase is blocked

## Solutions for Users

### Option 1: Whitelist the Site (Recommended)
1. Click your ad blocker icon in the browser toolbar
2. Select "Disable on this site" or "Trust site"
3. Refresh the page

### Option 2: Allow Firebase Domains
Add these domains to your ad blocker's allowlist:
- `*.googleapis.com`
- `*.firebaseapp.com`
- `*.firestore.googleapis.com`

### Option 3: Use Offline Mode
- The app works offline with local data storage
- Your data will sync when network access is restored

## Technical Details

The blocked requests typically include:
- Firestore database operations (`/google.firestore.v1.Firestore/Listen`)
- Authentication requests
- Real-time data synchronization

## For Developers

The enhanced error handling includes:
- Detection of blocking patterns in error messages
- Graceful degradation to local storage
- User-friendly error reporting
- Toast notifications for blocked requests

This ensures the app remains functional even when external services are blocked.
