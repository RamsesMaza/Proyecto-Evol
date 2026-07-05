import { useState, useEffect } from 'react';
import { FaSms, FaPlus, FaEdit, FaSearch, FaExclamationTriangle, FaSpinner, FaTimes, FaSave, FaCalendarAlt, FaPhone, FaCheckCircle, FaClock } from 'react-icons/fa';
import { fetchCampaigns, fetchSmsCampaigns, createSmsCampaign, updateSmsCampaign, type Campaign } from '../../services/marketingApi';
import styles from './MarketingSms.module.scss';

const PROVIDERS = ['twilio', 'vonage', 'messagebird'];

const MarketingSms = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [smsCampaigns, setSmsCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ campaignId: '', name: '', message: '', provider: 'twilio', status: 'borrador', scheduledAt: '' });

  const load = async () => {
    try { setLoading(true); setError('');
      const [c, s] = await Promise.all([fetchCampaigns({ pageSize: '100' }), fetchSmsCampaigns()]);
      setCampaigns(c.campaigns); setSmsCampaigns(s.campaigns);
    } catch { setError('Error al cargar datos'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      if (editing) { await updateSmsCampaign(editing.id, form); } else { await createSmsCampaign(form); }
      setShowForm(false); load();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaSms /></div>
          <div><h2 className={styles.title}>SMS Marketing</h2><p className={styles.subtitle}>{smsCampaigns.length} campañas SMS</p></div>
        </div>
        <button className={styles.btnPrimary} onClick={() => { setEditing(null); setForm({ campaignId: selectedCampaign, name: '', message: '', provider: 'twilio', status: 'borrador', scheduledAt: '' }); setShowForm(true); }}><FaPlus /> Nueva Campaña SMS</button>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error}</div>}

      <div className={styles.filters}>
        <select className={styles.select} value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
          <option value="">Todas las campañas</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className={styles.btnSecondary} onClick={load}><FaSearch /> Filtrar</button>
      </div>

      {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
        <div className={styles.grid}>
          {smsCampaigns.filter(s => !selectedCampaign || s.campaignId === Number(selectedCampaign)).map(sc => (
            <div key={sc.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{sc.name}</h3>
                <span className={styles.badge}>{sc.status}</span>
              </div>
              <p className={styles.message}>{sc.message}</p>
              <div className={styles.meta}>
                <span><FaPhone /> {sc.provider}</span>
                {sc.scheduledAt && <span><FaCalendarAlt /> {new Date(sc.scheduledAt).toLocaleString('es-PE')}</span>}
              </div>
              <div className={styles.stats}>
                <span><FaSms /> {sc.sent} enviados</span>
                <span><FaCheckCircle /> {sc.delivered} entregados</span>
                <span><FaClock /> {sc.responded} responded</span>
              </div>
              <button className={styles.cardBtn} onClick={() => { setEditing(sc); setForm({ campaignId: String(sc.campaignId), name: sc.name, message: sc.message, provider: sc.provider, status: sc.status, scheduledAt: sc.scheduledAt ? sc.scheduledAt.slice(0, 16) : '' }); setShowForm(true); }}><FaEdit /></button>
            </div>
          ))}
          {smsCampaigns.length === 0 && <div className={styles.empty}>Sin campañas SMS</div>}
        </div>
      )}

      {showForm && (
        <div className={styles.modal} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing ? 'Editar SMS' : 'Nueva Campaña SMS'}</h3>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.fullWidth}>Campaña<select value={form.campaignId} onChange={e => setForm({ ...form, campaignId: e.target.value })} className={styles.select}>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label className={styles.fullWidth}>Nombre *<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={styles.input} /></label>
              <label className={styles.fullWidth}>Mensaje *<textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={styles.textarea} rows={4} maxLength={160} /></label>
              <label>Proveedor<select value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className={styles.select}>{PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
              <label>Estado<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={styles.select}><option value="borrador">Borrador</option><option value="programado">Programado</option><option value="enviado">Enviado</option></select></label>
              <label>Programar para<input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className={styles.input} /></label>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? <FaSpinner /> : <FaSave />} {editing ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingSms;
