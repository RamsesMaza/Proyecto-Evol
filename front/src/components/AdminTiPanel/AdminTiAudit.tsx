import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaHistory, FaSyncAlt, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaSpinner, FaUser, FaCalendarAlt, FaTimes, FaDownload, FaEye, FaCopy, FaCheck, FaUserCircle, FaTag, FaKey, FaLock, FaUserPlus, FaUserEdit, FaUserSlash, FaTicketAlt, FaUserCheck } from 'react-icons/fa';
import { fetchAuditLogs } from '../../services/adminTiApi';
import styles from './AdminTiAudit.module.scss';

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CREAR_USUARIO: { label: 'Crear Usuario', color: '#10b981', icon: <FaUserPlus /> },
  EDITAR_USUARIO: { label: 'Editar Usuario', color: '#3b82f6', icon: <FaUserEdit /> },
  CAMBIAR_ESTADO_ACTIVO: { label: 'Activar Usuario', color: '#10b981', icon: <FaUserCheck /> },
  CAMBIAR_ESTADO_INACTIVO: { label: 'Desactivar Usuario', color: '#f59e0b', icon: <FaUserSlash /> },
  CAMBIAR_ESTADO_BLOQUEADO: { label: 'Bloquear Usuario', color: '#ef4444', icon: <FaLock /> },
  CAMBIAR_ROL: { label: 'Cambiar Rol', color: '#8b5cf6', icon: <FaUserEdit /> },
  RESTABLECER_PASSWORD: { label: 'Reset Password', color: '#f97316', icon: <FaKey /> },
  ELIMINAR_USUARIO: { label: 'Eliminar Usuario', color: '#dc2626', icon: <FaUserSlash /> },
  CREAR_TICKET: { label: 'Crear Ticket', color: '#0ea5e9', icon: <FaTicketAlt /> },
  ACTUALIZAR_TICKET: { label: 'Actualizar Ticket', color: '#6366f1', icon: <FaTicketAlt /> },
};

const DEFAULT_ACTION_COLOR = '#64748b';

const getActionConfig = (action: string) => {
  const exact = ACTION_CONFIG[action];
  if (exact) return exact;
  const match = Object.entries(ACTION_CONFIG).find(([k]) => action.startsWith(k));
  if (match) return match[1];
  return { label: action, color: DEFAULT_ACTION_COLOR, icon: <FaTag /> };
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const AdminTiAudit = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const PAGE_SIZE = 12;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (userSearch) params.userId = userSearch;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const data = await fetchAuditLogs(params);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      setError('Error al cargar registros de auditoría');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter, userSearch, startDate, endDate]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const uniqueActions = useMemo(() => {
    const s = new Set(logs.map(l => l.action));
    return Array.from(s).sort();
  }, [logs]);

  const uniqueEntities = useMemo(() => {
    const s = new Set(logs.map(l => l.entity).filter(Boolean));
    return Array.from(s).sort();
  }, [logs]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayEntries = logs.filter(l => new Date(l.createdAt).toDateString() === today).length;
    const uniqueUsers = new Set(logs.filter(l => l.userId).map(l => l.userId)).size;
    const uniqueActionsSet = new Set(logs.map(l => l.action)).size;
    return { todayEntries, uniqueUsers, uniqueActions: uniqueActionsSet };
  }, [logs]);

  const clearFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setUserSearch('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const hasFilters = actionFilter || entityFilter || userSearch || startDate || endDate;

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const renderDetail = (log: any) => {
    if (expandedId !== log.id) return null;
    let oldVals: any = null;
    let newVals: any = null;
    try { oldVals = log.oldValues ? JSON.parse(log.oldValues) : null; } catch {}
    try { newVals = log.newValues ? JSON.parse(log.newValues) : null; } catch {}
    return (
      <tr key={`detail-${log.id}`} className={styles.detailRow}>
        <td colSpan={6}>
          <div className={styles.detailPanel}>
            <div className={styles.detailSection}>
              <h4>Descripción completa</h4>
              <p>{log.description || 'Sin descripción'}</p>
            </div>
            {(oldVals || newVals) && (
              <div className={styles.detailGrid}>
                {oldVals && (
                  <div className={styles.detailCol}>
                    <h4><FaExclamationTriangle /> Valores anteriores</h4>
                    <pre>{JSON.stringify(oldVals, null, 2)}</pre>
                  </div>
                )}
                {newVals && (
                  <div className={styles.detailCol}>
                    <h4><FaCheck /> Valores nuevos</h4>
                    <pre>{JSON.stringify(newVals, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const hasMoreFilters = uniqueActions.length > 0 || uniqueEntities.length > 0;

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaHistory /></div>
          <div>
            <h2 className={styles.title}>Auditoría del Sistema</h2>
            <p className={styles.subtitle}>{total} registros de actividad en el sistema</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnRefresh} onClick={load} title="Actualizar"><FaSyncAlt /></button>
          <button className={styles.btnOutline} onClick={() => {}}><FaDownload /> Exportar</button>
        </div>
      </div>

      {error && (
        <div className={styles.error}><FaExclamationTriangle /> {error}</div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#0ea5e912', color: '#0ea5e9' }}><FaHistory /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{total}</span>
            <span className={styles.statLabel}>Registros totales</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#10b98112', color: '#10b981' }}><FaCalendarAlt /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.todayEntries}</span>
            <span className={styles.statLabel}>Hoy</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#8b5cf612', color: '#8b5cf6' }}><FaUserCircle /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.uniqueUsers}</span>
            <span className={styles.statLabel}>Usuarios</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f59e0b12', color: '#f59e0b' }}><FaTag /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.uniqueActions}</span>
            <span className={styles.statLabel}>Acciones distintas</span>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label>Acción</label>
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0); }}>
            <option value="">Todas las acciones</option>
            {['CREAR_USUARIO', 'EDITAR_USUARIO', 'CAMBIAR_ESTADO_ACTIVO', 'CAMBIAR_ESTADO_INACTIVO', 'CAMBIAR_ESTADO_BLOQUEADO', 'CAMBIAR_ROL', 'RESTABLECER_PASSWORD', 'ELIMINAR_USUARIO', 'CREAR_TICKET', 'ACTUALIZAR_TICKET'].map(a => (
              <option key={a} value={a}>{ACTION_CONFIG[a]?.label || a}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Entidad</label>
          <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(0); }}>
            <option value="">Todas</option>
            <option value="User">Usuario</option>
            <option value="SupportTicket">Ticket</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Usuario ID</label>
          <div className={styles.inputWrap}>
            <FaUser className={styles.inputIcon} />
            <input value={userSearch} onChange={e => { setUserSearch(e.target.value); setPage(0); }} placeholder="ID..." />
            {userSearch && <button className={styles.clearBtn} onClick={() => setUserSearch('')}>✕</button>}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label>Desde</label>
          <div className={styles.inputWrap}>
            <FaCalendarAlt className={styles.inputIcon} />
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(0); }} />
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label>Hasta</label>
          <div className={styles.inputWrap}>
            <FaCalendarAlt className={styles.inputIcon} />
            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(0); }} />
          </div>
        </div>
        {hasFilters && (
          <div className={styles.filterGroup}>
            <label>&nbsp;</label>
            <button className={styles.clearFilters} onClick={clearFilters}><FaTimes /> Limpiar</button>
          </div>
        )}
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando registros...</div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Descripción</th>
                    <th>Usuario</th>
                    <th>IP</th>
                    <th>Fecha</th>
                    <th className={styles.thActions}></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => {
                    const cfg = getActionConfig(l.action);
                    return (
                      <>
                        <tr key={l.id} className={`${styles.tr} ${expandedId === l.id ? styles.trExpanded : ''}`}>
                          <td>
                            <span className={styles.actionBadge} style={{ background: `${cfg.color}14`, color: cfg.color }}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </td>
                          <td>
                            <div className={styles.descCell}>
                              <span>{l.description || '—'}</span>
                              {l.entity && <span className={styles.entityTag}>{l.entity}{l.entityId ? ` #${l.entityId}` : ''}</span>}
                            </div>
                          </td>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.userAvatar} style={{ background: l.userId ? '#3b82f614' : '#94a3b814', color: l.userId ? '#3b82f6' : '#94a3b8' }}>
                                {l.userName ? l.userName.charAt(0) : '?'}
                              </div>
                              <div>
                                <span className={styles.userName}>{l.userName || 'Sistema'}</span>
                                {l.userEmail && <span className={styles.userEmail}>{l.userEmail}</span>}
                              </div>
                            </div>
                          </td>
                          <td>
                            {l.ipAddress ? (
                              <div className={styles.ipCell}>
                                <code>{l.ipAddress}</code>
                                <button className={styles.copyBtn} onClick={() => copyToClipboard(l.ipAddress, l.id)} title="Copiar IP">
                                  {copiedId === l.id ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                                </button>
                              </div>
                            ) : <span className={styles.muted}>—</span>}
                          </td>
                          <td>
                            <div className={styles.dateCell}>
                              <span className={styles.dateRelative}>{timeAgo(l.createdAt)}</span>
                              <span className={styles.dateAbsolute}>{new Date(l.createdAt).toLocaleString('es-PE')}</span>
                            </div>
                          </td>
                          <td className={styles.tdActions}>
                            <button
                              className={styles.expandBtn}
                              onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                              title="Ver detalle"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                        {renderDetail(l)}
                      </>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyState}>
                          <FaHistory className={styles.emptyIcon} />
                          <p>No se encontraron registros</p>
                          <span>Intenta ajustar los filtros de búsqueda</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.pageInfo}>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}</span>
                <div className={styles.pageBtns}>
                  <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
                  {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 6) p = i;
                    else if (page <= 2) p = i;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 2 + i;
                    return (
                      <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)}>{p + 1}</button>
                    );
                  })}
                  <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTiAudit;
