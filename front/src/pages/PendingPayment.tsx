import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCopy, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const PendingPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [copied, setCopied] = React.useState<'yape' | 'plin' | null>(null);

  const copyToClipboard = (text: string, type: 'yape' | 'plin') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px', maxWidth: 520, width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, color: '#f59e0b', marginBottom: 12 }}>
            <FaExclamationTriangle />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Pago Pendiente</h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            {orderId && <>Orden #{orderId} — </>}
            Realiza el pago a una de estas cuentas para confirmar tu pedido.
          </p>
        </div>

        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaCheckCircle style={{ color: '#eab308' }} /> Yape
          </h3>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}><strong>Titular:</strong> Ricardo Maza Apaza</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}><strong>Teléfono:</strong> 999 999 999</div>
          <button
            onClick={() => copyToClipboard('999999999', 'yape')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: copied === 'yape' ? '#059669' : '#111', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'all 0.3s',
            }}
          >
            <FaCopy /> {copied === 'yape' ? '¡Copiado!' : 'Copiar número'}
          </button>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaCheckCircle style={{ color: '#3b82f6' }} /> Plin
          </h3>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}><strong>Titular:</strong> Ricardo Maza Apaza</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}><strong>Teléfono:</strong> 999 999 999</div>
          <button
            onClick={() => copyToClipboard('999999999', 'plin')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: copied === 'plin' ? '#059669' : '#2563eb', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'all 0.3s',
            }}
          >
            <FaCopy /> {copied === 'plin' ? '¡Copiado!' : 'Copiar número'}
          </button>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.6 }}>
            <strong>📌 Importante:</strong> Luego de realizar el pago, envía el comprobante a nuestro 
            WhatsApp para confirmar tu pedido. Nuestro equipo verificará el pago y activará tu certificación.
          </p>
        </div>

        <Link to="/servicios" style={{
          display: 'block', textAlign: 'center', padding: 14,
          background: '#111', color: '#fff', borderRadius: 12,
          textDecoration: 'none', fontWeight: 600, fontSize: 14,
          fontFamily: "'Poppins', sans-serif", transition: 'all 0.3s',
        }}>
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
};

export default PendingPayment;
