import { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaSpinner, FaTimes, FaSave, FaClock } from 'react-icons/fa';
import { fetchLeads, createLead, updateLead, deleteLead, addLeadActivity, type Lead } from '../../services/marketingApi';
import styles from './MarketingLeads.module.scss';

const STATUS_OPTIONS = ['nuevo', 'contactado', 'interesado', 'en_negociacion', 'convertido', 'perdido'];
const PRIORITY_OPTIONS = ['baja', 'media', 'alta', 'urgente'];
const SOURCE_OPTIONS = ['web', 'referido', 'campana', 'llamada', 'email', 'redes', 'otro'];

const statusColors: Record<string, string> = {
  nuevo: '#3b82f6', contactado: '#f59e0b', interesado: '#8b5cf6',
  en_negociacion: '#ec4899', convertido: '#10b981', perdido: '#ef4444',
};
const priorityColors: Record<string, string> = {
  baja: '#10b981', media: '#f59e0b', alta: '#ec4899', urgente: '#ef4444',
};

const MarketingLeads = () => {
  const [data, setData] = useState<{ leads: Lead[]; total: number }>({ leads: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [showActivity, setShowActivity] = useState<Lead | null>(null);
  const [activityText, setActivityText] = useState('');
  const [activityType, setActivityType] = useState('nota');

  const load = async () => {
    try { setLoading(true); setError('');
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      setData(await fetchLeads(params));
    } catch { setError('Error al cargar leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter, priorityFilter]);

  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', position: '', source: 'web', status: 'nuevo', priority: 'media', notes: '' });

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '', company: '', position: '', source: 'web', status: 'nuevo', priority: 'media', notes: '' }); setShowForm(true); };
  const openEdit = (l: Lead) => { setEditing(l); setForm({ name: l.name, email: l.email || '', phone: l.phone || '', company: l.company || '', position: l.position || '', source: l.source, status: l.status, priority: l.priority, notes: l.notes || '' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) { await updateLead(editing.id, form); } else { await createLead(form); }
      setShowForm(false); load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este lead?')) return;
    try { await deleteLead(id); load(); } catch (e: any) { setError(e.message); }
  };

  const handleActivity = async () => {
    if (!showActivity || !activityText.trim()) return;
    try {
      await addLeadActivity(showActivity.id, { type: activityType, description: activityText });
      setActivityText(''); load();
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaUsers /></div>
          <div><h2 className={styles.title}>Gestión de Leads</h2><p className={styles.subtitle}>{data.total} prospectos registrados</p></div>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}><FaPlus /> Nuevo Lead</button>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error}</div>}

      <div className={styles.filters}>
        <div className={styles.searchWrap}><FaSearch className={styles.searchIcon} /><input type="text" placeholder="Buscar por nombre, email, empresa..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className={styles.searchInput} /></div>
        <select className={styles.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className={styles.select} value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
          <option value="">Todas las prioridades</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <button className={styles.btnSecondary} onClick={load}><FaSearch /> Buscar</button>
      </div>

      {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>Nombre</th><th>Contacto</th><th>Empresa</th><th>Estado</th><th>Prioridad</th><th>Origen</th><th>Fecha</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {data.leads.map(l => (
                <tr key={l.id}>
                  <td className={styles.nameCell}>{l.name}</td>
                  <td><small>{l.email}<br />{l.phone}</small></td>
                  <td>{l.company || '-'} {l.position ? <span className={styles.muted}>/ {l.position}</span> : ''}</td>
                  <td><span className={styles.badge} style={{ background: `${statusColors[l.status]}18`, color: statusColors[l.status] }}>{l.status}</span></td>
                  <td><span className={styles.badge} style={{ background: `${priorityColors[l.priority]}18`, color: priorityColors[l.priority] }}>{l.priority}</span></td>
                  <td>{l.source}</td>
                  <td><small>{new Date(l.createdAt).toLocaleDateString('es-PE')}</small></td>
                  <td className={styles.actions}>
                    <button className={styles.iconBtn} onClick={() => { setShowActivity(l); setActivityType('nota'); setActivityText(''); }} title="Actividad"><FaClock /></button>
                    <button className={styles.iconBtn} onClick={() => openEdit(l)} title="Editar"><FaEdit /></button>
                    <button className={styles.iconBtnDanger} onClick={() => handleDelete(l.id)} title="Eliminar"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {data.leads.length === 0 && <tr><td colSpan={8} className={styles.empty}>No se encontraron leads</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className={styles.modal} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing ? 'Editar Lead' : 'Nuevo Lead'}</h3>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <div className={styles.formGrid}>
              <label>Nombre *<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={styles.input} /></label>
              <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={styles.input} /></label>
              <label>Teléfono<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={styles.input} /></label>
              <label>Empresa<input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={styles.input} /></label>
              <label>Cargo<input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className={styles.input} /></label>
              <label>Origen<select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className={styles.select}>{SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></label>
              <label>Estado<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={styles.select}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></label>
              <label>Prioridad<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={styles.select}>{PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></label>
              <label className={styles.fullWidth}>Notas<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={styles.textarea} rows={3} /></label>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || !form.name.trim()}>{saving ? <FaSpinner className={styles.spinner} /> : <FaSave />} {editing ? 'Guardar Cambios' : 'Crear Lead'}</button>
            </div>
          </div>
        </div>
      )}

      {showActivity && (
        <div className={styles.modal} onClick={() => setShowActivity(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaClock /> Actividad - {showActivity.name}</h3>
              <button className={styles.modalClose} onClick={() => setShowActivity(null)}><FaTimes /></button>
            </div>
            <div className={styles.activityHistory}>
              {showActivity.activities?.map((a: any) => (
                <div key={a.id} className={styles.actividadItem}>
                  <span className={styles.actividadType}>{a.type}</span>
                  <span>{a.description}</span>
                  <span className={styles.activityDate}>{new Date(a.createdAt).toLocaleString('es-PE')}</span>
                </div>
              ))}
              {(!showActivity.activities || showActivity.activities.length === 0) && <p className={styles.empty}>Sin actividad registrada</p>}
            </div>
            <div className={styles.activityForm}>
              <select value={activityType} onChange={e => setActivityType(e.target.value)} className={styles.select}>
                <option value="nota">Nota</option><option value="llamada">Llamada</option><option value="correo">Correo</option><option value="reunion">Reunión</option>
              </select>
              <input type="text" placeholder="Describir actividad..." value={activityText} onChange={e => setActivityText(e.target.value)} className={styles.input} />
              <button className={styles.btnPrimary} onClick={handleActivity} disabled={!activityText.trim()}><FaSave /> Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingLeads;
