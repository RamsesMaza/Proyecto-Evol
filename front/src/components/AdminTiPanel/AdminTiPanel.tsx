import { useState } from 'react';
import AdminTiSidebar from './AdminTiSidebar';
import AdminTiDashboard from './AdminTiDashboard';
import AdminTiUsers from './AdminTiUsers';
import AdminTiRoles from './AdminTiRoles';
import AdminTiSupport from './AdminTiSupport';
import AdminTiAudit from './AdminTiAudit';
import AdminTiSecurity from './AdminTiSecurity';
import ReportesGenerales from '../ReportesGenerales/ReportesGenerales';
import UserHeader from '../UserPanel/UserHeader';
import styles from './AdminTiPanel.module.scss';

const AdminTiPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <AdminTiSidebar active={activeSection} onSelect={setActiveSection}
        collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        <UserHeader onNavigate={setActiveSection} />
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)}>
          <span /><span /><span />
        </button>
        <div className={styles.content}>
          {activeSection === 'dashboard' && <AdminTiDashboard onNavigate={setActiveSection} />}
          {activeSection === 'usuarios' && <AdminTiUsers />}
          {activeSection === 'roles' && <AdminTiRoles />}
          {activeSection === 'soporte' && <AdminTiSupport />}
          {activeSection === 'auditoria' && <AdminTiAudit />}
          {activeSection === 'seguridad' && <AdminTiSecurity />}
          {activeSection === 'reportes' && <ReportesGenerales />}
        </div>
      </div>
    </div>
  );
};

export default AdminTiPanel;
