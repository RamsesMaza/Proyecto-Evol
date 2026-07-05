import { useState, useEffect } from 'react';
import { FaEnvelope, FaPlus, FaEdit, FaSearch, FaExclamationTriangle, FaSpinner, FaTimes, FaSave, FaCalendarAlt, FaEye, FaMousePointer, FaCheckCircle, FaUsers } from 'react-icons/fa';
import { fetchCampaigns, fetchEmailCampaigns, createEmailCampaign, updateEmailCampaign, type Campaign } from '../../services/marketingApi';
import styles from './MarketingEmail.module.scss';

const MarketingEmail = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ campaignId: '', name: '', subject: '', body: '', template: '', status: 'borrador', scheduledAt: '' });

  const load = async () => {
    try { setLoading(true); setError('');
      const [c, e] = await Promise.all([fetchCampaigns({ pageSize: '100' }), fetchEmailCampaigns()]);
      setCampaigns(c.campaigns); setEmailCampaigns(e.campaigns);
    } catch { setError('Error al cargar datos'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ campaignId: selectedCampaign, name: '', subject: '', body: '', template: '', status: 'borrador', scheduledAt: '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim()) return;
    setSaving(true);
    try {
      if (editing) { await updateEmailCampaign(editing.id, form); } else { await createEmailCampaign(form); }
      setShowForm(false); load();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaEnvelope /></div>
          <div><h2 className={styles.title}>Email Marketing</h2><p className={styles.subtitle}>{emailCampaigns.length} campañas de correo</p></div>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}><FaPlus /> Nuevo Email</button>
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
          {emailCampaigns.filter(e => !selectedCampaign || e.campaignId === Number(selectedCampaign)).map(ec => (
            <div key={ec.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{ec.name}</h3>
                <span className={styles.badge}>{ec.status}</span>
              </div>
              <p className={styles.subject}><FaEnvelope /> {ec.subject}</p>
              <div className={styles.stats}>
                <span><FaUsers /> {ec.recipients}</span>
                <span><FaEye /> {ec.opened}</span>
                <span><FaMousePointer /> {ec.clicked}</span>
                <span><FaCheckCircle /> {ec.converted}</span>
              </div>
              {ec.scheduledAt && <p className={styles.meta}><FaCalendarAlt /> {new Date(ec.scheduledAt).toLocaleString('es-PE')}</p>}
              <div className={styles.cardActions}>
                <button className={styles.cardBtn} onClick={() => { setEditing(ec); setForm({ campaignId: String(ec.campaignId), name: ec.name, subject: ec.subject, body: ec.body, template: ec.template || '', status: ec.status, scheduledAt: ec.scheduledAt ? ec.scheduledAt.slice(0, 16) : '' }); setShowForm(true); }}><FaEdit /></button>
              </div>
            </div>
          ))}
          {emailCampaigns.length === 0 && <div className={styles.empty}>Sin campañas de email</div>}
        </div>
      )}

      {showForm && (
        <div className={styles.modal} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing ? 'Editar Email' : 'Nueva Campaña de Email'}</h3>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.fullWidth}>Campaña<select value={form.campaignId} onChange={e => setForm({ ...form, campaignId: e.target.value })} className={styles.select}>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label className={styles.fullWidth}>Nombre *<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={styles.input} /></label>
              <label className={styles.fullWidth}>Asunto *<input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={styles.input} /></label>
              <label className={styles.fullWidth}>Cuerpo (HTML)<textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className={styles.textarea} rows={6} /></label>
              <label>Plantilla<input value={form.template} onChange={e => setForm({ ...form, template: e.target.value })} className={styles.input} /></label>
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

export default MarketingEmail;
