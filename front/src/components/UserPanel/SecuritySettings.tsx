import { useState, useEffect, useCallback } from 'react';
import { FaShieldAlt, FaCheck, FaTimes, FaExclamationTriangle, FaSpinner, FaMobile, FaEnvelope, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './SecuritySettings.module.scss';

function getToken() { return localStorage.getItem('token'); }
function authHeaders(): Record<string, string> { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }
async function api(path: string, opts?: RequestInit) {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...authHeaders() };
  if (opts?.headers && typeof opts.headers === 'object' && !Array.isArray(opts.headers)) {
    Object.assign(h, opts.headers);
  }
  const res = await fetch(`/api/auth${path}`, { ...opts, headers: h });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Error' })); throw new Error(err.error || 'Error'); }
  return res.json();
}

const SecuritySettings = () => {
  const { user, updateUser } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<string>('email');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [step, setStep] = useState<'idle' | 'setup' | 'verify_phone' | 'confirm'>('idle');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const codeInputsRef = useState<(HTMLInputElement | null)[]>([])[0];

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api('/2fa/status');
      setEnabled(res.twoFactorEnabled);
      setMethod(res.twoFactorMethod || 'email');
      setPhone(res.phone || '');
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => { setMsg(text); setMsgType(type); };

  const handleStartSetup = async (selectedMethod: string) => {
    setSaving(true);
    try {
      const res = await api('/2fa/setup', { method: 'POST', body: JSON.stringify({ method: selectedMethod, phone: selectedMethod === 'sms' ? phone : undefined }) });
      if (selectedMethod === 'authenticator') {
        setQrCode(res.qrCode);
        setSecret(res.secret);
        setMethod('authenticator');
        setStep('confirm');
      } else if (selectedMethod === 'sms') {
        setMethod('sms');
        setStep('verify_phone');
        showMsg('Código de verificación enviado a tu teléfono');
      } else {
        setMethod('email');
        setStep('confirm');
        showMsg('Método configurado. Ingresa el código de verificación.');
      }
    } catch (e: any) { showMsg(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleConfirm2FA = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) { showMsg('Ingresa el código completo de 6 dígitos', 'error'); return; }
    setSaving(true);
    try {
      await api('/2fa/confirm', { method: 'POST', body: JSON.stringify({ method, code: fullCode }) });
      setEnabled(true);
      setStep('idle');
      showMsg('Autenticación de dos factores activada exitosamente');
      updateUser({ phone: method === 'sms' ? phone : user?.phone });
    } catch (e: any) { showMsg(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDisable = async () => {
    if (!confirmPassword) { showMsg('Ingresa tu contraseña para desactivar 2FA', 'error'); return; }
    setSaving(true);
    try {
      await api('/2fa/disable', { method: 'POST', body: JSON.stringify({ password: confirmPassword }) });
      setEnabled(false);
      setConfirmPassword('');
      setStep('idle');
      showMsg('2FA desactivado');
    } catch (e: any) { showMsg(e.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className={styles.module}><div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div></div>;

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaShieldAlt /></div>
          <div><h2 className={styles.title}>Seguridad de la Cuenta</h2><p className={styles.subtitle}>Autenticación de Dos Factores (2FA)</p></div>
        </div>
      </div>

      {msg && <div className={`${styles.msg} ${msgType === 'error' ? styles.msgError : styles.msgSuccess}`}><FaExclamationTriangle /> {msg}</div>}

      <div className={styles.card}>
        <div className={styles.statusRow}>
          <div className={styles.statusInfo}>
            <h3>Autenticación de Dos Factores</h3>
            <p>Añade una capa extra de seguridad a tu cuenta. Cada vez que inicies sesión, se te pedirá un código de verificación adicional.</p>
          </div>
          <div className={`${styles.statusBadge} ${enabled ? styles.statusOn : styles.statusOff}`}>
            {enabled ? <><FaCheck /> Activado</> : <><FaTimes /> Desactivado</>}
          </div>
        </div>

        {!enabled && step === 'idle' && (
          <div className={styles.methodsGrid}>
            <button className={styles.methodCard} onClick={() => handleStartSetup('email')} disabled={saving}>
              <FaEnvelope className={styles.methodIcon} />
              <span className={styles.methodName}>Correo Electrónico</span>
              <span className={styles.methodDesc}>Recibirás un código en tu correo</span>
            </button>
            <button className={styles.methodCard} onClick={() => { setStep('setup'); setMethod('sms'); }} disabled={saving}>
              <FaMobile className={styles.methodIcon} />
              <span className={styles.methodName}>SMS</span>
              <span className={styles.methodDesc}>Recibirás un código por mensaje de texto</span>
            </button>
            <button className={styles.methodCard} onClick={() => handleStartSetup('authenticator')} disabled={saving}>
              <FaQrcode className={styles.methodIcon} />
              <span className={styles.methodName}>App de Autenticación</span>
              <span className={styles.methodDesc}>Google Authenticator, Authy, etc.</span>
            </button>
          </div>
        )}

        {!enabled && step === 'setup' && method === 'sms' && (
          <div className={styles.setupForm}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#0f172a' }}>Configurar SMS</h4>
            <div className={styles.field}>
              <label>Número de Teléfono (formato internacional: +51999999999)</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+51999999999" />
            </div>
            <button className={styles.btnPrimary} onClick={() => handleStartSetup('sms')} disabled={saving || !phone}>
              {saving ? 'Enviando...' : 'Enviar Código de Verificación'}
            </button>
          </div>
        )}

        {!enabled && step === 'verify_phone' && (
          <div className={styles.setupForm}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#0f172a' }}>Verificar Teléfono</h4>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Ingresa el código de 6 dígitos enviado a {phone}</p>
            <div className={styles.codeInputs}>
              {code.map((d, i) => (
                <input key={i} ref={(el: HTMLInputElement | null) => { codeInputsRef[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => { const nc = [...code]; nc[i] = e.target.value.replace(/\D/g, ''); setCode(nc); if (e.target.value && i < 5) codeInputsRef[i + 1]?.focus(); }}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) codeInputsRef[i - 1]?.focus(); }}
                  className={styles.codeInput} />
              ))}
            </div>
            <button className={styles.btnPrimary} onClick={handleConfirm2FA} disabled={saving || code.join('').length !== 6}>
              {saving ? 'Verificando...' : 'Verificar y Activar 2FA'}
            </button>
          </div>
        )}

        {!enabled && step === 'confirm' && method === 'authenticator' && (
          <div className={styles.setupForm}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#0f172a' }}>Configurar App de Autenticación</h4>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Escanea el código QR con tu app de autenticación (Google Authenticator, Authy, etc.)</p>
            {qrCode && <div className={styles.qrWrap}><img src={qrCode} alt="Código QR" className={styles.qrImage} /></div>}
            {secret && <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '8px 0' }}>O ingresa manualmente: <code style={{ fontWeight: 700, color: '#0f172a' }}>{secret}</code></p>}
            <div className={styles.codeInputs} style={{ marginTop: 16 }}>
              {code.map((d, i) => (
                <input key={i} ref={(el: HTMLInputElement | null) => { codeInputsRef[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => { const nc = [...code]; nc[i] = e.target.value.replace(/\D/g, ''); setCode(nc); if (e.target.value && i < 5) codeInputsRef[i + 1]?.focus(); }}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) codeInputsRef[i - 1]?.focus(); }}
                  className={styles.codeInput} />
              ))}
            </div>
            <button className={styles.btnPrimary} onClick={handleConfirm2FA} disabled={saving || code.join('').length !== 6}>
              {saving ? 'Verificando...' : 'Verificar y Activar 2FA'}
            </button>
          </div>
        )}

        {!enabled && step === 'confirm' && method === 'email' && (
          <div className={styles.setupForm}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#0f172a' }}>Verificar Correo Electrónico</h4>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Ingresa el código de 6 dígitos enviado a tu correo</p>
            <div className={styles.codeInputs}>
              {code.map((d, i) => (
                <input key={i} ref={(el: HTMLInputElement | null) => { codeInputsRef[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => { const nc = [...code]; nc[i] = e.target.value.replace(/\D/g, ''); setCode(nc); if (e.target.value && i < 5) codeInputsRef[i + 1]?.focus(); }}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) codeInputsRef[i - 1]?.focus(); }}
                  className={styles.codeInput} />
              ))}
            </div>
            <button className={styles.btnPrimary} onClick={handleConfirm2FA} disabled={saving || code.join('').length !== 6}>
              {saving ? 'Verificando...' : 'Verificar y Activar 2FA'}
            </button>
          </div>
        )}

        {enabled && (
          <div className={styles.disableSection}>
            <div className={styles.field}>
              <label>Ingresa tu contraseña para desactivar 2FA</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Contraseña actual" />
            </div>
            <button className={styles.btnDanger} onClick={handleDisable} disabled={saving || !confirmPassword}>
              {saving ? 'Desactivando...' : 'Desactivar 2FA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;
