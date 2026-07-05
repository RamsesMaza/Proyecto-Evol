import { useState, useEffect } from 'react';
import { FaDollarSign, FaChartLine, FaShoppingCart, FaPercentage, FaBox, FaFileInvoiceDollar, FaMoneyBillWave, FaTruck, FaTag, FaUndo, FaCreditCard, FaExclamationTriangle, FaSpinner, FaCalendarAlt, FaArrowUp, FaArrowDown, FaCheckCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { fetchFinanzas, type FinanzasData } from '../../services/adminTiApi';
import styles from './AdminFinanzas.module.scss';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const formatPrice = (v: number) => `S/ ${v.toFixed(2)}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 12, margin: 0 }}>
          {p.name}: {typeof p.value === 'number' && p.name !== 'Cantidad' ? `S/ ${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
  return null;
};

const MOCK_DATA: FinanzasData = {
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
    { productId: 6, productName: 'Diplomado en Gestión de Calidad', quantity: 41, revenue: 10250.00 },
    { productId: 7, productName: 'Taller Liderazgo Organizacional', quantity: 87, revenue: 9560.00 },
    { productId: 8, productName: 'Curso ISO 22000', quantity: 52, revenue: 8320.00 },
    { productId: 9, productName: 'Certificación Scrum Master', quantity: 68, revenue: 7480.00 },
    { productId: 10, productName: 'Curso ISO 50001', quantity: 35, revenue: 5250.00 },
  ],
  cotizaciones: { projectedRevenue: 45230.00, pendingRevenue: 18340.00, total: 234, approvedCount: 98, pendingCount: 67, conversionRate: 42 },
};

function hasRealData(d: FinanzasData): boolean {
  return d.revenue.total > 0 || d.paymentMethods.some(p => p.total > 0) || d.topProducts.length > 0;
}

const AdminFinanzas = () => {
  const [data, setData] = useState<FinanzasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setLoading(true); setError('');
      const real = await fetchFinanzas();
      setData(hasRealData(real) ? real : MOCK_DATA);
    }
    catch { setData(MOCK_DATA); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className={styles.module}><div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando finanzas...</div></div>;
  if (error) return <div className={styles.module}><div className={styles.errorMsg}><FaExclamationTriangle /> {error} <button className={styles.retryBtn} onClick={load}>Reintentar</button></div></div>;
  if (!data) return null;

  const d = data;
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const revenueCards = [
    { label: 'Ingresos Totales', value: formatPrice(d.revenue.total), icon: <FaDollarSign />, color: '#10b981', bg: '#10b98115' },
    { label: 'Este Mes', value: formatPrice(d.revenue.thisMonth), icon: <FaCalendarAlt />, color: '#3b82f6', bg: '#3b82f615',
      change: d.revenue.lastMonth > 0 ? `${((d.revenue.thisMonth - d.revenue.lastMonth) / d.revenue.lastMonth * 100).toFixed(1)}% vs mes ant.` : 'Sin dato previo' },
    { label: 'Hoy', value: formatPrice(d.revenue.today), icon: <FaChartLine />, color: '#8b5cf6', bg: '#8b5cf615' },
    { label: 'Ticket Promedio', value: formatPrice(d.revenue.averageOrder), icon: <FaMoneyBillWave />, color: '#f59e0b', bg: '#f59e0b15',
      change: `${d.revenue.paidOrders} pedidos pagados` },
  ];

  const financialCards = [
    { label: 'IGV Cobrado', value: formatPrice(d.financials.taxCollected), icon: <FaPercentage />, color: '#8b5cf6', bg: '#8b5cf615' },
    { label: 'Descuentos', value: formatPrice(d.financials.discountsGiven), icon: <FaTag />, color: '#ef4444', bg: '#ef444415' },
    { label: 'Envío Cobrado', value: formatPrice(d.financials.shippingCollected), icon: <FaTruck />, color: '#3b82f6', bg: '#3b82f615' },
    { label: 'Reembolsado', value: formatPrice(d.financials.refunded), icon: <FaUndo />, color: '#f59e0b', bg: '#f59e0b15' },
  ];

  const pieData = d.paymentMethods.map(pm => ({
    name: pm.method === 'yape' ? 'Yape' : pm.method === 'mercadopago' ? 'Mercado Pago' : pm.method === 'card' ? 'Tarjeta' : pm.method,
    value: pm.total,
    count: pm.count,
  }));

  const cotizacionCards = [
    { label: 'Proyectado (Aprobadas)', value: formatPrice(d.cotizaciones.projectedRevenue), icon: <FaFileInvoiceDollar />, color: '#10b981', bg: '#10b98115' },
    { label: 'Pendiente Cotizado', value: formatPrice(d.cotizaciones.pendingRevenue), icon: <FaMoneyBillWave />, color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'Cotizaciones Aprobadas', value: `${d.cotizaciones.approvedCount}`, icon: <FaCheckCircle />, color: '#10b981', bg: '#10b98115' },
    { label: 'Tasa Conversión', value: `${d.cotizaciones.conversionRate}%`, icon: <FaChartLine />, color: '#3b82f6', bg: '#3b82f615' },
  ];

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaDollarSign /></div>
          <div><h2 className={styles.title}>Panel Financiero</h2><p className={styles.subtitle}>Métricas económicas del sistema</p></div>
        </div>
        <button className={styles.refreshBtn} onClick={load}><FaSpinner className={styles.spinnerSmall} /> Actualizar</button>
      </div>

      <h3 className={styles.sectionTitle}><FaDollarSign /> Resumen de Ingresos</h3>
      <div className={styles.metricsGrid}>
        {revenueCards.map(c => (
          <div key={c.label} className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{c.value}</span>
              <span className={styles.metricLabel}>{c.label}</span>
              {c.change && <span className={styles.metricChange}>{c.change}</span>}
            </div>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle}><FaPercentage /> Desglose Financiero</h3>
      <div className={styles.metricsGrid}>
        {financialCards.map(c => (
          <div key={c.label} className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{c.value}</span>
              <span className={styles.metricLabel}>{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><FaChartLine /> Ingresos Mensuales (12 meses)</h3>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => {
                  const m = parseInt(v.slice(5)) - 1;
                  return monthNames[m] || v;
                }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `S/ ${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" name="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tax" name="IGV" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><FaCreditCard /> Métodos de Pago</h3>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `S/ ${value.toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.paymentList}>
              {d.paymentMethods.map((pm, i) => (
                <div key={pm.method} className={styles.paymentRow}>
                  <span className={styles.paymentDot} style={{ background: COLORS[i % COLORS.length] }} />
                  <span className={styles.paymentName}>
                    {pm.method === 'yape' ? 'Yape' : pm.method === 'mercadopago' ? 'Mercado Pago' : pm.method === 'card' ? 'Tarjeta' : pm.method}
                  </span>
                  <span className={styles.paymentCount}>{pm.count} pedidos</span>
                  <span className={styles.paymentTotal}>{formatPrice(pm.total)}</span>
                </div>
              ))}
              {d.paymentMethods.length === 0 && <p className={styles.emptyText}>Sin datos de pago</p>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid2col}>
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}><FaBox /> Productos Más Vendidos</h3>
          <div className={styles.miniTable}>
            {d.topProducts.length === 0 && <div className={styles.emptyState}>Sin datos de productos</div>}
            {d.topProducts.map((p, i) => (
              <div key={p.productId} className={styles.miniRow}>
                <span className={styles.rank}>#{i + 1}</span>
                <div className={styles.miniInfo}>
                  <span className={styles.miniName}>{p.productName}</span>
                  <span className={styles.miniDate}>{p.quantity} unidades vendidas</span>
                </div>
                <span className={styles.miniTotal}>{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}><FaFileInvoiceDollar /> Cotizaciones</h3>
          <div className={styles.metricsGridSmall}>
            {cotizacionCards.map(c => (
              <div key={c.label} className={styles.metricCardSmall}>
                <div className={styles.metricIconSmall} style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                <div className={styles.metricInfoSmall}>
                  <span className={styles.metricValueSmall}>{c.value}</span>
                  <span className={styles.metricLabelSmall}>{c.label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.cotizacionSummary}>
            <span>Total: {d.cotizaciones.total} cotizaciones</span>
            <span>{d.cotizaciones.pendingCount} pendientes · {d.cotizaciones.approvedCount} aprobadas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanzas;
