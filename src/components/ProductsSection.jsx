import React, { useEffect, useState } from "react";
import { fetchProducts } from "../firebase/firebase";
import ProductCard from "./ProductCard";
import "../styles/ProductsSection.css";

const ProductsSection = ({ searchTerm }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const productsData = await fetchProducts(); // Cargar productos desde Firebase
      setProducts(productsData);
    };

    getProducts();
  }, []);

  // Filtrar productos según el término de búsqueda (nombre en minúsculas)
  const filteredProducts = products.filter((product) =>
    product.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="products-section">
      <h2 className="products-title">Productos Recomendados</h2>

      <div className="products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="no-results">No se encontraron productos.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;





