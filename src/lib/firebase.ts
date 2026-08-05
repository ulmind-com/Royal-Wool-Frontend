import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  inMemoryPersistence,
  type Auth,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "royal-wool.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "royal-wool",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "royal-wool.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// ── Lazy singletons — only created when running in the browser ──────────
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

function ensureApp(): FirebaseApp {
  if (!_app) {
    _app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return _app;
}

/**
 * Returns the Firebase Auth instance (browser-only).
 * Call this from event handlers / useEffect — never at module top-level.
 */
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const app = ensureApp();
    try {
      // Initialize Auth with graceful fallback for Incognito / restricted IndexedDB.
      // The resolver is not optional here: initializeAuth() skips the default one
      // that getAuth() installs, and without it signInWithPopup / signInWithRedirect
      // fail with auth/argument-error.
      _auth = initializeAuth(app, {
        persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch {
      // Fallback if auth instance already exists (e.g. HMR or fast refresh)
      _auth = getAuth(app);
    }
  }
  return _auth;
}

/**
 * Returns a GoogleAuthProvider singleton with prompt set to select_account.
 */
export function getGoogleProvider(): GoogleAuthProvider {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }
  return _googleProvider;
}
