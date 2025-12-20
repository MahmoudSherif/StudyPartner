#!/bin/bash

# Deploy Firestore Rules Script
# This script will deploy the updated firestore.rules to your Firebase project

echo "🔥 Deploying Firestore Rules..."
echo ""
echo "Project: motivemate-6c846"
echo "Rules file: firestore.rules"
echo ""

# Check if logged in
if ! firebase projects:list > /dev/null 2>&1; then
    echo "❌ Not logged in to Firebase"
    echo "Please run: firebase login"
    echo ""
    read -p "Do you want to login now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        firebase login
    else
        echo "Please run 'firebase login' first, then run this script again"
        exit 1
    fi
fi

# Deploy rules
echo "📤 Deploying rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Hard refresh your browser (Ctrl+Shift+R)"
    echo "2. Clear cache if needed"
    echo "3. The permission errors should be resolved"
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Alternative: Deploy manually via Firebase Console"
    echo "1. Go to: https://console.firebase.google.com/project/motivemate-6c846/firestore/rules"
    echo "2. Copy the content from firestore.rules"
    echo "3. Click 'Publish'"
fi
