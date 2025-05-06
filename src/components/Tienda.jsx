import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Categories from "./Categories";
import Banner from "./Banner";
import ProductsSection from "./ProductsSection";
import Footer from "./Footer";

function Tienda() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Categories />
      <Banner />
      <ProductsSection searchTerm={searchTerm} />
      <Footer />
    </>
  );
}

export default Tienda;
