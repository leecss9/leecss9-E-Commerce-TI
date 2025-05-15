import React, { useEffect, useState } from 'react';
import { useCart } from '../components/CartContext';
import PayPalButtonComponent from './PayPalButton';
import { db, doc, getDoc, updateDoc } from "../firebase/firebase";
import { useAuth } from "../components/AuthContext";
import "../styles/carrito.css";

const Carrito = () => {
  const { cartItems, updateQuantity, setCartItems, alertMessage } = useCart();
  const [productosStock, setProductosStock] = useState({});
  const { user } = useAuth();
  const clienteId = user?.uid;

  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const cargarCarrito = async () => {
      if (!clienteId) return;

      const carritoRef = doc(db, "carritodecompras", clienteId);
      const carritoDoc = await getDoc(carritoRef);

      if (carritoDoc.exists()) {
        const carritoData = carritoDoc.data().productos || [];
        setCartItems(carritoData);

        const productosIds = carritoData.map(producto => producto.id);
        const stockPromises = productosIds.map(id => getDoc(doc(db, 'productos', id)));

        const stockDocs = await Promise.all(stockPromises);
        const stockData = stockDocs.reduce((acc, doc, index) => {
          if (doc.exists()) {
            acc[productosIds[index]] = doc.data().cantidad || 0;
          }
          return acc;
        }, {});

        setProductosStock(stockData);
      }
    };

    cargarCarrito();
  }, [clienteId, setCartItems]);

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const stockDisponible = productosStock[id] || 0;
    if (nuevaCantidad > stockDisponible) {
      alert(`Solo hay ${stockDisponible} unidades disponibles de este producto.`);
      return;
    }

    const productosActualizados = cartItems.map(producto =>
      producto.id === id ? { ...producto, cantidad: nuevaCantidad } : producto
    );
    setCartItems(productosActualizados);

    const carritoRef = doc(db, "carritodecompras", clienteId);
    const carritoDoc = await getDoc(carritoRef);

    if (carritoDoc.exists()) {
      const carritoData = carritoDoc.data();
      const productosFirestore = carritoData.productos.map(p =>
        p.id === id ? { ...p, cantidad: nuevaCantidad } : p
      );
      await updateDoc(carritoRef, { productos: productosFirestore });
    }
  };

  const confirmarEliminar = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModal(true);
  };

  const eliminarProducto = async () => {
    const id = productoAEliminar.id;
    const cantidadDevuelta = productoAEliminar.cantidad;

    const nuevosItems = cartItems.filter(producto => producto.id !== id);
    setCartItems(nuevosItems);

    const carritoRef = doc(db, "carritodecompras", clienteId);
    const carritoDoc = await getDoc(carritoRef);

    if (carritoDoc.exists()) {
      const carritoData = carritoDoc.data();
      const productosActualizados = carritoData.productos.filter(p => p.id !== id);
      await updateDoc(carritoRef, { productos: productosActualizados });
    }

    // 🆕 Devolver cantidad al stock en Firestore
    const productoRef = doc(db, "productos", id);
    const productoDoc = await getDoc(productoRef);
    if (productoDoc.exists()) {
      const stockActual = productoDoc.data().cantidad || 0;
      await updateDoc(productoRef, {
        cantidad: stockActual + cantidadDevuelta
      });
    }

    setMostrarModal(false);
    setProductoAEliminar(null);
  };

  const tipoCambio = 18;
  const totalMXN = cartItems.reduce((acc, p) => {
    const precioEnMXN = p.precio * (p.precioUnidad === 'USD' ? tipoCambio : 1);
    const cantidad = parseInt(p.cantidad) || 0;
    return acc + precioEnMXN * cantidad;
  }, 0);

  const productosUnicos = [...new Map(cartItems.map(item => [item.id, item])).values()];

  return (
    <div className="carrito-container">
      <h1>Carrito de Compras</h1>

      {alertMessage && <div className="alert">{alertMessage}</div>}

      {productosUnicos.length === 0 ? (
        <p className="vacio">Tu carrito está vacío.</p>
      ) : (
        productosUnicos.map(producto => {
          const precioMXN = producto.precioUnidad === 'USD' ? producto.precio * tipoCambio : producto.precio;

          return (
            <div key={producto.id} className="producto">
              <img src={producto.imageUrl} alt={producto.nombre} />
              <div className="info">
                <h3>{producto.nombre}</h3>
                <p className="precio">${precioMXN} MXN</p>
                <p className="stock">Stock disponible: {productosStock[producto.id]}</p>
              </div>
              <div className="cantidad">
                <button
                  onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                  disabled={producto.cantidad <= 1}
                >-</button>
                <span>{producto.cantidad}</span>
                <button
                  onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                  disabled={producto.cantidad >= productosStock[producto.id]}
                >+</button>
              </div>
              <button className="btn-eliminar" onClick={() => confirmarEliminar(producto)}>🗑</button>
            </div>
          );
        })
      )}

      <hr />
      <div className="total">Total: ${totalMXN.toFixed(2)} MXN</div>

      {productosUnicos.length > 0 && <PayPalButtonComponent totalAmount={totalMXN} />}

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>¿Eliminar producto?</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>{productoAEliminar?.nombre}</strong> del carrito?</p>
            <div className="modal-buttons">
              <button onClick={eliminarProducto}>Sí, eliminar</button>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;

