import { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase/firebase";
import Categories from "./Categories";
import ProductCard from "./ProductCard";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "productos");
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        nombre: doc.data().nombre,
        categoria: doc.data().categoria,
        descripcion: doc.data().descripcion,
        imagen: doc.data().imagen,
        precio: doc.data().precio,
        cantidad: doc.data().cantidad,
      }));
      setProducts(productsList);
    };

    fetchProducts();
  }, []);

  // Esta función es la que se pasa a Categories
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoria === selectedCategory)
    : products;

  return (
    <div>
      {/* Pasa la función handleCategorySelect como prop */}
      <Categories onCategorySelect={handleCategorySelect} />
      <div className="product-list">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Catalog;


