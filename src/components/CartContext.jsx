import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [clienteId, setClienteId] = useState(null);

  const clearAlert = () => setTimeout(() => setAlertMessage(''), 3000);

  useEffect(() => {
    const loadCart = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const uid = user.uid;
      setClienteId(uid);

      try {
        const carritoRef = doc(db, 'carritodecompras', uid);
        const carritoDoc = await getDoc(carritoRef);

        if (carritoDoc.exists()) {
          setCartItems(carritoDoc.data().productos || []);
        }
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
      }
    };

    loadCart();
  }, []);

  const syncCartWithFirestore = async (productosFinal) => {
    try {
      const carritoRef = doc(db, 'carritodecompras', clienteId);
      await updateDoc(carritoRef, { productos: productosFinal });
    } catch (error) {
      console.error('Error sincronizando carrito en Firestore:', error);
    }
  };

  const addToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      setAlertMessage('Debes iniciar sesión para agregar productos.');
      clearAlert();
      return;
    }

    if (!clienteId) setClienteId(user.uid);

    try {
      const productRef = doc(db, 'productos', product.id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        setAlertMessage('Producto no encontrado.');
        clearAlert();
        return;
      }

      const stockDisponible = productDoc.data().cantidad || 0;
      const itemEnCarrito = cartItems.find(item => item.id === product.id);
      const cantidadEnCarrito = itemEnCarrito?.cantidad || 0;
      const cantidadSolicitada = product.cantidad || 1;

      if (cantidadEnCarrito + cantidadSolicitada > stockDisponible) {
        setAlertMessage(`Solo puedes agregar hasta ${stockDisponible} unidades de "${product.nombre}".`);
        clearAlert();
        return;
      }

      const nuevoCarrito = itemEnCarrito
        ? cartItems.map(item =>
            item.id === product.id
              ? { ...item, cantidad: item.cantidad + cantidadSolicitada }
              : item
          )
        : [...cartItems, { ...product, cantidad: cantidadSolicitada }];

      setCartItems(nuevoCarrito);

      const carritoRef = doc(db, 'carritodecompras', user.uid);
      await setDoc(carritoRef, { clienteId: user.uid, productos: nuevoCarrito }, { merge: true });

      setAlertMessage(`"${product.nombre}" agregado al carrito.`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      setAlertMessage('Error al agregar al carrito.');
    } finally {
      clearAlert();
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (!clienteId) return;

    const item = cartItems.find(p => p.id === id);
    if (!item) return;

    if (newQuantity < 1) {
      if (!window.confirm('¿Eliminar este producto del carrito?')) return;

      const nuevoCarrito = cartItems.filter(p => p.id !== id);
      setCartItems(nuevoCarrito);
      await syncCartWithFirestore(nuevoCarrito);

      // Devolver la cantidad eliminada al inventario
      try {
        const productRef = doc(db, 'productos', id);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const cantidadActual = productDoc.data().cantidad || 0;
          const nuevaCantidad = cantidadActual + item.cantidad;

          await updateDoc(productRef, {
            cantidad: nuevaCantidad
          });
        }
      } catch (error) {
        console.error('Error al devolver stock:', error);
      }

      setAlertMessage('Producto eliminado y cantidad devuelta al inventario.');
      clearAlert();
      return;
    }

    try {
      const productRef = doc(db, 'productos', id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        setAlertMessage('Producto no encontrado.');
        clearAlert();
        return;
      }

      const stockDisponible = productDoc.data().cantidad || 0;

      if (newQuantity > stockDisponible) {
        setAlertMessage(`Solo hay ${stockDisponible} unidades disponibles.`);
        clearAlert();
        return;
      }

      const nuevoCarrito = cartItems.map(p =>
        p.id === id ? { ...p, cantidad: newQuantity } : p
      );

      setCartItems(nuevoCarrito);
      await syncCartWithFirestore(nuevoCarrito);

      setAlertMessage('Cantidad actualizada.');
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setAlertMessage('Error al actualizar la cantidad.');
    } finally {
      clearAlert();
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      clienteId,
      setCartItems,
      alertMessage
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
