import React, { useEffect, useState } from "react";
import { fetchProducts } from "../firebase/firebase";
import ProductCard from "./ProductCard";
import "../styles/ProductsSection.css";

// Función para normalizar texto (elimina acentos y convierte a minúsculas)
const normalizeText = (text) =>
  text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";

// Función para mezclar aleatoriamente un arreglo (Fisher-Yates)
const shuffleArray = (array) => {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const ProductsSection = ({ searchTerm, selectedCategory }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const productsData = await fetchProducts(); // Cargar productos desde Firebase
      const shuffled = shuffleArray(productsData); // Mezclamos los productos al cargarlos
      setProducts(shuffled);
    };

    getProducts();
  }, []);

  // Filtrar productos según el término de búsqueda y la categoría seleccionada
  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm = normalizeText(product.nombre).includes(normalizeText(searchTerm));
    const matchesCategory = selectedCategory
      ? normalizeText(product.categoria) === normalizeText(selectedCategory)
      : true;
    return matchesSearchTerm && matchesCategory;
  });

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
