import { useState, useEffect, useCallback } from 'react';
import { FaDollarSign, FaUsers, FaFileInvoiceDollar, FaCheckCircle, FaChartLine, FaPlus, FaArrowRight, FaChartBar, FaStar, FaSpinner, FaExclamationTriangle, FaPercentage, FaCalendarAlt, FaRocket, FaUserTie, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useRefresh } from '../../context/RefreshContext';
import { fetchCotizacionStats } from '../../services/cotizacionesApi';
import { fetchClienteStats } from '../../services/clientesApi';
import { fetchOrderStats } from '../../services/ordersApi';
import styles from './SalesPanel.module.scss';

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDate(): string {
  return new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const SalesDashboard = ({ onNavigate }: DashboardProps) => {
  const { user } = useAuth();
  const { refreshKey } = useRefresh();
  const [cotStats, setCotStats] = useState({ total: 0, pendientes: 0, aprobadas: 0, ingresosProyectados: 0, esteMes: 0 });
  const [cliStats, setCliStats] = useState({ total: 0, activos: 0, nuevosEsteMes: 0, frecuentes: 0, conversionRate: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, paid: 0, ingresos: 0, esteMes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [cs, cl, os] = await Promise.all([
        fetchCotizacionStats(),
        fetchClienteStats(),
        fetchOrderStats(),
      ]);
      setCotStats({ total: cs.total, pendientes: cs.pendientes, aprobadas: cs.aprobadas, ingresosProyectados: cs.ingresosProyectados, esteMes: cs.esteMes });
      setCliStats({ total: cl.total, activos: cl.activos, nuevosEsteMes: cl.nuevosEsteMes, frecuentes: cl.frecuentes, conversionRate: cl.conversionRate });
      setOrderStats({ total: os.total, paid: os.paid, ingresos: os.ingresos, esteMes: os.esteMes });
    } catch {
      setError('Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => { load(); }, [load]);

  const formatCurrency = (n: number) => `S/ ${n.toFixed(2)}`;

  const quickActions = [
    { label: 'Nueva Venta', icon: <FaPlus />, section: 'ventas', color: '#10b981', desc: 'Registrar una venta nueva' },
    { label: 'Ver Clientes', icon: <FaUsers />, section: 'clientes', color: '#2563eb', desc: 'Gestionar base de clientes' },
    { label: 'Reportes', icon: <FaChartBar />, section: 'reportes', color: '#8b5cf6', desc: 'Analizar rendimiento' },
    { label: 'Configuración', icon: <FaStar />, section: 'configuracion', color: '#f59e0b', desc: 'Ajustar preferencias' },
  ];

  const ingresoTotal = cotStats.ingresosProyectados + orderStats.ingresos;
  const ventasCompletadas = cotStats.aprobadas + orderStats.paid;
  const ticketPromedio = ventasCompletadas > 0 ? ingresoTotal / ventasCompletadas : 0;

  const summaryItems = [
    { label: 'Cotizaciones este mes', value: cotStats.esteMes, icon: <FaFileInvoiceDollar />, color: '#2563eb', max: Math.max(cotStats.total, 1) },
    { label: 'Pedidos web pagados', value: orderStats.esteMes, icon: <FaShoppingCart />, color: '#10b981', max: Math.max(orderStats.total, 1) },
    { label: 'Clientes activos', value: cliStats.activos, icon: <FaUserTie />, color: '#8b5cf6', max: Math.max(cliStats.total, 1) },
    { label: 'Clientes nuevos', value: cliStats.nuevosEsteMes, icon: <FaRocket />, color: '#f59e0b', max: Math.max(cliStats.nuevosEsteMes || 1, 1) },
  ];

  return (
    <>
      <div className={styles.dashGreeting}>
        <div className={styles.dashGreetingDecor} />
        <div className={styles.dashGreetingContent}>
          <div className={styles.dashGreetingTop}>
            <span className={styles.dashGreetingTime}>{timeGreeting()}, <strong>{user?.firstName || 'Asesor'}</strong></span>
            <span className={styles.dashGreetingDate}><FaCalendarAlt /> {formatDate()}</span>
          </div>
          <p className={styles.dashGreetingSub}>Panel de Ventas &middot; Resumen general de tu actividad comercial</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.dashLoading}>
          <FaSpinner className={styles.dashSpinner} />
          <p>Cargando indicadores...</p>
        </div>
      ) : error ? (
        <div className={styles.dashError}>
          <FaExclamationTriangle /> {error}
          <button className={styles.dashRetry} onClick={load}>Reintentar</button>
        </div>
      ) : (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#10b98112' }}>
                <FaDollarSign style={{ color: '#10b981', fontSize: 20 }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}>{formatCurrency(ingresoTotal)}</span>
                <span className={styles.statLabel}>Ingresos totales</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#2563eb12' }}>
                <FaChartLine style={{ color: '#2563eb', fontSize: 20 }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}>{ventasCompletadas}</span>
                <span className={styles.statLabel}>Ventas completadas</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#f59e0b12' }}>
                <FaFileInvoiceDollar style={{ color: '#f59e0b', fontSize: 20 }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}>{cotStats.pendientes}</span>
                <span className={styles.statLabel}>Cotizaciones pendientes</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#8b5cf612' }}>
                <FaPercentage style={{ color: '#8b5cf6', fontSize: 20 }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}>{formatCurrency(ticketPromedio)}</span>
                <span className={styles.statLabel}>Ticket promedio</span>
              </div>
            </div>
          </div>

          <div className={styles.dashGrid}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}><FaRocket /> Acciones Rápidas</h3>
              </div>
              <div className={styles.dashActions}>
                {quickActions.map(a => (
                  <button key={a.section} className={styles.dashActionCard} onClick={() => onNavigate?.(a.section)}>
                    <span className={styles.dashActionIcon} style={{ background: `${a.color}18`, color: a.color }}>{a.icon}</span>
                    <div className={styles.dashActionInfo}>
                      <span className={styles.dashActionLabel}>{a.label}</span>
                      <span className={styles.dashActionDesc}>{a.desc}</span>
                    </div>
                    <FaArrowRight className={styles.dashActionArrow} />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}><FaStar /> Resumen del Mes</h3>
              </div>
              <div className={styles.dashSummary}>
                {summaryItems.map(item => {
                  const pct = Math.min(Math.round((item.value / item.max) * 100), 100);
                  return (
                    <div key={item.label} className={styles.dashSummaryItem}>
                      <div className={styles.dashSummaryTop}>
                        <span className={styles.dashSummaryIcon} style={{ color: item.color }}>{item.icon}</span>
                        <span className={styles.dashSummaryValue}>{item.value}</span>
                      </div>
                      <span className={styles.dashSummaryLabel}>{item.label}</span>
                      <div className={styles.dashSummaryBar}>
                        <div className={styles.dashSummaryBarFill} style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.dashFooter}>
            <div className={styles.dashFooterItem}>
              <FaUsers /> {cliStats.total} clientes registrados
            </div>
            <div className={styles.dashFooterItem}>
              <FaCheckCircle /> {cliStats.conversionRate}% tasa de conversión
            </div>
            <div className={styles.dashFooterItem}>
              <FaShoppingCart /> {orderStats.paid} pedidos web completados
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SalesDashboard;
