#!/bin/bash

# Production Deployment Fix Script for MotivaMate
# This script addresses the production issues identified

echo "🚀 MotivaMate Production Deployment Fix"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project directory verified"

# Step 1: Build the project
echo "📦 Building project for production..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully"

# Step 2: Check for critical files
echo "🔍 Verifying critical files..."

if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: dist/index.html not found"
    exit 1
fi

if [ ! -f "dist/manifest.json" ]; then
    echo "❌ Error: dist/manifest.json not found"
    exit 1
fi

if [ ! -f "dist/sw.js" ]; then
    echo "❌ Error: dist/sw.js not found"
    exit 1
fi

echo "✅ All critical files present"

# Step 3: Show deployment instructions
echo ""
echo "🎯 DEPLOYMENT INSTRUCTIONS"
echo "=========================="
echo ""
echo "The build is ready! Here's what was fixed:"
echo ""
echo "1. ✅ CSP Policy Updated:"
echo "   - Added https://fonts.googleapis.com to connect-src"
echo "   - Added https://fonts.gstatic.com to connect-src"
echo ""
echo "2. ✅ Icon References Fixed:"
echo "   - apple-touch-icon now points to existing /icons/favicon.svg"
echo ""
echo "3. ✅ Production Build Generated:"
echo "   - All assets optimized and ready for deployment"
echo ""
echo "NEXT STEPS:"
echo "----------"
echo "1. Deploy the 'dist' folder to your hosting provider"
echo "2. Ensure environment variables are set:"
echo "   - VITE_FIREBASE_API_KEY"
echo "   - VITE_FIREBASE_AUTH_DOMAIN" 
echo "   - VITE_FIREBASE_PROJECT_ID"
echo "   - VITE_FIREBASE_STORAGE_BUCKET"
echo "   - VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "   - VITE_FIREBASE_APP_ID"
echo ""
echo "3. Update Firestore Security Rules in Firebase Console:"
echo "   - Go to Firestore Database > Rules"
echo "   - Use the rules from firestore.rules file"
echo ""
echo "🎉 Ready for deployment!"

echo ""
echo "📁 Build output: $(du -sh dist 2>/dev/null | cut -f1) in dist/ folder"
echo "📦 Main bundle: $(ls -lah dist/assets/*.js 2>/dev/null | tail -1 | awk '{print $5}')"
echo "🎨 CSS bundle: $(ls -lah dist/assets/*.css 2>/dev/null | tail -1 | awk '{print $5}')"
