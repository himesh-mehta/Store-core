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

let app;
let authInstance;

try {
  // If we have an API key or are running in the browser (where Vite injects them at build time), initialize Firebase
  if (firebaseConfig.apiKey || typeof window !== "undefined") {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// Fallback empty auth object to prevent undefined errors during SSR parsing/compilation
export const auth = authInstance || {};
export default auth;


