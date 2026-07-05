import { useState, useEffect } from 'react';
import MarketingSidebar from './MarketingSidebar';
import MarketingDashboard from './MarketingDashboard';
import MarketingLeads from './MarketingLeads';
import MarketingCampaigns from './MarketingCampaigns';
import MarketingSegmentacion from './MarketingSegmentacion';
import MarketingEmail from './MarketingEmail';
import MarketingSms from './MarketingSms';
import ReportesGenerales from '../ReportesGenerales/ReportesGenerales';
import MarketingCertificados from './MarketingCertificados';
import UserHeader from '../UserPanel/UserHeader';
import styles from './MarketingPanel.module.scss';

const MarketingPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('mkt_sidebar') === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    try { localStorage.setItem('mkt_sidebar', String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); } catch {}
  }, [darkMode]);

  return (
    <div className={styles.layout}>
      <MarketingSidebar active={activeSection} onSelect={setActiveSection}
        collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
        darkMode={darkMode} onDarkModeToggle={() => setDarkMode(!darkMode)} />
      <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        <UserHeader onNavigate={setActiveSection} />
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)}>
          <span /><span /><span />
        </button>
        <div className={styles.content}>
          {activeSection === 'dashboard' && <MarketingDashboard onNavigate={setActiveSection} />}
          {activeSection === 'leads' && <MarketingLeads />}
          {activeSection === 'campaigns' && <MarketingCampaigns />}
          {activeSection === 'segmentacion' && <MarketingSegmentacion />}
          {activeSection === 'email' && <MarketingEmail />}
          {activeSection === 'sms' && <MarketingSms />}
          {activeSection === 'certificados' && <MarketingCertificados />}
          {activeSection === 'reportes' && <ReportesGenerales />}
        </div>
      </div>
    </div>
  );
};

export default MarketingPanel;
