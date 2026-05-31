import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChartBar, FaChartPie, FaDollarSign, FaUsers, FaFileInvoiceDollar, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaSyncAlt, FaStar, FaTrophy, FaMoneyBillWave, FaSearch, FaCalendarAlt, FaShoppingCart, FaReceipt, FaFilter } from 'react-icons/fa';
import { useRefresh } from '../../context/RefreshContext';
import { fetchCotizaciones, fetchCotizacionStats } from '../../services/cotizacionesApi';
import { fetchOrders } from '../../services/ordersApi';
import { fetchClienteStats } from '../../services/clientesApi';
import type { Cotizacion } from './Cotizaciones/types';
import styles from './SalesReportes.module.scss';

interface TopClient {
  name: string;
  email: string;
  company: string | null;
  totalRevenue: number;
  count: number;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatCurrency(n: number): string {
  return `S/ ${n.toFixed(2)}`;
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const sourceTabs = [
  { key: 'todas', label: 'Todas', icon: <FaFilter /> },
  { key: 'cotizacion', label: 'Cotizaciones', icon: <FaReceipt /> },
  { key: 'order', label: 'Pedidos Web', icon: <FaShoppingCart /> },
];

const SalesReportes = () => {
  const { refreshKey } = useRefresh();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setCotStats] = useState({ total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0, expiradas: 0, ingresosProyectados: 0, conversionRate: 0, esteMes: 0 });
  const [, setCliStats] = useState({ total: 0, activos: 0, nuevosEsteMes: 0, frecuentes: 0, conversionRate: 0 });

  const [filterQuery, setFilterQuery] = useState('');
  const [filterSource, setFilterSource] = useState('todas');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [cotData, orderData, cs, cl] = await Promise.all([
        fetchCotizaciones({ pageSize: 100 }),
        fetchOrders({ pageSize: 100 }),
        fetchCotizacionStats(),
        fetchClienteStats(),
      ]);
      const merged: Cotizacion[] = [
        ...cotData.cotizaciones.map(c => ({ ...c, origen: 'cotizacion' })),
        ...orderData.orders.map(o => ({ ...o, origen: 'order' })),
      ];
      setCotizaciones(merged);
      setCotStats(cs);
      setCliStats(cl);
    } catch {
      setError('Error al cargar datos de reportes. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = [...cotizaciones];

    if (filterSource !== 'todas') {
      list = list.filter(c => c.origen === filterSource);
    }

    if (filterStatus !== 'todas') {
      const statusGroups: Record<string, string[]> = {
        completada: ['aprobada', 'completada', 'paid'],
        pendiente: ['pendiente', 'pending', 'revision'],
        expirada: ['expirada'],
        cancelada: ['rechazada', 'cancelled', 'refunded'],
      };
      const allowed = statusGroups[filterStatus] || [filterStatus];
      list = list.filter(c => allowed.includes(c.estado));
    }

    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      list = list.filter(c =>
        c.clienteNombre.toLowerCase().includes(q) ||
        c.clienteEmail.toLowerCase().includes(q) ||
        c.codigo.toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      list = list.filter(c => c.fecha >= dateFrom);
    }
    if (dateTo) {
      list = list.filter(c => c.fecha <= dateTo);
    }

    return list;
  }, [cotizaciones, filterSource, filterStatus, filterQuery, dateFrom, dateTo]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    filtered.forEach(c => {
      const key = getMonthKey(c.fecha);
      const existing = map.get(key) || { count: 0, revenue: 0 };
      existing.count++;
      existing.revenue += c.total;
      map.set(key, existing);
    });
    const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([key, val]) => {
      const [year, monthNum] = key.split('-');
      const monthIdx = parseInt(monthNum, 10) - 1;
      return {
        month: key,
        label: `${MONTHS[monthIdx]} ${year}`,
        count: val.count,
        revenue: val.revenue,
      };
    });
  }, [filtered]);

  const maxRevenue = useMemo(() => Math.max(...monthlyData.map(d => d.revenue), 1), [monthlyData]);

  const topClients = useMemo(() => {
    const map = new Map<string, TopClient>();
    filtered.forEach(c => {
      const key = c.clienteEmail;
      const existing = map.get(key) || {
        name: c.clienteNombre,
        email: c.clienteEmail,
        company: c.clienteCompany,
        totalRevenue: 0,
        count: 0,
      };
      existing.totalRevenue += c.total;
      existing.count++;
      map.set(key, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [filtered]);

  const maxClientRevenue = useMemo(() => Math.max(...topClients.map(c => c.totalRevenue), 1), [topClients]);

  const statusDist = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(c => {
      const estado = c.estado;
      map.set(estado, (map.get(estado) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const statsBySource = useMemo(() => {
    const cot = filtered.filter(c => c.origen === 'cotizacion');
    const ord = filtered.filter(c => c.origen === 'order');
    const cotDone = cot.filter(c => c.estado === 'aprobada');
    const ordDone = ord.filter(c => c.estado === 'completada' || c.estado === 'paid');
    const cotRev = cotDone.reduce((s, c) => s + c.total, 0);
    const ordRev = ordDone.reduce((s, c) => s + c.total, 0);
    return { cotCount: cot.length, ordCount: ord.length, cotRev, ordRev };
  }, [filtered]);

  const totalIngresos = statsBySource.cotRev + statsBySource.ordRev;
  const totalCount = filtered.length;
  const completadas = filtered.filter(c => c.estado === 'aprobada' || c.estado === 'completada' || c.estado === 'paid');
  const ticketProm = completadas.length > 0 ? totalIngresos / completadas.length : 0;

  const statusFilters = [
    { key: 'todas', label: 'Todas' },
    { key: 'completada', label: 'Completadas' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'expirada', label: 'Expiradas' },
    { key: 'cancelada', label: 'Canceladas' },
  ];

  if (loading) {
    return (
      <div className={styles.reportesModule}>
        <div className={styles.loadingState}>
          <FaSpinner className={styles.spinner} />
          <p className={styles.loadingText}>Generando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.reportesModule}>
        <div className={styles.errorState}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button className={styles.btnPrimary} onClick={load}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reportesModule}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaChartBar /></div>
          <div>
            <h2 className={styles.title}>Reportes y Estadísticas</h2>
            <p className={styles.subtitle}>Métricas clave de rendimiento comercial</p>
          </div>
        </div>
        <button className={styles.btnOutline} onClick={() => load()}><FaSyncAlt /> Actualizar</button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterRow}>
          <div className={styles.searchWrap}>
            <FaSearch className={styles.searchIcon} />
            <input className={styles.searchInput} value={filterQuery} onChange={e => setFilterQuery(e.target.value)} placeholder="Buscar por cliente o código..." />
            {filterQuery && <button className={styles.searchClear} onClick={() => setFilterQuery('')}>✕</button>}
          </div>
          <div className={styles.dateWrap}>
            <FaCalendarAlt className={styles.dateIcon} />
            <input type="date" className={styles.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Desde" />
            <span className={styles.dateSep}>→</span>
            <input type="date" className={styles.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} title="Hasta" />
            {(dateFrom || dateTo) && <button className={styles.dateClear} onClick={() => { setDateFrom(''); setDateTo(''); }}>✕</button>}
          </div>
        </div>
        <div className={styles.filterRow}>
          <div className={styles.sourceTabs}>
            {sourceTabs.map(t => (
              <button key={t.key}
                className={`${styles.sourceTab} ${filterSource === t.key ? styles.sourceTabActive : ''}`}
                onClick={() => setFilterSource(t.key)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className={styles.statusTabs}>
            {statusFilters.map(f => (
              <button key={f.key}
                className={`${styles.statusTab} ${filterStatus === f.key ? styles.statusTabActive : ''}`}
                onClick={() => setFilterStatus(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {filterQuery || filterSource !== 'todas' || filterStatus !== 'todas' || dateFrom || dateTo ? (
          <div className={styles.filterInfo}>
            Mostrando {filtered.length} de {cotizaciones.length} registros
            {(filterQuery || filterSource !== 'todas' || filterStatus !== 'todas' || dateFrom || dateTo) && (
              <button className={styles.clearFilters} onClick={() => { setFilterQuery(''); setFilterSource('todas'); setFilterStatus('todas'); setDateFrom(''); setDateTo(''); }}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <FaFileInvoiceDollar className={styles.statIcon} style={{ color: '#2563eb', background: '#2563eb12' }} />
          <div><span className={styles.statNum}>{totalCount}</span><span className={styles.statLabel}>Registros</span></div>
        </div>
        <div className={styles.statCard}>
          <FaCheckCircle className={styles.statIcon} style={{ color: '#10b981', background: '#10b98112' }} />
          <div><span className={styles.statNum}>{completadas.length}</span><span className={styles.statLabel}>Completadas</span></div>
        </div>
        <div className={styles.statCard}>
          <FaDollarSign className={styles.statIcon} style={{ color: '#f59e0b', background: '#f59e0b12' }} />
          <div><span className={styles.statNum}>{formatCurrency(totalIngresos)}</span><span className={styles.statLabel}>Ingresos</span></div>
        </div>
        <div className={styles.statCard}>
          <FaMoneyBillWave className={styles.statIcon} style={{ color: '#8b5cf6', background: '#8b5cf612' }} />
          <div><span className={styles.statNum}>{formatCurrency(ticketProm)}</span><span className={styles.statLabel}>Ticket Prom.</span></div>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className={styles.sourceRow}>
        <div className={styles.sourceBadge}>
          <FaReceipt /> Cotizaciones: {statsBySource.cotCount} · {formatCurrency(statsBySource.cotRev)}
        </div>
        <div className={styles.sourceBadge} style={{ background: '#10b98112', color: '#10b981' }}>
          <FaShoppingCart /> Pedidos Web: {statsBySource.ordCount} · {formatCurrency(statsBySource.ordRev)}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}><FaChartBar /> Ingresos Mensuales</h3>
          <span className={styles.cardBadge}>{monthlyData.length} meses</span>
        </div>
        <div className={styles.chartContainer}>
          {monthlyData.length === 0 ? (
            <div className={styles.chartEmpty}>
              <FaChartBar className={styles.chartEmptyIcon} />
              <p>No hay datos para mostrar</p>
            </div>
          ) : (
            <div className={styles.chart}>
              <div className={styles.chartYAxis}>
                <span>{formatCurrency(maxRevenue)}</span>
                <span>{formatCurrency(maxRevenue / 2)}</span>
                <span>S/ 0</span>
              </div>
              <div className={styles.chartBars}>
                {monthlyData.map(d => {
                  const pct = (d.revenue / maxRevenue) * 100;
                  return (
                    <div key={d.month} className={styles.chartCol}>
                      <div className={styles.chartBarWrap}>
                        <div
                          className={styles.chartBar}
                          style={{ height: `${Math.max(pct, 2)}%` }}
                          title={`${d.label}: ${formatCurrency(d.revenue)} (${d.count} ventas)`}
                        />
                      </div>
                      <span className={styles.chartLabel}>{d.label.split(' ')[0]}<br />{d.label.split(' ')[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Top Clients */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaTrophy /> Top Clientes</h3>
            <span className={styles.cardBadge}>Por ingresos</span>
          </div>
          <div className={styles.cardBody}>
            {topClients.length === 0 ? (
              <div className={styles.chartEmpty}>
                <FaUsers className={styles.chartEmptyIcon} />
                <p>Sin datos de clientes</p>
              </div>
            ) : (
              <div className={styles.clientList}>
                {topClients.map((cl, i) => {
                  const pct = (cl.totalRevenue / maxClientRevenue) * 100;
                  return (
                    <div key={cl.email} className={styles.clientRow}>
                      <div className={styles.clientRank}>
                        {i === 0 ? <FaStar className={styles.goldStar} /> : `#${i + 1}`}
                      </div>
                      <div className={styles.clientInfo}>
                        <span className={styles.clientName}>{cl.name}</span>
                        <span className={styles.clientMeta}>{cl.count} venta{cl.count !== 1 ? 's' : ''} · {cl.company || '—'}</span>
                      </div>
                      <div className={styles.clientRevenue}>{formatCurrency(cl.totalRevenue)}</div>
                      <div className={styles.clientBarWrap}>
                        <div className={styles.clientBar} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FaChartPie /> Distribución por Estado</h3>
            <span className={styles.cardBadge}>{filtered.length} registros</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.statusDist}>
              {filtered.length === 0 ? (
                <div className={styles.chartEmpty} style={{ padding: '20px' }}>
                  <FaChartPie className={styles.chartEmptyIcon} />
                  <p>Sin datos</p>
                </div>
              ) : (
                <>
                  <div className={styles.statusBarFull}>
                    {(() => {
                      const labels: Record<string, string> = {
                        aprobada: '#34d399', completada: '#34d399', paid: '#34d399',
                        pendiente: '#fbbf24', pending: '#fbbf24', revision: '#fbbf24',
                        expirada: '#9ca3af',
                        rechazada: '#f87171', cancelled: '#f87171', refunded: '#f87171',
                      };
                      const names: Record<string, string> = {
                        aprobada: 'Completada', completada: 'Pagada', paid: 'Pagada',
                        pendiente: 'Pendiente', pending: 'Pendiente', revision: 'Revisión',
                        expirada: 'Expirada',
                        rechazada: 'Rechazada', cancelled: 'Cancelada', refunded: 'Reembolsada',
                      };
                      const total = Math.max(filtered.length, 1);
                      return statusDist.map(([estado, count]) => {
                        const pct = (count / total) * 100;
                        return (
                          <div key={estado}
                            style={{ width: `${pct}%`, background: labels[estado] || '#94a3b8', height: '100%' }}
                            title={`${names[estado] || estado}: ${count}`} />
                        );
                      });
                    })()}
                  </div>
                  <div className={styles.statusLegend}>
                    {statusDist.map(([estado, count]) => {
                      const colorMap: Record<string, string> = {
                        aprobada: '#34d399', completada: '#34d399', paid: '#34d399',
                        pendiente: '#fbbf24', pending: '#fbbf24', revision: '#fbbf24',
                        expirada: '#9ca3af',
                        rechazada: '#f87171', cancelled: '#f87171', refunded: '#f87171',
                      };
                      const nameMap: Record<string, string> = {
                        aprobada: 'Completada', completada: 'Pagada', paid: 'Pagada',
                        pendiente: 'Pendiente', pending: 'Pendiente', revision: 'Revisión',
                        expirada: 'Expirada',
                        rechazada: 'Rechazada', cancelled: 'Cancelada', refunded: 'Reembolsada',
                      };
                      return (
                        <div key={estado} className={styles.legendItem}>
                          <span className={styles.legendDot} style={{ background: colorMap[estado] || '#94a3b8' }} />
                          {nameMap[estado] || estado} <strong>{count}</strong>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}><FaDollarSign /> Resumen Financiero</h3>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Ingresos Totales</span>
            <span className={styles.summaryValue}>{formatCurrency(totalIngresos)}</span>
            <span className={styles.summarySub}>{completadas.length} ventas completadas</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Ticket Promedio</span>
            <span className={styles.summaryValue}>{formatCurrency(ticketProm)}</span>
            <span className={styles.summarySub}>Por venta completada</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Cotizaciones</span>
            <span className={styles.summaryValue}>{statsBySource.cotCount}</span>
            <span className={styles.summarySub}>{formatCurrency(statsBySource.cotRev)} en ingresos</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Pedidos Web</span>
            <span className={styles.summaryValue}>{statsBySource.ordCount}</span>
            <span className={styles.summarySub}>{formatCurrency(statsBySource.ordRev)} en ingresos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportes;
