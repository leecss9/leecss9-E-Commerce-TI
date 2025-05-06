import '../styles/Footer.css'; // Asegúrate de que la ruta sea correcta

const Footer = () => (
  <footer>
    <div className="footer-container">
      <div className="footer-section">
        <h3>Categorías</h3>
        <ul>
          <li><a href="#">Microcontroladores y placas</a></li>
          <li><a href="#">Sensores</a></li>
          <li><a href="#">Actuadores</a></li>
          <li><a href="#">Componentes Electrónicos</a></li>
          <li><a href="#">Módulos</a></li>
          <li><a href="#">Cables y conectores</a></li>
          <li><a href="#">Protoboards y PCB</a></li>
          <li><a href="#">Alimentación</a></li>
          <li><a href="#">Herramientas</a></li>
          <li><a href="#">Kits armados</a></li>
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

export default Footer;
