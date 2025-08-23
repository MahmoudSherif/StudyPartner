#!/bin/bash

# MotivaMate Deployment Verification Script
# This script checks if the app is ready for deployment

echo "🚀 MotivaMate Deployment Verification"
echo "=================================="

# Check if required files exist
echo "📁 Checking required files..."

echo "Checking netlify.toml..."
if [ -f "netlify.toml" ]; then
  echo "✅ netlify.toml exists"
else
  echo "❌ netlify.toml is missing"
  exit 1
fi

echo "Checking public/_redirects..."
if [ -f "public/_redirects" ]; then
  echo "✅ public/_redirects exists"
else
  echo "❌ public/_redirects is missing"
  exit 1
fi

echo "Checking .env..."
if [ -f ".env" ]; then
  echo "✅ .env exists"
else
  echo "❌ .env is missing"
  exit 1
fi

echo "Checking src/lib/firebase.ts..."
if [ -f "src/lib/firebase.ts" ]; then
  echo "✅ src/lib/firebase.ts exists"
else
  echo "❌ src/lib/firebase.ts is missing"
  exit 1
fi

echo "Checking src/contexts/AuthContext.tsx..."
if [ -f "src/contexts/AuthContext.tsx" ]; then
  echo "✅ src/contexts/AuthContext.tsx exists"
else
  echo "❌ src/contexts/AuthContext.tsx is missing"
  exit 1
fi

echo "Checking src/hooks/useFirebaseSync.ts..."
if [ -f "src/hooks/useFirebaseSync.ts" ]; then
  echo "✅ src/hooks/useFirebaseSync.ts exists"
else
  echo "❌ src/hooks/useFirebaseSync.ts is missing"
  exit 1
fi

# Check environment variables
echo ""
echo "🔧 Checking environment variables..."

if [ -f ".env" ]; then
  if grep -q "VITE_FIREBASE_API_KEY=" .env; then
    echo "✅ Firebase API Key configured"
  else
    echo "❌ Firebase API Key not configured"
    exit 1
  fi
  
  if grep -q "VITE_FIREBASE_PROJECT_ID=" .env; then
    echo "✅ Firebase Project ID configured"
  else
    echo "❌ Firebase Project ID not configured"
    exit 1
  fi
else
  echo "❌ .env file not found"
  exit 1
fi

# Check if Firebase package is installed
echo ""
echo "📦 Checking dependencies..."

if grep -q '"firebase"' package.json; then
  echo "✅ Firebase package is installed"
else
  echo "❌ Firebase package not found in package.json"
  exit 1
fi

# Check build configuration
echo ""
echo "🏗️ Checking build configuration..."

if grep -q '"build":' package.json; then
  echo "✅ Build script configured"
else
  echo "❌ Build script not found"
  exit 1
fi

echo ""
echo "🎉 All checks passed! Ready for deployment to Netlify."
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub/GitLab/Bitbucket"
echo "2. Connect repository to Netlify"
echo "3. Set environment variables in Netlify dashboard"
echo "4. Deploy!"
echo ""
echo "📖 See NETLIFY_DEPLOYMENT.md for detailed instructions."