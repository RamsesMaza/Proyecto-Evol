import { useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaChartLine, FaChartBar, FaCog, FaSignOutAlt, FaChevronLeft, FaTimes, FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './SalesSidebar.module.scss';

const menuItems = [
  { key: 'inicio', label: 'Inicio', icon: <FaHome /> },
  { key: 'clientes', label: 'Clientes', icon: <FaUsers /> },
  { key: 'ventas', label: 'Ventas', icon: <FaChartLine /> },
  { key: 'reportes', label: 'Reportes', icon: <FaChartBar /> },
  { key: 'configuracion', label: 'Configuración', icon: <FaCog /> },
] as const;

interface SalesSidebarProps {
  active: string;
  onSelect: (key: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const SalesSidebar = ({ active, onSelect, collapsed, onToggle, mobileOpen, onMobileClose }: SalesSidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logo}>
          {!collapsed && <span className={styles.logoText}>ACS Ventas</span>}
          <button className={styles.collapseBtn} onClick={onToggle} aria-label="Colapsar sidebar">
            {collapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onSelect(item.key); onMobileClose(); }}
              className={`${styles.navItem} ${active === item.key ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {active === item.key && <span className={styles.activeDot} />}
            </button>
          ))}
        </nav>

        <div className={styles.footer}>
          <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
            <span className={styles.navIcon}><FaSignOutAlt /></span>
            {!collapsed && <span className={styles.navLabel}>Cerrar Sesión</span>}
          </button>
        </div>

        {!collapsed && (
          <button className={styles.mobileClose} onClick={onMobileClose} aria-label="Cerrar sidebar">
            <FaTimes />
          </button>
        )}
      </aside>
    </>
  );
};

export default SalesSidebar;
