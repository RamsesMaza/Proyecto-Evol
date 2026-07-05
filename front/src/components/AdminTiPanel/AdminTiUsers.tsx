import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSearch, FaSyncAlt, FaUserPlus, FaEdit, FaCheck, FaBan, FaLock, FaUnlock, FaKey, FaHistory, FaSignInAlt, FaChevronLeft, FaChevronRight, FaUserCheck, FaEye, FaTrashAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
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
  const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'detail' | 'activity' | 'password'; user?: TiUser } | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '', role: 'USER', status: 'activo' });
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<TiUser | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<TiUser | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    try { setLoading(true); setActionMsg('');
      const params: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
      if (query) params.query = query;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await fetchTiUsers(params);
      setUsers(data.users); setTotal(data.total);
    } catch { setActionMsg('Error al cargar usuarios'); }
    finally { setLoading(false); }
  }, [query, roleFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 2000); return () => clearTimeout(t); } }, [actionMsg]);

  const statusActions = [
    { label: 'Activar', status: 'activo', icon: <FaCheck />, color: '#10b981' },
    { label: 'Desactivar', status: 'inactivo', icon: <FaBan />, color: '#f59e0b' },
    { label: 'Bloquear', status: 'bloqueado', icon: <FaLock />, color: '#ef4444' },
    { label: 'Desbloquear', status: 'activo', icon: <FaUnlock />, color: '#10b981' },
  ];

  const handleStatusChange = async (id: number, status: string) => {
    try { await changeUserStatus(id, status); setActionMsg('Estado actualizado'); load(); }
    catch (e: any) { setActionMsg(e.message); }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try { await changeUserRole(id, role); setActionMsg('Rol actualizado'); load(); }
    catch (e: any) { setActionMsg(e.message); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createTiUser(formData); setActionMsg('Usuario creado exitosamente');
      setModal(null); setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '', role: 'USER', status: 'activo' });
      load();
    } catch (e: any) { setActionMsg(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!modal?.user) return;
    setSaving(true);
    try {
      await updateTiUser(modal.user.id, formData);
      setActionMsg('Usuario actualizado'); setModal(null); load();
    } catch (e: any) { setActionMsg(e.message); }
    finally { setSaving(false); }
  };

  const handleResetPassword = async () => {
    if (!modal?.user || !newPassword) return;
    try {
      await resetUserPassword(modal.user.id, newPassword);
      setActionMsg('Contraseña restablecida'); setModal(null); setNewPassword('');
    } catch (e: any) { setActionMsg(e.message); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await deleteTiUser(confirmDelete.id);
      setActionMsg(`Usuario ${confirmDelete.firstName} ${confirmDelete.lastName} eliminado permanentemente`);
      setConfirmDelete(null);
      load();
    } catch (e: any) { setActionMsg(e.message); }
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

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaUsers /></div>
          <div><h2 className={styles.title}>Gestión de Usuarios</h2><p className={styles.subtitle}>{total} usuarios registrados</p></div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
          <button className={styles.btnPrimary} onClick={() => { setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '', role: 'USER', status: 'activo' }); setModal({ type: 'create' }); }}>
            <FaUserPlus /> Nuevo Usuario
          </button>
        </div>
      </div>

      {actionMsg && <div className={styles.toast}><FaExclamationTriangle /> {actionMsg}</div>}

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Buscar usuarios..." />
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
          <option value="nuevo">Nuevo</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> :
          <table className={styles.table}>
            <thead><tr>
              <th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Registro</th><th className={styles.thActions}>Acciones</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={styles.tr}>
                  <td><span className={styles.cellName}>{u.firstName} {u.lastName}</span></td>
                  <td className={styles.cellEmail}>{u.email}</td>
                  <td><span className={styles.roleBadge} style={{ background: u.role === 'ADMIN' ? '#ef444412' : u.role === 'TI' ? '#8b5cf612' : u.role === 'SALES' ? '#2563eb12' : '#f1f5f9', color: u.role === 'ADMIN' ? '#ef4444' : u.role === 'TI' ? '#8b5cf6' : u.role === 'SALES' ? '#2563eb' : '#64748b' }}>{u.role}</span></td>
                  <td><span className={styles.statusBadge} style={{ background: `${statusColor(u.status)}18`, color: statusColor(u.status) }}>{u.status}</span></td>
                  <td className={styles.cellDate}>{new Date(u.createdAt).toLocaleDateString('es-PE')}</td>
                  <td className={styles.tdActions}>
                    <div className={styles.actionBtns}>
                      <button className={styles.actionBtn} title="Ver detalle" onClick={() => openDetail(u)}><FaEye /></button>
                      <button className={styles.actionBtn} title="Editar" onClick={() => openEdit(u)}><FaEdit /></button>
                      <select className={styles.quickAction} onChange={e => { if (e.target.value) handleStatusChange(u.id, e.target.value); e.target.value = ''; }} defaultValue="">
                        <option value="" disabled>Estado...</option>
                        {statusActions.map((a, i) => <option key={`${a.status}-${i}`} value={a.status}>{a.label}</option>)}
                      </select>
                      <select className={styles.quickAction} onChange={e => { if (e.target.value) handleRoleChange(u.id, e.target.value); e.target.value = ''; }} defaultValue="">
                        <option value="" disabled>Rol...</option>
                        {ROLES.filter(r => r !== u.role).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button className={styles.actionBtn} title="Restablecer contraseña" onClick={() => { setNewPassword(''); setModal({ type: 'password', user: u }); }}><FaKey /></button>
                      <button className={styles.actionBtn} title="Eliminar usuario" onClick={() => setConfirmDelete(u)} style={{ color: '#ef4444' }}><FaTrashAlt /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} className={styles.emptyCell}>No se encontraron usuarios</td></tr>}
            </tbody>
          </table>}
        {totalPages > 1 && <div className={styles.pagination}>
          <span className={styles.pageInfo}>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}</span>
          <div className={styles.pageBtns}>
            <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        </div>}
      </div>

      {/* Create/Edit Modal */}
      {modal?.type === 'create' && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaUserPlus /> Nuevo Usuario</h3><button onClick={() => setModal(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={styles.field}><label>Nombre</label><input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div className={styles.field}><label>Apellidos</label><input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
              <div className={styles.field}><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
              <div className={styles.field}><label>Contraseña</label><input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} /></div>
              <div className={styles.field}><label>Teléfono</label><input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className={styles.field}><label>Empresa</label><input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} /></div>
              <div className={styles.field}><label>Rol</label>
                <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={styles.field}><label>Estado</label>
                <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                  <option value="activo">Activo</option><option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleCreate} disabled={saving}>{saving ? 'Guardando...' : 'Crear Usuario'}</button>
          </div>
        </div>
      </div>}

      {/* Edit Modal */}
      {modal?.type === 'edit' && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaEdit /> Editar Usuario</h3><button onClick={() => setModal(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={styles.field}><label>Nombre</label><input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div className={styles.field}><label>Apellidos</label><input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
              <div className={styles.field}><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
              <div className={styles.field}><label>Teléfono</label><input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className={styles.field}><label>Empresa</label><input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} /></div>
              <div className={styles.field}><label>Rol</label>
                <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={styles.field}><label>Estado</label>
                <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                  <option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="bloqueado">Bloqueado</option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleEdit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </div>
      </div>}

      {/* Password Reset Modal */}
      {modal?.type === 'password' && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaKey /> Restablecer Contraseña</h3><button onClick={() => setModal(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>Usuario: {modal.user?.firstName} {modal.user?.lastName} ({modal.user?.email})</p>
            <div className={styles.field}><label>Nueva Contraseña</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleResetPassword} disabled={!newPassword || newPassword.length < 8}>Restablecer</button>
          </div>
        </div>
      </div>}

      {/* Detail Modal */}
      {confirmDelete && <div className={styles.modalOverlay} onClick={() => !saving && setConfirmDelete(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
          <div className={styles.modalHeader}><h3><FaTrashAlt style={{ color: '#ef4444' }} /> Confirmar Eliminación</h3><button onClick={() => !saving && setConfirmDelete(null)} disabled={saving}>✕</button></div>
          <div className={styles.modalBody}>
            <p style={{ margin: 0, fontSize: 14, color: '#0f172a', lineHeight: 1.5 }}>
              ¿Estás seguro de eliminar permanentemente a <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong> ({confirmDelete.email})?
            </p>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaExclamationTriangle /> Esta acción no se puede deshacer. Todas las sesiones del usuario serán cerradas.
            </p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setConfirmDelete(null)} disabled={saving}>Cancelar</button>
            <button className={styles.btnDanger} onClick={handleDelete} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </button>
          </div>
        </div>
      </div>}

      {detail && <div className={styles.modalOverlay} onClick={() => setDetail(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaUserCheck /> {detail.firstName} {detail.lastName}</h3><button onClick={() => setDetail(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.detailGrid}>
              <div className={styles.detailField}><span>Email</span><strong>{detail.email}</strong></div>
              <div className={styles.detailField}><span>Rol</span><strong>{detail.role}</strong></div>
              <div className={styles.detailField}><span>Estado</span><strong style={{ color: statusColor(detail.status) }}>{detail.status}</strong></div>
              <div className={styles.detailField}><span>Teléfono</span><strong>{detail.phone || '—'}</strong></div>
              <div className={styles.detailField}><span>Empresa</span><strong>{detail.company || '—'}</strong></div>
              <div className={styles.detailField}><span>Registro</span><strong>{new Date(detail.createdAt).toLocaleDateString('es-PE')}</strong></div>
            </div>

            <h4 style={{ margin: '20px 0 12px', fontSize: 14, color: '#0f172a' }}><FaHistory /> Actividad Reciente</h4>
            <div className={styles.activityList}>
              {activity.length === 0 && <p className={styles.emptyText}>Sin actividad registrada</p>}
              {activity.slice(0, 10).map((a: any) => (
                <div key={a.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div><strong>{a.action}</strong><p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{a.description} — {new Date(a.createdAt).toLocaleString('es-PE')}</p></div>
                </div>
              ))}
            </div>

            <h4 style={{ margin: '20px 0 12px', fontSize: 14, color: '#0f172a' }}><FaSignInAlt /> Historial de Accesos</h4>
            <div className={styles.activityList}>
              {loginHistory.length === 0 && <p className={styles.emptyText}>Sin intentos de acceso</p>}
              {loginHistory.slice(0, 10).map((a: any) => (
                <div key={a.id} className={styles.activityItem}>
                  <div className={styles.activityDot} style={{ background: a.success ? '#10b981' : '#ef4444' }} />
                  <div><strong>{a.success ? 'Exitoso' : 'Fallido'}</strong><p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{new Date(a.createdAt).toLocaleString('es-PE')} — IP: {a.ipAddress || 'N/A'}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.modalFooter}><button className={styles.btnOutline} onClick={() => setDetail(null)}>Cerrar</button></div>
        </div>
      </div>}
    </div>
  );
};

export default AdminTiUsers;
