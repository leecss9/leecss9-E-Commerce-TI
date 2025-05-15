import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Categories from "./Categories";
import Banner from "./Banner";
import ProductsSection from "./ProductsSection";
import Footer from "./Footer";

function Tienda() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null); // Estado para almacenar la categoría seleccionada

  // Función que se pasa al componente Categories
  const handleCategorySelect = (category) => {
    console.log("Categoría seleccionada:", category);
    setSelectedCategory(category); // Actualizamos el estado con la categoría seleccionada
  };

  return (
    <>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Categories onCategorySelect={handleCategorySelect} /> {/* Pasamos la función al componente Categories */}
      <Banner />
      <ProductsSection searchTerm={searchTerm} selectedCategory={selectedCategory} /> {/* Pasamos la categoría seleccionada */}
      <Footer onCategorySelect={handleCategorySelect} />
    </>
  );
}

export default Tienda;

