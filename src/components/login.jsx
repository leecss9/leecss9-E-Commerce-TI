import React, { useState } from "react";
import { auth, db, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "../styles/login.css";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false); // <-- NUEVO estado para términos

  const saveUserToFirestore = async (user) => {
    if (!user) return;
    try {
      const userRef = doc(db, "user", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Si el documento no existe, es un nuevo usuario, lo creamos
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || name || "",
          photoURL: user.photoURL || "",
          rol: "cliente", // Solo asigna el rol "cliente" si es nuevo
        });
      } else {
        // Si ya existe, no modificamos el rol ni otros datos
        console.log("Usuario ya existe, no se actualizó el rol.");
      }
    } catch (error) {
      console.error("Error guardando el usuario en Firestore:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(result.user);
      window.location.href = "/";
    } catch (err) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!acceptTerms) {
      setError("Debes aceptar los Términos y Condiciones.");
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore({ ...result.user, displayName: name });
      window.location.href = "/";
    } catch (err) {
      setError("Error al crear la cuenta. Intenta con otro correo.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserToFirestore(result.user);
      window.location.href = "/";
    } catch (err) {
      setError("Error al iniciar sesión con Google.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}</h2>
        <p>{isRegistering ? "Completa los campos para registrarte" : "Ingrese su correo electrónico para acceder a esta aplicación"}</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <>
              <label htmlFor="name">Nombre Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Nombre Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}

          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isRegistering && (
            <>
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {/* CHECKBOX TÉRMINOS Y CONDICIONES */}
              <div className="terms-container">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <label htmlFor="terms">
                  Acepto los <a href="/terminos" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
                </label>
              </div>
            </>
          )}

          {!isRegistering && (
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          )}

          <button type="submit" className="btn-primary">
            {isRegistering ? "Registrarse" : "Iniciar Sesión"}
          </button>

          <div className="separator">O</div>

          <button type="button" className="btn-google" onClick={handleGoogleLogin}>
            Iniciar sesión con Google
          </button>
        </form>

        <p className="register-text">
          {isRegistering ? (
            <>¿Ya tienes una cuenta?{" "}
              <button className="register-link" onClick={() => setIsRegistering(false)}>Inicia sesión</button>
            </>
          ) : (
            <>¿No tienes una cuenta?{" "}
              <button className="register-link" onClick={() => setIsRegistering(true)}>Crear cuenta</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;

