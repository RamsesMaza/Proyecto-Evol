import { useState, useEffect, useCallback } from 'react';
import { FaShoppingCart, FaSearch, FaSyncAlt, FaSpinner, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaEye, FaFilePdf } from 'react-icons/fa';
import { fetchOrders, fetchOrderStats } from '../../services/ordersApi';
import type { Cotizacion as Order } from '../SalesPanel/Cotizaciones/types';
import styles from './AdminOrders.module.scss';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    try { setLoading(true); setError('');
      const params: any = { page, pageSize: PAGE_SIZE };
      if (query) params.query = query;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      const data = await fetchOrders(params);
      setOrders(data.orders as any);
      setTotal(data.total);
    } catch { setError('Error al cargar pedidos'); }
    finally { setLoading(false); }
  }, [query, statusFilter, paymentFilter, page]);

  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchOrderStats().then(setStats).catch(() => {}); }, []);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 3000); return () => clearTimeout(t); } }, [error]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statusColor = (s: string) => {
    const m: Record<string, string> = { completada: '#10b981', pending: '#f59e0b', paid: '#10b981', cancelled: '#ef4444', refunded: '#94a3b8' };
    return m[s] || '#94a3b8';
  };

  const statusLabel = (s: string) => {
    const m: Record<string, string> = { completada: 'Completada', pending: 'Pendiente', paid: 'Pagado', cancelled: 'Cancelado', refunded: 'Reembolsado' };
    return m[s] || s;
  };

  const handleDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      setDetail(data);
    } catch { setError('Error al cargar detalle'); }
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaShoppingCart /></div>
          <div><h2 className={styles.title}>Pedidos</h2><p className={styles.subtitle}>{total} pedidos | Ingresos: S/ {stats?.ingresos?.toFixed(2) ?? '0.00'}</p></div>
        </div>
        <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
      </div>

      {stats && <div className={styles.statsRow}>
        <div className={styles.statBox}><span className={styles.statVal}>{stats.total}</span><span className={styles.statLbl}>Total</span></div>
        <div className={styles.statBox}><span className={styles.statVal} style={{ color: '#10b981' }}>{stats.paid}</span><span className={styles.statLbl}>Pagados</span></div>
        <div className={styles.statBox}><span className={styles.statVal} style={{ color: '#f59e0b' }}>{stats.pending}</span><span className={styles.statLbl}>Pendientes</span></div>
        <div className={styles.statBox}><span className={styles.statVal} style={{ color: '#ef4444' }}>{stats.cancelled}</span><span className={styles.statLbl}>Cancelados</span></div>
        <div className={styles.statBox}><span className={styles.statVal} style={{ color: '#3b82f6' }}>{stats.esteMes}</span><span className={styles.statLbl}>Este mes</span></div>
      </div>}

      {error && <div className={styles.toast}><FaExclamationTriangle /> {error}</div>}

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Buscar cliente o email..." />
          {query && <button className={styles.clearBtn} onClick={() => setQuery('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">Todos los estados</option>
          <option value="completada">Completada</option><option value="pending">Pendiente</option>
          <option value="cancelled">Cancelado</option><option value="refunded">Reembolsado</option>
        </select>
        <select className={styles.filterSelect} value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(0); }}>
          <option value="">Todos los pagos</option>
          <option value="paid">Pagado</option><option value="pending">Pendiente</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> :
          <table className={styles.table}>
            <thead><tr>
              <th>#</th><th>Cliente</th><th>Email</th><th>Total</th><th>Estado</th><th>Pago</th><th>Fecha</th><th className={styles.thActions}>Acciones</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className={styles.cellId}>{o.codigo || `#${o.id}`}</td>
                  <td><span className={styles.cellName}>{o.clienteNombre}</span></td>
                  <td className={styles.cellEmail}>{o.clienteEmail}</td>
                  <td className={styles.cellPrice}>S/ {o.total?.toFixed(2)}</td>
                  <td><span className={styles.statusBadge} style={{ background: `${statusColor(o.estado)}18`, color: statusColor(o.estado) }}>{statusLabel(o.estado)}</span></td>
                  <td><span className={styles.statusBadge} style={{ background: o.estado === 'completada' ? '#10b98118' : '#f59e0b18', color: o.estado === 'completada' ? '#10b981' : '#f59e0b' }}>{o.estado === 'completada' ? 'Pagado' : 'Pendiente'}</span></td>
                  <td className={styles.cellDate}>{new Date(o.createdAt).toLocaleDateString('es-PE')}</td>
                  <td className={styles.tdActions}>
                    <button className={styles.actionBtn} title="Ver detalle" onClick={() => handleDetail(o.id)}><FaEye /></button>
                    <button className={styles.actionBtn} title="Descargar factura" onClick={async () => {
                      try { const r = await fetch(`/api/orders/${o.id}/invoice`); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `recibo-${o.id}.pdf`; a.click(); URL.revokeObjectURL(u); }
                      catch { setError('Error al descargar factura'); }
                    }}><FaFilePdf /></button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={8} className={styles.emptyCell}>No se encontraron pedidos</td></tr>}
            </tbody>
          </table>}
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

      {detail && <div className={styles.modalOverlay} onClick={() => setDetail(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaShoppingCart /> Pedido #{detail.id}</h3><button onClick={() => setDetail(null)}>✕</button></div>
          <div className={styles.modalBody}>
            <div className={styles.detailGrid}>
              <div><span>Cliente</span><strong>{detail.customerName}</strong></div>
              <div><span>Email</span><strong>{detail.customerEmail}</strong></div>
              <div><span>Total</span><strong>S/ {detail.total?.toFixed(2)}</strong></div>
              <div><span>Estado</span><strong style={{ color: statusColor(detail.status || detail.paymentStatus) }}>{statusLabel(detail.status || detail.paymentStatus)}</strong></div>
              <div><span>Pago</span><strong>{detail.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}</strong></div>
              <div><span>Método</span><strong>{detail.paymentMethod || '—'}</strong></div>
              <div><span>Fecha</span><strong>{new Date(detail.createdAt).toLocaleString('es-PE')}</strong></div>
            </div>
            {detail.items && detail.items.length > 0 && <>
              <h4 style={{ margin: '16px 0 8px', fontSize: 14, color: '#0f172a' }}>Productos</h4>
              <table className={styles.table} style={{ marginBottom: 0 }}>
                <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>{detail.items.map((it: any) => (
                  <tr key={it.id}><td>{it.product?.title || `Producto #${it.productId}`}</td><td>{it.quantity}</td><td>S/ {it.price?.toFixed(2)}</td><td>S/ {(it.quantity * it.price).toFixed(2)}</td></tr>
                ))}</tbody>
              </table>
            </>}
          </div>
          <div className={styles.modalFooter}><button className={styles.btnOutline} onClick={() => setDetail(null)}>Cerrar</button></div>
        </div>
      </div>}
    </div>
  );
};

export default AdminOrders;
