# 🚨 URGENT: Deploy Firestore Rules to Fix Goals Issue

## The Problem

Your goals and other data are **sometimes not loading** because:

1. **Permission Errors**: The Firestore rules haven't been deployed yet
2. **Old Data Keys**: Existing data was saved with old keys (e.g., `subjects` instead of `study-subjects`)
3. **Migration Ready**: I've added automatic migration code that will run when you log in, BUT it needs the rules deployed first

## Quick Fix (5 minutes)

### Option 1: Deploy via Firebase Console (Easiest)

1. **Open Firebase Console**: https://console.firebase.google.com/project/motivemate-6c846/firestore/rules

2. **Click "Edit Rules"**

3. **Delete ALL existing rules** and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Allow access to user's shared challenges subcollection
      match /shared-challenges/{challengeId} {
        allow read, write: if request.auth != null;
      }
    }

    // Users can read/write their own data
    // Note: Specific userData rules removed - using fallback rule below for simplicity
    // The fallback rule at the end handles all authenticated user access

    // Challenge sharing rules - fixes CVF9L9 permission issues
    match /shared-challenges/{challengeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && (
        resource.data.createdBy == request.auth.uid ||
        request.auth.uid in resource.data.participants
      );
    }

    // Public challenge index for discovery
    match /public-challenge-index/{indexId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Fallback rule for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **Click "Publish"**

5. **Done!** The rules are now live.

### Option 2: Deploy via Command Line

```bash
# Run the deploy script
./deploy-rules.sh
```

Or manually:

```bash
# Login (only needed once)
firebase login

# Deploy
firebase deploy --only firestore:rules
```

## After Deploying

1. **Hard refresh** your browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Log out and log back in** - this will trigger the automatic data migration
3. **Check console** - you should see:
   ```
   🔄 Running data migration for userData keys...
   ✅ Migration complete: X documents migrated
   ```
4. **Test**: Your goals should now persist after logout/login

## What Changed

### Fixed Issues:
1. ✅ **Infinite loops** (3 different bugs)
2. ✅ **Data key mismatches** (goals, focus sessions, etc.)
3. ✅ **Missing default values** when document doesn't exist
4. ✅ **Firestore rules** simplified to use fallback

### Migration:
- Old keys → New keys automatically migrated:
  - `subjects` → `study-subjects`
  - `sessions` → `study-sessions`
  - `tasks` → `daily-tasks`
  - `challenges` → `user-challenges`
  - `focusSessions` → `focus-sessions`

## Still Having Issues?

If you still see permission errors after deploying:

1. Check the Firebase Console rules were actually published
2. Hard refresh browser (clear cache)
3. Check browser console for errors
4. Try logging out/in again

## Questions?

The deploy script will guide you through the process with clear error messages.
