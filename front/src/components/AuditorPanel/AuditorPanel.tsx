import { useState, useEffect } from 'react';
import AuditorSidebar from './AuditorSidebar';
import AuditorDashboard from './AuditorDashboard';
import AuditorCourses from './AuditorCourses';
import AuditorStudents from './AuditorStudents';
import Messages from '../UserPanel/Messages/Messages';
import UserHeader from '../UserPanel/UserHeader';
import styles from './AuditorPanel.module.scss';

const AuditorPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('aud_sidebar') === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    try { localStorage.setItem('aud_sidebar', String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); } catch {}
  }, [darkMode]);

  return (
    <div className={styles.layout}>
      <AuditorSidebar active={activeSection} onSelect={setActiveSection}
        collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
        darkMode={darkMode} onDarkModeToggle={() => setDarkMode(!darkMode)} />
      <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        <UserHeader onNavigate={setActiveSection} />
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)}>
          <span /><span /><span />
        </button>
        <div className={styles.content}>
          {activeSection === 'dashboard' && <AuditorDashboard onNavigate={setActiveSection} />}
          {activeSection === 'cursos' && <AuditorCourses />}
          {activeSection === 'estudiantes' && <AuditorStudents />}
          {activeSection === 'mensajes' && <Messages />}
        </div>
      </div>
    </div>
  );
};

export default AuditorPanel;
