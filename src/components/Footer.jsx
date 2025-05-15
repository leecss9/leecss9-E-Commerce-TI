import '../styles/Footer.css';

const Footer = ({ onCategorySelect }) => {
  const handleClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);

      // Scroll a la sección de productos
      const section = document.querySelector(".products-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer>
      <div className="footer-container">
        <div className="footer-section">
          <h3>Categorías</h3>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("Microcontroladores y placas"); }}>Microcontroladores y placas</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("sensores"); }}>Sensores</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("actuadores"); }}>Actuadores</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("Componentes Electrónicos"); }}>Componentes Electrónicos</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("modulos"); }}>Módulos</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("Cables y conectores"); }}>Cables y conectores</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("Protoboards y PCB"); }}>Protoboards y PCB</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("alimentacion"); }}>Alimentación</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("herramientas"); }}>Herramientas</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleClick("Kits armados"); }}>Kits armados</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contacto</h3>
          <p>📍 Dirección: Calle 123, Querétaro, México</p>
          <p>📞 Teléfono: +52 442 123 4567</p>
          <p>✉️ Email: StoreTI@tienda.com</p>
        </div>

        <div className="footer-section">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 TiendaTech | Todos los derechos reservados.</p>
      </div>


    </footer>
  );
};

export default Footer;
