/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Firebase web config — public by design; security comes from Firestore Rules. */
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** Imgur anonymous Client-ID for image uploads. */
  readonly VITE_IMGUR_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
