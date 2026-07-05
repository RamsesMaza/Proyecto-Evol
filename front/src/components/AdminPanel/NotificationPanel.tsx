import { useState, useEffect, useCallback } from 'react';
import { FaBell, FaCheck, FaTrash, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaEnvelope, FaLayerGroup, FaSyncAlt } from 'react-icons/fa';
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, type Notification } from '../../services/notificationsApi';
import styles from './NotificationPanel.module.scss';

const typeStyles: Record<string, { icon: JSX.Element; color: string }> = {
  info: { icon: <FaInfoCircle />, color: '#3b82f6' },
  warning: { icon: <FaExclamationTriangle />, color: '#f59e0b' },
  error: { icon: <FaTimesCircle />, color: '#ef4444' },
  success: { icon: <FaCheckCircle />, color: '#10b981' },
  security: { icon: <FaBell />, color: '#8b5cf6' },
};

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true);
      const data = await fetchMyNotifications({
        type: typeFilter || undefined,
        read: readFilter || undefined,
        pageSize: 50,
      });
      setNotifications(data.notifications); setTotal(data.total);
    } catch { setActionMsg('Error al cargar notificaciones'); }
    finally { setLoading(false); }
  }, [typeFilter, readFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 2500); return () => clearTimeout(t); } }, [actionMsg]);

  const handleMarkRead = async (id: number) => {
    try { await markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)); }
    catch { setActionMsg('Error al marcar'); }
  };

  const handleMarkAllRead = async () => {
    try { await markAllNotificationsRead(); setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))); setActionMsg('Todas marcadas como leídas'); }
    catch { setActionMsg('Error al marcar todas'); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteNotification(id); setNotifications(prev => prev.filter(n => n.id !== id)); setTotal(prev => prev - 1); }
    catch { setActionMsg('Error al eliminar'); }
  };

  const unread = notifications.filter(n => !n.readAt).length;

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaBell /></div>
          <div><h2 className={styles.title}>Centro de Notificaciones</h2><p className={styles.subtitle}>{total} notificaciones · {unread} sin leer</p></div>
        </div>
        <div className={styles.headerActions}>
          {unread > 0 && <button className={styles.btnOutline} onClick={handleMarkAllRead}><FaCheck /> Marcar todas leídas</button>}
          <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
        </div>
      </div>

      {actionMsg && <div className={styles.toast}>{actionMsg}</div>}

      <div className={styles.filterBar}>
        <select className={styles.filterSelect} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); }}>
          <option value="">Todos los tipos</option>
          <option value="info">Info</option><option value="success">Éxito</option>
          <option value="warning">Advertencia</option><option value="error">Error</option>
          <option value="security">Seguridad</option>
        </select>
        <select className={styles.filterSelect} value={readFilter} onChange={e => { setReadFilter(e.target.value); }}>
          <option value="">Todas</option><option value="false">No leídas</option><option value="true">Leídas</option>
        </select>
      </div>

      <div className={styles.card}>
        {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
          <div className={styles.list}>
            {notifications.length === 0 && <div className={styles.empty}>No hay notificaciones</div>}
            {notifications.map(n => {
              const style = typeStyles[n.type] || typeStyles.info;
              return (
                <div key={n.id} className={`${styles.item} ${!n.readAt ? styles.unread : ''}`}>
                  <div className={styles.itemIcon} style={{ color: style.color }}>{style.icon}</div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemTitle}>{n.title}</span>
                    {n.message && <span className={styles.itemMessage}>{n.message}</span>}
                    <span className={styles.itemTime}>{new Date(n.createdAt).toLocaleString('es-PE')}</span>
                  </div>
                  <div className={styles.itemActions}>
                    {!n.readAt && <button className={styles.itemAction} title="Marcar leída" onClick={() => handleMarkRead(n.id)}><FaCheck /></button>}
                    <button className={styles.itemAction} title="Eliminar" onClick={() => handleDelete(n.id)} style={{ color: '#94a3b8' }}><FaTrash /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
