// src/pages/LoginPage.jsx
import "../styles/login.css"
import React from 'react';

const LoginPage = () => {
  return (
    <div className="login-page">
      <h2>Iniciar sesión</h2>
      <form>
        <label htmlFor="username">Usuario:</label>
        <input type="text" id="username" name="username" />

        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" />

        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default LoginPage;

