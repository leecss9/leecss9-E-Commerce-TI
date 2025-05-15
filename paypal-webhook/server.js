const express = require('express');
const bodyParser = require('body-parser');
const { WebhookEvent } = require('paypal-rest-sdk');

const app = express();
const PORT = 5000;

// Configurar body-parser para recibir JSON sin modificarlo
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // para verificar la firma si es necesario
  }
}));

// Verifica la firma del webhook
function verifyWebhookSignature(body, headers) {
  const webhookId = '4DN62185GW649512V'; // 🔁 Reemplaza esto con el verdadero ID de tu webhook

  const params = {
    transmission_id: headers['paypal-transmission-id'],
    transmission_time: headers['paypal-transmission-time'],
    cert_url: headers['paypal-cert-url'],
    auth_algo: headers['paypal-auth-algo'],
    transmission_sig: headers['paypal-transmission-sig'],
    webhook_id: webhookId,
    webhook_event: body
  };

  return new Promise((resolve, reject) => {
    WebhookEvent.verify(params, (error, response) => {
      if (error) {
        console.error('Error al verificar la firma del webhook: ', error);
        resolve(false);
      } else if (response.verification_status === 'SUCCESS') {
        console.log('✅ Firma verificada correctamente');
        resolve(true);
      } else {
        console.warn('⚠️ Firma del webhook no verificada');
        resolve(false);
      }
    });
  });
}

// Endpoint Webhook de PayPal
app.post('/paypal-webhook', async (req, res) => {
  const body = req.body;
  const headers = req.headers;

  const isValid = await verifyWebhookSignature(body, headers);

  if (isValid) {
    const eventType = body.event_type;
    console.log(`📦 Evento recibido: ${eventType}`);

    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource.id;
      console.log(`✅ Orden aprobada con ID: ${orderId}`);
    }

    res.sendStatus(200);
  } else {
    res.status(400).send('Webhook no verificado');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${PORT}`);
});

