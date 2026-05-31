import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaUserLock, FaUserSlash, FaServer, FaShieldAlt, FaExclamationTriangle, FaHeadset, FaCheckCircle, FaSyncAlt, FaHistory, FaUserCheck, FaUserTag, FaUserCog, FaUserShield } from 'react-icons/fa';
import { fetchTiDashboardStats, type TiDashboardStats } from '../../services/adminTiApi';
import styles from './AdminTiDashboard.module.scss';

interface Props {
  onNavigate: (section: string) => void;
}

const AdminTiDashboard = ({ onNavigate }: Props) => {
  const [stats, setStats] = useState<TiDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await fetchTiDashboardStats();
      setStats(data);
    } catch {
      setError('Error al cargar estadísticas');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className={styles.module}>
      <div className={styles.loading}>Cargando dashboard...</div>
    </div>
  );

  if (error) return (
    <div className={styles.module}>
      <div className={styles.error}>{error} <button className={styles.retry} onClick={load}>Reintentar</button></div>
    </div>
  );

  if (!stats) return null;

  const quickActions = [
    { key: 'usuarios', icon: <FaUserCheck />, color: '#2563eb', bg: '#2563eb12', label: 'Gestionar Usuarios', desc: 'Crear, editar, desactivar cuentas' },
    { key: 'soporte', icon: <FaHeadset />, color: '#8b5cf6', bg: '#8b5cf612', label: 'Soporte Técnico', desc: `${stats.ticketStats.abiertos} tickets abiertos` },
    { key: 'roles', icon: <FaUserShield />, color: '#10b981', bg: '#10b98112', label: 'Roles y Permisos', desc: 'Administrar accesos del sistema' },
    { key: 'auditoria', icon: <FaHistory />, color: '#f59e0b', bg: '#f59e0b12', label: 'Auditoría', desc: 'Actividad reciente del sistema' },
  ];

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaServer /></div>
          <div>
            <h2 className={styles.title}>Panel de Administración TI</h2>
            <p className={styles.subtitle}>Monitoreo y gestión del sistema</p>
          </div>
        </div>
        <button className={styles.refresh} onClick={load}><FaSyncAlt /> Actualizar</button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#10b98112' }}><FaUsers style={{ color: '#10b981', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.activos}</span>
            <span className={styles.statLabel}>Usuarios Activos</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#ef444412' }}><FaUserLock style={{ color: '#ef4444', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.bloqueados}</span>
            <span className={styles.statLabel}>Bloqueados</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#f59e0b12' }}><FaUserSlash style={{ color: '#f59e0b', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.inactivos}</span>
            <span className={styles.statLabel}>Deshabilitados</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#8b5cf612' }}><FaServer style={{ color: '#8b5cf6', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.activeSessions}</span>
            <span className={styles.statLabel}>Sesiones Activas</span>
          </div>
        </div>
      </div>

      <div className={styles.secondRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#2563eb12' }}><FaExclamationTriangle style={{ color: '#2563eb', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.ticketStats.abiertos}</span>
            <span className={styles.statLabel}>Incidencias Abiertas</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#10b98112' }}><FaCheckCircle style={{ color: '#10b981', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.loginStats.successRate}%</span>
            <span className={styles.statLabel}>Tasa Éxito Login</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#f59e0b12' }}><FaUserCog style={{ color: '#f59e0b', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.users}</span>
            <span className={styles.statLabel}>Usuarios</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#8b5cf612' }}><FaUserTag style={{ color: '#8b5cf6', fontSize: 20 }} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{stats.admins + stats.sales + stats.tis}</span>
            <span className={styles.statLabel}>Staff ({stats.admins}A/{stats.sales}S/{stats.tis}TI)</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}><FaShieldAlt /> Acciones Rápidas</h3>
        </div>
        <div className={styles.actionsGrid}>
          {quickActions.map(a => (
            <button key={a.key} className={styles.actionCard} onClick={() => onNavigate(a.key)}>
              <div className={styles.actionIcon} style={{ background: a.bg, color: a.color }}>{a.icon}</div>
              <div className={styles.actionInfo}>
                <span className={styles.actionLabel}>{a.label}</span>
                <span className={styles.actionDesc}>{a.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaHeadset /> Estado de Tickets</h3>
          </div>
          <div className={styles.ticketGrid}>
            <div className={styles.ticketStat}><span className={styles.ticketNum} style={{ color: '#ef4444' }}>{stats.ticketStats.abiertos}</span><span>Abiertos</span></div>
            <div className={styles.ticketStat}><span className={styles.ticketNum} style={{ color: '#f59e0b' }}>{stats.ticketStats.enProgreso}</span><span>En Progreso</span></div>
            <div className={styles.ticketStat}><span className={styles.ticketNum} style={{ color: '#10b981' }}>{stats.ticketStats.resueltos}</span><span>Resueltos</span></div>
            <div className={styles.ticketStat}><span className={styles.ticketNum} style={{ color: '#64748b' }}>{stats.ticketStats.cerrados}</span><span>Cerrados</span></div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaHistory /> Actividad Reciente</h3>
          </div>
          <div className={styles.activityList}>
            {stats.recentActivity.length === 0 && <p className={styles.emptyText}>Sin actividad reciente</p>}
            {stats.recentActivity.slice(0, 6).map((a: any) => (
              <div key={a.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <span className={styles.activityAction}>{a.action}</span>
                  <span className={styles.activityMeta}>{a.userName || 'Sistema'} — {new Date(a.createdAt).toLocaleString('es-PE')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTiDashboard;
