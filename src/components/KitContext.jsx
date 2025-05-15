import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const KitContext = createContext();

export const useKit = () => useContext(KitContext);

export const KitProvider = ({ children }) => {
  const [kitItems, setKitItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  const auth = getAuth();

  const clearAlert = () => setTimeout(() => setAlertMessage(""), 3000);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadKitItems(user.uid);
      } else {
        setUserId(null);
        setKitItems([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const getKitRef = (uid) => {
    if (!uid) return null;
    return doc(db, "kits", uid);
  };

  const loadKitItems = async (uid) => {
    const kitRef = getKitRef(uid);
    if (!kitRef) return;

    try {
      const snapshot = await getDoc(kitRef);
      if (snapshot.exists()) {
        setKitItems(snapshot.data().productos || []);
        console.log("Kit cargado desde Firebase:", snapshot.data().productos);
      } else {
        setKitItems([]);
      }
    } catch (error) {
      console.error("Error al cargar el kit desde Firestore:", error);
    }
  };

  const saveKit = async (productos) => {
    if (!userId) return;

    const kitRef = getKitRef(userId);
    if (!kitRef) return;

    try {
      await setDoc(
        kitRef,
        {
          userId,
          productos,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setKitItems(productos);
    } catch (error) {
      console.error("Error al guardar el kit en Firebase:", error);
    }
  };

  const addToKit = async (product, cantidad = 1) => {
    if (!userId) {
      setAlertMessage("Debes iniciar sesión para agregar productos al kit.");
      clearAlert();
      return;
    }

    try {
      let productos = [...kitItems];
      const productWithImage = {
        ...product,
        imagen: product.imageUrl || product.imagen || "",
      };

      const index = productos.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        productos[index].cantidad += cantidad;
      } else {
        productos.push({ ...productWithImage, cantidad });
      }

      await saveKit(productos);
      setAlertMessage(`"${product.nombre}" agregado al kit.`);
    } catch (error) {
      console.error("Error al agregar producto al kit:", error);
      setAlertMessage("Error al agregar producto al kit.");
    } finally {
      clearAlert();
    }
  };

  // Función para eliminar y devolver stock a Firestore
  const removeFromKitAndReturnStock = async (productId) => {
    if (!userId) return;

    try {
      // Buscar producto en kitItems
      const producto = kitItems.find((p) => p.id === productId);
      if (!producto) return;

      // Referencia al producto en Firestore
      const productoRef = doc(db, "productos", productId);

      // Leer producto actual en Firestore
      const productoSnap = await getDoc(productoRef);
      if (!productoSnap.exists()) {
        throw new Error("Producto no encontrado en la base de datos.");
      }

      const productoData = productoSnap.data();

      // Sumar la cantidad que se elimina del kit al stock en Firestore
      const nuevaCantidad = (productoData.cantidad || 0) + producto.cantidad;

      // Actualizar stock en Firestore
      await updateDoc(productoRef, { cantidad: nuevaCantidad });

      // Eliminar producto del kit local
      const nuevosProductos = kitItems.filter((p) => p.id !== productId);
      await saveKit(nuevosProductos);

      setAlertMessage(`Se eliminó "${producto.nombre}" y se actualizó el stock.`);
      clearAlert();
    } catch (error) {
      console.error("Error al eliminar producto y actualizar stock:", error);
      setAlertMessage("Error al eliminar producto y actualizar stock.");
      clearAlert();
    }
  };

  const removeFromKit = async (productId) => {
    if (!userId) return;

    try {
      const productos = kitItems.filter((p) => p.id !== productId);
      await saveKit(productos);
      setAlertMessage("Producto eliminado del kit.");
      clearAlert();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const updateItemQuantity = async (productId, newQuantity) => {
    if (!userId) return;

    try {
      let productos = [...kitItems];
      const index = productos.findIndex((p) => p.id === productId);
      if (index === -1) return;

      if (newQuantity <= 0) {
        productos.splice(index, 1);
      } else {
        productos[index].cantidad = newQuantity;
      }

      await saveKit(productos);
      setAlertMessage("Cantidad actualizada.");
      clearAlert();
    } catch (error) {
      console.error("Error al actualizar cantidad del producto:", error);
    }
  };

  const clearKit = async () => {
    if (!userId) return;

    try {
      const kitRef = getKitRef(userId);
      if (!kitRef) return;

      await deleteDoc(kitRef);
      setKitItems([]);
      setAlertMessage("Kit vaciado correctamente.");
      clearAlert();
    } catch (error) {
      console.error("Error al vaciar el kit:", error);
    }
  };

  return (
    <KitContext.Provider
      value={{
        kitItems,
        userId,
        alertMessage,
        addToKit,
        removeFromKit,
        removeFromKitAndReturnStock, // <-- aquí la expongo
        updateItemQuantity,
        clearKit,
        loadKitItems,
      }}
    >
      {children}
    </KitContext.Provider>
  );
};





