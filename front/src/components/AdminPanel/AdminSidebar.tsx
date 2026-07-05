import { useState, useEffect } from 'react';
import { FaTachometerAlt, FaUsers, FaBox, FaShoppingCart, FaHeadset, FaUserShield, FaHistory, FaShieldAlt, FaCog, FaChevronLeft, FaChevronRight, FaBell, FaMoon, FaSun, FaDollarSign, FaChartBar } from 'react-icons/fa';
import { fetchUnreadCount } from '../../services/notificationsApi';
import styles from './AdminSidebar.module.scss';

const sections = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { key: 'finanzas', label: 'Finanzas', icon: <FaDollarSign /> },
  { key: 'notificaciones', label: 'Notificaciones', icon: <FaBell /> },
  { key: 'usuarios', label: 'Usuarios', icon: <FaUsers /> },
  { key: 'productos', label: 'Productos', icon: <FaBox /> },
  { key: 'pedidos', label: 'Pedidos', icon: <FaShoppingCart /> },
  { key: 'soporte', label: 'Soporte Técnico', icon: <FaHeadset /> },
  { key: 'roles', label: 'Roles y Permisos', icon: <FaUserShield /> },
  { key: 'auditoria', label: 'Auditoría', icon: <FaHistory /> },
  { key: 'seguridad', label: 'Seguridad', icon: <FaShieldAlt /> },
  { key: 'configuracion', label: 'Configuración', icon: <FaCog /> },
  { key: 'reportes', label: 'Reportes', icon: <FaChartBar /> },
];

interface Props {
  active: string; onSelect: (key: string) => void;
  collapsed: boolean; onToggle: () => void;
  mobileOpen: boolean; onMobileClose: () => void;
}

const AdminSidebar = ({ active, onSelect, collapsed, onToggle, mobileOpen, onMobileClose }: Props) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    fetchUnreadCount().then(setUnreadCount).catch(() => {});
    const interval = setInterval(() => fetchUnreadCount().then(setUnreadCount).catch(() => {}), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logo}>
          {!collapsed && <span className={styles.logoText}><FaCog /> Admin Panel</span>}
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
              {s.key === 'notificaciones' && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className={styles.footer}>
          <button className={styles.darkModeBtn} onClick={toggleDarkMode} title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </button>
        </div>
      </aside>
      {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}
    </>
  );
};

export default AdminSidebar;
