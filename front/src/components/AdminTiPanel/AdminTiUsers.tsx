import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaUsers, FaSearch, FaSyncAlt, FaUserPlus, FaEdit, FaLock, FaKey, FaHistory, FaSignInAlt, FaChevronLeft, FaChevronRight, FaUserCheck, FaEye, FaTrashAlt, FaSpinner, FaExclamationTriangle, FaUserShield, FaUserCog, FaUserTag, FaEllipsisV, FaUserCircle, FaEnvelope, FaPhone, FaBuilding, FaCalendarAlt, FaToggleOn, FaToggleOff, FaTimesCircle, FaCheckCircle, FaCheck } from 'react-icons/fa';
import { fetchTiUsers, createTiUser, updateTiUser, changeUserStatus, changeUserRole, resetUserPassword, fetchUserActivity, fetchUserLoginHistory, deleteTiUser, type TiUser } from '../../services/adminTiApi';
import styles from './AdminTiUsers.module.scss';

const ROLES = ['USER', 'SALES', 'TI', 'ADMIN'];

const AdminTiUsers = () => {
  const [users, setUsers] = useState<TiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'detail' | 'password'; user?: TiUser } | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '', role: 'USER', status: 'activo' });
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<TiUser | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<TiUser | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [actionMsgType, setActionMsgType] = useState<'success' | 'error'>('success');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const PAGE_SIZE = 10;

  const stats = useMemo(() => {
    const activos = users.filter(u => u.status === 'activo').length;
    const admins = users.filter(u => u.role === 'ADMIN').length;
    const salesUsers = users.filter(u => u.role === 'SALES').length;
    const tiUsers = users.filter(u => u.role === 'TI').length;
    return { activos, admins, sales: salesUsers, ti: tiUsers };
  }, [users]);

  const load = useCallback(async () => {
    try { setLoading(true); setActionMsg('');
      const params: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
      if (query) params.query = query;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await fetchTiUsers(params);
      setUsers(data.users); setTotal(data.total);
    } catch { setActionMsg('Error al cargar usuarios'); setActionMsgType('error'); }
    finally { setLoading(false); }
  }, [query, roleFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 2500); return () => clearTimeout(t); } }, [actionMsg]);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try { await changeUserStatus(id, status); setActionMsg('Estado actualizado'); setActionMsgType('success'); load(); }
    catch (e: any) { setActionMsg(e.message); setActionMsgType('error'); }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try { await changeUserRole(id, role); setActionMsg('Rol actualizado'); setActionMsgType('success'); load(); }
    catch (e: any) { setActionMsg(e.message); setActionMsgType('error'); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createTiUser(formData); setActionMsg('Usuario creado exitosamente'); setActionMsgType('success');
      setModal(null); setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '', role: 'USER', status: 'activo' });
      load();
    } catch (e: any) { setActionMsg(e.message); setActionMsgType('error'); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!modal?.user) return;
    setSaving(true);
    try {
      await updateTiUser(modal.user.id, formData);
      setActionMsg('Usuario actualizado'); setActionMsgType('success'); setModal(null); load();
    } catch (e: any) { setActionMsg(e.message); setActionMsgType('error'); }
    finally { setSaving(false); }
  };

  const handleResetPassword = async () => {
    if (!modal?.user || !newPassword) return;
    try {
      await resetUserPassword(modal.user.id, newPassword);
      setActionMsg('Contraseña restablecida'); setActionMsgType('success'); setModal(null); setNewPassword('');
    } catch (e: any) { setActionMsg(e.message); setActionMsgType('error'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await deleteTiUser(confirmDelete.id);
      setActionMsg(`Usuario eliminado permanentemente`); setActionMsgType('success');
      setConfirmDelete(null); load();
    } catch (e: any) { setActionMsg(e.message); setActionMsgType('error'); }
    finally { setSaving(false); }
  };

  const openDetail = async (user: TiUser) => {
    setDetail(user);
    try {
      const [act, logins] = await Promise.all([
        fetchUserActivity(user.id), fetchUserLoginHistory(user.id),
      ]);
      setActivity(act.logs); setLoginHistory(logins.attempts);
    } catch { setActivity([]); setLoginHistory([]); }
  };

  const openEdit = (user: TiUser) => {
    setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', phone: user.phone, company: user.company, role: user.role, status: user.status });
    setModal({ type: 'edit', user });
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { activo: '#10b981', inactivo: '#f59e0b', bloqueado: '#ef4444', nuevo: '#3b82f6', frecuente: '#8b5cf6' };
    return m[s] || '#94a3b8';
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const roleBadgeStyle = (r: string) => {
    switch (r) {
      case 'ADMIN': return { bg: '#fef2f2', text: '#dc2626' };
      case 'TI': return { bg: '#f5f3ff', text: '#7c3aed' };
      case 'SALES': return { bg: '#eff6ff', text: '#2563eb' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const initials = (u: TiUser) => `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();

  const statCards = [
    { icon: <FaUsers />, value: total, label: 'Total', color: '#0ea5e9' },
    { icon: <FaUserCheck />, value: stats.activos, label: 'Activos', color: '#10b981' },
    { icon: <FaUserShield />, value: stats.admins, label: 'Admin', color: '#dc2626' },
    { icon: <FaUserTag />, value: stats.sales, label: 'Sales', color: '#2563eb' },
    { icon: <FaUserCog />, value: stats.ti, label: 'TI', color: '#7c3aed' },
  ];

  return (
    <div className={styles.module}>
      <div className={styles.toastArea}>
        {actionMsg && (
          <div className={`${styles.toast} ${actionMsgType === 'error' ? styles.toastError : ''}`}>
            {actionMsgType === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />} {actionMsg}
          </div>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaUsers /></div>
          <div>
            <h2 className={styles.title}>Usuarios</h2>
            <p className={styles.subtitle}>{total} usuarios registrados en el sistema</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnRefresh} onClick={load} title="Actualizar"><FaSyncAlt /></button>
          <button className={styles.btnPrimary} onClick={() => { setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '', role: 'USER', status: 'activo' }); setModal({ type: 'create' }); }}>
            <FaUserPlus /> Nuevo
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        {statCards.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${s.color}12`, color: s.color }}>{s.icon}</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Buscar por nombre o email..." />
          {query && <button className={styles.clearBtn} onClick={() => setQuery('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0); }}>
          <option value="">Todos los roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th className={styles.thActions}></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rs = roleBadgeStyle(u.role);
                  return (
                    <tr key={u.id} className={styles.tr}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar} style={{ background: `${rs.text}14`, color: rs.text }}>{initials(u)}</div>
                          <span className={styles.userName}>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.contactCell}>
                          <span className={styles.contactItem}><FaEnvelope /> {u.email}</span>
                          {u.phone && <span className={styles.contactItem}><FaPhone /> {u.phone}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={styles.roleBadge} style={{ background: rs.bg, color: rs.text }}>{u.role}</span>
                      </td>
                      <td>
                        <span className={styles.statusBadge} style={{ background: `${statusColor(u.status)}14`, color: statusColor(u.status) }}>
                          {u.status === 'activo' ? <FaCheckCircle /> : u.status === 'bloqueado' ? <FaLock /> : <FaTimesCircle />} {u.status}
                        </span>
                      </td>
                      <td><span className={styles.dateCell}><FaCalendarAlt /> {new Date(u.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                      <td className={styles.tdActions}>
                        <div className={styles.actionsWrap} onClick={e => e.stopPropagation()}>
                          <button className={styles.actionBtn} title="Ver" onClick={() => openDetail(u)}><FaEye /></button>
                          <button className={styles.actionBtn} title="Editar" onClick={() => openEdit(u)}><FaEdit /></button>
                          <div className={styles.menuWrap}>
                            <button className={styles.menuBtn} onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === u.id ? null : u.id); }}><FaEllipsisV /></button>
                            {openMenuId === u.id && (
                              <div className={styles.dropdown}>
                                <button onClick={() => { setOpenMenuId(null); u.status !== 'activo' && handleStatusChange(u.id, 'activo'); }}><FaToggleOn /> Activar</button>
                                <button onClick={() => { setOpenMenuId(null); handleStatusChange(u.id, 'inactivo'); }}><FaToggleOff /> Desactivar</button>
                                <button onClick={() => { setOpenMenuId(null); handleStatusChange(u.id, 'bloqueado'); }}><FaLock /> Bloquear</button>
                                <div className={styles.divider} />
                                {ROLES.filter(r => r !== u.role).map(r => (
                                  <button key={r} onClick={() => { setOpenMenuId(null); handleRoleChange(u.id, r); }}>Cambiar a {r}</button>
                                ))}
                                <div className={styles.divider} />
                                <button onClick={() => { setOpenMenuId(null); setNewPassword(''); setModal({ type: 'password', user: u }); }}><FaKey /> Reset Password</button>
                                <button className={styles.danger} onClick={() => { setOpenMenuId(null); setConfirmDelete(u); }}><FaTrashAlt /> Eliminar</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={6}>
                    <div className={styles.emptyState}>
                      <FaUsers className={styles.emptyIcon} />
                      <p>No se encontraron usuarios</p>
                      <span>Prueba con otros filtros</span>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}</span>
            <div className={styles.pageBtns}>
              <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p: number;
                if (totalPages <= 5) p = i;
                else if (page <= 2) p = i;
                else if (page >= totalPages - 3) p = totalPages - 5 + i;
                else p = page - 2 + i;
                return <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)}>{p + 1}</button>;
              })}
              <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
            </div>
          </div>
        )}
      </div>

      {modal?.type === 'create' && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaUserPlus /> Nuevo Usuario</h3>
              <button onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.field}><label>Nombre</label><input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} placeholder="Ej: Juan" /></div>
                <div className={styles.field}><label>Apellidos</label><input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} placeholder="Ej: Pérez" /></div>
                <div className={styles.field}><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" /></div>
                <div className={styles.field}><label>Contraseña</label><input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="Mín. 8 caracteres" /></div>
                <div className={styles.field}><label>Teléfono</label><input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+51 999 999 999" /></div>
                <div className={styles.field}><label>Empresa</label><input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Nombre de empresa" /></div>
                <div className={styles.field}><label>Rol</label><select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div className={styles.field}><label>Estado</label><select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleCreate} disabled={saving}>{saving ? <FaSpinner className={styles.spinner} /> : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'edit' && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaEdit /> Editar Usuario</h3>
              <button onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.field}><label>Nombre</label><input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
                <div className={styles.field}><label>Apellidos</label><input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
                <div className={styles.field}><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                <div className={styles.field}><label>Teléfono</label><input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
                <div className={styles.field}><label>Empresa</label><input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} /></div>
                <div className={styles.field}><label>Rol</label><select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div className={styles.field}><label>Estado</label><select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}><option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="bloqueado">Bloqueado</option></select></div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleEdit} disabled={saving}>{saving ? <FaSpinner className={styles.spinner} /> : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'password' && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaKey /> Restablecer Contraseña</h3>
              <button onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoBar}><FaUserCircle /> {modal.user?.firstName} {modal.user?.lastName} — <strong>{modal.user?.email}</strong></div>
              <div className={styles.field}><label>Nueva Contraseña</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" /></div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleResetPassword} disabled={!newPassword || newPassword.length < 8}>Restablecer</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.overlay} onClick={() => !saving && setConfirmDelete(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h3><FaTrashAlt style={{ color: '#dc2626' }} /> Confirmar</h3>
              <button onClick={() => !saving && setConfirmDelete(null)} disabled={saving}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteWarning}>
                <FaExclamationTriangle />
                <p>¿Eliminar permanentemente a <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong>?</p>
              </div>
              <p className={styles.deleteHint}>Esta acción no se puede deshacer.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => setConfirmDelete(null)} disabled={saving}>Cancelar</button>
              <button className={styles.btnDanger} onClick={handleDelete} disabled={saving}>{saving ? <FaSpinner className={styles.spinner} /> : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className={styles.overlay} onClick={() => setDetail(null)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaUserCircle /> {detail.firstName} {detail.lastName}</h3>
              <button onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailTop}>
                <div className={styles.detailAvatar} style={{ background: `${roleBadgeStyle(detail.role).text}14`, color: roleBadgeStyle(detail.role).text }}>{initials(detail)}</div>
                <div>
                  <h3>{detail.firstName} {detail.lastName}</h3>
                  <div className={styles.detailBadges}>
                    <span className={styles.roleBadge} style={{ background: roleBadgeStyle(detail.role).bg, color: roleBadgeStyle(detail.role).text }}>{detail.role}</span>
                    <span className={styles.statusBadge} style={{ background: `${statusColor(detail.status)}14`, color: statusColor(detail.status) }}>{detail.status}</span>
                  </div>
                </div>
              </div>
              <div className={styles.detailGrid}>
                <div className={styles.detailField}><FaEnvelope /> <span>Email</span><strong>{detail.email}</strong></div>
                <div className={styles.detailField}><FaPhone /> <span>Teléfono</span><strong>{detail.phone || '—'}</strong></div>
                <div className={styles.detailField}><FaBuilding /> <span>Empresa</span><strong>{detail.company || '—'}</strong></div>
                <div className={styles.detailField}><FaCalendarAlt /> <span>Registro</span><strong>{new Date(detail.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></div>
              </div>
              <div className={styles.sectionTitle}><FaHistory /> Actividad Reciente</div>
              <div className={styles.activityList}>
                {activity.length === 0 && <p className={styles.mutedText}>Sin actividad registrada</p>}
                {activity.slice(0, 6).map((a: any) => (
                  <div key={a.id} className={styles.activityItem}>
                    <div className={styles.dot} />
                    <div><strong>{a.action}</strong><p>{a.description} — {new Date(a.createdAt).toLocaleString('es-PE')}</p></div>
                  </div>
                ))}
              </div>
              <div className={styles.sectionTitle}><FaSignInAlt /> Historial de Accesos</div>
              <div className={styles.activityList}>
                {loginHistory.length === 0 && <p className={styles.mutedText}>Sin intentos de acceso</p>}
                {loginHistory.slice(0, 6).map((a: any) => (
                  <div key={a.id} className={styles.activityItem}>
                    <div className={styles.dot} style={{ background: a.success ? '#10b981' : '#ef4444' }} />
                    <div><strong>{a.success ? 'Exitoso' : 'Fallido'}</strong><p>{new Date(a.createdAt).toLocaleString('es-PE')} — IP: {a.ipAddress || 'N/A'}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}><button className={styles.btnOutline} onClick={() => setDetail(null)}>Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTiUsers;
