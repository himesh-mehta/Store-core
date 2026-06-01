import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Safe retrieval supporting both SSR (Node.js) and CSR (Vite)
const getEnvVal = (key) => {
  if (typeof window !== "undefined") {
    return import.meta.env[key];
  }
  return process.env[key];
};

const firebaseConfig = {
  apiKey: getEnvVal("VITE_FIREBASE_API_KEY"),
  authDomain: getEnvVal("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVal("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVal("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVal("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVal("VITE_FIREBASE_APP_ID"),
};

// Initialize Firebase only if we have a valid configuration to avoid startup crashes in SSR
let app;
let auth;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (e) {
  console.error("Firebase initialization failed during startup:", e);
}

export { auth };
export default auth;

