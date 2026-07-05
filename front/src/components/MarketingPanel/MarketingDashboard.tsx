import { useState, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaPercentage, FaCheckCircle, FaBullhorn, FaDollarSign, FaExclamationTriangle, FaSpinner, FaChartLine, FaHistory, FaFlag, FaLayerGroup, FaSms, FaChartBar, FaEnvelope } from 'react-icons/fa';
import { fetchMarketingDashboard, type MarketingDashboardStats } from '../../services/marketingApi';
import styles from './MarketingDashboard.module.scss';

const MarketingDashboard = ({ onNavigate }: { onNavigate: (key: string) => void }) => {
  const [stats, setStats] = useState<MarketingDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setLoading(true); setError(''); setStats(await fetchMarketingDashboard()); }
    catch { setError('Error al cargar dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className={styles.module}><div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando dashboard...</div></div>;
  if (error) return <div className={styles.module}><div className={styles.errorMsg}><FaExclamationTriangle /> {error} <button className={styles.retryBtn} onClick={load}>Reintentar</button></div></div>;
  if (!stats) return null;

  const s = stats;

  const metricCards = [
    { label: 'Total Leads', value: s.totalLeads, icon: <FaUsers />, color: '#8b5cf6', bg: '#8b5cf615', section: 'leads' },
    { label: 'Leads Nuevos', value: s.newLeads, icon: <FaUserPlus />, color: '#3b82f6', bg: '#3b82f615', section: 'leads' },
    { label: 'Leads Convertidos', value: s.convertedLeads, icon: <FaCheckCircle />, color: '#10b981', bg: '#10b98115', section: 'leads' },
    { label: 'Tasa Conversión', value: `${s.conversionRate}%`, icon: <FaPercentage />, color: '#f59e0b', bg: '#f59e0b15', section: 'leads' },
    { label: 'Campañas Activas', value: s.activeCampaigns, icon: <FaBullhorn />, color: '#3b82f6', bg: '#3b82f615', section: 'campaigns' },
    { label: 'Campañas Finalizadas', value: s.finishedCampaigns, icon: <FaFlag />, color: '#10b981', bg: '#10b98115', section: 'campaigns' },
    { label: 'Ingresos Campañas', value: `S/ ${s.campaignRevenue.toFixed(2)}`, icon: <FaDollarSign />, color: '#f59e0b', bg: '#f59e0b15', section: 'reportes' },
    { label: 'Conversión General', value: `${s.conversionRate > 0 ? `${s.conversionRate}%` : '0%'}`, icon: <FaChartLine />, color: '#10b981', bg: '#10b98115', section: 'reportes' },
  ];

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaChartLine /></div>
          <div><h2 className={styles.title}>Panel de Marketing</h2><p className={styles.subtitle}>Métricas y rendimiento de campañas</p></div>
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
            </div>
          </button>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3><FaHistory /> Actividad Reciente</h3></div>
          <div className={styles.chartBody}>
            {s.recentActivity.length === 0 && <p className={styles.emptyText}>Sin actividad reciente</p>}
            {s.recentActivity.slice(0, 8).map((a: any) => (
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

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3><FaBullhorn /> Acceso Rápido</h3></div>
          <div className={styles.chartBody}>
            <div className={styles.quickGrid}>
              {[
                { label: 'Nuevo Lead', icon: <FaUserPlus />, section: 'leads', desc: 'Registrar prospecto' },
                { label: 'Nueva Campaña', icon: <FaBullhorn />, section: 'campaigns', desc: 'Crear campaña' },
                { label: 'Segmentar', icon: <FaLayerGroup />, section: 'segmentacion', desc: 'Segmentar clientes' },
                { label: 'Email', icon: <FaEnvelope />, section: 'email', desc: 'Campaña de correo' },
                { label: 'SMS', icon: <FaSms />, section: 'sms', desc: 'Campaña de SMS' },
                { label: 'Reportes', icon: <FaChartBar />, section: 'reportes', desc: 'Analítica' },
              ].map(a => (
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
    </div>
  );
};

export default MarketingDashboard;
