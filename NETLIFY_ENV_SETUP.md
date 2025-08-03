# Netlify Environment Variables Setup Guide

## 🔧 Setting Up Firebase Environment Variables in Netlify

To properly secure your Firebase configuration, follow these steps to add environment variables to your Netlify deployment:

### 1. Access Netlify Dashboard
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site (StudyPartner)
3. Navigate to **Site settings** → **Environment variables**

### 2. Add Firebase Environment Variables

Click "Add a variable" and add each of the following:

| Variable Name | Value |
|--------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyA5NwasV9Zq0nD7m1hTIHyBYT1-HvqousU` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `motivemate-6c846.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `motivemate-6c846` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `motivemate-6c846.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1009214726351` |
| `VITE_FIREBASE_APP_ID` | `1:1009214726351:web:20b0c745c8222feb5557ba` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-360M7L231L` |

### 3. Trigger a New Deploy
After adding all variables:
1. Go to the **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

### 4. Local Development Setup

For local development, create a `.env` file in your project root:

```bash
# .env
VITE_FIREBASE_API_KEY=AIzaSyA5NwasV9Zq0nD7m1hTIHyBYT1-HvqousU
VITE_FIREBASE_AUTH_DOMAIN=motivemate-6c846.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=motivemate-6c846
VITE_FIREBASE_STORAGE_BUCKET=motivemate-6c846.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1009214726351
VITE_FIREBASE_APP_ID=1:1009214726351:web:20b0c745c8222feb5557ba
VITE_FIREBASE_MEASUREMENT_ID=G-360M7L231L
```

**Note:** The `.env` file is already in `.gitignore` so it won't be committed to your repository.

## 🔒 Security Note

The current implementation has fallback values to prevent the site from breaking, but for production security:
1. Add the environment variables to Netlify as described above
2. Once confirmed working, remove the fallback values from `src/config/firebase.ts`

## ✅ Temporary Fix Applied

We've updated the Firebase configuration to use environment variables with fallback values, so your site should work immediately without the error. However, please add the environment variables to Netlify for better security. 