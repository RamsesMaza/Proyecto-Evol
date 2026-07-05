import { useState, useEffect, useCallback } from 'react';
import { FaChartBar, FaExclamationTriangle, FaSpinner, FaUsers, FaDollarSign, FaBullhorn, FaHistory, FaChartLine, FaCheckCircle, FaPercentage, FaMoneyBillWave, FaShoppingCart, FaFileInvoice, FaUserPlus, FaEye, FaMousePointer, FaArrowUp, FaCalendarAlt, FaTrophy, FaDownload, FaSearch, FaLock } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import {
  fetchGeneral, fetchUserGrowth, fetchLeadReports, fetchLeadTrend,
  fetchCampaignReports, fetchRevenueReports, fetchActivityReports,
  type GeneralReport, type LeadReport, type CampaignReport, type RevenueReport, type ActivityReport,
} from '../../services/reportsApi';
import styles from './ReportesGenerales.module.scss';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

const formatPrice = (v: number) => `S/ ${v.toFixed(2)}`;

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };

const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color, fontSize: 12, margin: 0 }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>)}
    </div>
  );
  return null;
};

const getUserRole = (): string => {
  try {
    const u = localStorage.getItem('user');
    if (u) return JSON.parse(u).role || '';
  } catch {}
  return '';
};

const TAB_ROLES: Record<string, string[]> = {
  general: ['ADMIN', 'MARKETING', 'SALES'],
  growth: ['ADMIN', 'TI'],
  leads: ['ADMIN', 'MARKETING', 'SALES'],
  campaigns: ['ADMIN', 'MARKETING'],
  revenue: ['ADMIN', 'SALES', 'MARKETING'],
  activity: ['ADMIN', 'TI'],
};

type TabId = 'general' | 'growth' | 'leads' | 'campaigns' | 'revenue' | 'activity';

const ALL_TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: <FaChartBar /> },
  { id: 'growth', label: 'Crecimiento', icon: <FaArrowUp /> },
  { id: 'leads', label: 'Leads', icon: <FaUsers /> },
  { id: 'campaigns', label: 'Campañas', icon: <FaBullhorn /> },
  { id: 'revenue', label: 'Ingresos', icon: <FaDollarSign /> },
  { id: 'activity', label: 'Actividad', icon: <FaHistory /> },
];

const statusLabels: Record<string, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', interesado: 'Interesado',
  en_negociacion: 'En Neg.', convertido: 'Convertido', perdido: 'Perdido',
};

const ReportesGenerales = () => {
  const role = getUserRole();
  const TABS = ALL_TABS.filter(t => (TAB_ROLES[t.id] || []).includes(role));
  const [tab, setTab] = useState<TabId>(TABS[0]?.id || 'general');
  const [startDate, setStartDate] = useState(monthAgo());
  const [endDate, setEndDate] = useState(today());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [general, setGeneral] = useState<GeneralReport | null>(null);
  const [userGrowth, setUserGrowth] = useState<Array<{ month: string; total: number }>>([]);
  const [leads, setLeads] = useState<LeadReport | null>(null);
  const [leadTrend, setLeadTrend] = useState<Array<{ month: string; total: number; converted: number }>>([]);
  const [campaigns, setCampaigns] = useState<CampaignReport | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [activity, setActivity] = useState<ActivityReport | null>(null);

  const qs = { startDate, endDate };

  const loadAll = async () => {
    setLoading(true); setError('');
    const fetches: Promise<any>[] = [];
    const includes = (id: TabId) => TABS.some(t => t.id === id);

    if (includes('general')) fetches.push(fetchGeneral(qs));
    if (includes('growth')) fetches.push(fetchUserGrowth(qs));
    if (includes('leads')) fetches.push(fetchLeadReports(qs));
    if (includes('leads')) fetches.push(fetchLeadTrend(qs));
    if (includes('campaigns')) fetches.push(fetchCampaignReports(qs));
    if (includes('revenue')) fetches.push(fetchRevenueReports(qs));
    if (includes('activity')) fetches.push(fetchActivityReports(qs));

    try {
      const results = await Promise.allSettled(fetches);
      let idx = 0;
      if (includes('general')) { if (results[idx].status === 'fulfilled') setGeneral(results[idx].value); idx++; }
      if (includes('growth')) { if (results[idx].status === 'fulfilled') setUserGrowth(results[idx].value); idx++; }
      if (includes('leads')) { if (results[idx].status === 'fulfilled') setLeads(results[idx].value); idx++; }
      if (includes('leads')) { if (results[idx].status === 'fulfilled') setLeadTrend(results[idx].value); idx++; }
      if (includes('campaigns')) { if (results[idx].status === 'fulfilled') setCampaigns(results[idx].value); idx++; }
      if (includes('revenue')) { if (results[idx].status === 'fulfilled') setRevenue(results[idx].value); idx++; }
      if (includes('activity')) { if (results[idx].status === 'fulfilled') setActivity(results[idx].value); idx++; }
      const errors = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      if (errors.length > 0) {
        setError(`Error en ${errors.length} reporte(s): ${errors.map(e => e.reason?.message || 'desconocido').join('; ')}`);
      }
    } catch {
      setError('Error al cargar reportes');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const downloadCurrent = useCallback(() => {
    const dateStr = new Date().toISOString().slice(0, 10);
    switch (tab) {
      case 'general': {
        if (!general) return;
        downloadCSV(`reporte_general_${dateStr}.csv`,
          ['Métrica', 'Valor'],
          [
            ['Total Usuarios', String(general.totalUsers)],
            ['Nuevos (periodo)', String(general.newUsers)],
            ['Total Órdenes', String(general.totalOrders)],
            ['Ingresos', formatPrice(general.totalRevenue)],
            ['Cotizaciones', String(general.totalQuotes)],
            ...general.usersByRole.map(r => [`Usuarios ${r.role}`, String(r._count)]),
            ...userGrowth.map(g => [`Crecimiento ${g.month}`, String(g.total)]),
          ]
        );
        break;
      }
      case 'growth': {
        if (!userGrowth.length) return;
        downloadCSV(`crecimiento_usuarios_${dateStr}.csv`,
          ['Mes', 'Nuevos Usuarios'],
          userGrowth.map(g => [g.month, String(g.total)])
        );
        break;
      }
      case 'leads': {
        if (!leads) return;
        downloadCSV(`reporte_leads_${dateStr}.csv`,
          ['Categoría', 'Nombre', 'Valor'],
          [
            ['Total', '', String(leads.total)],
            ...leads.byStatus.map(s => ['Estado', statusLabels[s.status] || s.status, String(s._count)]),
            ...leads.byCampaign.map(c => ['Campaña', c.campaignName, String(c._count)]),
            ...leadTrend.map(t => ['Tendencia', t.month, `${t.total} (${t.converted} convertidos)`]),
          ]
        );
        break;
      }
      case 'campaigns': {
        if (!campaigns) return;
        const cr = ((campaigns.totals.leadsGenerated > 0 ? (campaigns.totals.leadsConverted / campaigns.totals.leadsGenerated) * 100 : 0)).toFixed(1);
        downloadCSV(`reporte_campanas_${dateStr}.csv`,
          ['Categoría', 'Nombre', 'Valor'],
          [
            ['Ingresos', '', formatPrice(campaigns.totals.revenue)],
            ['Leads Generados', '', String(campaigns.totals.leadsGenerated)],
            ['Convertidos', '', String(campaigns.totals.leadsConverted)],
            ['Conversión', '', `${cr}%`],
            ['Impresiones', '', String(campaigns.totals.impressions)],
            ['Clicks', '', String(campaigns.totals.clicks)],
            ...campaigns.byStatus.map(s => ['Estado', s.status, String(s._count)]),
            ...campaigns.byType.map(t => ['Tipo', t.type, String(t._count)]),
            ...campaigns.top.map(c => ['Top Campaña', c.name, `${formatPrice(c.revenue)} (${c.leadsCount} leads)`]),
          ]
        );
        break;
      }
      case 'revenue': {
        if (!revenue) return;
        downloadCSV(`reporte_ingresos_${dateStr}.csv`,
          ['Categoría', 'Valor'],
          [
            ['Total Órdenes', formatPrice(revenue.totalOrders)],
            ['Total Cotizaciones', formatPrice(revenue.totalQuotes)],
            ['Ingresos Campañas', formatPrice(revenue.totalCampaignRevenue)],
            ['Total General', formatPrice(revenue.totalOrders + revenue.totalQuotes + revenue.totalCampaignRevenue)],
            ['Órdenes', String(revenue.orderCount)],
            ['Cotizaciones', String(revenue.quoteCount)],
            ['Cotizaciones Aprobadas', String(revenue.approvedQuotes)],
            ['Cotizaciones Pendientes', String(revenue.pendingQuotes)],
            ...revenue.byCampaign.map(c => [`Ingreso ${c.campaignName}`, `${formatPrice(c.revenue)} (${c.leadsGenerated} leads, ${c.leadsConverted} conv.)`]),
          ]
        );
        break;
      }
      case 'activity': {
        if (!activity) return;
        downloadCSV(`reporte_actividad_${dateStr}.csv`,
          ['Tipo', 'Nombre', 'Conteo'],
          [
            ...activity.byAction.map(a => ['Acción', a.action, String(a._count)]),
            ...activity.byEntity.map(e => ['Entidad', e.entity, String(e._count)]),
            ...activity.recent.slice(0, 15).map(r => ['Reciente', r.action, `${r.description || ''} - ${r.userName || ''} ${new Date(r.createdAt).toLocaleString('es-PE')}`]),
          ]
        );
        break;
      }
    }
  }, [tab, general, userGrowth, leads, leadTrend, campaigns, revenue, activity]);

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaChartBar /></div>
          <div><h2 className={styles.title}>Reportes Generales</h2><p className={styles.subtitle}>Análisis y métricas del sistema</p></div>
        </div>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error}</div>}

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.dateFilter}>
            <FaCalendarAlt />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.dateInput} />
            <span>a</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={styles.dateInput} />
            <button className={styles.filterBtn} onClick={loadAll} disabled={loading}>
              {loading ? <FaSpinner /> : <FaSearch />} Filtrar
            </button>
          </div>
          <button className={styles.downloadBtn} onClick={downloadCurrent} disabled={loading} title="Descargar CSV">
            <FaDownload /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando reportes...</div>
      ) : (
        <>
          {tab === 'general' && general && <GeneralTab data={general} growth={userGrowth} />}
          {tab === 'growth' && <GrowthTab data={userGrowth} />}
          {tab === 'leads' && leads && <LeadsTab data={leads} trend={leadTrend} />}
          {tab === 'campaigns' && campaigns && <CampaignsTab data={campaigns} />}
          {tab === 'revenue' && revenue && <RevenueTab data={revenue} />}
          {tab === 'activity' && activity && <ActivityTab data={activity} />}
        </>
      )}
    </div>
  );
};

const GrowthTab = ({ data }: { data: Array<{ month: string; total: number }> }) => (
  <div className={styles.sectionCard}>
    <h3 className={styles.sectionTitle}><FaArrowUp /> Crecimiento de Usuarios</h3>
    <div className={styles.chartBody}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="total" name="Nuevos Usuarios" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className={styles.tableWrap} style={{ marginTop: 16 }}>
      <table className={styles.table}>
        <thead><tr><th>Mes</th><th>Nuevos Usuarios</th></tr></thead>
        <tbody>
          {data.map((g, i) => (
            <tr key={i}><td>{g.month}</td><td>{g.total}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const GeneralTab = ({ data, growth }: { data: GeneralReport; growth: Array<{ month: string; total: number }> }) => (
  <>
    <div className={styles.metricsGrid}>
      <div className={styles.metricCard}><FaUsers /> Usuarios: {data.totalUsers}</div>
      <div className={styles.metricCard}><FaUserPlus /> Nuevos (periodo): {data.newUsers}</div>
      <div className={styles.metricCard}><FaShoppingCart /> Órdenes: {data.totalOrders}</div>
      <div className={styles.metricCard}><FaDollarSign /> Ingresos: {formatPrice(data.totalRevenue)}</div>
      <div className={styles.metricCard}><FaFileInvoice /> Cotizaciones: {data.totalQuotes}</div>
    </div>

    <div className={styles.chartsRow}>
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}><h3><FaUsers /> Usuarios por Rol</h3></div>
        <div className={styles.chartBody}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.usersByRole.map(r => ({ name: r.role, value: r._count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.usersByRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}><h3><FaArrowUp /> Crecimiento de Usuarios</h3></div>
        <div className={styles.chartBody}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" name="Nuevos Usuarios" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </>
);

const LeadsTab = ({ data, trend }: { data: LeadReport; trend: Array<{ month: string; total: number; converted: number }> }) => (
  <>
    <div className={styles.metricsGrid}>
      <div className={styles.metricCard}><FaUsers /> Total Leads: {data.total}</div>
      {data.byStatus.map(s => (
        <div key={s.status} className={styles.metricCard}>
          {statusLabels[s.status] || s.status}: {s._count}
        </div>
      ))}
    </div>

    <div className={styles.chartsRow}>
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}><h3><FaChartLine /> Leads por Estado</h3></div>
        <div className={styles.chartBody}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.byStatus.map(s => ({ name: statusLabels[s.status] || s.status, value: s._count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
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

    {data.byCampaign.length > 0 && (
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}><FaBullhorn /> Leads por Campaña (Top 10)</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Campaña</th><th>Leads</th></tr></thead>
            <tbody>
              {data.byCampaign.map((c, i) => (
                <tr key={i}><td>{c.campaignName}</td><td>{c._count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
);

const CampaignsTab = ({ data }: { data: CampaignReport }) => {
  const conversionRate = data.totals.leadsGenerated > 0 ? ((data.totals.leadsConverted / data.totals.leadsGenerated) * 100).toFixed(1) : '0.0';
  return (
    <>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}><FaDollarSign /> Ingresos: {formatPrice(data.totals.revenue)}</div>
        <div className={styles.metricCard}><FaUsers /> Leads Gen.: {data.totals.leadsGenerated}</div>
        <div className={styles.metricCard}><FaCheckCircle /> Convertidos: {data.totals.leadsConverted}</div>
        <div className={styles.metricCard}><FaPercentage /> Conv.: {conversionRate}%</div>
        <div className={styles.metricCard}><FaEye /> Impresiones: {data.totals.impressions.toLocaleString()}</div>
        <div className={styles.metricCard}><FaMousePointer /> Clicks: {data.totals.clicks.toLocaleString()}</div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3><FaChartLine /> Campañas por Estado</h3></div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.byStatus.map(s => ({ name: s.status, value: s._count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3><FaBullhorn /> Campañas por Tipo</h3></div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.byType.map(s => ({ name: s.type, value: s._count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.byType.map((_, i) => <Cell key={i} fill={COLORS.slice(4).concat(COLORS.slice(0, 4))[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}><FaTrophy /> Top Campañas</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Nombre</th><th>Estado</th><th>Tipo</th><th>Presupuesto</th><th>Gastado</th><th>Leads</th><th>Ingresos</th></tr></thead>
            <tbody>
              {data.top.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><span className={styles.badge}>{c.status}</span></td>
                  <td>{c.type}</td>
                  <td>{formatPrice(c.budget)}</td>
                  <td>{formatPrice(c.spent)}</td>
                  <td>{c.leadsCount}</td>
                  <td>{formatPrice(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const RevenueTab = ({ data }: { data: RevenueReport }) => (
  <>
    <div className={styles.metricsGrid}>
      <div className={styles.metricCard}><FaShoppingCart /> Órdenes: {data.orderCount} - {formatPrice(data.totalOrders)}</div>
      <div className={styles.metricCard}><FaFileInvoice /> Cotizaciones: {data.quoteCount} - {formatPrice(data.totalQuotes)}</div>
      <div className={styles.metricCard}><FaBullhorn /> Campañas: {formatPrice(data.totalCampaignRevenue)}</div>
      <div className={styles.metricCard}><FaCheckCircle /> Aprobadas: {data.approvedQuotes}</div>
      <div className={styles.metricCard}><FaHistory /> Pendientes: {data.pendingQuotes}</div>
      <div className={styles.metricCard}><FaMoneyBillWave /> Total: {formatPrice(data.totalOrders + data.totalQuotes + data.totalCampaignRevenue)}</div>
    </div>

    {data.byCampaign.length > 0 && (
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}><FaBullhorn /> Ingresos por Campaña</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Campaña</th><th>Ingresos</th><th>Leads Gen.</th><th>Convertidos</th></tr></thead>
            <tbody>
              {data.byCampaign.map((c, i) => (
                <tr key={i}><td>{c.campaignName}</td><td>{formatPrice(c.revenue)}</td><td>{c.leadsGenerated}</td><td>{c.leadsConverted}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
);

const ActivityTab = ({ data }: { data: ActivityReport }) => (
  <>
    <div className={styles.chartsRow}>
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}><h3><FaHistory /> Acciones más Frecuentes</h3></div>
        <div className={styles.chartBody}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byAction.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="action" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="_count" name="Veces" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}><h3><FaChartLine /> Entidades más Auditadas</h3></div>
        <div className={styles.chartBody}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byEntity} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="entity" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="_count" name="Registros" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className={styles.sectionCard}>
      <h3 className={styles.sectionTitle}><FaHistory /> Actividad Reciente</h3>
      <div className={styles.activityList}>
        {data.recent.slice(0, 15).map(a => (
          <div key={a.id} className={styles.activityRow}>
            <span className={styles.activityAction}>{a.action}</span>
            <span className={styles.activityEntity}>{a.entity}</span>
            <span className={styles.activityDesc}>{a.description || '-'}</span>
            <span className={styles.activityUser}>{a.userName || '-'}</span>
            <span className={styles.activityDate}>{new Date(a.createdAt).toLocaleString('es-PE')}</span>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default ReportesGenerales;
