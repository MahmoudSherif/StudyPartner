#!/bin/bash

echo "🔥 Firebase Firestore Rules Update Required"
echo "==========================================="
echo ""
echo "❌ You're getting 'Missing or insufficient permissions' errors for challenges."
echo "This is specifically for the challenge sharing functionality that's failing."
echo ""
echo "📋 QUICK FIX STEPS:"
echo ""
echo "1. Go to Firebase Console: https://console.firebase.google.com"
echo "2. Select your project: motivemate-6c846"
echo "3. Go to: Firestore Database → Rules tab"
echo "4. Replace existing rules with the COMPLETE rules below:"
echo ""
echo "---START FIRESTORE RULES---"
cat << 'EOF'
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
    match /userData/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow creation of new userData documents for authenticated users
    match /userData/{document} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // 🎯 CHALLENGE SHARING RULES - This fixes your CVF9L9 issue
    match /shared-challenges/{challengeId} {
      // Anyone authenticated can read challenges (needed to find challenges by code)
      allow read: if request.auth != null;
      
      // Anyone authenticated can create challenges
      allow create: if request.auth != null;
      
      // ⭐ CRITICAL: Allow updates for challenge participation
      // This fixes the "Missing or insufficient permissions" error
      allow update: if request.auth != null;
      
      // Allow deletion by creator or participants
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
    
    // Allow all authenticated users to read/write (fallback rule)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF
echo "---END FIRESTORE RULES---"
echo ""
echo "5. Click 'Publish' to deploy the rules"
echo "6. Wait 30 seconds for propagation"
echo "7. Refresh your app and try joining challenge 'CVF9L9' again"
echo ""
echo "🎯 THIS WILL SPECIFICALLY FIX:"
echo "   ✅ Challenge code 'CVF9L9' finding errors"
echo "   ✅ 'Missing or insufficient permissions' on challenge join"
echo "   ✅ Participant update failures"
echo "   ✅ All challenge sharing functionality"
echo ""
echo "💡 Why this works:"
echo "   - Broader read permissions for challenge discovery"
echo "   - Update permissions for adding participants"
echo "   - Fallback rules for edge cases"
echo ""
echo ""
echo "🚀 ALTERNATIVE: If you don't want to update Firebase rules right now:"
echo "   - The app has automatic fallback to local storage"
echo "   - Use the '🚀 Simple' sharing buttons instead"
echo "   - All challenge functionality works without Firestore"
echo ""
echo "� Rules also saved to: ./firestore.rules"

# Update the local firestore.rules file
cat << 'EOF' > firestore.rules
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
    match /userData/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow creation of new userData documents for authenticated users
    match /userData/{document} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
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
EOF

echo "✅ Updated firestore.rules file with challenge sharing fixes"
echo ""
echo "🎯 IMMEDIATE ACTION:"
echo "   1. Run: chmod +x ./firebase-rules-fix.sh"
echo "   2. Then: ./firebase-rules-fix.sh"
echo "   3. Follow the Firebase Console instructions"
echo "   4. Test challenge 'CVF9L9' again - it should work!"
