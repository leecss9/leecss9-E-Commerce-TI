import React from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/pedidos.css';

const pedidos = [
  {
    id: "#1001",
    cliente: "Carlos Villa casas",
    fecha: "2025-03-18",
    total: "$3,200 MXN",
    estado: "Pendiente",
    metodo: "DHL Express",
    registro: "FE123456789MX",
  },
  
];

export default function Pedidos() {
  const navigate = useNavigate(); // ✅ Esto soluciona el error

  return (
    <div className="contenedor">
      <div className="sidebar">
        <h2>Panel de Usuario</h2>
        <p>Administrador</p>
        <nav>
          <button onClick={() => navigate('/')}>Inicio</button>
          <button onClick={() => navigate('/admin')}>Usuarios</button>
          <button onClick={() => navigate('/productos')}>Productos</button>
          <button onClick={() => navigate('/pedidos')}>Pedidos</button>
        </nav>
      </div>

      <main className="contenido">
        <h1>Administración de Pedidos y Envíos</h1>
        <div className="barra-superior">
          <button className="btn-envios">ENVIOS</button>
          <input
            type="text"
            placeholder="Buscar ID Envío....."
            className="buscador"
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>ID pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Método envío</th>
              <th>No. registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p, i) => (
              <tr key={i}>
                <td>{p.id}</td>
                <td>{p.cliente}</td>
                <td>{p.fecha}</td>
                <td>{p.total}</td>
                <td>
                  <span className={`estado ${p.estado.toLowerCase()}`}>
                    {p.estado}
                  </span>
                </td>
                <td>{p.metodo}</td>
                <td>{p.registro}</td>
                <td>
                  <button className="btn-actualizar">Actualizar</button>
                  <button className="btn-cancelar">Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
