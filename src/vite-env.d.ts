/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STUDYPARTNER_API_URL: string
  readonly VITE_STUDYPARTNER_API_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_DEBUG_SYNC: string
  readonly VITE_ENABLE_STUDYPARTNER_SYNC: string
  readonly VITE_ENABLE_OFFLINE_MODE: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}