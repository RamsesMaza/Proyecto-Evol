import { useState, useEffect } from 'react';
import { FaLayerGroup, FaPlus, FaTrash, FaExclamationTriangle, FaSpinner, FaTimes, FaSave, FaUsers, FaEye, FaCheckCircle } from 'react-icons/fa';
import { fetchSegments, createSegment, deleteSegment, evaluateSegment, type Segment } from '../../services/marketingApi';
import styles from './MarketingSegmentacion.module.scss';

const MarketingSegmentacion = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [evaluating, setEvaluating] = useState<number | null>(null);
  const [evalResult, setEvalResult] = useState<{ count: number; members: any[] } | null>(null);

  const load = async () => {
    try { setLoading(true); setError(''); setSegments((await fetchSegments()).segments); } catch { setError('Error al cargar segmentos'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await createSegment({ name: form.name, description: form.description, criteria: '{}' }); setShowForm(false); setForm({ name: '', description: '' }); load(); } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este segmento?')) return;
    try { await deleteSegment(id); load(); } catch (e: any) { setError(e.message); }
  };

  const handleEvaluate = async (id: number) => {
    setEvaluating(id);
    try { const r = await evaluateSegment(id); setEvalResult(r); } catch (e: any) { setError(e.message); } finally { setEvaluating(null); }
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaLayerGroup /></div>
          <div><h2 className={styles.title}>Segmentación de Clientes</h2><p className={styles.subtitle}>{segments.length} segmentos creados</p></div>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}><FaPlus /> Nuevo Segmento</button>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error}</div>}

      {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
        <div className={styles.grid}>
          {segments.map(s => (
            <div key={s.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{s.name}</h3>
                <span className={styles.memberCount}><FaUsers /> {s._count?.members || 0}</span>
              </div>
              {s.description && <p className={styles.cardDesc}>{s.description}</p>}
              <div className={styles.cardActions}>
                <button className={styles.btnSecondary} onClick={() => handleEvaluate(s.id)} disabled={evaluating === s.id}>
                  {evaluating === s.id ? <FaSpinner className={styles.spinner} /> : <FaEye />} Evaluar
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(s.id)}><FaTrash /></button>
              </div>
            </div>
          ))}
          {segments.length === 0 && <div className={styles.empty}>No hay segmentos creados</div>}
        </div>
      )}

      {showForm && (
        <div className={styles.modal} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Nuevo Segmento</h3>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.fullWidth}>Nombre *<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={styles.input} /></label>
              <label className={styles.fullWidth}>Descripción<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={styles.textarea} rows={3} /></label>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleCreate} disabled={saving || !form.name.trim()}>{saving ? <FaSpinner className={styles.spinner} /> : <FaSave />} Crear</button>
            </div>
          </div>
        </div>
      )}

      {evalResult && (
        <div className={styles.modal} onClick={() => setEvalResult(null)}>
          <div className={styles.modalContentLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaCheckCircle /> Resultado: {evalResult.count} miembros</h3>
              <button className={styles.modalClose} onClick={() => setEvalResult(null)}><FaTimes /></button>
            </div>
            <table className={styles.table}>
              <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Empresa</th><th>Estado</th><th>Registro</th></tr></thead>
              <tbody>
                {evalResult.members.map((m: any) => (
                  <tr key={m.id}><td>{m.firstName} {m.lastName}</td><td>{m.email}</td><td>{m.phone || '-'}</td><td>{m.company || '-'}</td><td>{m.status}</td><td>{new Date(m.createdAt).toLocaleDateString('es-PE')}</td></tr>
                ))}
                {evalResult.members.length === 0 && <tr><td colSpan={6} className={styles.empty}>Sin miembros</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingSegmentacion;
