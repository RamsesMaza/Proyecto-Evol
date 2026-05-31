import { useState, useEffect, useCallback } from 'react';
import { FaShieldAlt, FaSyncAlt, FaSignInAlt, FaServer, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaSpinner, FaTrash } from 'react-icons/fa';
import { fetchLoginAttempts, fetchSessions, closeSession, type Session } from '../../services/adminTiApi';
import styles from './AdminTiSecurity.module.scss';

const AdminTiSecurity = () => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionPage, setSessionPage] = useState(0);
  const [actionMsg, setActionMsg] = useState('');
  const [tab, setTab] = useState<'attempts' | 'sessions'>('attempts');

  const SESSION_PAGE_SIZE = 8;

  const load = useCallback(async () => {
    try { setLoading(true);
      const [attemptData, sessionData] = await Promise.all([
        fetchLoginAttempts(),
        fetchSessions(),
      ]);
      setAttempts(attemptData.attempts || []);
      setSessions(sessionData.sessions);
      setSessionTotal(sessionData.total);
    } catch { setActionMsg('Error al cargar datos de seguridad'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 2500); return () => clearTimeout(t); } }, [actionMsg]);

  const handleCloseSession = async (id: number) => {
    try { await closeSession(id); setActionMsg('Sesión cerrada'); load(); }
    catch (e: any) { setActionMsg(e.message); }
  };

  const totalSessionPages = Math.ceil(sessionTotal / SESSION_PAGE_SIZE);
  const displayedSessions = sessions.slice(sessionPage * SESSION_PAGE_SIZE, (sessionPage + 1) * SESSION_PAGE_SIZE);

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaShieldAlt /></div>
          <div><h2 className={styles.title}>Seguridad</h2><p className={styles.subtitle}>Intentos de acceso y sesiones activas</p></div>
        </div>
        <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
      </div>

      {actionMsg && <div className={styles.toast}><FaExclamationTriangle /> {actionMsg}</div>}

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'attempts' ? styles.tabActive : ''}`} onClick={() => setTab('attempts')}>
          <FaSignInAlt /> Intentos de Acceso
        </button>
        <button className={`${styles.tab} ${tab === 'sessions' ? styles.tabActive : ''}`} onClick={() => setTab('sessions')}>
          <FaServer /> Sesiones Activas
        </button>
      </div>

      {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
        <>
          {tab === 'attempts' && (
            <div className={styles.card}>
              <table className={styles.table}>
                <thead><tr>
                  <th>Usuario</th><th>Email</th><th>Resultado</th><th>IP</th><th>Fecha</th>
                </tr></thead>
                <tbody>
                  {attempts.slice(0, 50).map((a: any) => (
                    <tr key={a.id} className={styles.tr}>
                      <td className={styles.cellUser}>{a.userName || 'Desconocido'}</td>
                      <td className={styles.cellEmail}>{a.email || '—'}</td>
                      <td>{a.success ? <span className={styles.success}><FaCheck /> Exitoso</span> : <span className={styles.failed}><FaTimes /> Fallido</span>}</td>
                      <td className={styles.cellIp}>{a.ipAddress || '—'}</td>
                      <td className={styles.cellDate}>{new Date(a.createdAt).toLocaleString('es-PE')}</td>
                    </tr>
                  ))}
                  {attempts.length === 0 && <tr><td colSpan={5} className={styles.emptyCell}>Sin intentos registrados</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'sessions' && (
            <div className={styles.card}>
              <table className={styles.table}>
                <thead><tr>
                  <th>Usuario</th><th>Rol</th><th>IP</th><th>Última Actividad</th><th className={styles.thActions}>Acciones</th>
                </tr></thead>
                <tbody>
                  {displayedSessions.map(s => (
                    <tr key={s.id} className={styles.tr}>
                      <td className={styles.cellUser}>{s.user.firstName} {s.user.lastName}</td>
                      <td><span className={styles.roleBadge}>{s.user.role}</span></td>
                      <td className={styles.cellIp}>{s.ipAddress || '—'}</td>
                      <td className={styles.cellDate}>{new Date(s.lastActivity).toLocaleString('es-PE')}</td>
                      <td className={styles.tdActions}>
                        <button className={styles.dangerBtn} title="Cerrar sesión" onClick={() => handleCloseSession(s.id)}>
                          <FaTrash /> Cerrar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayedSessions.length === 0 && <tr><td colSpan={5} className={styles.emptyCell}>Sin sesiones activas</td></tr>}
                </tbody>
              </table>
              {totalSessionPages > 1 && <div className={styles.pagination}>
                <span className={styles.pageInfo}>{sessionPage * SESSION_PAGE_SIZE + 1}–{Math.min((sessionPage + 1) * SESSION_PAGE_SIZE, sessionTotal)}</span>
                <div className={styles.pageBtns}>
                  <button className={styles.pageBtn} disabled={sessionPage === 0} onClick={() => setSessionPage(p => p - 1)}><FaChevronLeft /></button>
                  {Array.from({ length: Math.min(totalSessionPages, 10) }, (_, i) => (
                    <button key={i} className={`${styles.pageBtn} ${i === sessionPage ? styles.pageBtnActive : ''}`} onClick={() => setSessionPage(i)}>{i + 1}</button>
                  ))}
                  <button className={styles.pageBtn} disabled={sessionPage >= totalSessionPages - 1} onClick={() => setSessionPage(p => p + 1)}><FaChevronRight /></button>
                </div>
              </div>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminTiSecurity;
