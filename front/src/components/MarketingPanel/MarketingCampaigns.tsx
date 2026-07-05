import { useState, useEffect } from 'react';
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaSpinner, FaTimes, FaSave, FaDollarSign, FaCalendarAlt, FaBullseye, FaChartLine, FaUsers, FaEnvelope, FaSms } from 'react-icons/fa';
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign, recordCampaignResult, type Campaign } from '../../services/marketingApi';
import styles from './MarketingCampaigns.module.scss';

const STATUSES = ['borrador', 'activa', 'pausada', 'finalizada', 'cancelada'];
const TYPES = ['email', 'sms', 'redes', 'evento', 'otro'];

const statusColors: Record<string, string> = {
  borrador: '#6b7280', activa: '#10b981', pausada: '#f59e0b', finalizada: '#3b82f6', cancelada: '#ef4444',
};

const MarketingCampaigns = () => {
  const [data, setData] = useState<{ campaigns: Campaign[]; total: number }>({ campaigns: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);
  const [showResult, setShowResult] = useState<Campaign | null>(null);
  const [resultForm, setResultForm] = useState({ leadsGenerated: 0, leadsConverted: 0, revenue: 0, impressions: 0, clicks: 0, opens: 0 });

  const load = async () => {
    try { setLoading(true); setError('');
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      setData(await fetchCampaigns(params));
    } catch { setError('Error al cargar campañas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter, typeFilter]);

  const [form, setForm] = useState({ name: '', description: '', objective: '', budget: 0, spent: 0, startDate: '', endDate: '', status: 'borrador' as string, type: 'otro' as string });

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', objective: '', budget: 0, spent: 0, startDate: '', endDate: '', status: 'borrador', type: 'otro' }); setShowForm(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      name: c.name, description: c.description || '', objective: c.objective || '',
      budget: c.budget, spent: c.spent, status: c.status, type: c.type,
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) { await updateCampaign(editing.id, form); } else { await createCampaign(form); }
      setShowForm(false); load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta campaña?')) return;
    try { await deleteCampaign(id); load(); } catch (e: any) { setError(e.message); }
  };

  const handleResult = async () => {
    if (!showResult) return;
    try { await recordCampaignResult(showResult.id, resultForm); setShowResult(null); load(); } catch (e: any) { setError(e.message); }
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaBullhorn /></div>
          <div><h2 className={styles.title}>Campañas</h2><p className={styles.subtitle}>{data.total} campañas registradas</p></div>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}><FaPlus /> Nueva Campaña</button>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error}</div>}

      <div className={styles.filters}>
        <div className={styles.searchWrap}><input type="text" placeholder="Buscar campañas..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className={styles.searchInput} /></div>
        <select className={styles.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}><option value="">Todos los estados</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
        <select className={styles.select} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}><option value="">Todos los tipos</option>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <button className={styles.btnSecondary} onClick={load}><FaSearch /> Buscar</button>
      </div>

      {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
        <div className={styles.grid}>
          {data.campaigns.map(c => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{c.name}</h3>
                <span className={styles.badge} style={{ background: `${statusColors[c.status]}18`, color: statusColors[c.status] }}>{c.status}</span>
              </div>
              {c.description && <p className={styles.cardDesc}>{c.description}</p>}
              <div className={styles.cardMeta}>
                <span><FaBullseye /> {c.objective || 'Sin objetivo'}</span>
                <span><FaDollarSign /> S/ {c.budget.toFixed(2)}</span>
                {c.startDate && <span><FaCalendarAlt /> {new Date(c.startDate).toLocaleDateString('es-PE')}</span>}
              </div>
              <div className={styles.cardStats}>
                <span><FaUsers /> {c._count?.leads || 0} leads</span>
                <span><FaEnvelope /> {c._count?.emailCampaigns || 0} emails</span>
                <span><FaSms /> {c._count?.smsCampaigns || 0} SMS</span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.cardBtn} onClick={() => { setShowResult(c); setResultForm({ leadsGenerated: 0, leadsConverted: 0, revenue: 0, impressions: 0, clicks: 0, opens: 0 }); }}><FaChartLine /> Resultados</button>
                <button className={styles.cardBtn} onClick={() => openEdit(c)}><FaEdit /></button>
                <button className={styles.cardBtnDanger} onClick={() => handleDelete(c.id)}><FaTrash /></button>
              </div>
            </div>
          ))}
          {data.campaigns.length === 0 && <div className={styles.empty}>No se encontraron campañas</div>}
        </div>
      )}

      {showForm && (
        <div className={styles.modal} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing ? 'Editar Campaña' : 'Nueva Campaña'}</h3>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.fullWidth}>Nombre *<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={styles.input} /></label>
              <label className={styles.fullWidth}>Descripción<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={styles.textarea} rows={3} /></label>
              <label className={styles.fullWidth}>Objetivo<textarea value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} className={styles.textarea} rows={2} /></label>
              <label>Presupuesto<input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} className={styles.input} /></label>
              <label>Gastado<input type="number" value={form.spent} onChange={e => setForm({ ...form, spent: Number(e.target.value) })} className={styles.input} /></label>
              <label>Tipo<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={styles.select}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
              <label>Estado<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={styles.select}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
              <label>Inicio<input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={styles.input} /></label>
              <label>Fin<input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={styles.input} /></label>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || !form.name.trim()}>{saving ? <FaSpinner className={styles.spinner} /> : <FaSave />} {editing ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div className={styles.modal} onClick={() => setShowResult(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaChartLine /> Resultados - {showResult.name}</h3>
              <button className={styles.modalClose} onClick={() => setShowResult(null)}><FaTimes /></button>
            </div>
            <div className={styles.formGrid}>
              <label>Leads Generados<input type="number" value={resultForm.leadsGenerated} onChange={e => setResultForm({ ...resultForm, leadsGenerated: Number(e.target.value) })} className={styles.input} /></label>
              <label>Leads Convertidos<input type="number" value={resultForm.leadsConverted} onChange={e => setResultForm({ ...resultForm, leadsConverted: Number(e.target.value) })} className={styles.input} /></label>
              <label>Ingresos (S/)<input type="number" value={resultForm.revenue} onChange={e => setResultForm({ ...resultForm, revenue: Number(e.target.value) })} className={styles.input} /></label>
              <label>Impresiones<input type="number" value={resultForm.impressions} onChange={e => setResultForm({ ...resultForm, impressions: Number(e.target.value) })} className={styles.input} /></label>
              <label>Clicks<input type="number" value={resultForm.clicks} onChange={e => setResultForm({ ...resultForm, clicks: Number(e.target.value) })} className={styles.input} /></label>
              <label>Aperturas<input type="number" value={resultForm.opens} onChange={e => setResultForm({ ...resultForm, opens: Number(e.target.value) })} className={styles.input} /></label>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowResult(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleResult}><FaSave /> Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingCampaigns;
