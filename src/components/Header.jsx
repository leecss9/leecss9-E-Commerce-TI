import React, { useState, useEffect } from 'react';  
import { useNavigate, Link } from 'react-router-dom';  
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';  
import { getFirestore, doc, getDoc } from 'firebase/firestore';  // 👈 Import Firestore
import '../styles/Header.css';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [userRole, setUserRole] = useState(null);  // 👈 Estado para el rol
  const navigate = useNavigate();  

  const auth = getAuth();
  const db = getFirestore();

  // Verificar si hay usuario y obtener su rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      if (currentUser) {
        try {
          const docRef = doc(db, "user", currentUser.uid);  // 👈 Asegúrate que esta ruta sea correcta
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserRole(docSnap.data().rol);  // 👈 El campo debe llamarse 'rol' en Firestore
          } else {
            setUserRole(null);
          }
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert('Sesión cerrada');
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">Store TI</div>

        <div className="header-icons">
          <Link to="/carrito" title="Carrito" className="cart-link">
            <FaShoppingCart />
          </Link>

          <div className="user-menu">
            <button 
              onClick={toggleUserMenu} 
              className="user-icon-btn" 
              title="Perfil" 
              style={{ background: 'none', border: 'none', color: 'inherit' }}
            >
              {user && user.photoURL ? (
                <img src={user.photoURL} alt="Usuario" className="user-icon-avatar" />
              ) : (
                <FaUserCircle />
              )}
            </button>

            {isUserMenuOpen && (
              <div className="user-popup">
                {user ? (
                  <>
                    <h2>Perfil de Usuario</h2>
                    <img src={user.photoURL || 'default-avatar.png'} alt="Usuario" className="user-avatar" />
                    <h3>{user.displayName || 'Nombre de Usuario'}</h3>
                    <p>{user.email}</p>
                    <button className="profile-button" onClick={() => navigate("/perfil")}>Ver Perfil</button>
                    <button className="settings-button" onClick={() => navigate("/configuracion")}>Configuración</button>

                    {/* Solo se muestra si el usuario es admin */}
                    {userRole === "admin" && (
                      <button className="admin-button" onClick={() => navigate("/admin")}>Panel de Administrador</button>
                    )}

                    <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
                  </>
                ) : (
                  <>
                    <h2>¡Bienvenido!</h2>
                    <p>Debes iniciar sesión para ver tu perfil.</p>
                    <button className="settings-button" onClick={handleLogin}>Iniciar Sesión</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


