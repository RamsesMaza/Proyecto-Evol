import { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaSyncAlt, FaSearch, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaSpinner, FaUser } from 'react-icons/fa';
import { fetchAuditLogs } from '../../services/adminTiApi';
import styles from './AdminTiAudit.module.scss';

const AdminTiAudit = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    try { setLoading(true); setError('');
      const params: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
      if (actionFilter) params.action = actionFilter;
      if (userFilter) params.userId = userFilter;
      const data = await fetchAuditLogs(params);
      setLogs(data.logs); setTotal(data.total);
    } catch { setError('Error al cargar registros de auditoría'); }
    finally { setLoading(false); }
  }, [page, actionFilter, userFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaHistory /></div>
          <div><h2 className={styles.title}>Auditoría del Sistema</h2><p className={styles.subtitle}>{total} registros de actividad</p></div>
        </div>
        <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0); }} placeholder="Filtrar por acción..." />
          {actionFilter && <button className={styles.clearBtn} onClick={() => setActionFilter('')}>✕</button>}
        </div>
        <div className={styles.searchWrap}>
          <FaUser className={styles.searchIcon} />
          <input className={styles.searchInput} value={userFilter} onChange={e => { setUserFilter(e.target.value); setPage(0); }} placeholder="ID de usuario..." />
          {userFilter && <button className={styles.clearBtn} onClick={() => setUserFilter('')}>✕</button>}
        </div>
      </div>

      {error && <div className={styles.error}><FaExclamationTriangle /> {error}</div>}

      <div className={styles.card}>
        {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
          <table className={styles.table}>
            <thead><tr>
              <th>Acción</th><th>Descripción</th><th>Usuario</th><th>IP</th><th>Fecha</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className={styles.tr}>
                  <td><span className={styles.actionBadge}>{l.action}</span></td>
                  <td className={styles.cellDesc}>{l.description || '—'}</td>
                  <td className={styles.cellUser}>{l.userName || 'Sistema'}</td>
                  <td className={styles.cellIp}>{l.ipAddress || '—'}</td>
                  <td className={styles.cellDate}>{new Date(l.createdAt).toLocaleString('es-PE')}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className={styles.emptyCell}>No se encontraron registros</td></tr>}
            </tbody>
          </table>
        )}
        {totalPages > 1 && <div className={styles.pagination}>
          <span className={styles.pageInfo}>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}</span>
          <div className={styles.pageBtns}>
            <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
              <button key={i} className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default AdminTiAudit;
