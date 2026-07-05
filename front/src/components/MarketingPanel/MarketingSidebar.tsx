import { FaTachometerAlt, FaUsers, FaBullhorn, FaLayerGroup, FaEnvelope, FaSms, FaChartBar, FaChevronLeft, FaChevronRight, FaMoon, FaSun, FaBullseye, FaCertificate } from 'react-icons/fa';
import styles from './MarketingSidebar.module.scss';

const sections = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { key: 'leads', label: 'Leads', icon: <FaUsers /> },
  { key: 'campaigns', label: 'Campañas', icon: <FaBullhorn /> },
  { key: 'segmentacion', label: 'Segmentación', icon: <FaLayerGroup /> },
  { key: 'email', label: 'Email Marketing', icon: <FaEnvelope /> },
  { key: 'sms', label: 'SMS Marketing', icon: <FaSms /> },
  { key: 'certificados', label: 'Certificados', icon: <FaCertificate /> },
  { key: 'reportes', label: 'Reportes', icon: <FaChartBar /> },
];

interface Props {
  active: string; onSelect: (key: string) => void;
  collapsed: boolean; onToggle: () => void;
  mobileOpen: boolean; onMobileClose: () => void;
  darkMode: boolean; onDarkModeToggle: () => void;
}

const MarketingSidebar = ({ active, onSelect, collapsed, onToggle, mobileOpen, onMobileClose, darkMode, onDarkModeToggle }: Props) => (
  <>
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.logo}>
        {!collapsed && <span className={styles.logoText}><FaBullseye /> Marketing</span>}
        <button className={styles.collapseBtn} onClick={onToggle} title={collapsed ? 'Expandir' : 'Colapsar'}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      <nav className={styles.nav}>
        {sections.map(s => (
          <button key={s.key} className={`${styles.navItem} ${active === s.key ? styles.navItemActive : ''}`}
            onClick={() => { onSelect(s.key); if (mobileOpen) onMobileClose(); }} title={collapsed ? s.label : undefined}>
            <span className={styles.navIcon}>{s.icon}</span>
            {!collapsed && <span className={styles.navLabel}>{s.label}</span>}
          </button>
        ))}
      </nav>
      <div className={styles.footer}>
        <button className={styles.darkModeBtn} onClick={onDarkModeToggle} title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}>
          {darkMode ? <FaSun /> : <FaMoon />}
          {!collapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
        </button>
      </div>
    </aside>
    {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}
  </>
);

export default MarketingSidebar;
