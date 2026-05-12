import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaBell, FaEnvelope, FaCog, FaChevronDown, FaSignOutAlt, FaUser, FaIdBadge } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './UserHeader.module.scss';

const UserHeader = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : 'U';

  return (
    <header className={styles.header}>
      <div className={styles.searchBar}>
        <FaSearch className={styles.searchIcon} />
        <input type="text" placeholder="Buscar..." className={styles.searchInput} />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Notificaciones">
          <FaBell />
          <span className={styles.badge}>3</span>
        </button>
        <button className={styles.iconBtn} aria-label="Mensajes">
          <FaEnvelope />
          <span className={styles.badge}>1</span>
        </button>
        <button className={styles.iconBtn} aria-label="Configuración">
          <FaCog />
        </button>

        <div className={styles.userMenu} ref={ref}>
          <button className={styles.userBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
              <span className={styles.userRole}>Usuario</span>
            </div>
            <FaChevronDown className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <a href="/panel" className={styles.dropdownItem}><FaUser /> Mi Perfil</a>
              <a href="/panel" className={styles.dropdownItem}><FaIdBadge /> Mi Cuenta</a>
              <div className={styles.dropdownDivider} />
              <button onClick={logout} className={styles.dropdownItem}><FaSignOutAlt /> Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
