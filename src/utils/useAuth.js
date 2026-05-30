import { useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "./firebase";

function useAuth() {
  const signInWithCredentials = useCallback(async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      console.error("Sign in error:", err);
      throw err;
    }
  }, []);

  const signUpWithCredentials = useCallback(async ({ email, password, name }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (name) {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(user, { displayName: name });
      }
      return user;
    } catch (err) {
      console.error("Sign up error:", err);
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (err) {
      console.error("Google Sign in error:", err);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
      throw err;
    }
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook: useCallback(() => {}, []),
    signInWithTwitter: useCallback(() => {}, []),
    signInWithApple: useCallback(() => {}, []),
    signOut,
  };
}

export default useAuth;