import React, { useState, useEffect, useCallback } from 'react';
import { FaUserShield, FaSyncAlt, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { fetchPermissions, fetchRolePermissions, assignPermission, removePermission, createPermission, type Permission } from '../../services/adminTiApi';
import styles from './AdminTiRoles.module.scss';

const ROLES = ['USER', 'SALES', 'TI', 'ADMIN'];

const AdminTiRoles = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePerms, setRolePerms] = useState<Record<string, number[]>>({});
  const [activeRole, setActiveRole] = useState('TI');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newPerm, setNewPerm] = useState({ name: '', slug: '', description: '', module: 'general' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true);
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
    } catch { setActionMsg('Error al cargar permisos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 2500); return () => clearTimeout(t); } }, [actionMsg]);

  const togglePermission = async (permId: number) => {
    const has = rolePerms[activeRole]?.includes(permId);
    try {
      if (has) {
        await removePermission(activeRole, permId);
        setRolePerms(p => ({ ...p, [activeRole]: p[activeRole].filter(id => id !== permId) }));
        setActionMsg('Permiso removido');
      } else {
        await assignPermission(activeRole, permId);
        setRolePerms(p => ({ ...p, [activeRole]: [...(p[activeRole] || []), permId] }));
        setActionMsg('Permiso asignado');
      }
    } catch (e: any) { setActionMsg(e.message); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createPermission(newPerm);
      setActionMsg('Permiso creado'); setShowCreate(false);
      setNewPerm({ name: '', slug: '', description: '', module: 'general' });
      load();
    } catch (e: any) { setActionMsg(e.message); }
    finally { setSaving(false); }
  };

  const modules = [...new Set(permissions.map(p => p.module))];

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaUserShield /></div>
          <div><h2 className={styles.title}>Roles y Permisos</h2><p className={styles.subtitle}>Gestiona los permisos de cada rol del sistema</p></div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
          <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}><FaPlus /> Nuevo Permiso</button>
        </div>
      </div>

      {actionMsg && <div className={styles.toast}>{actionMsg}</div>}

      <div className={styles.roleTabs}>
        {ROLES.map(r => (
          <button key={r} className={`${styles.roleTab} ${activeRole === r ? styles.roleTabActive : ''}`}
            onClick={() => setActiveRole(r)}>
            {r}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {loading ? <div className={styles.loading}>Cargando permisos...</div> : (
          <table className={styles.table}>
            <thead><tr>
              <th>Permiso</th><th>Slug</th><th>Módulo</th><th className={styles.thCenter}>Asignado</th>
            </tr></thead>
            <tbody>
              {modules.map(mod => (
                <React.Fragment key={mod}>
                  <tr className={styles.moduleRow}><td colSpan={4} className={styles.moduleLabel}>{mod}</td></tr>
                  {permissions.filter(p => p.module === mod).map(p => (
                    <tr key={p.id} className={styles.tr}>
                      <td><span className={styles.permName}>{p.name}</span><span className={styles.permDesc}>{p.description}</span></td>
                      <td><code className={styles.slug}>{p.slug}</code></td>
                      <td><span className={styles.moduleBadge}>{p.module}</span></td>
                      <td className={styles.tdCenter}>
                        <button className={`${styles.toggle} ${rolePerms[activeRole]?.includes(p.id) ? styles.toggleOn : styles.toggleOff}`}
                          onClick={() => togglePermission(p.id)}>
                          {rolePerms[activeRole]?.includes(p.id) ? <FaCheck /> : <FaTimes />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaPlus /> Nuevo Permiso</h3><button onClick={() => setShowCreate(false)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.field}><label>Nombre</label><input value={newPerm.name} onChange={e => setNewPerm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className={styles.field}><label>Slug</label><input value={newPerm.slug} onChange={e => setNewPerm(p => ({ ...p, slug: e.target.value }))} placeholder="users.create" /></div>
            <div className={styles.field}><label>Descripción</label><input value={newPerm.description} onChange={e => setNewPerm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className={styles.field}><label>Módulo</label>
              <select value={newPerm.module} onChange={e => setNewPerm(p => ({ ...p, module: e.target.value }))}>
                {['general', 'users', 'support', 'audit', 'permissions', 'sessions', 'security', 'dashboard'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleCreate} disabled={saving || !newPerm.name || !newPerm.slug}>
              {saving ? 'Guardando...' : 'Crear Permiso'}
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default AdminTiRoles;
