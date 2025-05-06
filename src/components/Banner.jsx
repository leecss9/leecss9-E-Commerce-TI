import React, { useState, useEffect } from 'react';
import '../styles/Banner.css'; // Importas el CSS del componente
import bannerImg1 from '../assets/img/COCKET-NOVA-web3-2048x461.jpg';
import bannerImg2 from '../assets/img/SEEED-STUDIO-2024-web3-2048x461.jpg'; // Añadir más imágenes si es necesario
import bannerImg3 from '../assets/img/03-MODULOS-UNIT-2048x461.jpg';


const Banner = () => {
  const images = [bannerImg1, bannerImg2, bannerImg3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cambiar imagen cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3000 ms = 3 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="banner">
      <img src={images[currentImageIndex]} alt="Banner promocional" />
    </div>
  );
};

export default Banner;
