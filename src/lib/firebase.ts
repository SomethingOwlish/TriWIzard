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
/**
 * Public web config for the `triwizard-32a18` project. A Firebase web config is
 * NOT a secret — it ships in the client bundle to every visitor's browser by
 * design; the data is protected by Firestore Security Rules (see firestore.rules),
 * not by hiding these identifiers. Committing it lets the GitHub Pages build work
 * without provisioning Actions secrets. Set the matching `VITE_FIREBASE_*` env
 * vars (e.g. a `.env`) to point a local build at a different project.
 */
const FALLBACK_CONFIG = {
  apiKey: 'AIzaSyDjlGINOvCWSU9543wIggyTvmmYwkUW9dk',
  authDomain: 'triwizard-32a18.firebaseapp.com',
  projectId: 'triwizard-32a18',
  storageBucket: 'triwizard-32a18.firebasestorage.app',
  messagingSenderId: '941826852943',
  appId: '1:941826852943:web:d0549d067d4d375315823a',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
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
