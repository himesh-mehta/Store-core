import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Safe retrieval supporting both SSR (Node.js) and CSR (Vite)
const getEnvVal = (key) => {
  const nextPublicKey = key.startsWith("VITE_") ? key.replace("VITE_", "NEXT_PUBLIC_") : `NEXT_PUBLIC_${key}`;
  const viteKey = key.startsWith("NEXT_PUBLIC_") ? key.replace("NEXT_PUBLIC_", "VITE_") : `VITE_${key}`;
  
  if (typeof window !== "undefined") {
    return import.meta.env[key] || import.meta.env[nextPublicKey] || import.meta.env[viteKey];
  }
  return process.env[key] || process.env[nextPublicKey] || process.env[viteKey];
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
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// Create a dynamic proxy that delegates all property reads directly to the live authInstance if initialized,
// otherwise falling back to safe mock methods for SSR stability.
const authProxy = new Proxy({}, {
  get(target, prop) {
    if (authInstance) {
      const val = authInstance[prop];
      if (typeof val === 'function') {
        return val.bind(authInstance);
      }
      return val;
    }
    
    // Fallback safe implementations for compile/SSR boot phases
    if (prop === 'onAuthStateChanged') {
      return (cb) => () => {};
    }
    if (prop === 'currentUser') {
      return null;
    }
    if (prop === 'signInWithEmailAndPassword') {
      return async () => { throw new Error("Authentication not configured"); };
    }
    if (prop === 'createUserWithEmailAndPassword') {
      return async () => { throw new Error("Authentication not configured"); };
    }
    if (prop === 'signOut') {
      return async () => {};
    }
    return undefined;
  }
});

export const auth = authProxy;
export default auth;




