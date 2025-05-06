import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CartProvider } from './components/CartContext';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ "client-id": "AfP7Juwwa59waiDlb7Btd_H2JzgfgpTesyqWSEg_0KB-8uxKtH5rwBQtqUSG8IceS9IT1PFgFbgzsB1a" }}>
      <CartProvider> {/* 👈 envolvemos toda la app */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </PayPalScriptProvider>
  </React.StrictMode>
);

