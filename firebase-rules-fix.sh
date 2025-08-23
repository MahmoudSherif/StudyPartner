#!/bin/bash

echo "🔥 Firebase Firestore Rules Checker"
echo "===================================="
echo ""
echo "You're getting 'Missing or insufficient permissions' errors."
echo "This means the Firestore security rules need to be updated in Firebase Console."
echo ""
echo "📋 REQUIRED STEPS:"
echo ""
echo "1. Go to Firebase Console: https://console.firebase.google.com"
echo "2. Select your project: motivemate-6c846"
echo "3. Go to: Firestore Database → Rules tab"
echo "4. Replace existing rules with:"
echo ""
echo "---START RULES---"
cat << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own data
    // Documents are stored as userId_dataType (e.g., "user123_focusSessions")
    match /userData/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow creation of new userData documents for authenticated users
    match /userData/{document} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
EOF
echo "---END RULES---"
echo ""
echo "5. Click 'Publish' to deploy the rules"
echo "6. Refresh your app to test"
echo ""
echo "💡 Why this is needed:"
echo "   - Your app stores data in 'userData' collection"
echo "   - Document IDs are like: userId_dataType"
echo "   - Each doc has 'userId' field for security"
echo "   - Rules must allow access based on userId match"
echo ""
echo "🔍 You can copy the rules from: ./firestore.rules"
echo ""

if [ -f "firestore.rules" ]; then
    echo "✅ Firestore rules file exists locally"
else
    echo "❌ Firestore rules file missing - creating it now..."
    cat << 'EOF' > firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own data
    // Documents are stored as userId_dataType (e.g., "user123_focusSessions")
    match /userData/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow creation of new userData documents for authenticated users
    match /userData/{document} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
EOF
    echo "✅ Created firestore.rules file"
fi

echo ""
echo "🚀 After updating the rules, your app should work without permission errors!"
