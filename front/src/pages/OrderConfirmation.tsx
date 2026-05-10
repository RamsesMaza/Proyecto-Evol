import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(status || 'approved');

  useEffect(() => {
    if (paymentId && status !== 'approved') {
      const checkPayment = async () => {
        try {
          const res = await fetch('/api/payments/check-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          const data = await res.json();
          if (data.status) setPaymentStatus(data.status);
        } catch {
          // ignore
        } finally {
          setChecking(false);
        }
      };
      checkPayment();
    } else {
      setChecking(false);
    }
  }, [paymentId, status]);

  if (checking) {
    return (
      <div style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: 48, color: '#C10E1A', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 16, color: '#666' }}>Verificando pago...</p>
        </div>
      </div>
    );
  }

  const isApproved = paymentStatus === 'approved' || paymentStatus === 'paid';

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '60px 40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: 480, width: '90%' }}>
        {isApproved ? (
          <>
            <div style={{ fontSize: 64, color: '#10b981', marginBottom: 20 }}><FaCheckCircle /></div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>¡Pedido Confirmado!</h1>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
              Gracias por tu compra. Hemos recibido tu pago y te enviaremos un correo con los detalles.
            </p>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>
              Nuestro equipo se comunicará contigo en las próximas 24 horas.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 64, color: '#f59e0b', marginBottom: 20 }}><FaTimesCircle /></div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Pago Pendiente</h1>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
              El pago no se ha completado. Si ya realizaste el pago, espera unos minutos y verifica.
            </p>
          </>
        )}
        <Link to="/servicios" style={{ display: 'inline-block', padding: '14px 40px', background: '#111', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 15, fontFamily: "'Poppins', sans-serif" }}>
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
