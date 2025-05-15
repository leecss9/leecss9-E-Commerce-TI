const paypal = require('paypal-rest-sdk');

// Configura el SDK de PayPal con tus credenciales
paypal.configure({
  mode: 'sandbox', // Usa 'live' en producción
  client_id: 'AfP7Juwwa59waiDlb7Btd_H2JzgfgpTesyqWSEg_0KB-8uxKtH5rwBQtqUSG8IceS9IT1PFgFbgzsB1a',
  client_secret: 'TU_CLIENT_SECRET_SAND_BOX'
});

module.exports = paypal;

