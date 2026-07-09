import { useState, useEffect } from 'react';
import UserHeader from '../UserPanel/UserHeader';
import SalesSidebar from './SalesSidebar';
import SalesDashboard from './SalesDashboard';
import SalesClientes from './SalesClientes';
import SalesVentas from './SalesVentas';
import AdminProducts from '../AdminPanel/AdminProducts';
import ReportesGenerales from '../ReportesGenerales/ReportesGenerales';
import SalesConfiguracion from './SalesConfiguracion';
import { RefreshProvider } from '../../context/RefreshContext';
import styles from './SalesPanel.module.scss';

const SalesPanel = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('sales_displayPrefs') || '{}');
      document.documentElement.setAttribute('data-theme', prefs.darkMode ? 'dark' : 'light');
    } catch {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <RefreshProvider>
    <div className={styles.layout}>
      <SalesSidebar active={activeSection} onSelect={setActiveSection} collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        <UserHeader onNavigate={setActiveSection} />
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
          <span /><span /><span />
        </button>

        <div className={styles.content}>
          {activeSection === 'inicio' && <SalesDashboard onNavigate={setActiveSection} />}
          {activeSection === 'clientes' && <SalesClientes />}
          {activeSection === 'productos' && <AdminProducts />}
          {activeSection === 'ventas' && <SalesVentas />}
          {activeSection === 'reportes' && <ReportesGenerales />}
          {activeSection === 'configuracion' && <SalesConfiguracion />}
        </div>
      </div>
    </div>
    </RefreshProvider>
  );
};

export default SalesPanel;
