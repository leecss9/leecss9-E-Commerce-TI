import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [clienteId, setClienteId] = useState(null); // Asegúrate de establecer el clienteId en algún lugar de la app

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingProduct = prevItems.find(item => item.id === product.id);

      if (existingProduct) {
        // Si ya existe, actualizar cantidad
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si es nuevo, agregarlo con cantidad 1 (si no viene con cantidad)
        return [...prevItems, { ...product, cantidad: product.cantidad || 1 }];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prevItems => 
      prevItems.map(item =>
        item.id === productId ? { ...item, cantidad: quantity } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, clienteId, setClienteId }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
