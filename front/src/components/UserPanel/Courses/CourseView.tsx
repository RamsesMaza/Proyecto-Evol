import { useState } from 'react';
import { FaArrowLeft, FaFilePdf, FaLink, FaBook, FaCheckCircle, FaRegCircle, FaPlayCircle, FaDownload, FaExternalLinkAlt, FaChevronDown, FaUserTie, FaChartBar, FaClock, FaAward, FaFolder, FaClipboardList, FaFilePowerpoint, FaStar, FaMedal, FaBookOpen, FaFire, FaLaptop, FaBuilding, FaTimes } from 'react-icons/fa';
import type { Course } from './Courses';
import styles from './CourseView.module.scss';

interface WeekData {
  week: number;
  title: string;
  resources: { name: string; type: 'pdf' | 'link' | 'doc'; url: string }[];
  activities: { name: string; status: 'pending' | 'completed' }[];
  ppts: { name: string; slides: number }[];
}

const generateWeeks = (): WeekData[] => Array.from({ length: 12 }, (_, i) => {
  const w = i + 1;
  const topics = [
    'Introducción a la Norma', 'Contexto de la Organización', 'Liderazgo y Compromiso', 'Planificación del SGC',
    'Apoyo y Recursos', 'Operación', 'Evaluación del Desempeño', 'Mejora Continua',
    'Auditoría Interna', 'Revisión por la Dirección', 'No Conformidades', 'Cierre y Certificación'
  ];
  return {
    week: w,
    title: topics[i],
    resources: w <= 8 ? [
      { name: `Guía Semana ${w} - ${topics[i]}`, type: 'pdf' as const, url: '#' },
      { name: `Material Complementario S${w}`, type: 'doc' as const, url: '#' },
      { name: w % 2 === 0 ? `Enlace: Norma ISO aplicable S${w}` : `Video tutorial S${w}`, type: 'link' as const, url: '#' },
    ] : [
      { name: `Plantilla Auditoría S${w}`, type: 'pdf' as const, url: '#' },
      { name: `Checklist S${w}`, type: 'doc' as const, url: '#' },
    ],
    activities: w <= 8 ? [
      { name: `Ejercicio práctico S${w}`, status: (w < 4 ? 'completed' : 'pending') as 'completed' | 'pending' },
      { name: `Cuestionario S${w}`, status: (w < 3 ? 'completed' : 'pending') as 'completed' | 'pending' },
    ] : [
      { name: `Simulacro de auditoría S${w}`, status: 'pending' },
    ],
    ppts: [
      { name: `Presentación Semana ${w}`, slides: 12 + w * 2 },
    ],
  };
});

interface Props {
  course: Course;
  onBack: () => void;
}

const resourceIcons: Record<string, JSX.Element> = {
  pdf: <FaFilePdf />,
  doc: <FaBook />,
  link: <FaLink />,
};

const CourseView = ({ course, onBack }: Props) => {
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const weeks = generateWeeks();

  const toggleWeek = (w: number) => {
    setExpandedWeeks(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };

  const completedActivities = weeks.flatMap(w => w.activities).filter(a => a.status === 'completed').length;
  const totalActivities = weeks.flatMap(w => w.activities).length;
  const progress = Math.round((completedActivities / totalActivities) * 100);

  return (
    <div className={styles.wrapper}>
      {/* Back */}
      <button className={styles.backBtn} onClick={onBack}><FaArrowLeft /> Volver a cursos</button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerBg} style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}08)` }} />
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconWrap} style={{ background: `${course.color}18`, color: course.color }}>{course.code.charAt(0)}</div>
            <div>
              <span className={styles.headerCode}>{course.code}</span>
              <h1 className={styles.headerTitle}>{course.title}</h1>
              <div className={styles.headerMeta}>
                <span className={styles.headerType} style={{ background: course.type === 'Virtual' ? 'rgba(37,99,235,0.1)' : 'rgba(16,185,129,0.1)', color: course.type === 'Virtual' ? '#2563eb' : '#10b981' }}>
                  {course.type === 'Virtual' ? <FaLaptop /> : <FaBuilding />} {course.type}
                </span>
                <span className={styles.headerInstructor}><FaUserTie /> {course.instructor}</span>
                <span className={styles.headerRating}><FaStar /> {course.rating}</span>
              </div>
            </div>
          </div>
          <div className={styles.headerProgress}>
            <div className={styles.progressRing}>
              <svg viewBox="0 0 36 36" className={styles.progressSvg}>
                <path className={styles.progressBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={styles.progressFill} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: course.color }} />
              </svg>
              <span className={styles.progressText}>{progress}%</span>
            </div>
            <span className={styles.progressLabel}>Completado</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Left — Accordion */}
        <div className={styles.leftCol}>
          {weeks.map(w => {
            const isOpen = expandedWeeks.includes(w.week);
            const hasResources = w.resources.length > 0;
            const hasActivities = w.activities.length > 0;
            const hasPpts = w.ppts.length > 0;
            const allDone = w.activities.every(a => a.status === 'completed');

            return (
              <div key={w.week} className={`${styles.weekCard} ${isOpen ? styles.weekOpen : ''}`}>
                <button className={styles.weekHeader} onClick={() => toggleWeek(w.week)}>
                  <div className={styles.weekInfo}>
                    <span className={styles.weekNum}>Semana {w.week}</span>
                    <span className={styles.weekTitle}>{w.title}</span>
                  </div>
                  <div className={styles.weekRight}>
                    {allDone && w.activities.length > 0 && <FaCheckCircle className={styles.weekDone} />}
                    <FaChevronDown className={`${styles.weekChevron} ${isOpen ? styles.chevronOpen : ''}`} />
                  </div>
                </button>
                <div className={`${styles.weekBody} ${isOpen ? styles.weekBodyOpen : ''}`}>
                  {!hasResources && !hasActivities && !hasPpts ? (
                    <div className={styles.weekEmpty}>
                      <FaClock /> Contenido próximamente.
                    </div>
                  ) : (
                    <div className={styles.weekSections}>
                      {hasResources && (
                        <div className={styles.section}>
                          <div className={styles.sectionHeader}>
                            <FaFolder className={styles.sectionIcon} />
                            <span>Recursos</span>
                          </div>
                          <div className={styles.sectionList}>
                            {w.resources.map((r, i) => (
                              <div key={i} className={styles.sectionItem}>
                                <span className={styles.itemIcon} style={{ color: r.type === 'pdf' ? '#dc2626' : r.type === 'link' ? '#2563eb' : '#10b981' }}>{resourceIcons[r.type]}</span>
                                <span className={styles.itemName}>{r.name}</span>
                                <button className={styles.itemBtn}><FaExternalLinkAlt /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {hasActivities && (
                        <div className={styles.section}>
                          <div className={styles.sectionHeader}>
                            <FaClipboardList className={styles.sectionIcon} />
                            <span>Actividades</span>
                          </div>
                          <div className={styles.sectionList}>
                            {w.activities.map((a, i) => (
                              <div key={i} className={styles.sectionItem}>
                                <span className={`${styles.itemIcon} ${a.status === 'completed' ? styles.itemDone : ''}`}>
                                  {a.status === 'completed' ? <FaCheckCircle /> : <FaRegCircle />}
                                </span>
                                <span className={styles.itemName}>{a.name}</span>
                                <span className={`${styles.itemStatus} ${a.status === 'completed' ? styles.statusDone : styles.statusPending}`}>
                                  {a.status === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>
                                <button className={styles.itemBtn}><FaPlayCircle /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {hasPpts && (
                        <div className={styles.section}>
                          <div className={styles.sectionHeader}>
                            <FaFilePowerpoint className={styles.sectionIcon} />
                            <span>PPTs</span>
                          </div>
                          <div className={styles.sectionList}>
                            {w.ppts.map((p, i) => (
                              <div key={i} className={styles.sectionItem}>
                                <span className={styles.itemIcon} style={{ color: '#f59e0b' }}><FaFilePowerpoint /></span>
                                <span className={styles.itemName}>{p.name}</span>
                                <span className={styles.itemMeta}>{p.slides} diapositivas</span>
                                <button className={styles.itemBtn}><FaDownload /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Sidebar */}
        <div className={styles.rightCol}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}><FaUserTie /> Instructor</h3>
            <div className={styles.instructorCard}>
              <div className={styles.instructorAvatar} style={{ background: `${course.color}22`, color: course.color }}>
                {course.instructor.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className={styles.instructorName}>{course.instructor}</p>
                <p className={styles.instructorRole}>Instructor Principal</p>
              </div>
            </div>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}><FaChartBar /> Progreso</h3>
            <div className={styles.progressBar}>
              <div className={styles.progressBarFill} style={{ width: `${progress}%`, background: course.color }} />
            </div>
            <div className={styles.progressStats}>
              <div><span className={styles.statNum}>{completedActivities}</span><span className={styles.statLabel}>Completadas</span></div>
              <div><span className={styles.statNum}>{totalActivities - completedActivities}</span><span className={styles.statLabel}>Pendientes</span></div>
              <div><span className={styles.statNum}>{weeks.length}</span><span className={styles.statLabel}>Semanas</span></div>
            </div>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}><FaAward /> Logros</h3>
            <div className={styles.achievements}>
              {progress >= 25 && <div className={styles.achBadge} style={{ background: '#fef2f2', color: '#dc2626' }}><FaMedal /> Iniciado</div>}
              {progress >= 50 && <div className={styles.achBadge} style={{ background: '#eff6ff', color: '#2563eb' }}><FaBookOpen /> En progreso</div>}
              {progress >= 75 && <div className={styles.achBadge} style={{ background: '#f0fdf4', color: '#16a34a' }}><FaFire /> Avanzado</div>}
              {progress >= 100 && <div className={styles.achBadge} style={{ background: '#fefce8', color: '#ca8a04' }}><FaStar /> Completado</div>}
              {progress < 25 && <p className={styles.achEmpty} style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Completa actividades para obtener logros</p>}
            </div>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}><FaClock /> Acciones rápidas</h3>
            <button className={styles.quickBtn} style={{ color: course.color, borderColor: `${course.color}33` }}>
              <FaDownload /> Descargar todo el material
            </button>
            <button className={styles.quickBtn} style={{ color: course.color, borderColor: `${course.color}33` }}>
              <FaExternalLinkAlt /> Ver calendario del curso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
