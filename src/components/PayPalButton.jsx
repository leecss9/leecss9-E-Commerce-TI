import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';

const PayPalButtonComponent = ({ totalAmount }) => {
  // Asegurarse de que totalAmount sea un número válido
  const amount = parseFloat(totalAmount).toFixed(2);

  // Validar que totalAmount sea un número válido
  if (isNaN(amount) || amount <= 0) {
    return <p>El monto total no es válido.</p>;
  }

  return (
    <PayPalButtons
      style={{ layout: 'horizontal', color: 'blue', shape: 'pill' }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount, // Asegurarse de que el monto es un número con 2 decimales
              },
            },
          ],
        }).catch((err) => {
          console.error('Error al crear la orden:', err);
          alert('Hubo un problema al crear la orden.');
        });
      }}
      onApprove={(data, actions) => {
        return actions.order.capture().then((details) => {
          alert('Pago completado por ' + details.payer.name.given_name);
        }).catch((err) => {
          console.error('Error en la aprobación del pago:', err);
          alert('Hubo un problema al procesar el pago.');
        });
      }}
      onError={(err) => {
        console.error('Error en el pago:', err);
        alert('Hubo un error con el proceso de pago. Por favor, intenta nuevamente.');
      }}
    />
  );
};

export default PayPalButtonComponent;
