import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCopy, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import styles from './PendingPayment.module.scss';

const PendingPayment = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [copied, setCopied] = useState<'yape' | 'plin' | null>(null);

  const copyToClipboard = (text: string, type: 'yape' | 'plin') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.warningIcon}><FaExclamationTriangle /></div>
          <h1 className={styles.title}>Pago Pendiente</h1>
          <p className={styles.subtitle}>
            {orderId && <>Orden #{orderId} — </>}
            Realiza el pago a una de estas cuentas para confirmar tu pedido.
          </p>
        </div>

        <div className={styles.yapeBox}>
          <h3 className={styles.boxTitle}><FaCheckCircle /> Yape</h3>
          <div className={styles.detail}><strong>Titular:</strong> Ricardo Maza Apaza</div>
          <div className={styles.detail}><strong>Teléfono:</strong> 999 999 999</div>
          <button onClick={() => copyToClipboard('999999999', 'yape')}
            className={`${styles.copyBtn} ${copied === 'yape' ? styles.copied : styles.dark}`}>
            <FaCopy /> {copied === 'yape' ? '¡Copiado!' : 'Copiar número'}
          </button>
        </div>

        <div className={styles.plinBox}>
          <h3 className={styles.boxTitle}><FaCheckCircle /> Plin</h3>
          <div className={styles.detail}><strong>Titular:</strong> Ricardo Maza Apaza</div>
          <div className={styles.detail}><strong>Teléfono:</strong> 999 999 999</div>
          <button onClick={() => copyToClipboard('999999999', 'plin')}
            className={`${styles.copyBtn} ${copied === 'plin' ? styles.copied : styles.blue}`}>
            <FaCopy /> {copied === 'plin' ? '¡Copiado!' : 'Copiar número'}
          </button>
        </div>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            <strong>📌 Importante:</strong> Luego de realizar el pago, envía el comprobante a nuestro
            WhatsApp para confirmar tu pedido. Nuestro equipo verificará el pago y activará tu certificación.
          </p>
        </div>

        <Link to="/servicios" className={styles.footerBtn}>
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
};

export default PendingPayment;
