import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { FaSearch, FaBell, FaEnvelope, FaCog, FaChevronDown, FaSignOutAlt, FaUser, FaIdBadge, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTrash, FaHome, FaCalendarAlt, FaCertificate, FaBook, FaComments } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './UserHeader.module.scss';

interface Notification {
  id: string;
  icon: 'bell' | 'check' | 'info' | 'warning';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface Message {
  id: string;
  sender: string;
  initials: string;
  preview: string;
  time: string;
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: 'check', title: 'Curso completado', description: 'Has completado el curso ISO 9001:2025', time: 'Hace 2 horas', read: false },
  { id: '2', icon: 'bell', title: 'Nuevo certificado', description: 'Tu certificado ISO 14001 está listo para descargar', time: 'Hace 5 horas', read: false },
  { id: '3', icon: 'info', title: 'Recordatorio de pago', description: 'Tu suscripción premium vence en 7 días', time: 'Hace 1 día', read: false },
  { id: '4', icon: 'warning', title: 'Actualización disponible', description: 'Nueva versión del curso ISO 45001 disponible', time: 'Hace 2 días', read: true },
  { id: '5', icon: 'bell', title: 'Webinar exclusivo', description: 'Inscríbete al webinar sobre gestión de calidad', time: 'Hace 3 días', read: true },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'Soporte ACS', initials: 'AC', preview: 'Tu consulta sobre el curso ISO 27001 ha sido respondida', time: 'Hace 1 hora', unread: true },
  { id: '2', sender: 'Instructor Carlos', initials: 'CG', preview: 'Te he enviado los materiales adicionales para la próxima clase', time: 'Hace 3 horas', unread: true },
  { id: '3', sender: 'Departamento de Facturación', initials: 'DF', preview: 'Recordatorio: tu factura del mes de mayo está disponible', time: 'Hace 1 día', unread: false },
  { id: '4', sender: 'Equipo de Certificaciones', initials: 'EC', preview: 'Tu certificado ha sido aprobado. Puedes descargarlo desde tu panel', time: 'Hace 2 días', unread: false },
];

const notifIconMap: Record<string, ReactNode> = {
  bell: <FaBell />,
  check: <FaCheckCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />,
};

const notifColorMap: Record<string, string> = {
  bell: '#2563eb',
  check: '#10b981',
  info: '#f59e0b',
  warning: '#dc2626',
};

interface SearchItem {
  id: string;
  section: string;
  label: string;
  description: string;
  keywords: string[];
  icon: ReactNode;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: 'inicio', section: 'inicio', label: 'Inicio', description: 'Dashboard, perfil, cuenta, método de pago, direcciones, ofertas', keywords: ['inicio', 'home', 'dashboard', 'perfil', 'profile', 'cuenta', 'account', 'pago', 'payment', 'tarjeta', 'card', 'direccion', 'address'], icon: <FaHome /> },
  { id: 'calendario', section: 'calendario', label: 'Calendario', description: 'Eventos y actividades programadas', keywords: ['calendario', 'calendar', 'evento', 'event', 'actividad', 'fecha', 'date'], icon: <FaCalendarAlt /> },
  { id: 'certificados', section: 'certificados', label: 'Certificados', description: 'Certificados obtenidos y descargas', keywords: ['certificado', 'certificate', 'certificacion', 'diploma'], icon: <FaCertificate /> },
  { id: 'cursos', section: 'cursos', label: 'Cursos', description: 'Cursos inscritos y disponibles', keywords: ['curso', 'course', 'cursos', 'courses', 'clase', 'class', 'aprender', 'learn'], icon: <FaBook /> },
  { id: 'mensajes', section: 'mensajes', label: 'Mensajes', description: 'Bandeja de mensajes y conversaciones', keywords: ['mensaje', 'message', 'mensajes', 'messages', 'chat', 'bandeja', 'inbox'], icon: <FaComments /> },
];

const UserHeader = ({ onNavigate }: { onNavigate?: (section: string) => void }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SEARCH_ITEMS.filter(item =>
      item.keywords.some(kw => kw.includes(q)) || item.label.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (msgRef.current && !msgRef.current.contains(target)) setMsgOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(target)) setSettingsOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMsgs = messages.filter(m => m.unread).length;

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markMsgRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, unread: false } : m));
  };

  const clearNotifs = () => setNotifications([]);
  const clearMsgs = () => setMessages([]);

  const initials = user?.firstName && user?.lastName ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : 'U';

  const handleNavigate = (section: string) => {
    setProfileOpen(false);
    setNotifOpen(false);
    setMsgOpen(false);
    setSettingsOpen(false);
    onNavigate?.(section);
  };

  return (
    <header className={styles.header}>
      <div className={styles.searchWrap} ref={searchRef}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar secciones..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setSearchFocused(false); (e.target as HTMLInputElement).blur(); }
            }}
          />
        </div>
        {searchFocused && searchQuery.trim() && (
          <div className={styles.searchDropdown}>
            {searchResults.length === 0 ? (
              <div className={styles.searchEmpty}>
                <FaSearch className={styles.searchEmptyIcon} />
                <p>Sin resultados para "<strong>{searchQuery}</strong>"</p>
              </div>
            ) : (
              searchResults.map(item => (
                <button
                  key={item.id}
                  className={styles.searchItem}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchFocused(false);
                    onNavigate?.(item.section);
                  }}
                >
                  <span className={styles.searchItemIcon}>{item.icon}</span>
                  <div className={styles.searchItemContent}>
                    <span className={styles.searchItemLabel}>{item.label}</span>
                    <span className={styles.searchItemDesc}>{item.description}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {/* Notifications */}
        <div className={styles.dropdownWrap} ref={notifRef}>
          <button className={styles.iconBtn} onClick={() => { setNotifOpen(!notifOpen); setMsgOpen(false); setSettingsOpen(false); }} aria-label="Notificaciones">
            <FaBell />
            {unreadNotifs > 0 && <span className={styles.badge}>{unreadNotifs}</span>}
          </button>
          {notifOpen && (
            <div className={styles.dropdownPanel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Notificaciones</h3>
                {notifications.length > 0 && (
                  <button className={styles.panelClear} onClick={clearNotifs}><FaTrash /> Limpiar</button>
                )}
              </div>
              <div className={styles.panelBody}>
                {notifications.length === 0 ? (
                  <div className={styles.panelEmpty}>
                    <FaCheckCircle className={styles.panelEmptyIcon} />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`${styles.panelItem} ${!n.read ? styles.panelItemUnread : ''}`} onClick={() => markNotifRead(n.id)}>
                      <div className={styles.panelItemIcon} style={{ background: `${notifColorMap[n.icon]}18`, color: notifColorMap[n.icon] }}>
                        {notifIconMap[n.icon]}
                      </div>
                      <div className={styles.panelItemContent}>
                        <span className={styles.panelItemTitle}>{n.title}</span>
                        <span className={styles.panelItemDesc}>{n.description}</span>
                        <span className={styles.panelItemTime}>{n.time}</span>
                      </div>
                      {!n.read && <span className={styles.panelDot} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className={styles.dropdownWrap} ref={msgRef}>
          <button className={styles.iconBtn} onClick={() => { setMsgOpen(!msgOpen); setNotifOpen(false); setSettingsOpen(false); }} aria-label="Mensajes">
            <FaEnvelope />
            {unreadMsgs > 0 && <span className={styles.badge}>{unreadMsgs}</span>}
          </button>
          {msgOpen && (
            <div className={styles.dropdownPanel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Mensajes</h3>
                {messages.length > 0 && (
                  <button className={styles.panelClear} onClick={clearMsgs}><FaTrash /> Limpiar</button>
                )}
              </div>
              <div className={styles.panelBody}>
                {messages.length === 0 ? (
                  <div className={styles.panelEmpty}>
                    <FaEnvelope className={styles.panelEmptyIcon} />
                    <p>No hay mensajes</p>
                  </div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`${styles.panelItem} ${m.unread ? styles.panelItemUnread : ''}`} onClick={() => markMsgRead(m.id)}>
                      <div className={styles.msgAvatar}>{m.initials}</div>
                      <div className={styles.panelItemContent}>
                        <span className={styles.panelItemTitle}>{m.sender}</span>
                        <span className={styles.panelItemDesc}>{m.preview}</span>
                        <span className={styles.panelItemTime}>{m.time}</span>
                      </div>
                      {m.unread && <span className={styles.panelDot} />}
                    </div>
                  ))
                )}
              </div>
              <div className={styles.panelFooter}>
                <button className={styles.panelFooterBtn} onClick={() => handleNavigate('mensajes')}>Ver todos los mensajes</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className={styles.dropdownWrap} ref={settingsRef}>
          <button className={styles.iconBtn} onClick={() => { setSettingsOpen(!settingsOpen); setNotifOpen(false); setMsgOpen(false); }} aria-label="Configuración">
            <FaCog />
          </button>
          {settingsOpen && (
            <div className={styles.settingsDropdown}>
              <div className={styles.settingsHeader}>
                <FaCog /> Configuración
              </div>
              <button className={styles.settingsItem} onClick={() => handleNavigate('inicio')}>
                <FaUser /> Editar Perfil
              </button>
              <div className={styles.dropdownDivider} />
              <button className={styles.settingsItem} onClick={() => handleNavigate('inicio')}>
                <FaIdBadge /> Datos de Cuenta
              </button>
              <div className={styles.dropdownDivider} />
              <button className={styles.settingsItem} onClick={() => handleNavigate('inicio')}>
                <FaEnvelope /> Preferencias de Notificaciones
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.userMenu} ref={profileRef}>
          <button className={styles.userBtn} onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setMsgOpen(false); setSettingsOpen(false); }}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
              <span className={styles.userRole}>{user?.role === 'SALES' ? 'Ventas' : 'Usuario'}</span>
            </div>
            <FaChevronDown className={`${styles.chevron} ${profileOpen ? styles.chevronOpen : ''}`} />
          </button>

          {profileOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownUser}>
                <div className={styles.dropdownAvatar}>{initials}</div>
                <div>
                  <span className={styles.dropdownName}>{user?.firstName} {user?.lastName}</span>
                  <span className={styles.dropdownEmail}>{user?.email}</span>
                </div>
              </div>
              <div className={styles.dropdownDivider} />
              <button onClick={() => handleNavigate('inicio')} className={styles.dropdownItem}>
                <FaUser /> Mi Perfil
              </button>
              <button onClick={() => handleNavigate('inicio')} className={styles.dropdownItem}>
                <FaIdBadge /> Mi Cuenta
              </button>
              <div className={styles.dropdownDivider} />
              <button onClick={() => { logout(); window.location.href = '/login'; }} className={styles.dropdownItem}>
                <FaSignOutAlt /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
