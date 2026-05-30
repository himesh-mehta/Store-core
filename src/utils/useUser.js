import * as React from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const useUser = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const syncRes = await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              image: firebaseUser.photoURL || ""
            })
          });
          if (syncRes.ok) {
            const syncedUser = await syncRes.json();
            setUser(syncedUser);
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              image: firebaseUser.photoURL || "",
              role: "user"
            });
          }
        } catch (err) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            image: firebaseUser.photoURL || "",
            role: "user"
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refetchUser = React.useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken(true);
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            image: firebaseUser.photoURL || ""
          })
        });
        if (syncRes.ok) {
          const syncedUser = await syncRes.json();
          setUser(syncedUser);
        }
      } catch (err) {}
    }
  }, []);

  return { user, data: user, loading, refetch: refetchUser };
};

export { useUser }
export default useUser;