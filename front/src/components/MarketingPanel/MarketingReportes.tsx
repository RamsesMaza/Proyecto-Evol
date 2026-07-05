import { useState, useEffect } from 'react';
import { FaChartBar, FaExclamationTriangle, FaSpinner, FaChartLine, FaDollarSign, FaUsers, FaCheckCircle, FaBullhorn, FaPercentage, FaArrowUp } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { fetchMarketingReports, type MarketingReports } from '../../services/marketingApi';
import styles from './MarketingReportes.module.scss';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
const formatPrice = (v: number) => `S/ ${v.toFixed(2)}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color, fontSize: 12, margin: 0 }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>)}
    </div>
  );
  return null;
};

const MarketingReportes = () => {
  const [data, setData] = useState<MarketingReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setLoading(true); setError(''); setData(await fetchMarketingReports()); }
    catch { setError('Error al cargar reportes'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className={styles.module}><div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando reportes...</div></div>;
  if (error) return <div className={styles.module}><div className={styles.errorMsg}><FaExclamationTriangle /> {error} <button className={styles.retryBtn} onClick={load}>Reintentar</button></div></div>;
  if (!data) return null;

  const d = data;
  const leadsByStatus = d.leadsByStatus || [];
  const monthlyLeads = d.monthlyLeads || [];

  const statusLabels: Record<string, string> = { nuevo: 'Nuevo', contactado: 'Contactado', interesado: 'Interesado', en_negociacion: 'En Neg.', convertido: 'Convertido', perdido: 'Perdido' };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaChartBar /></div>
          <div><h2 className={styles.title}>Reportes y Analítica</h2><p className={styles.subtitle}>Rendimiento de marketing</p></div>
        </div>
        <button className={styles.refreshBtn} onClick={load}><FaSpinner className={styles.spinnerSmall} /> Actualizar</button>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}><FaDollarSign /> Ingresos: {formatPrice(d.totalRevenue)}</div>
        <div className={styles.metricCard}><FaCheckCircle /> Convertidos: {d.totalConverted}</div>
        <div className={styles.metricCard}><FaUsers /> Leads Generados: {d.totalLeadsGenerated}</div>
        <div className={styles.metricCard}><FaPercentage /> Conv. General: {d.totalLeadsGenerated > 0 ? `${((d.totalConverted / d.totalLeadsGenerated) * 100).toFixed(1)}%` : '0%'}</div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3><FaChartLine /> Leads por Estado</h3></div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={leadsByStatus.map((l: any) => ({ name: statusLabels[l.status] || l.status, value: l._count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {leadsByStatus.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3><FaArrowUp /> Leads Mensuales</h3></div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyLeads}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" name="Totales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Convertidos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.grid2col}>
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}><FaBullhorn /> Top Campañas</h3>
          {d.topCampaigns.length === 0 && <p className={styles.emptyText}>Sin datos</p>}
          {d.topCampaigns.map((c: any) => (
            <div key={c.id} className={styles.miniRow}>
              <div className={styles.miniInfo}><span className={styles.miniName}>{c.name}</span></div>
              <span className={styles.miniTotal}>S/ {(c.results?.reduce((s: number, r: any) => s + r.revenue, 0) || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}><FaUsers /> Resumen General</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Leads</span>
              <span className={styles.summaryValue}>{leadsByStatus.reduce((s: number, l: any) => s + l._count, 0)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Convertidos</span>
              <span className={styles.summaryValue}>{d.totalConverted}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Ingresos</span>
              <span className={styles.summaryValue}>{formatPrice(d.totalRevenue)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Campañas</span>
              <span className={styles.summaryValue}>{(d.campaignsByStatus || []).reduce((s: number, c: any) => s + c._count, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingReportes;
