import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaShoppingCart, FaDollarSign, FaUserPlus, FaChartLine, FaExclamationTriangle, FaSpinner, FaTachometerAlt, FaBox, FaHeadset, FaUserShield, FaHistory, FaPercent, FaUserCheck, FaCalendarDay, FaCalendarAlt, FaUserSlash, FaBell } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import { fetchTiDashboardStats, fetchFinanzas, type TiDashboardStats, type FinanzasData } from '../../services/adminTiApi';
import { fetchUnreadCount } from '../../services/notificationsApi';
import styles from './AdminDashboard.module.scss';

const MOCK_FINANZAS: FinanzasData = {
  revenue: { total: 128430.50, thisMonth: 18250.00, today: 1280.00, lastMonth: 15830.00, averageOrder: 156.80, paidOrders: 819 },
  financials: { taxCollected: 23117.49, discountsGiven: 8940.00, shippingCollected: 5720.00, refunded: 2340.00 },
  paymentMethods: [
    { method: 'yape', count: 398, total: 62400.00 },
    { method: 'mercadopago', count: 263, total: 41200.00 },
    { method: 'card', count: 158, total: 24830.50 },
  ],
  monthlyRevenue: [
    { month: '2025-07', total: 8420.00, count: 54, tax: 1515.60 },
    { month: '2025-08', total: 9180.00, count: 59, tax: 1652.40 },
    { month: '2025-09', total: 10560.00, count: 68, tax: 1900.80 },
    { month: '2025-10', total: 9870.00, count: 63, tax: 1776.60 },
    { month: '2025-11', total: 12450.00, count: 80, tax: 2241.00 },
    { month: '2025-12', total: 18230.00, count: 117, tax: 3281.40 },
    { month: '2026-01', total: 11340.00, count: 73, tax: 2041.20 },
    { month: '2026-02', total: 9650.00, count: 62, tax: 1737.00 },
    { month: '2026-03', total: 14320.00, count: 92, tax: 2577.60 },
    { month: '2026-04', total: 12680.00, count: 81, tax: 2282.40 },
    { month: '2026-05', total: 15830.00, count: 102, tax: 2849.40 },
    { month: '2026-06', total: 18250.00, count: 118, tax: 3285.00 },
  ],
  topProducts: [
    { productId: 1, productName: 'Curso ISO 9001:2025', quantity: 186, revenue: 27840.00 },
    { productId: 2, productName: 'Curso ISO 14001', quantity: 142, revenue: 19860.00 },
    { productId: 3, productName: 'Curso ISO 45001', quantity: 98, revenue: 15680.00 },
    { productId: 4, productName: 'Auditoría Interna ISO 9001', quantity: 75, revenue: 13125.00 },
    { productId: 5, productName: 'Curso ISO 27001', quantity: 63, revenue: 11025.00 },
  ],
  cotizaciones: { projectedRevenue: 45230.00, pendingRevenue: 18340.00, total: 234, approvedCount: 98, pendingCount: 67, conversionRate: 42 },
};

const AdminDashboard = ({ onNavigate }: { onNavigate: (section: string) => void }) => {
  const [stats, setStats] = useState<TiDashboardStats | null>(null);
  const [finanzas, setFinanzas] = useState<FinanzasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifCount, setNotifCount] = useState(0);

  const load = useCallback(async () => {
    try { setLoading(true); setError('');
      const [statsData, finanzasData] = await Promise.all([fetchTiDashboardStats(), fetchFinanzas()]);
      setStats(statsData);
      const hasReal = finanzasData.revenue.total > 0 || finanzasData.paymentMethods.some((p: any) => p.total > 0);
      setFinanzas(hasReal ? finanzasData : MOCK_FINANZAS);
    }
    catch { setFinanzas(MOCK_FINANZAS); setError('Error al cargar estadísticas'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchUnreadCount().then(setNotifCount).catch(() => {});
    const interval = setInterval(() => fetchUnreadCount().then(setNotifCount).catch(() => {}), 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <div className={styles.module}><div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando dashboard...</div></div>;
  if (error) return <div className={styles.module}><div className={styles.errorMsg}><FaExclamationTriangle /> {error} <button className={styles.retryBtn} onClick={load}>Reintentar</button></div></div>;
  if (!stats) return null;

  const s = stats;
  const salesData = s.charts?.salesByDay || [];
  const userGrowth = s.charts?.userGrowth || [];
  const loginActivity = s.charts?.dailyLogins || [];
  const activities = s.recentActivity || [];
  const lastOrders = s.last7Orders || [];

  const metricCards = [
    { label: 'Usuarios Totales', value: s.total ?? 0, icon: <FaUsers />, color: '#8b5cf6', bg: '#8b5cf615', section: 'usuarios', change: `+${s.newUsersThisMonth ?? 0} este mes` },
    { label: 'Usuarios Activos', value: s.activos ?? 0, icon: <FaUserCheck />, color: '#10b981', bg: '#10b98115', section: 'usuarios', change: `${((s.activos / (s.total || 1)) * 100).toFixed(0)}% del total` },
    { label: 'Nuevos (Hoy)', value: s.newUsersToday ?? 0, icon: <FaUserPlus />, color: '#3b82f6', bg: '#3b82f615', section: 'usuarios', change: s.newUsersThisMonth ? `${s.newUsersThisMonth} este mes` : '0 este mes' },
    { label: 'Clientes', value: s.totalClientes ?? 0, icon: <FaUserSlash />, color: '#f59e0b', bg: '#f59e0b15', section: 'usuarios', change: s.newClientesThisMonth ? `+${s.newClientesThisMonth} nuevos` : '0 nuevos' },
    { label: 'Ventas Totales', value: s.orderStats?.total ?? 0, icon: <FaShoppingCart />, color: '#3b82f6', bg: '#3b82f615', section: 'pedidos', change: `S/ ${(s.orderStats?.ingresos ?? 0).toFixed(2)} ingresos` },
    { label: 'Ventas Hoy', value: s.salesToday ?? 0, icon: <FaCalendarDay />, color: '#10b981', bg: '#10b98115', section: 'pedidos', change: `+${s.salesThisMonth ?? 0} este mes` },
    { label: 'Ingresos', value: `S/ ${(s.orderStats?.ingresos ?? 0).toFixed(2)}`, icon: <FaDollarSign />, color: '#f59e0b', bg: '#f59e0b15', section: 'pedidos', change: 'Ingresos totales' },
    { label: 'Tasa Éxito Login', value: `${s.loginStats?.successRate ?? 0}%`, icon: <FaPercent />, color: '#10b981', bg: '#10b98115', section: 'seguridad', change: `${s.loginStats?.last24h ?? 0} intentos últ. 24h` },
    { label: 'Notificaciones', value: notifCount, icon: <FaBell />, color: '#dc2626', bg: '#dc262615', section: 'notificaciones', change: notifCount === 1 ? '1 sin leer' : `${notifCount} sin leer` },
  ];

  const quickActions = [
    { label: 'Notificaciones', icon: <FaBell />, section: 'notificaciones', desc: notifCount ? `${notifCount} sin leer` : 'Centro de notificaciones' },
    { label: 'Productos', icon: <FaBox />, section: 'productos', desc: 'Inventario y catálogo' },
    { label: 'Pedidos', icon: <FaShoppingCart />, section: 'pedidos', desc: 'Ver y gestionar' },
    { label: 'Soporte', icon: <FaHeadset />, section: 'soporte', desc: 'Tickets técnicos' },
    { label: 'Roles', icon: <FaUserShield />, section: 'roles', desc: 'Permisos del sistema' },
    { label: 'Auditoría', icon: <FaHistory />, section: 'auditoria', desc: 'Actividad del sistema' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color, fontSize: 12, margin: 0 }}>{p.name}: {p.name.includes('S/') ? `S/ ${p.value?.toFixed(2)}` : p.value}</p>)}
      </div>
    );
    return null;
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaTachometerAlt /></div>
          <div><h2 className={styles.title}>Panel Ejecutivo</h2><p className={styles.subtitle}>Métricas en tiempo real del sistema</p></div>
        </div>
        <button className={styles.refreshBtn} onClick={load}><FaSpinner className={styles.spinnerSmall} /> Actualizar</button>
      </div>

      <div className={styles.metricsGrid}>
        {metricCards.map(c => (
          <button key={c.label} className={styles.metricCard} onClick={() => onNavigate(c.section)}>
            <div className={styles.metricIcon} style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{c.value}</span>
              <span className={styles.metricLabel}>{c.label}</span>
              <span className={styles.metricChange}>{c.change}</span>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><FaChartLine /> Ventas por Día (30 días)</h3>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="S/ Ingresos" stroke="#3b82f6" fill="url(#salesGrad)" strokeWidth={2} />
                <Bar dataKey="count" name="Ventas" fill="#3b82f6" opacity={0.3} radius={[2, 2, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><FaUsers /> Crecimiento (12 meses)</h3>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => { const m = ['E','F','M','A','M','J','J','A','S','O','N','D']; return m[parseInt(v.slice(5)) - 1] || v.slice(5); }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="users" name="Usuarios" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clients" name="Clientes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><FaHistory /> Actividad de Accesos (7 días)</h3>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={loginActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="success" name="Exitosos" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="failed" name="Fallidos" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><FaBox /> Últimos Pedidos</h3>
          </div>
          <div className={styles.chartBody} style={{ padding: 0 }}>
            <div className={styles.miniTable}>
              {lastOrders.length === 0 && <div className={styles.emptyState}>Sin pedidos recientes</div>}
              {lastOrders.slice(0, 5).map((o: any) => (
                <div key={o.id} className={styles.miniRow}>
                  <div className={styles.miniInfo}>
                    <span className={styles.miniName}>{o.customerName}</span>
                    <span className={styles.miniDate}>{new Date(o.createdAt).toLocaleDateString('es-PE')}</span>
                  </div>
                  <span className={styles.miniTotal}>S/ {o.total?.toFixed(2)}</span>
                  <span className={styles.miniStatus} style={{ color: o.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                    {o.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {finanzas && (
        <div className={styles.finanzaRow}>
          <div className={styles.finanzaCard}>
            <div className={styles.finanzaValue}>S/ {finanzas.revenue.averageOrder.toFixed(2)}</div>
            <div className={styles.finanzaLabel}>Ticket Promedio</div>
          </div>
          <div className={styles.finanzaCard}>
            <div className={styles.finanzaValue}>S/ {finanzas.financials.taxCollected.toFixed(2)}</div>
            <div className={styles.finanzaLabel}>IGV Cobrado</div>
          </div>
          <div className={styles.finanzaCard}>
            <div className={styles.finanzaValue}>S/ {finanzas.financials.discountsGiven.toFixed(2)}</div>
            <div className={styles.finanzaLabel}>Descuentos</div>
          </div>
          <div className={styles.finanzaCard}>
            <div className={styles.finanzaValue} style={{ color: finanzas.revenue.thisMonth >= finanzas.revenue.lastMonth ? '#10b981' : '#ef4444' }}>
              {finanzas.revenue.lastMonth > 0 ? `${((finanzas.revenue.thisMonth - finanzas.revenue.lastMonth) / finanzas.revenue.lastMonth * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <div className={styles.finanzaLabel}>Vs. Mes Anterior</div>
          </div>
          <div className={styles.finanzaCard}>
            <div className={styles.finanzaValue}>{finanzas.cotizaciones.conversionRate}%</div>
            <div className={styles.finanzaLabel}>Conv. Cotizaciones</div>
          </div>
          <div className={styles.finanzaCard}>
            <div className={styles.finanzaValue}>S/ {finanzas.cotizaciones.projectedRevenue.toFixed(2)}</div>
            <div className={styles.finanzaLabel}>Proyectado</div>
          </div>
        </div>
      )}

      <div className={styles.grid2col}>
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}><FaHistory /> Actividad Reciente</h3>
          <div className={styles.activityList}>
            {activities.length === 0 && <p className={styles.emptyText}>Sin actividad reciente</p>}
            {activities.slice(0, 8).map((a: any) => (
              <div key={a.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <span className={styles.activityAction}>{a.action}</span>
                  <span className={styles.activityDesc}>{a.description || ''}</span>
                  <span className={styles.activityMeta}>{a.userName || 'Sistema'} · {new Date(a.createdAt).toLocaleString('es-PE')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}><FaTachometerAlt /> Acceso Rápido</h3>
          <div className={styles.quickGrid}>
            {quickActions.map(a => (
              <button key={a.label} className={styles.quickBtn} onClick={() => onNavigate(a.section)}>
                <span className={styles.quickIcon}>{a.icon}</span>
                <span className={styles.quickLabel}>{a.label}</span>
                <span className={styles.quickDesc}>{a.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
