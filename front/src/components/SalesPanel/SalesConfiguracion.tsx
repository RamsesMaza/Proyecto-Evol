import { useState, useEffect } from 'react';
import { FaCog, FaUser, FaFileInvoiceDollar, FaBell, FaEye, FaSave, FaCheckCircle, FaPercentage, FaDollarSign, FaEnvelope, FaSms, FaList, FaSun, FaMoon, FaTag, FaFileAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { updateMyProfile } from '../../services/clientesApi';
import styles from './SalesConfiguracion.module.scss';

interface CotizacionConfig {
  defaultTax: number;
  defaultTerms: string;
  defaultPaymentMethod: string;
  currency: string;
}

interface NotificationPrefs {
  emailNewClient: boolean;
  emailCotizacionCreated: boolean;
  emailCotizacionApproved: boolean;
  smsNewClient: boolean;
  smsCotizacionUpdates: boolean;
}

interface DisplayPrefs {
  itemsPerPage: number;
  darkMode: boolean;
}

interface VendorProfile {
  phone: string;
  company: string;
}

const defaultCotConfig: CotizacionConfig = {
  defaultTax: 18,
  defaultTerms: 'Pago contra entrega. Válido por 30 días.',
  defaultPaymentMethod: 'yape',
  currency: 'S/',
};

const defaultNotifPrefs: NotificationPrefs = {
  emailNewClient: true,
  emailCotizacionCreated: true,
  emailCotizacionApproved: false,
  smsNewClient: false,
  smsCotizacionUpdates: true,
};

const defaultDisplayPrefs: DisplayPrefs = {
  itemsPerPage: 10,
  darkMode: false,
};

const paymentMethods = [
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
];

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function save<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

const SalesConfiguracion = () => {
  const { user, updateUser } = useAuth();

  const [cotConfig, setCotConfig] = useState<CotizacionConfig>(() => load('sales_cotConfig', defaultCotConfig));
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() => load('sales_notifPrefs', defaultNotifPrefs));
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPrefs>(() => load('sales_displayPrefs', defaultDisplayPrefs));
  const [vendorProfile, setVendorProfile] = useState<VendorProfile>(() => load('sales_vendorProfile', { phone: user?.phone || '', company: user?.company || '' }));
  const [saved, setSaved] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => { if (saved) { const t = setTimeout(() => setSaved(''), 2000); return () => clearTimeout(t); } }, [saved]);

  useEffect(() => {
    const prefs = load<DisplayPrefs>('sales_displayPrefs', defaultDisplayPrefs);
    document.documentElement.setAttribute('data-theme', prefs.darkMode ? 'dark' : 'light');
  }, []);

  const applyTheme = (dark: boolean) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    try {
      const result = await updateMyProfile({
        phone: vendorProfile.phone,
        company: vendorProfile.company,
      });
      save('sales_vendorProfile', vendorProfile);
      updateUser({ phone: result.phone, company: result.company });
      setSaved('Perfil actualizado en el servidor');
    } catch (err: any) {
      setProfileError(err.message || 'Error al guardar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSave = (key: string, data: any, setter: (d: any) => void) => {
    setter(data);
    save(`sales_${key}`, data);
    if (key === 'displayPrefs') applyTheme((data as DisplayPrefs).darkMode);
    setSaved('Configuración guardada');
  };

  return (
    <div className={styles.configModule}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaCog /></div>
          <div>
            <h2 className={styles.title}>Configuración</h2>
            <p className={styles.subtitle}>Personaliza tu panel de ventas</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className={styles.toast}>
          <FaCheckCircle /> {saved}
        </div>
      )}

      <div className={styles.grid2}>
        {/* Vendor Profile */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaUser /> Perfil del Vendedor</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Nombre</label>
              <input className={styles.fieldInput} value={`${user?.firstName || ''} ${user?.lastName || ''}`} disabled />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email</label>
              <input className={styles.fieldInput} value={user?.email || ''} disabled />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Teléfono</label>
              <input
                className={styles.fieldInput}
                value={vendorProfile.phone}
                onChange={e => setVendorProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+51 999 888 777"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Empresa / Representación</label>
              <input
                className={styles.fieldInput}
                value={vendorProfile.company}
                onChange={e => setVendorProfile(p => ({ ...p, company: e.target.value }))}
                placeholder="ACS Certification"
              />
            </div>
            {profileError && (
              <div style={{ color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaExclamationTriangle /> {profileError}
              </div>
            )}
            <button className={styles.btnPrimary} onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? <><FaSpinner className={styles.spinner} /> Guardando...</> : <><FaSave /> Guardar Perfil</>}
            </button>
          </div>
        </div>

        {/* Cotizaciones Config */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaFileInvoiceDollar /> Cotizaciones</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><FaPercentage /> Impuesto por defecto (%)</label>
              <input
                className={styles.fieldInput}
                type="number"
                min={0}
                max={100}
                value={cotConfig.defaultTax}
                onChange={e => setCotConfig(c => ({ ...c, defaultTax: Number(e.target.value) }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><FaDollarSign /> Moneda</label>
              <select className={styles.fieldSelect} value={cotConfig.currency} onChange={e => setCotConfig(c => ({ ...c, currency: e.target.value }))}>
                <option value="S/">S/ — Sol (PEN)</option>
                <option value="$">$ — Dólar (USD)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><FaTag /> Método de pago predeterminado</label>
              <select className={styles.fieldSelect} value={cotConfig.defaultPaymentMethod} onChange={e => setCotConfig(c => ({ ...c, defaultPaymentMethod: e.target.value }))}>
                {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><FaFileAlt /> Términos y condiciones</label>
              <textarea
                className={styles.fieldTextarea}
                rows={3}
                value={cotConfig.defaultTerms}
                onChange={e => setCotConfig(c => ({ ...c, defaultTerms: e.target.value }))}
              />
            </div>
            <button className={styles.btnPrimary} onClick={() => handleSave('cotConfig', cotConfig, setCotConfig)}>
              <FaSave /> Guardar Configuración
            </button>
          </div>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Notification Preferences */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaBell /> Notificaciones</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.toggleGroup}>
              <span className={styles.toggleGroupLabel}><FaEnvelope /> Correo electrónico</span>
              <label className={styles.toggleRow}>
                <span>Nuevo cliente registrado</span>
                <input type="checkbox" checked={notifPrefs.emailNewClient} onChange={e => setNotifPrefs(p => ({ ...p, emailNewClient: e.target.checked }))} />
                <span className={styles.toggleTrack}><span className={`${styles.toggleThumb} ${notifPrefs.emailNewClient ? styles.toggleOn : ''}`} /></span>
              </label>
              <label className={styles.toggleRow}>
                <span>Cotización creada</span>
                <input type="checkbox" checked={notifPrefs.emailCotizacionCreated} onChange={e => setNotifPrefs(p => ({ ...p, emailCotizacionCreated: e.target.checked }))} />
                <span className={styles.toggleTrack}><span className={`${styles.toggleThumb} ${notifPrefs.emailCotizacionCreated ? styles.toggleOn : ''}`} /></span>
              </label>
              <label className={styles.toggleRow}>
                <span>Cotización aprobada</span>
                <input type="checkbox" checked={notifPrefs.emailCotizacionApproved} onChange={e => setNotifPrefs(p => ({ ...p, emailCotizacionApproved: e.target.checked }))} />
                <span className={styles.toggleTrack}><span className={`${styles.toggleThumb} ${notifPrefs.emailCotizacionApproved ? styles.toggleOn : ''}`} /></span>
              </label>
            </div>
            <div className={styles.toggleDivider} />
            <div className={styles.toggleGroup}>
              <span className={styles.toggleGroupLabel}><FaSms /> SMS</span>
              <label className={styles.toggleRow}>
                <span>Nuevo cliente registrado</span>
                <input type="checkbox" checked={notifPrefs.smsNewClient} onChange={e => setNotifPrefs(p => ({ ...p, smsNewClient: e.target.checked }))} />
                <span className={styles.toggleTrack}><span className={`${styles.toggleThumb} ${notifPrefs.smsNewClient ? styles.toggleOn : ''}`} /></span>
              </label>
              <label className={styles.toggleRow}>
                <span>Actualizaciones de cotización</span>
                <input type="checkbox" checked={notifPrefs.smsCotizacionUpdates} onChange={e => setNotifPrefs(p => ({ ...p, smsCotizacionUpdates: e.target.checked }))} />
                <span className={styles.toggleTrack}><span className={`${styles.toggleThumb} ${notifPrefs.smsCotizacionUpdates ? styles.toggleOn : ''}`} /></span>
              </label>
            </div>
            <button className={styles.btnPrimary} onClick={() => handleSave('notifPrefs', notifPrefs, setNotifPrefs)} style={{ marginTop: 16 }}>
              <FaSave /> Guardar Preferencias
            </button>
          </div>
        </div>

        {/* Display Preferences */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaEye /> Visualización</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><FaList /> Items por página</label>
              <select className={styles.fieldSelect} value={displayPrefs.itemsPerPage} onChange={e => setDisplayPrefs(p => ({ ...p, itemsPerPage: Number(e.target.value) }))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><FaSun /> Tema</label>
              <div className={styles.themeToggle}>
                <button
                  className={`${styles.themeBtn} ${!displayPrefs.darkMode ? styles.themeBtnActive : ''}`}
                  onClick={() => setDisplayPrefs(p => ({ ...p, darkMode: false }))}
                >
                  <FaSun /> Claro
                </button>
                <button
                  className={`${styles.themeBtn} ${displayPrefs.darkMode ? styles.themeBtnActive : ''}`}
                  onClick={() => setDisplayPrefs(p => ({ ...p, darkMode: true }))}
                >
                  <FaMoon /> Oscuro
                </button>
              </div>
            </div>
            <button className={styles.btnPrimary} onClick={() => handleSave('displayPrefs', displayPrefs, setDisplayPrefs)}>
              <FaSave /> Guardar Preferencias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesConfiguracion;
