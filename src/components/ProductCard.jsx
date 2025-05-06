import React from "react";
import "../styles/ProductCard.css";
import { useCart } from "../components/CartContext"; // 👈 importar el hook del carrito

const ProductCard = ({ product }) => {
  const { addToCart } = useCart(); // 👈 acceder a la función para agregar

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="product-card">
      <img
        src={product.imagen}
        alt={product.nombre}
        className="product-image"
      />
      <h3 className="product-name">{product.nombre}</h3>
      <p className="product-quantity">Cantidad: <strong>{product.cantidad}</strong></p>
      <p className="product-price">${product.precio}</p>
      <div className="product-buttons">
        <button className="kit-button">KIT</button>
        <button className="cart-button" onClick={handleAddToCart}>
          Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;



