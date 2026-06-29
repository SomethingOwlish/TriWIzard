import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

/**
 * Firebase initialisation — the single client for both cabinets.
 *
 * Free-tier rules (Spark): NO Cloud Functions / Admin SDK. All authorization
 * lives in Firestore Security Rules + client guards. The web config below is
 * public by design; secrecy is not what protects the data.
 *
 * Config is read from Vite env vars (see `.env` / `.env.example`).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

/** Google sign-in provider (Email/Password uses the auth instance directly). */
export const googleProvider = new GoogleAuthProvider();
