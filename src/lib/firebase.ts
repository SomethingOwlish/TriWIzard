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

/**
 * True only when the web config is actually present. A credential-less build
 * (CI without secrets, a fresh clone) must still compile and render, so the
 * auth/role guards check this and show an in-world "the hall is sealed" notice
 * instead of letting the SDK throw at call time. Fill `.env` to open the hall.
 */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

/** Google sign-in provider (Email/Password uses the auth instance directly). */
export const googleProvider = new GoogleAuthProvider();
