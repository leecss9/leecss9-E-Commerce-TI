import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, getDocs, deleteDoc, doc } from "../firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AdminLayout from "./AdminLayout.jsx"; // Asegúrate de que exista este layout
import '../styles/AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [admins, setAdmins] = useState([]);
  const [loggedAdmin, setLoggedAdmin] = useState({ username: '', rol: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const querySnapshot = await getDocs(collection(db, 'user'));
        const currentUser = querySnapshot.docs.find(doc => doc.data().email === user.email);
        if (currentUser) {
          const data = currentUser.data();
          setLoggedAdmin({
            username: data.username || user.displayName || "Usuario sin nombre",
            rol: data.rol || 'Sin rol'
          });
        }
      } else {
        setLoggedAdmin({ username: '', rol: '' });
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAdmins = async () => {
    const querySnapshot = await getDocs(collection(db, 'user'));
    const adminsList = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(user => user.rol === 'admin');
    setAdmins(adminsList);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({ ...newAdmin, [name]: value });
  };

  const handleCreateAdmin = async () => {
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await addDoc(collection(db, 'user'), {
        username: newAdmin.username,
        email: newAdmin.email,
        password: newAdmin.password,
        rol: 'admin',
      });
      fetchAdmins();
      setNewAdmin({ username: '', email: '', password: '', confirmPassword: '' });
      setError('');
    } catch (error) {
      console.error("Error al agregar el administrador: ", error);
    }
  };

  const handleDeleteAdmin = async (id) => {
    try {
      await deleteDoc(doc(db, 'user', id));
      fetchAdmins();
    } catch (error) {
      console.error("Error al eliminar el administrador: ", error);
    }
  };

  return (
    <AdminLayout>
      <main className="admin-main">
        <section className="create-admin">
          <h3>Crear Nuevo Administrador</h3>
          <input
            type="text"
            name="username"
            placeholder="Nombre de Usuario"
            value={newAdmin.username}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={newAdmin.email}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={newAdmin.password}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar Contraseña"
            value={newAdmin.confirmPassword}
            onChange={handleInputChange}
          />
          {error && <p className="error-message">{error}</p>}
          <button onClick={handleCreateAdmin}>Crear Administrador</button>
        </section>

        <section className="list-admins">
          <h3>Administradores Existentes</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre de Usuario</th>
                <th>Correo Electrónico</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.username || admin.displayName || 'Nombre no disponible'}</td>
                  <td>{admin.email}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleDeleteAdmin(admin.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </AdminLayout>
  );
}

export default AdminPage;

