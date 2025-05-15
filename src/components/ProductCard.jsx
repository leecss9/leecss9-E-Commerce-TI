import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { useKit } from "../components/KitContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // importa tu instancia de Firestore
import "../styles/ProductCard.css";

const placeholderImage = "https://via.placeholder.com/150?text=Sin+Imagen";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToKit } = useKit();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(product.cantidad || 0); // stock local

  if (!product) return null;

  // Cargar stock actualizado desde Firestore cuando se monta el componente o cambia el producto
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const docRef = doc(db, "productos", product.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStock(data.cantidad ?? 0);
          setQuantity((q) => Math.min(q, data.cantidad ?? 0));
        } else {
          setStock(0);
        }
      } catch (error) {
        console.error("Error leyendo stock de producto:", error);
      }
    };

    fetchStock();
  }, [product.id]);

  const updateStockInFirestore = async (newStock) => {
    try {
      const docRef = doc(db, "productos", product.id);
      await updateDoc(docRef, { cantidad: newStock });
      console.log(`Stock actualizado: ${newStock}`);
    } catch (error) {
      console.error("Error actualizando stock:", error);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (window.confirm(`¿Agregar ${quantity} "${product.nombre}" al carrito?`)) {
      addToCart({ ...product, cantidad: quantity });
      const newStock = stock - quantity;
      setStock(newStock);
      await updateStockInFirestore(newStock);
    }
  };

  const handleAddToKit = async (e) => {
    e.stopPropagation();
    if (window.confirm(`¿Agregar ${quantity} "${product.nombre}" al kit?`)) {
      addToKit(product, quantity);
      const newStock = stock - quantity;
      setStock(newStock);
      await updateStockInFirestore(newStock);
    }
  };

  const decreaseQuantity = (e) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = (e) => {
    e.stopPropagation();
    setQuantity((prev) => (prev < stock ? prev + 1 : prev));
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <img
        src={product.imageUrl || product.imagen || placeholderImage}
        alt={product.nombre || "Producto sin nombre"}
        className="product-image"
      />
      <h3 className="product-name">{product.nombre || "Producto sin nombre"}</h3>
      <p className="product-price">
        ${new Intl.NumberFormat("es-MX").format(product.precio ?? 0)}
      </p>

      <div className="quantity-control">
        <span className="label">Cantidad {stock}</span>
        <div className="quantity-selector">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            title={quantity <= 1 ? "Cantidad mínima" : "Disminuir cantidad"}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={increaseQuantity}
            disabled={quantity >= stock}
            title={quantity >= stock ? "Stock máximo alcanzado" : "Aumentar cantidad"}
          >
            +
          </button>
        </div>
      </div>

      <div className="product-buttons">
        <button className="kit-button" onClick={handleAddToKit}>
          KIT
        </button>
        <button className="cart-button" onClick={handleAddToCart}>
          Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
