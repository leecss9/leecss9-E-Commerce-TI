import './index.css';
import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Header from './components/Header';
import Carrito from './components/carrito';
import Login from './components/login';
import AdminPage from './components/AdminPage';
import Productos from './components/Productos';
import Pedidos from './components/Pedidos';
import Tienda from './components/Tienda';
import ProductDetail from './components/ProductDetail';
import KitComponent from './components/KitComponent';
import ErrorBoundary from './components/ErrorBoundary';
import { CartProvider } from './components/CartContext';
import { KitProvider } from './components/KitContext';
import Perfil from './components/ProfileModal';  // <--- Nuevo import
import { AuthProvider } from './components/AuthContext';  // <--- Importa tu AuthProvider

function App() {
  return (
    <AuthProvider> {/* <--- Envuelve toda la app */}
      <CartProvider>
        <KitProvider>
          <Routes>
            {/* Rutas que no necesitan header */}
            <Route path="/login" element={<Login />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="productos" element={<Productos />} />
            <Route path="pedidos" element={<Pedidos />} />

            {/* Rutas que sí usan el Layout con Header */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Tienda />} />
              <Route path="carrito" element={<Carrito />} />
              <Route path="kit" element={<KitComponent />} />
              <Route path="perfil" element={<Perfil />} /> {/* <--- NUEVA RUTA */}
              
              <Route 
                path="product/:id" 
                element={
                  <ErrorBoundary>
                    <ProductDetail />
                  </ErrorBoundary>
                } 
              />
            </Route>

            {/* Ruta comodín */}
            <Route 
              path="*" 
              element={
                <div style={{ padding: '2rem' }}>
                  <h2>Página no encontrada.</h2>
                  <Link to="/">Ir al inicio</Link>
                </div>
              } 
            />
          </Routes>
        </KitProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;






