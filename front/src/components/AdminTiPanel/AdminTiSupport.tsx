import { useState, useEffect, useCallback } from 'react';
import { FaHeadset, FaSyncAlt, FaPlus, FaEye, FaEdit, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { fetchSupportTickets, createSupportTicket, updateSupportTicket, type SupportTicket } from '../../services/adminTiApi';
import styles from './AdminTiSupport.module.scss';

const PRIORITIES = ['baja', 'media', 'alta', 'critica'];
const STATUSES = ['abierto', 'en_progreso', 'resuelto', 'cerrado'];

const statusColor = (s: string) => {
  const m: Record<string, string> = { abierto: '#ef4444', en_progreso: '#f59e0b', resuelto: '#10b981', cerrado: '#64748b' };
  return m[s] || '#94a3b8';
};

const priorityColor = (p: string) => {
  const m: Record<string, string> = { baja: '#10b981', media: '#f59e0b', alta: '#ef4444', critica: '#dc2626' };
  return m[p] || '#94a3b8';
};

const AdminTiSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [modal, setModal] = useState<{ type: 'create' | 'detail' | 'edit'; ticket?: SupportTicket } | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'media', status: 'abierto' });
  const [saving, setSaving] = useState(false);

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    try { setLoading(true);
      const params: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const data = await fetchSupportTickets(params);
      setTickets(data.tickets); setTotal(data.total);
    } catch { setActionMsg('Error al cargar tickets'); }
    finally { setLoading(false); }
  }, [page, statusFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 2500); return () => clearTimeout(t); } }, [actionMsg]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createSupportTicket(formData);
      setActionMsg('Ticket creado'); setModal(null);
      setFormData({ title: '', description: '', priority: 'media', status: 'abierto' });
      load();
    } catch (e: any) { setActionMsg(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (ticket: SupportTicket, data: any) => {
    try {
      await updateSupportTicket(ticket.id, data);
      setActionMsg('Ticket actualizado');
      if (modal?.type === 'edit') setModal(null);
      load();
    } catch (e: any) { setActionMsg(e.message); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaHeadset /></div>
          <div><h2 className={styles.title}>Soporte Técnico</h2><p className={styles.subtitle}>{total} tickets registrados</p></div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
          <button className={styles.btnPrimary} onClick={() => { setFormData({ title: '', description: '', priority: 'media', status: 'abierto' }); setModal({ type: 'create' }); }}>
            <FaPlus /> Nuevo Ticket
          </button>
        </div>
      </div>

      {actionMsg && <div className={styles.toast}><FaExclamationTriangle /> {actionMsg}</div>}

      <div className={styles.filterBar}>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">Todos los estados</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className={styles.filterSelect} value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(0); }}>
          <option value="">Todas las prioridades</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className={styles.card}>
        {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> : (
          <table className={styles.table}>
            <thead><tr>
              <th>Título</th><th>Prioridad</th><th>Estado</th><th>Creado por</th><th>Asignado a</th><th>Fecha</th><th className={styles.thActions}>Acciones</th>
            </tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className={styles.tr}>
                  <td><span className={styles.ticketTitle}>{t.title}</span></td>
                  <td><span className={styles.priorityBadge} style={{ background: `${priorityColor(t.priority)}18`, color: priorityColor(t.priority) }}>{t.priority}</span></td>
                  <td><span className={styles.statusBadge} style={{ background: `${statusColor(t.status)}18`, color: statusColor(t.status) }}>{t.status.replace('_', ' ')}</span></td>
                  <td className={styles.cellUser}>{t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : <span className={styles.noAssign}>—</span>}</td>
                  <td className={styles.cellUser}>{t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : <span className={styles.noAssign}>Sin asignar</span>}</td>
                  <td className={styles.cellDate}>{new Date(t.createdAt).toLocaleDateString('es-PE')}</td>
                  <td className={styles.tdActions}>
                    <div className={styles.actionBtns}>
                      <button className={styles.actionBtn} title="Ver detalle" onClick={() => setModal({ type: 'detail', ticket: t })}><FaEye /></button>
                      <button className={styles.actionBtn} title="Editar estado" onClick={() => { setFormData({ title: t.title, description: t.description, priority: t.priority, status: t.status }); setModal({ type: 'edit', ticket: t }); }}><FaEdit /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && <tr><td colSpan={7} className={styles.emptyCell}>No se encontraron tickets</td></tr>}
            </tbody>
          </table>
        )}
        {totalPages > 1 && <div className={styles.pagination}>
          <span className={styles.pageInfo}>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}</span>
          <div className={styles.pageBtns}>
            <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
              <button key={i} className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        </div>}
      </div>

      {/* Create Modal */}
      {modal?.type === 'create' && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaPlus /> Nuevo Ticket</h3><button onClick={() => setModal(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.field}><label>Título</label><input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
            <div className={styles.field}><label>Descripción</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} /></div>
            <div className={styles.field}><label>Prioridad</label>
              <select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleCreate} disabled={saving || !formData.title}>{saving ? 'Guardando...' : 'Crear Ticket'}</button>
          </div>
        </div>
      </div>}

      {/* Detail Modal */}
      {modal?.type === 'detail' && modal.ticket && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaEye /> {modal.ticket.title}</h3><button onClick={() => setModal(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.detailGrid}>
              <div className={styles.detailField}><span>Estado</span><strong style={{ color: statusColor(modal.ticket.status) }}>{modal.ticket.status.replace('_', ' ')}</strong></div>
              <div className={styles.detailField}><span>Prioridad</span><strong style={{ color: priorityColor(modal.ticket.priority) }}>{modal.ticket.priority}</strong></div>
              <div className={styles.detailField}><span>Creado por</span><strong>{modal.ticket.createdBy ? `${modal.ticket.createdBy.firstName} ${modal.ticket.createdBy.lastName}` : '—'}</strong></div>
              <div className={styles.detailField}><span>Asignado a</span><strong>{modal.ticket.assignedTo ? `${modal.ticket.assignedTo.firstName} ${modal.ticket.assignedTo.lastName}` : 'Sin asignar'}</strong></div>
              <div className={styles.detailField}><span>Fecha</span><strong>{new Date(modal.ticket.createdAt).toLocaleString('es-PE')}</strong></div>
              {modal.ticket.updatedAt !== modal.ticket.createdAt && <div className={styles.detailField}><span>Actualizado</span><strong>{new Date(modal.ticket.updatedAt).toLocaleString('es-PE')}</strong></div>}
            </div>
            <div className={styles.detailDesc}>
              <strong>Descripción</strong>
              <p>{modal.ticket.description}</p>
            </div>
            {modal.ticket.resolution && <div className={styles.detailDesc}>
              <strong>Resolución</strong>
              <p>{modal.ticket.resolution}</p>
            </div>}
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setModal(null)}>Cerrar</button>
            <button className={styles.btnPrimary} onClick={() => { setFormData({ title: modal.ticket!.title, description: modal.ticket!.description, priority: modal.ticket!.priority, status: modal.ticket!.status }); setModal({ type: 'edit', ticket: modal.ticket }); }}>
              <FaEdit /> Editar
            </button>
          </div>
        </div>
      </div>}

      {/* Edit Modal */}
      {modal?.type === 'edit' && modal.ticket && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaEdit /> Actualizar Ticket</h3><button onClick={() => setModal(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.field}><label>Estado</label>
              <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className={styles.field}><label>Prioridad</label>
              <select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setModal(null)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={() => handleUpdate(modal.ticket!, { status: formData.status, priority: formData.priority })}>
              <FaCheckCircle /> Actualizar
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default AdminTiSupport;
