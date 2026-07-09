import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaUserShield, FaSyncAlt, FaPlus, FaCheck, FaTimes, FaCheckDouble, FaBan, FaLock, FaUsers, FaHeadset, FaClipboardList, FaKey, FaHistory, FaShieldAlt, FaTachometerAlt, FaLayerGroup, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaUserTag, FaUserCircle, FaUserCog, FaUserTie } from 'react-icons/fa';
import { fetchPermissions, fetchRolePermissions, assignPermission, removePermission, createPermission, type Permission } from '../../services/adminTiApi';
import styles from './AdminTiRoles.module.scss';

const ROLES = ['USER', 'SALES', 'TI', 'ADMIN'];

const MODULE_ICONS: Record<string, React.ReactNode> = {
  general: <FaLayerGroup />,
  users: <FaUsers />,
  support: <FaHeadset />,
  audit: <FaClipboardList />,
  permissions: <FaKey />,
  sessions: <FaHistory />,
  security: <FaShieldAlt />,
  dashboard: <FaTachometerAlt />,
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  USER: <FaUserCircle />,
  SALES: <FaUserTag />,
  TI: <FaUserCog />,
  ADMIN: <FaUserTie />,
};

const AdminTiRoles = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePerms, setRolePerms] = useState<Record<string, number[]>>({});
  const [activeRole, setActiveRole] = useState('TI');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState<'success' | 'error'>('success');
  const [showCreate, setShowCreate] = useState(false);
  const [newPerm, setNewPerm] = useState({ name: '', slug: '', description: '', module: 'general' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [permData, ...roleData] = await Promise.all([
        fetchPermissions(),
        ...ROLES.map(r => fetchRolePermissions(r)),
      ]);
      setPermissions(permData.permissions);
      const rp: Record<string, number[]> = {};
      ROLES.forEach((r, i) => {
        rp[r] = roleData[i].permissions.map((p: any) => p.permissionId || p.id);
      });
      setRolePerms(rp);
    } catch {
      setActionMsg('Error al cargar permisos');
      setActionType('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (actionMsg) {
      const t = setTimeout(() => setActionMsg(''), 2500);
      return () => clearTimeout(t);
    }
  }, [actionMsg]);

  const togglePermission = async (permId: number) => {
    const has = rolePerms[activeRole]?.includes(permId);
    try {
      if (has) {
        await removePermission(activeRole, permId);
        setRolePerms(p => ({ ...p, [activeRole]: p[activeRole].filter(id => id !== permId) }));
        setActionType('success');
        setActionMsg('Permiso removido');
      } else {
        await assignPermission(activeRole, permId);
        setRolePerms(p => ({ ...p, [activeRole]: [...(p[activeRole] || []), permId] }));
        setActionType('success');
        setActionMsg('Permiso asignado');
      }
    } catch (e: any) {
      setActionType('error');
      setActionMsg(e.message);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createPermission(newPerm);
      setActionType('success');
      setActionMsg('Permiso creado exitosamente');
      setShowCreate(false);
      setNewPerm({ name: '', slug: '', description: '', module: 'general' });
      load();
    } catch (e: any) {
      setActionType('error');
      setActionMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const modules = useMemo(() => [...new Set(permissions.map(p => p.module))], [permissions]);
  const assignedCount = rolePerms[activeRole]?.length ?? 0;
  const totalCount = permissions.length;

  const modulePerms = useMemo(() => {
    const m: Record<string, number[]> = {};
    permissions.forEach(p => {
      if (!m[p.module]) m[p.module] = [];
      m[p.module].push(p.id);
    });
    return m;
  }, [permissions]);

  const toggleModule = async (module: string) => {
    const permIds = modulePerms[module] || [];
    const assigned = rolePerms[activeRole] || [];
    const allAssigned = permIds.every(id => assigned.includes(id));
    try {
      if (allAssigned) {
        for (const id of permIds) {
          if (assigned.includes(id)) await removePermission(activeRole, id);
        }
        setRolePerms(p => ({ ...p, [activeRole]: (p[activeRole] || []).filter(id => !permIds.includes(id)) }));
        setActionType('success');
        setActionMsg(`Permisos de "${module}" removidos`);
      } else {
        for (const id of permIds) {
          if (!assigned.includes(id)) await assignPermission(activeRole, id);
        }
        setRolePerms(p => ({ ...p, [activeRole]: [...new Set([...(p[activeRole] || []), ...permIds])] }));
        setActionType('success');
        setActionMsg(`Permisos de "${module}" asignados`);
      }
    } catch (e: any) {
      setActionType('error');
      setActionMsg(e.message);
    }
  };

  return (
    <div className={styles.module}>
      <div className={styles.toastContainer}>
        {actionMsg && (
          <div className={`${styles.toast} ${actionType === 'error' ? styles.toastError : ''}`}>
            <span className={styles.toastIcon}>
              {actionType === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
            </span>
            {actionMsg}
          </div>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaUserShield /></div>
          <div>
            <h2 className={styles.title}>Roles y Permisos</h2>
            <p className={styles.subtitle}>Gestiona los permisos de cada rol del sistema</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnRefresh} onClick={load} title="Actualizar"><FaSyncAlt /></button>
          <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}><FaPlus /> Nuevo Permiso</button>
        </div>
      </div>

      <div className={styles.roleTabsRow}>
        {ROLES.map(r => {
          const count = rolePerms[r]?.length ?? 0;
          const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          return (
            <button
              key={r}
              className={`${styles.roleTab} ${activeRole === r ? styles.roleTabActive : ''}`}
              onClick={() => setActiveRole(r)}
            >
              <span className={styles.roleTabIcon}>{ROLE_ICONS[r]}</span>
              <span className={styles.roleTabInfo}>
                <span className={styles.roleTabName}>{r}</span>
                <span className={styles.roleTabCount}>{count}/{totalCount}</span>
              </span>
              <span className={styles.roleTabBar}>
                <span className={styles.roleTabFill} style={{ width: `${pct}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <FaSpinner className={styles.spinner} /> Cargando permisos...
        </div>
      ) : (
        <>
          <div className={styles.summaryBar}>
            <div className={styles.summaryInfo}>
              <FaCheckCircle className={styles.summaryCheck} />
              <span>
                <strong>{assignedCount}</strong> de <strong>{totalCount}</strong> permisos asignados a <strong className={styles.summaryRole}>{activeRole}</strong>
              </span>
            </div>
            <span className={styles.summaryPct}>{totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0}%</span>
          </div>

          {modules.map(mod => {
            const modPerms = permissions.filter(p => p.module === mod);
            const assignedIds = rolePerms[activeRole] || [];
            const modAssigned = modPerms.filter(p => assignedIds.includes(p.id));
            const allAssigned = modAssigned.length === modPerms.length;

            return (
              <div key={mod} className={styles.moduleCard}>
                <div className={styles.moduleHeader}>
                  <div className={styles.moduleTitle}>
                    <span className={styles.moduleIcon}>{MODULE_ICONS[mod] || <FaLayerGroup />}</span>
                    <div>
                      <span className={styles.moduleName}>{mod}</span>
                      <span className={styles.moduleCount}>{modAssigned.length}/{modPerms.length} permisos</span>
                    </div>
                  </div>
                  <button
                    className={`${styles.moduleToggle} ${allAssigned ? styles.moduleToggleOn : styles.moduleToggleOff}`}
                    onClick={() => toggleModule(mod)}
                  >
                    {allAssigned ? <><FaBan /> Quitar</> : <><FaCheckDouble /> Asignar</>}
                  </button>
                </div>
                <div className={styles.permGrid}>
                  {modPerms.map(p => {
                    const assigned = assignedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`${styles.permCard} ${assigned ? styles.permCardOn : styles.permCardOff}`}
                        onClick={() => togglePermission(p.id)}
                      >
                        <div className={styles.permCardTop}>
                          <span className={styles.permCardName}>{p.name}</span>
                          <span className={`${styles.permToggle} ${assigned ? styles.permToggleOn : ''}`}>
                            <span className={styles.permToggleDot} />
                          </span>
                        </div>
                        <span className={styles.permCardSlug}>{p.slug}</span>
                        {p.description && <span className={styles.permCardDesc}>{p.description}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {modules.length === 0 && (
            <div className={styles.emptyState}>
              <FaUserShield className={styles.emptyIcon} />
              <p>No hay permisos registrados</p>
              <span>Crea un nuevo permiso para comenzar</span>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaPlus /> Nuevo Permiso</h3>
              <button onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Nombre</label>
                <input value={newPerm.name} onChange={e => setNewPerm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Crear usuarios" />
              </div>
              <div className={styles.field}>
                <label>Slug</label>
                <input value={newPerm.slug} onChange={e => setNewPerm(p => ({ ...p, slug: e.target.value }))} placeholder="users.create" />
              </div>
              <div className={styles.field}>
                <label>Descripción</label>
                <input value={newPerm.description} onChange={e => setNewPerm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del permiso" />
              </div>
              <div className={styles.field}>
                <label>Módulo</label>
                <select value={newPerm.module} onChange={e => setNewPerm(p => ({ ...p, module: e.target.value }))}>
                  {['general', 'users', 'support', 'audit', 'permissions', 'sessions', 'security', 'dashboard'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleCreate} disabled={saving || !newPerm.name || !newPerm.slug}>
                {saving ? <><FaSpinner className={styles.spinner} /> Creando...</> : 'Crear Permiso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTiRoles;
