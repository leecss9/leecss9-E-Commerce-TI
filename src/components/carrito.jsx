import React, { useEffect } from 'react';
import { useCart } from '../components/CartContext'; // Usar el contexto
import PayPalButtonComponent from './PayPalButton';
import { db, collection, addDoc, updateDoc, doc, getDoc } from "../firebase/firebase"; // Importar Firestore
import "../styles/carrito.css";

const Carrito = () => {
  const { cartItems, updateQuantity, clienteId } = useCart(); // Usar el contexto

  useEffect(() => {
    const cargarCarrito = async () => {
      const carritoRef = doc(db, "carritodecompras", clienteId);
      const carritoDoc = await getDoc(carritoRef);
      if (carritoDoc.exists()) {
        setCartItems(carritoDoc.data().productos); // Aquí deberías usar setCartItems del contexto
      }
    };
    if (clienteId) cargarCarrito();
  }, [clienteId]);

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    // Actualizar en el estado local utilizando el contexto
    updateQuantity(id, nuevaCantidad);

    // Actualizar Firestore
    const carritoRef = doc(db, "carritodecompras", clienteId);
    const carritoDoc = await getDoc(carritoRef);

    if (carritoDoc.exists()) {
      const carritoData = carritoDoc.data();
      const productosActualizados = carritoData.productos.map(p =>
        p.id === id ? { ...p, cantidad: nuevaCantidad } : p
      );
      await updateDoc(carritoRef, { productos: productosActualizados });
    } else {
      await addDoc(collection(db, "carritodecompras"), {
        clienteId,
        productos: cartItems,
      });
    }
  };

  const total = cartItems.reduce((acc, p) => {
    const precio = parseFloat(p.precio) || 0;
    const cantidad = parseInt(p.cantidad) || 0;
    return acc + precio * cantidad;
  }, 0);

  return (
    <div className="carrito-container">
      <h1>Carrito de Compras</h1>

      {cartItems.length === 0 ? (
        <p className="vacio">Tu carrito está vacío.</p>
      ) : (
        cartItems.map(producto => (
          <div key={producto.id} className="producto">
            <img src={producto.imagen} alt={producto.nombre} />
            <div className="info">
              <h3>{producto.nombre}</h3>
              <p className="precio">${producto.precio}</p>
            </div>
            <div className="cantidad">
              <button onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}>-</button>
              <span>{producto.cantidad}</span>
              <button onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}>+</button>
            </div>
          </div>
        ))
      )}

      <hr />
      <div className="total">Total: ${total.toFixed(2)}</div>

      {cartItems.length > 0 && <PayPalButtonComponent totalAmount={total} />}
    </div>
  );
};

export default Carrito;


