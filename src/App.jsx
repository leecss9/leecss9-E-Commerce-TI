import './index.css'; 
import Header from './components/Header';
import Carrito from './components/carrito';
import Login from './components/Login';
import AdminPage from './components/AdminPage'; 
import Productos from './components/Productos'; 
import Pedidos from './components/Pedidos';
import Tienda from './components/Tienda'; // ✅ importar nuevo componente
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/carrito" element={<Carrito />} />

        {/* ✅ Página principal usando Tienda */}
        <Route 
          path="/" 
          element={
            <>
              <Header />
              <Tienda />
            </>
          } 
        />
      </Routes>
    </>
  );
}

export default App;


