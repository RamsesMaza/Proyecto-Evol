import { FaTachometerAlt, FaUsers, FaUserShield, FaHeadset, FaHistory, FaShieldAlt, FaChevronLeft, FaChevronRight, FaCog, FaChartBar } from 'react-icons/fa';
import styles from './AdminTiSidebar.module.scss';

const sections = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { key: 'usuarios', label: 'Usuarios', icon: <FaUsers /> },
  { key: 'roles', label: 'Roles y Permisos', icon: <FaUserShield /> },
  { key: 'soporte', label: 'Soporte Técnico', icon: <FaHeadset /> },
  { key: 'auditoria', label: 'Auditoría', icon: <FaHistory /> },
  { key: 'seguridad', label: 'Seguridad', icon: <FaShieldAlt /> },
  { key: 'reportes', label: 'Reportes', icon: <FaChartBar /> },
];

interface Props {
  active: string;
  onSelect: (key: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const AdminTiSidebar = ({ active, onSelect, collapsed, onToggle, mobileOpen, onMobileClose }: Props) => {
  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logo}>
          {!collapsed && <span className={styles.logoText}>TI Panel</span>}
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
          {!collapsed && <span className={styles.footerText}><FaCog /> Panel TI v1.0</span>}
        </div>
      </aside>
      {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}
    </>
  );
};

export default AdminTiSidebar;
