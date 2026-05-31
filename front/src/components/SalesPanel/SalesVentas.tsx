import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChartLine, FaDollarSign, FaCheckCircle, FaExclamationCircle, FaSearch, FaSyncAlt, FaReceipt, FaUser, FaCalendarAlt, FaSpinner, FaExclamationTriangle, FaSort, FaSortUp, FaSortDown, FaEye, FaChevronLeft, FaChevronRight, FaMoneyBillWave, FaPercentage, FaShoppingCart, FaTimesCircle, FaUndo } from 'react-icons/fa';
import { useRefresh } from '../../context/RefreshContext';
import type { Cotizacion, SortField, SortDir } from './Cotizaciones/types';
import { fetchCotizaciones, fetchCotizacionStats } from '../../services/cotizacionesApi';
import { fetchOrders } from '../../services/ordersApi';
import styles from './SalesVentas.module.scss';

interface SaleStats {
  totalVentas: number;
  ingresosTotales: number;
  ticketPromedio: number;
  tasaConversion: number;
}

const PAGE_SIZE = (() => { try { const p = JSON.parse(localStorage.getItem('sales_displayPrefs') || '{}'); return p.itemsPerPage || 10; } catch { return 10; } })();

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactElement }> = {
  aprobada: { label: 'Completada', className: 'statusAprobada', icon: <FaCheckCircle /> },
  completada: { label: 'Pagada', className: 'statusAprobada', icon: <FaCheckCircle /> },
  paid: { label: 'Pagada', className: 'statusAprobada', icon: <FaCheckCircle /> },
  pendiente: { label: 'Pendiente', className: 'statusPendiente', icon: <FaSpinner /> },
  pending: { label: 'Pendiente Pago', className: 'statusPendiente', icon: <FaSpinner /> },
  expirada: { label: 'Expirada', className: 'statusExpirada', icon: <FaExclamationCircle /> },
  cancelled: { label: 'Cancelada', className: 'statusRechazada', icon: <FaTimesCircle /> },
  refunded: { label: 'Reembolsada', className: 'statusRechazada', icon: <FaUndo /> },
  rechazada: { label: 'Rechazada', className: 'statusRechazada', icon: <FaTimesCircle /> },
  revision: { label: 'Revisión', className: 'statusPendiente', icon: <FaSpinner /> },
};

const filterGroups: Record<string, string[]> = {
  todas: [],
  completada: ['aprobada', 'completada', 'paid'],
  pendiente: ['pendiente', 'pending', 'revision'],
  expirada: ['expirada'],
  cancelada: ['rechazada', 'cancelled', 'refunded'],
};

const SalesVentas = () => {
  const { refreshKey } = useRefresh();
  const [sales, setSales] = useState<Cotizacion[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [stats, setStats] = useState<SaleStats>({ totalVentas: 0, ingresosTotales: 0, ticketPromedio: 0, tasaConversion: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [selectedSale, setSelectedSale] = useState<Cotizacion | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [cotData, orderData, cotStats] = await Promise.all([
        fetchCotizaciones({ query: query || undefined, pageSize: 100 }),
        fetchOrders({ query: query || undefined, pageSize: 100 }),
        fetchCotizacionStats(),
      ]);

      const cotizaciones = cotData.cotizaciones.map(c => ({ ...c, origen: 'cotizacion' }));
      const orders = orderData.orders.map(o => ({ ...o, origen: 'order' }));
      const merged = [...cotizaciones, ...orders].sort((a, b) => b.fecha.localeCompare(a.fecha));

      setSales(merged);
      setTotal(merged.length);

      const completadas = merged.filter(s => s.estado === 'aprobada' || s.estado === 'completada' || s.estado === 'paid');
      const ingresos = completadas.reduce((sum, s) => sum + s.total, 0);

      setStats({
        totalVentas: completadas.length,
        ingresosTotales: ingresos,
        ticketPromedio: completadas.length > 0 ? ingresos / completadas.length : 0,
        tasaConversion: cotStats.total > 0 ? Math.round((cotStats.aprobadas / cotStats.total) * 100) : 0,
      });
    } catch {
      setError('Error al cargar ventas. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [query, refreshKey]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (filterStatus === 'todas') return sales;
    const allowed = filterGroups[filterStatus] || [filterStatus];
    return sales.filter(s => allowed.includes(s.estado));
  }, [sales, filterStatus]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'codigo': aVal = a.codigo; bVal = b.codigo; break;
        case 'clienteNombre': aVal = a.clienteNombre; bVal = b.clienteNombre; break;
        case 'fecha': aVal = a.fecha; bVal = b.fecha; break;
        case 'total': aVal = a.total; bVal = b.total; break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(0);
  };

  const sortArrow = (field: SortField) => {
    if (sortField !== field) return <FaSort className={styles.sortIcon} />;
    return sortDir === 'asc' ? <FaSortUp className={styles.sortIconActive} /> : <FaSortDown className={styles.sortIconActive} />;
  };

  const formatCurrency = (n: number) => `S/ ${n.toFixed(2)}`;

  const filters = [
    { key: 'todas', label: 'Todas' },
    { key: 'completada', label: 'Completadas' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'expirada', label: 'Expiradas' },
    { key: 'cancelada', label: 'Canceladas' },
  ];

  if (loading && sales.length === 0) {
    return (
      <div className={styles.ventasModule}>
        <div className={styles.loadingState}>
          <FaSpinner className={styles.spinner} />
          <p className={styles.loadingText}>Cargando historial de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.ventasModule}>
        <div className={styles.errorState}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button className={styles.btnPrimary} onClick={load}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ventasModule}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaChartLine /></div>
          <div>
            <h2 className={styles.title}>Historial de Ventas</h2>
            <p className={styles.subtitle}>{total} ventas registradas</p>
          </div>
        </div>
        <button className={styles.btnOutline} onClick={() => load()}><FaSyncAlt /> Actualizar</button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <FaCheckCircle className={styles.statIcon} style={{ color: '#10b981', background: '#10b98112' }} />
          <div><span className={styles.statNum}>{stats.totalVentas}</span><span className={styles.statLabel}>Ventas Completadas</span></div>
        </div>
        <div className={styles.statCard}>
          <FaDollarSign className={styles.statIcon} style={{ color: '#2563eb', background: '#2563eb12' }} />
          <div><span className={styles.statNum}>{formatCurrency(stats.ingresosTotales)}</span><span className={styles.statLabel}>Ingresos Totales</span></div>
        </div>
        <div className={styles.statCard}>
          <FaMoneyBillWave className={styles.statIcon} style={{ color: '#f59e0b', background: '#f59e0b12' }} />
          <div><span className={styles.statNum}>{formatCurrency(stats.ticketPromedio)}</span><span className={styles.statLabel}>Ticket Promedio</span></div>
        </div>
        <div className={styles.statCard}>
          <FaPercentage className={styles.statIcon} style={{ color: '#8b5cf6', background: '#8b5cf612' }} />
          <div><span className={styles.statNum}>{stats.tasaConversion}%</span><span className={styles.statLabel}>Tasa de Conversión</span></div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Buscar por código o cliente..." />
          {query && <button className={styles.searchClear} onClick={() => setQuery('')}>✕</button>}
        </div>
        <div className={styles.filterTabs}>
          {filters.map(f => (
            <button key={f.key} className={`${styles.filterTab} ${filterStatus === f.key ? styles.filterTabActive : ''}`} onClick={() => { setFilterStatus(f.key); setPage(0); }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thSort} onClick={() => toggleSort('codigo')}>Código {sortArrow('codigo')}</th>
                  <th className={styles.thSort} onClick={() => toggleSort('clienteNombre')}>Cliente {sortArrow('clienteNombre')}</th>
                  <th>Vendedor</th>
                  <th className={styles.thSort} onClick={() => toggleSort('fecha')}>Fecha {sortArrow('fecha')}</th>
                  <th>Estado</th>
                  <th className={styles.thSort} onClick={() => toggleSort('total')}>Total {sortArrow('total')}</th>
                  <th className={styles.thActions}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(c => {
                  const cfg = statusConfig[c.estado] || { label: c.estado, className: '', icon: null };
                  return (
                    <tr key={`${c.origen}-${c.id}`} className={styles.tr}>
                      <td>
                        <span className={styles.cellCode}>
                          {c.origen === 'order' ? <FaShoppingCart className={styles.codeIcon} /> : <FaReceipt className={styles.codeIcon} />}
                          {c.codigo}
                        </span>
                      </td>
                      <td>
                        <div className={styles.cellClient}>
                          <span className={styles.cellClientName}>{c.clienteNombre}</span>
                          <span className={styles.cellClientEmail}>{c.clienteEmail}</span>
                        </div>
                      </td>
                      <td className={styles.tdMuted}>
                        {c.origen === 'order'
                          ? <span className={styles.tdTag}>Web</span>
                          : (c.vendedorNombre || <span className={styles.tdEmpty}>—</span>)}
                      </td>
                      <td className={styles.tdMuted}>{c.fecha}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[cfg.className] || ''}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td><span className={styles.cellTotal}>{formatCurrency(c.total)}</span></td>
                      <td className={styles.tdActions}>
                        <button className={styles.actionBtn} onClick={() => setSelectedSale(selectedSale?.id === c.id && selectedSale?.origen === c.origen ? null : c)} title="Ver detalle">
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      <div className={styles.emptyState}>
                        <FaChartLine className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>No se encontraron ventas</p>
                        <p className={styles.emptySub}>Las cotizaciones aprobadas y pedidos web aparecerán aquí</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} de {sorted.length}</span>
              <div className={styles.pageBtns}>
                <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
                ))}
                <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSale && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSale(null)}>
          <div className={styles.saleDetail} onClick={e => e.stopPropagation()}>
            <div className={styles.saleDetailHeader}>
              <h3 className={styles.saleDetailTitle}>
                {selectedSale.origen === 'order' ? <FaShoppingCart /> : <FaReceipt />} {selectedSale.codigo}
              </h3>
              <button className={styles.modalClose} onClick={() => setSelectedSale(null)}>✕</button>
            </div>
            <div className={styles.saleDetailBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}><FaUser /> Cliente</span>
                  <span className={styles.detailValue}>{selectedSale.clienteNombre}</span>
                </div>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{selectedSale.clienteEmail}</span>
                </div>
                {selectedSale.clienteCompany && (
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Empresa</span>
                    <span className={styles.detailValue}>{selectedSale.clienteCompany}</span>
                  </div>
                )}
                {selectedSale.vendedorNombre && (
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Vendedor</span>
                    <span className={styles.detailValue}>{selectedSale.vendedorNombre}</span>
                  </div>
                )}
                {selectedSale.origen === 'order' && (
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Origen</span>
                    <span className={styles.detailValue}>Pedido Web</span>
                  </div>
                )}
                {selectedSale.metodoPago && (
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Pago</span>
                    <span className={styles.detailValue}>{selectedSale.metodoPago}</span>
                  </div>
                )}
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}><FaCalendarAlt /> Fecha</span>
                  <span className={styles.detailValue}>{selectedSale.fecha}</span>
                </div>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Estado</span>
                  <span className={`${styles.statusBadge} ${styles[statusConfig[selectedSale.estado]?.className || '']}`}>
                    {statusConfig[selectedSale.estado]?.icon} {statusConfig[selectedSale.estado]?.label}
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Productos</h4>
                <table className={styles.detailTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>P. Unit.</th>
                      <th>Desc.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.producto}</td>
                        <td className={styles.tdCenter}>{item.cantidad}</td>
                        <td className={styles.tdRight}>{formatCurrency(item.precioUnit)}</td>
                        <td className={styles.tdRight}>{item.descuento > 0 ? formatCurrency(item.descuento) : '—'}</td>
                        <td className={styles.tdRight}>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><td colSpan={4} className={styles.tdRight}>Subtotal</td><td className={styles.tdRight}>{formatCurrency(selectedSale.subtotal)}</td></tr>
                    {selectedSale.descuento > 0 && (
                      <tr><td colSpan={4} className={styles.tdRight}>Descuento</td><td className={styles.tdRight}>-{formatCurrency(selectedSale.descuento)}</td></tr>
                    )}
                    <tr><td colSpan={4} className={styles.tdRight}>Impuesto</td><td className={styles.tdRight}>{formatCurrency(selectedSale.impuesto)}</td></tr>
                    <tr className={styles.totalRow}><td colSpan={4} className={styles.tdRight}>Total</td><td className={styles.tdRight}>{formatCurrency(selectedSale.total)}</td></tr>
                  </tfoot>
                </table>
              </div>

              {selectedSale.notas && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>Notas</h4>
                  <p className={styles.detailNotes}>{selectedSale.notas}</p>
                </div>
              )}

              {selectedSale.origen !== 'order' && selectedSale.actividad && selectedSale.actividad.length > 0 && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>Actividad</h4>
                  <div className={styles.activityList}>
                    {selectedSale.actividad.map(a => (
                      <div key={a.id} className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div className={styles.activityContent}>
                          <span className={styles.activityDesc}>{a.descripcion}</span>
                          <span className={styles.activityMeta}>{a.usuario ? `${a.usuario} — ` : ''}{a.fecha}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.saleDetailFooter}>
              <button className={styles.btnPrimary} onClick={() => setSelectedSale(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesVentas;
