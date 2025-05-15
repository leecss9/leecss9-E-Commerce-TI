import React, { useState } from 'react';
import '../styles/KitComponent.css';
import { useKit } from './KitContext';
import PayPalButtonComponent from './PayPalButton';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebase'; // Ajusta la ruta a tu configuración de Firebase

const placeholderImage = "https://via.placeholder.com/150?text=Sin+Imagen";

const getProductImage = (producto) =>
  producto?.imageUrl || producto?.imagen || placeholderImage;

const KitComponent = () => {
  const { kitItems, clearKit, removeFromKit } = useKit();
  const [mostrarPayPal, setMostrarPayPal] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const handleClearKit = () => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres vaciar el kit?");
    if (confirmacion) {
      clearKit();
    }
  };

  const calcularTotal = () => {
    return kitItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const confirmarEliminar = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModal(true);
  };

  // Función para actualizar la cantidad en Firestore
  const actualizarCantidadProductoEnFirebase = async (productoId, cantidadAAgregar) => {
    try {
      const productoRef = doc(db, 'productos', productoId);
      const productoSnap = await getDoc(productoRef);

      if (productoSnap.exists()) {
        const productoData = productoSnap.data();
        const nuevaCantidad = (productoData.cantidad || 0) + cantidadAAgregar;
        await updateDoc(productoRef, { cantidad: nuevaCantidad });
      } else {
        console.error("Producto no encontrado en Firebase");
      }
    } catch (error) {
      console.error("Error actualizando cantidad en Firebase:", error);
      throw error; // Propaga el error para manejarlo afuera
    }
  };

  // Maneja eliminar producto y actualizar Firebase
  const eliminarProducto = async () => {
    if (productoAEliminar) {
      try {
        // Actualiza la cantidad en Firebase sumando la cantidad que se elimina
        await actualizarCantidadProductoEnFirebase(productoAEliminar.id, productoAEliminar.cantidad);

        // Luego elimina el producto localmente del kit
        removeFromKit(productoAEliminar.id);
      } catch (error) {
        alert("Error al actualizar cantidad en el servidor. Intenta de nuevo.");
      }
      setProductoAEliminar(null);
      setMostrarModal(false);
    }
  };

  return (
    <div className="kit-container">
      <h2 className="kit-title">KIT ARDUINO</h2>

      {kitItems.length === 0 ? (
        <p className="no-items">Tu kit está vacío. Agrega productos desde la página de productos.</p>
      ) : (
        <div className="kit-items">
          {kitItems.map(producto => (
            <div className="kit-item" key={producto.id}>
              <img
                src={getProductImage(producto)}
                alt={producto.nombre}
                className="kit-item-image"
              />
              <div className="kit-item-info">
                <h4>{producto.nombre}</h4>
                <p className="kit-price">${producto.precio}</p>
                <p className="kit-quantity">Cantidad: {producto.cantidad}</p>
              </div>
              <button className="btn-eliminar" onClick={() => confirmarEliminar(producto)}>🗑</button>
            </div>
          ))}
        </div>
      )}

      {kitItems.length > 0 && (
        <div className="kit-actions">
          {mostrarPayPal ? (
            <div className="paypal-container">
              <PayPalButtonComponent
                totalAmount={calcularTotal()}
                onSuccess={() => {
                  clearKit();
                  setMostrarPayPal(false);
                }}
              />
              <button className="btn-cancel" onClick={() => setMostrarPayPal(false)}>Cancelar</button>
            </div>
          ) : (
            <button className="btn-buy" onClick={() => setMostrarPayPal(true)}>Comprar Ahora</button>
          )}
          <button className="btn-clear" onClick={handleClearKit}>Vaciar Kit</button>
        </div>
      )}

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>¿Eliminar producto?</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>{productoAEliminar?.nombre}</strong> del kit?</p>
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

export default KitComponent;





