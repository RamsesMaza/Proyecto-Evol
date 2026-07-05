import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminConfig from './AdminConfig';
import NotificationPanel from './NotificationPanel';
import AdminFinanzas from './AdminFinanzas';
import AdminTiUsers from '../AdminTiPanel/AdminTiUsers';
import AdminTiRoles from '../AdminTiPanel/AdminTiRoles';
import AdminTiSupport from '../AdminTiPanel/AdminTiSupport';
import AdminTiAudit from '../AdminTiPanel/AdminTiAudit';
import AdminTiSecurity from '../AdminTiPanel/AdminTiSecurity';
import ReportesGenerales from '../ReportesGenerales/ReportesGenerales';
import UserHeader from '../UserPanel/UserHeader';
import styles from './AdminPanel.module.scss';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <AdminSidebar active={activeSection} onSelect={setActiveSection}
        collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        <UserHeader onNavigate={setActiveSection} />
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)}>
          <span /><span /><span />
        </button>
        <div className={styles.content}>
          {activeSection === 'finanzas' && <AdminFinanzas />}
          {activeSection === 'notificaciones' && <NotificationPanel />}
          {activeSection === 'dashboard' && <AdminDashboard onNavigate={setActiveSection} />}
          {activeSection === 'usuarios' && <AdminTiUsers />}
          {activeSection === 'productos' && <AdminProducts />}
          {activeSection === 'pedidos' && <AdminOrders />}
          {activeSection === 'soporte' && <AdminTiSupport />}
          {activeSection === 'roles' && <AdminTiRoles />}
          {activeSection === 'auditoria' && <AdminTiAudit />}
          {activeSection === 'seguridad' && <AdminTiSecurity />}
          {activeSection === 'configuracion' && <AdminConfig />}
          {activeSection === 'reportes' && <ReportesGenerales />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
