import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CartProvider } from './components/CartContext';
import { AuthProvider } from './components/AuthContext.jsx'; // Importar el proveedor de autenticación
import { KitProvider } from './components/KitContext'; // Importar el proveedor de kit

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ "client-id": "AfP7Juwwa59waiDlb7Btd_H2JzgfgpTesyqWSEg_0KB-8uxKtH5rwBQtqUSG8IceS9IT1PFgFbgzsB1a" }}>
      <AuthProvider> {/* Envolver la app con el AuthProvider */}
        <CartProvider> {/* Envolver con el proveedor de carrito */}
          <KitProvider> {/* Envolver con el proveedor del kit */}
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </KitProvider>
        </CartProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  </React.StrictMode>
);


