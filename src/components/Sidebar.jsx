// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/siderbar.css';
import { useAuth } from '../components/AuthContext'; // ajusta el path si es necesario

const Sidebar = () => {
  const navigate = useNavigate();
  const { userName } = useAuth();

  const handleInicioClick = () => {
    const confirmExit = window.confirm('¿Estás seguro de que deseas salir e ir al inicio?');
    if (confirmExit) {
      navigate('/');
    }
  };

  return (
    <div className="sidebar">
      <h2>Panel de Administrador</h2>
      <p>{userName ? `Bienvenido, ${userName}` : 'Cargando usuario...'}</p>

      <nav>
        <button onClick={handleInicioClick}>Inicio</button>
        <button onClick={() => navigate('/admin')}>Usuarios</button>
        <button onClick={() => navigate('/productos')}>Productos</button>
        <button onClick={() => navigate('/pedidos')}>Pedidos</button>
      </nav>
    </div>
  );
};

export default Sidebar;

