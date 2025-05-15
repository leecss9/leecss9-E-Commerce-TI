import React, { useState, useEffect } from 'react';
import {
  getFirestore, doc, getDoc, setDoc,
  collection, query, where, getDocs, orderBy
} from 'firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/ProfileModal.css'; // Usa el CSS que te pasé antes

const Perfil = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    nombre: '',
    email: '',
    direccion: '',
    telefono: '',
    imagen: ''
  });

  const [historial, setHistorial] = useState([]);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, 'user', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setProfile({
            nombre: data.nombre || user.displayName || '',
            email: data.email || user.email || '',
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            imagen: data.imagen || data.photoURL || user.photoURL || ''
          });
        } else {
          setProfile({
            nombre: user.displayName || '',
            email: user.email || '',
            direccion: '',
            telefono: '',
            imagen: user.photoURL || ''
          });
        }
      }
    };

    const fetchPedidos = async () => {
      if (!user) return;

      try {
        const db = getFirestore();
        const pedidosRef = collection(db, 'pedidos');
        const q = query(pedidosRef, where('uid', '==', user.uid), orderBy('fecha', 'desc'));
        const querySnapshot = await getDocs(q);

        const pedidosUsuario = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setHistorial(pedidosUsuario);
      } catch (error) {
        console.error('Error al obtener pedidos:', error);
      }
    };

    fetchUserData();
    fetchPedidos();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfile(prev => ({ ...prev, imagen: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const db = getFirestore();
      const userRef = doc(db, 'user', user.uid);
      await setDoc(userRef, {
        nombre: profile.nombre,
        email: profile.email,
        direccion: profile.direccion,
        telefono: profile.telefono,
        imagen: profile.imagen
      }, { merge: true });

      alert('Datos guardados correctamente');
      setEditando(false);
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Error al guardar datos en Firestore');
    }
  };

  return (
    <div className="perfil-main-container">

      {/* Contenedor perfil */}
      <section className="perfil-container">
        <h2>Mi Perfil</h2>

        <div className="perfil-content">
          <div className="perfil-avatar">
            <img
              src={profile.imagen || 'default-avatar.png'}
              alt="Foto de perfil"
            />
            {editando && (
              <input type="file" accept="image/*" onChange={handleImageChange} />
            )}
          </div>

          <div className="perfil-form">
            <div>
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={profile.nombre}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>

            <div>
              <label>Correo</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
              />
            </div>

            <div>
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={profile.direccion}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>

            <div>
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={profile.telefono}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>

            {editando ? (
              <button className="save-button" onClick={handleSave}>Guardar Cambios</button>
            ) : (
              <button className="save-button" onClick={() => setEditando(true)}>Editar Perfil</button>
            )}
          </div>
        </div>
      </section>

      {/* Contenedor historial */}
      <section className="historial-container">
        <h2>Historial de Compras</h2>
        <ul className="historial-list">
          {historial.length === 0 ? (
            <li>No hay pedidos registrados.</li>
          ) : (
            historial.map(pedido => (
              <li key={pedido.id}>
                Pedido #{pedido.numeroPedido || pedido.id} - {pedido.fecha?.seconds ? new Date(pedido.fecha.seconds * 1000).toLocaleDateString() : 'Sin fecha'}
              </li>
            ))
          )}
        </ul>
      </section>

    </div>
  );
};

export default Perfil;

