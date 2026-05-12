import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import styles from './OrderConfirmation.module.scss';

const OrderConfirmation = () => {
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
      <div className={styles.page}>
        <FaSpinner className={styles.spinner} />
        <p className={styles.checkingText}>Verificando pago...</p>
      </div>
    );
  }

  const isApproved = paymentStatus === 'approved' || paymentStatus === 'paid';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {isApproved ? (
          <>
            <div className={styles.iconSuccess}><FaCheckCircle /></div>
            <h1 className={styles.title}>¡Pedido Confirmado!</h1>
            <p className={styles.text}>
              Gracias por tu compra. Hemos recibido tu pago y te enviaremos un correo con los detalles.
            </p>
            <p className={styles.subtext}>
              Nuestro equipo se comunicará contigo en las próximas 24 horas.
            </p>
          </>
        ) : (
          <>
            <div className={styles.iconPending}><FaTimesCircle /></div>
            <h1 className={styles.title}>Pago Pendiente</h1>
            <p className={styles.text}>
              El pago no se ha completado. Si ya realizaste el pago, espera unos minutos y verifica.
            </p>
          </>
        )}
        <Link to="/servicios" className={styles.btn}>
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
