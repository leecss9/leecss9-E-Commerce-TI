import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import AdminLayout from './AdminLayout.jsx';
import '../styles/pedidos.css';

// Componente para mostrar el modal con detalles del pedido
function PedidoDetalleModal({ pedido, onCerrar }) {
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal"
      onClick={onCerrar}
      tabIndex={-1}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="titulo-modal">Detalles Pedido {pedido.id}</h2>

        {[
          { label: "Cliente", value: pedido.clienteId },
          { label: "Fecha", value: formatearFecha(pedido.fecha) },
          { label: "Estado", value: pedido.estado },
          { label: "Total", value: pedido.totalMXN !== undefined ? `$${pedido.totalMXN}` : 'N/A' },
          { label: "Método de envío", value: pedido.metodo },
          { label: "Dirección de envío", value: pedido.direccion },
          { label: "Método de pago", value: pedido.metodoPago },
          { label: "Teléfono", value: pedido.telefono },
          { label: "Comentarios", value: pedido.comentarios }
        ].map((item, idx) => (
          <div key={idx} className="detalle-item">
            <span className="detalle-label">{item.label}:</span>
            <span className="detalle-valor">{item.value || 'No disponible'}</span>
          </div>
        ))}

        <div className="detalle-item">
          <span className="detalle-label">Productos:</span>
          <div className="detalle-valor">
            {pedido.productos?.length > 0 ? (
              <ul>
                {pedido.productos.map((prod, index) => (
                  <li key={index}>
                    {prod.nombre} x {prod.cantidad} - ${prod.precio} c/u
                  </li>
                ))}
              </ul>
            ) : (
              <span>No hay productos</span>
            )}
          </div>
        </div>

        <button onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
}

// Selector de estado con confirmación para "Cancelado"
function EstadoSelector({ estadoActual, onChange }) {
  const [estado, setEstado] = useState(estadoActual);

  const handleChange = (e) => {
    const nuevoEstado = e.target.value;
    if (nuevoEstado === "Cancelado") {
      if (!window.confirm("¿Estás seguro de cancelar este pedido?")) {
        // No cambia el estado
        return;
      }
    }
    setEstado(nuevoEstado);
    onChange(nuevoEstado);
  };

  useEffect(() => {
    setEstado(estadoActual);
  }, [estadoActual]);

  return (
    <select value={estado} onChange={handleChange} className="select-estado" aria-label="Selector de estado del pedido">
      <option value="Pendiente">Pendiente</option>
      <option value="Enviado">Enviado</option>
      <option value="Entregado">Entregado</option>
      <option value="Pagado">Pagado</option>
      <option value="Cancelado">Cancelado</option>
    </select>
  );
}

// Función para formatear fechas
function formatearFecha(fecha) {
  if (!fecha) return 'N/A';
  if (fecha.toDate) {
    return fecha.toDate().toLocaleString('es-MX');
  }
  return new Date(fecha).toLocaleString('es-MX');
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const pedidosCollection = collection(db, "pedidos");
    const unsubscribe = onSnapshot(pedidosCollection, (snapshot) => {
      const pedidosList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPedidos(pedidosList);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error("Error al obtener pedidos:", error);
      setError("No se pudieron cargar los pedidos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    const pedidoRef = doc(db, "pedidos", pedidoId);
    // Guardamos el estado anterior para revertir en caso de error
    const pedidoActual = pedidos.find(p => p.id === pedidoId);
    const estadoAnterior = pedidoActual?.estado || "Pendiente";

    // Actualizamos estado localmente para respuesta rápida
    setPedidos(pedidos.map(pedido =>
      pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido
    ));

    try {
      await updateDoc(pedidoRef, {
        estado: nuevoEstado
      });
      // Aquí podrías mostrar algún mensaje de éxito
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      setError("Error al actualizar el estado del pedido.");
      // Revertimos el cambio local
      setPedidos(pedidos.map(pedido =>
        pedido.id === pedidoId ? { ...pedido, estado: estadoAnterior } : pedido
      ));
    }
  };

  const pedidosFiltrados = pedidos.filter(p =>
    p.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.clienteId && p.clienteId.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="contenido-pedidos">
        <h1>Administración de Pedidos y Envíos</h1>

        <div className="barra-superior">
          <button className="btn-envios" onClick={() => navigate('/envios')}>ENVIOS</button>
          <input
            type="text"
            placeholder="Buscar ID o Cliente..."
            className="buscador"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            aria-label="Buscar pedidos por ID o cliente"
          />
        </div>

        {loading && <p>Cargando pedidos...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>ID pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total (MXN)</th>
                <th>Estado</th>
                <th>Método envío</th>
                <th>No. registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>No se encontraron pedidos</td>
                </tr>
              )}
              {pedidosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.clienteId || 'N/A'}</td>
                  <td>{formatearFecha(p.fecha)}</td>
                  <td>{p.totalMXN !== undefined ? `$${p.totalMXN}` : 'N/A'}</td>
                  <td>
                    <span className={`estado ${p.estado ? p.estado.toLowerCase() : ''}`}>
                      {p.estado || 'Sin estado'}
                    </span>
                  </td>
                  <td>{p.metodo || 'N/A'}</td>
                  <td>{p.registro || 'N/A'}</td>
                  <td>
                    <button
                      className="btn-detalles"
                      onClick={() => setPedidoSeleccionado(p)}
                      aria-label={`Ver detalles del pedido ${p.id}`}
                    >
                      Ver detalles
                    </button>

                    <EstadoSelector
                      estadoActual={p.estado || "Pendiente"}
                      onChange={(nuevoEstado) => actualizarEstado(p.id, nuevoEstado)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pedidoSeleccionado && (
          <PedidoDetalleModal
            pedido={pedidoSeleccionado}
            onCerrar={() => setPedidoSeleccionado(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
