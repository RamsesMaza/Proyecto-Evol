import { useNavigate } from 'react-router-dom';
import { FaHome, FaCertificate, FaBook, FaCalendarAlt, FaEnvelope, FaSignOutAlt, FaChevronLeft, FaTimes, FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.scss';

const menuItems = [
  { key: 'inicio', label: 'Inicio', icon: <FaHome /> },
  { key: 'cursos', label: 'Cursos', icon: <FaBook /> },
  { key: 'certificados', label: 'Certificados', icon: <FaCertificate /> },
  { key: 'calendario', label: 'Calendario', icon: <FaCalendarAlt /> },
  { key: 'mensajes', label: 'Mensajes', icon: <FaEnvelope /> },
] as const;

interface SidebarProps {
  active: string;
  onSelect: (key: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar = ({ active, onSelect, collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) => {
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
          {!collapsed && <span className={styles.logoText}>ACS Panel</span>}
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

export default Sidebar;
