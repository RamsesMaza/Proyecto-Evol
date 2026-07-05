import { useState, useEffect, useCallback } from 'react';
import { FaCog, FaSpinner, FaSave, FaExclamationTriangle, FaSyncAlt, FaGlobe, FaDollarSign, FaCalendarAlt, FaShieldAlt, FaEnvelope, FaSms, FaDatabase, FaBuilding, FaImage, FaClock, FaCheck } from 'react-icons/fa';
import { fetchSettings, saveSettings } from '../../services/settingsApi';
import styles from './AdminConfig.module.scss';

const AdminConfig = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true); setError(''); setSettings(await fetchSettings()); }
    catch { setError('Error al cargar configuraciones'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try { await saveSettings(settings); setSuccess('Configuraciones guardadas correctamente'); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const sections = [
    { title: 'Información de la Empresa', icon: <FaBuilding />, color: '#3b82f6',
      fields: [
        { key: 'company_name', label: 'Nombre de la empresa', type: 'text', placeholder: 'Mi Empresa SAC' },
        { key: 'company_logo', label: 'URL del Logo', type: 'text', placeholder: 'https://ejemplo.com/logo.png' },
        { key: 'company_email', label: 'Email de contacto', type: 'email', placeholder: 'contacto@empresa.com' },
        { key: 'company_phone', label: 'Teléfono', type: 'text', placeholder: '+51 999 999 999' },
        { key: 'company_address', label: 'Dirección', type: 'text', placeholder: 'Av. Principal 123' },
      ] },
    { title: 'Configuración Regional', icon: <FaGlobe />, color: '#10b981',
      fields: [
        { key: 'timezone', label: 'Zona Horaria', type: 'select',
          options: ['America/Lima', 'America/Mexico_City', 'America/Argentina/Buenos_Aires', 'America/Bogota', 'America/Santiago', 'UTC'],
          placeholder: 'America/Lima' },
        { key: 'currency', label: 'Moneda', type: 'select',
          options: ['PEN (S/)', 'USD ($)', 'EUR (€)', 'MXN ($)', 'COP ($)', 'CLP ($)'],
          placeholder: 'PEN (S/)' },
        { key: 'date_format', label: 'Formato de Fecha', type: 'select',
          options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
          placeholder: 'DD/MM/YYYY' },
        { key: 'language', label: 'Idioma', type: 'select',
          options: ['es', 'en'], placeholder: 'es' },
      ] },
    { title: 'Seguridad', icon: <FaShieldAlt />, color: '#8b5cf6',
      fields: [
        { key: 'password_min_length', label: 'Longitud mínima de contraseña', type: 'number', placeholder: '8' },
        { key: 'max_login_attempts', label: 'Intentos máximos de login', type: 'number', placeholder: '5' },
        { key: 'session_timeout_minutes', label: 'Tiempo de sesión (minutos)', type: 'number', placeholder: '60' },
        { key: 'two_factor_required', label: '2FA obligatorio', type: 'select',
          options: ['false', 'true'], placeholder: 'false' },
        { key: 'auto_lock_minutes', label: 'Bloqueo automático (minutos)', type: 'number', placeholder: '30' },
      ] },
    { title: 'Correo Electrónico', icon: <FaEnvelope />, color: '#f59e0b',
      fields: [
        { key: 'smtp_host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
        { key: 'smtp_port', label: 'SMTP Puerto', type: 'number', placeholder: '587' },
        { key: 'smtp_user', label: 'SMTP Usuario', type: 'text', placeholder: 'correo@gmail.com' },
        { key: 'smtp_from_name', label: 'Nombre remitente', type: 'text', placeholder: 'Mi Empresa' },
      ] },
    { title: 'SMS / Twilio', icon: <FaSms />, color: '#ec4899',
      fields: [
        { key: 'twilio_phone', label: 'Número Twilio', type: 'text', placeholder: '+15551234567' },
        { key: 'sms_enabled', label: 'SMS Habilitado', type: 'select',
          options: ['false', 'true'], placeholder: 'false' },
      ] },
  ];

  if (loading) return <div className={styles.module}><div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div></div>;

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaCog /></div>
          <div><h2 className={styles.title}>Configuración del Sistema</h2><p className={styles.subtitle}>Personaliza los ajustes de tu plataforma</p></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
          <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
            {saving ? <><FaSpinner className={styles.spinnerSmall} /> Guardando...</> : <><FaSave /> Guardar Cambios</>}
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error}</div>}
      {success && <div className={styles.successMsg}><FaCheck /> {success}</div>}

      <div className={styles.grid}>
        {sections.map(s => (
          <div key={s.title} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <h3 className={styles.cardTitle}>{s.title}</h3>
            </div>
            <div className={styles.cardBody}>
              {s.fields.map(f => (
                <div key={f.key} className={styles.field}>
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.saveBar}>
        <button className={styles.btnSaveLarge} onClick={handleSave} disabled={saving}>
          {saving ? <><FaSpinner className={styles.spinnerSmall} /> Guardando...</> : <><FaSave /> Guardar todas las configuraciones</>}
        </button>
      </div>
    </div>
  );
};

export default AdminConfig;
