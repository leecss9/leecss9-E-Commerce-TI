import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../components/CartContext';
import { db, doc, updateDoc, getDoc, collection, addDoc, serverTimestamp } from '../firebase/firebase';
import { useAuth } from '../components/AuthContext';

const PayPalButtonComponent = ({ totalAmount }) => {
  const paypalRef = useRef();
  const { setCartItems } = useCart();
  const { user } = useAuth();
  const [tipoCambio, setTipoCambio] = useState(18); // Valor por defecto
  const [sdkReady, setSdkReady] = useState(false);

  // Cargar SDK de PayPal
  useEffect(() => {
    const addPayPalSdk = async () => {
      const scriptExists = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (!scriptExists) {
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=AfP7Juwwa59waiDlb7Btd_H2JzgfgpTesyqWSEg_0KB-8uxKtH5rwBQtqUSG8IceS9IT1PFgFbgzsB1a&currency=USD';
        script.async = true;
        script.onload = () => setSdkReady(true);
        document.body.appendChild(script);
      } else {
        setSdkReady(true);
      }
    };

    addPayPalSdk();
  }, []);

  // Obtener tipo de cambio USD a MXN
  useEffect(() => {
    const obtenerTipoCambio = async () => {
      try {
        const response = await fetch('https://v6.exchangerate-api.com/v6/8ccd450e55ace3d67099de6f/latest/USD');
        const data = await response.json();

        if (data?.result === 'success' && data.conversion_rates?.MXN) {
          setTipoCambio(data.conversion_rates.MXN);
        } else {
          console.error('No se obtuvo el tipo de cambio MXN');
          setTipoCambio(null);
        }
      } catch (error) {
        console.error('Error al obtener tipo de cambio:', error);
        setTipoCambio(null);
      }
    };

    obtenerTipoCambio();
  }, []);

  // Renderizar botón de PayPal si todo es válido
  useEffect(() => {
    let isMounted = true;

    const validTotalAmount = typeof totalAmount === 'number' && totalAmount >= 1;
    const validTipoCambio = typeof tipoCambio === 'number' && tipoCambio > 0;

    if (!sdkReady || !window.paypal || !validTotalAmount || !validTipoCambio || !user || !paypalRef.current) return;

    paypalRef.current.innerHTML = '';

    const totalUSD = totalAmount / tipoCambio;

    if (isNaN(totalUSD)) {
      console.error('totalUSD inválido:', totalUSD);
      return;
    }

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: totalUSD.toFixed(2),
                currency_code: 'USD',
              },
              description: 'Compra en Tienda de Electrónica',
            },
          ],
        });
      },
      onApprove: async (data, actions) => {
        try {
          const order = await actions.order.capture();
          console.log('Pago completado:', order);

          if (user && isMounted) {
            const carritoRef = doc(db, 'carritodecompras', user.uid);
            const productosComprados = [];

            const carritoSnap = await getDoc(carritoRef);
            if (carritoSnap.exists()) {
              const data = carritoSnap.data();
              productosComprados.push(...(data.productos || []));
            }

            // Datos opcionales que podrían venir del usuario
            const datosUsuarioAdicionales = {};
            if (user.direccion) datosUsuarioAdicionales.direccion = user.direccion;
            if (user.displayName) datosUsuarioAdicionales.displayName = user.displayName;
            if (user.email) datosUsuarioAdicionales.email = user.email;
            if (user.imagen) datosUsuarioAdicionales.imagen = user.imagen;
            if (user.nombre) datosUsuarioAdicionales.nombre = user.nombre;
            if (user.photoURL) datosUsuarioAdicionales.photoURL = user.photoURL;
            if (user.rol) datosUsuarioAdicionales.rol = user.rol;
            if (user.telefono) datosUsuarioAdicionales.telefono = user.telefono;
            if (user.uid) datosUsuarioAdicionales.uid = user.uid;

            // Guardar el pedido en la colección "pedidos"
            await addDoc(collection(db, 'pedidos'), {
              clienteId: user.uid,
              productos: productosComprados,
              totalMXN: totalAmount,
              totalUSD: totalUSD.toFixed(2),
              paypalOrderId: order.id,
              fecha: serverTimestamp(),
              estado: 'pendiente',
              metodoPago: 'PayPal', // <-- Agregado método de pago explícito
              ...datosUsuarioAdicionales, // <-- Agrego datos adicionales si existen
            });

            console.log('Pedido guardado en Firebase correctamente.');

            // Vaciar el carrito
            await updateDoc(carritoRef, { productos: [] });
            setCartItems([]);
            alert('¡Pago exitoso! Gracias por tu compra.');
          }
        } catch (error) {
          console.error('Error en onApprove:', error);
          alert('Hubo un error al procesar tu pago o guardar el pedido. Por favor, contacta soporte.');
        }
      },
      onError: (err) => {
        console.error('Error en el pago:', err);
        alert('Ocurrió un error al procesar el pago.');
      },
    }).render(paypalRef.current);

    return () => {
      isMounted = false;
    };
  }, [sdkReady, totalAmount, tipoCambio, user, setCartItems]);

  if (tipoCambio === null) {
    return <p>No se pudo obtener el tipo de cambio. Intenta más tarde.</p>;
  }

  if (typeof totalAmount !== 'number' || totalAmount < 1) {
    return <p>No se puede procesar el pago. El monto mínimo es $1.00 MXN.</p>;
  }

  const totalUSD = totalAmount / tipoCambio;

  return (
    <>
      <p>Total: ${totalAmount.toFixed(2)} MXN (~${totalUSD.toFixed(2)} USD)</p>
      <div ref={paypalRef} />
    </>
  );
};

export default PayPalButtonComponent;
