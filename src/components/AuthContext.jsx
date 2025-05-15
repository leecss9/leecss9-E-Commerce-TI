// src/components/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("cliente");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            try {
              const userRef = doc(db, "users", firebaseUser.uid);
              const userDoc = await getDoc(userRef);

              if (userDoc.exists()) {
                const data = userDoc.data();
                setUserRole(data.role || "cliente");
                setUserName(
                  data.username ||
                  data.displayName ||
                  data.nombre ||
                  firebaseUser.displayName ||
                  ""
                );
              } else {
                setUserRole("cliente");
                setUserName(firebaseUser.displayName || "");
              }
            } catch (error) {
              console.error("Error al obtener datos de Firestore:", error);
              setUserRole("cliente");
              setUserName(firebaseUser?.displayName || "");
            }
          } else {
            setUserRole("cliente");
            setUserName("");
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error al establecer persistencia de sesión:", error);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, userName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
