import { useState, useEffect, useMemo, useCallback } from 'react';
import { FaArrowLeft, FaFilePdf, FaLink, FaBook, FaCheckCircle, FaRegCircle, FaPlayCircle, FaDownload, FaChevronDown, FaUserTie, FaChartBar, FaClock, FaFolder, FaBookOpen, FaLaptop, FaBuilding, FaTimes, FaVideo, FaSpinner, FaEnvelope, FaFilePowerpoint } from 'react-icons/fa';
import { fetchCourse, updateProgress, type Course, type CourseModule, type CourseMaterial } from '../../../services/coursesApi';
import styles from './CourseView.module.scss';

interface Props {
  course: any;
  onBack: () => void;
  onContactInstructor?: (userId: number) => void;
}

const resourceIcons: Record<string, JSX.Element> = {
  pdf: <FaFilePdf />, doc: <FaBook />, link: <FaLink />, video: <FaPlayCircle />, ppt: <FaFilePowerpoint />,
};

const CourseView = ({ course: initialCourse, onBack, onContactInstructor }: Props) => {
  const [course, setCourse] = useState<any>(initialCourse);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([0]);
  const [showVideo, setShowVideo] = useState(false);
  const [completedMaterials, setCompletedMaterials] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(`course_${initialCourse.id}_completed`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    fetchCourse(initialCourse.id)
      .then(setCourse)
      .catch(() => setCourse(initialCourse))
      .finally(() => setLoading(false));
  }, [initialCourse.id]);

  const modules = course?.modules || [];

  const totalMaterials = useMemo(
    () => modules.reduce((sum: number, m: any) => sum + (m.materials?.length || 0), 0),
    [modules]
  );

  const progress = useMemo(
    () => totalMaterials > 0 ? Math.min(Math.round((completedMaterials.size / totalMaterials) * 100), 100) : 0,
    [completedMaterials.size, totalMaterials]
  );

  const toggleMaterial = useCallback(async (matId: number) => {
    setCompletedMaterials(prev => {
      const next = new Set(prev);
      if (next.has(matId)) next.delete(matId); else next.add(matId);
      localStorage.setItem(`course_${initialCourse.id}_completed`, JSON.stringify([...next]));
      return next;
    });
  }, [initialCourse.id]);

  useEffect(() => {
    if (!loading && totalMaterials > 0) {
      const timer = setTimeout(async () => {
        setSavingProgress(true);
        try {
          await updateProgress(initialCourse.id, progress);
        } catch (e) { /* silencio */ }
        finally { setSavingProgress(false); }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, loading, totalMaterials, initialCourse.id]);

  const color = '#7c3aed';

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <FaSpinner className={styles.spin} />
      </div>
    );
  }

  const toggleWeek = (w: number) => {
    setExpandedWeeks(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };

  const moduleProgress = (mod: any) => {
    if (!mod.materials || mod.materials.length === 0) return 0;
    const done = mod.materials.filter((m: any) => completedMaterials.has(m.id)).length;
    return Math.round((done / mod.materials.length) * 100);
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.backBtn} onClick={onBack}><FaArrowLeft /> Volver a cursos</button>

      <div className={styles.header}>
        <div className={styles.headerBg} style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)` }} />
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconWrap} style={{ background: `${color}18`, color }}>{course.title?.charAt(0) || 'C'}</div>
            <div>
              <h1 className={styles.headerTitle}>{course.title}</h1>
              <div className={styles.headerMeta}>
                <span className={styles.headerType} style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
                  {course.level === 'virtual' ? <FaLaptop /> : <FaBuilding />} {course.level || 'Presencial'}
                </span>
                {course.creator && (
                  <span className={styles.headerInstructor}><FaUserTie /> {course.creator.firstName} {course.creator.lastName}</span>
                )}
                {course.duration && (
                  <span className={styles.headerDuration}><FaClock /> {course.duration}h</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.headerProgress}>
            <div className={styles.progressRing}>
              <svg viewBox="0 0 36 36" className={styles.progressSvg}>
                <path className={styles.progressBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={styles.progressFill} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: color }} />
              </svg>
              <span className={styles.progressText}>{progress}%</span>
            </div>
            <span className={styles.progressLabel}>Completado</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.leftCol}>
          {modules.length === 0 ? (
            <div className={styles.weekEmpty}>
              <FaClock /> Contenido próximamente.
            </div>
          ) : (
            modules.map((mod: any, idx: number) => {
              const isOpen = expandedWeeks.includes(idx);
              const materials = mod.materials || [];
              const mProgress = moduleProgress(mod);
              return (
                <div key={mod.id || idx} className={`${styles.weekCard} ${isOpen ? styles.weekOpen : ''}`}>
                  <button className={styles.weekHeader} onClick={() => toggleWeek(idx)}>
                    <div className={styles.weekInfo}>
                      <div className={styles.weekNumRow}>
                        <FaFolder className={styles.weekFolderIcon} />
                        <span className={styles.weekNum}>Módulo {idx + 1}</span>
                      </div>
                      <span className={styles.weekTitle}>{mod.title}</span>
                    </div>
                    <div className={styles.weekRight}>
                      {materials.length > 0 && (
                        <div className={styles.weekProgressMini}>
                          <div className={styles.weekProgressMiniFill} style={{ width: `${mProgress}%` }} />
                        </div>
                      )}
                      {mProgress === 100 && materials.length > 0 && <FaCheckCircle className={styles.weekDone} />}
                      <span className={styles.weekMatCount}>{completedMaterials.size} de {totalMaterials}</span>
                      <FaChevronDown className={`${styles.weekChevron} ${isOpen ? styles.chevronOpen : ''}`} />
                    </div>
                  </button>
                  <div className={`${styles.weekBody} ${isOpen ? styles.weekBodyOpen : ''}`}>
                    {materials.length === 0 ? (
                      <div className={styles.weekEmpty}><FaClock /> Sin materiales aún.</div>
                    ) : (
                      <div className={styles.weekSections}>
                        <div className={styles.section}>
                          <div className={styles.sectionList}>
                            {materials.map((mat: any) => {
                              const isCompleted = completedMaterials.has(mat.id);
                              return (
                                <div key={mat.id} className={`${styles.sectionItem} ${isCompleted ? styles.sectionItemDone : ''}`}>
                                  <button className={styles.itemToggle} onClick={() => toggleMaterial(mat.id)} title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}>
                                    {isCompleted ? <FaCheckCircle className={styles.itemCheckDone} /> : <FaRegCircle className={styles.itemCheck} />}
                                  </button>
                                  <span className={styles.itemIcon} style={{
                                    color: mat.type === 'pdf' ? '#dc2626' : mat.type === 'video' ? '#7c3aed' : mat.type === 'link' ? '#2563eb' : '#10b981'
                                  }}>
                                    {resourceIcons[mat.type] || <FaFilePowerpoint />}
                                  </span>
                                  <span className={styles.itemName}>{mat.title}</span>
                                  <span className={styles.itemMeta}>{mat.type}</span>
                                  {mat.fileUrl && (
                                    <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.itemBtn}>
                                      <FaDownload />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.rightCol}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}><FaUserTie /> Instructor</h3>
            <div className={styles.instructorCard}>
              <div className={styles.instructorAvatar} style={{ background: `${color}22`, color }}>
                {course.creator ? `${course.creator.firstName?.charAt(0) || ''}${course.creator.lastName?.charAt(0) || ''}` : 'IN'}
              </div>
              <div>
                <p className={styles.instructorName}>{course.creator ? `${course.creator.firstName} ${course.creator.lastName}` : 'Instructor'}</p>
                <p className={styles.instructorRole}>Instructor Principal</p>
              </div>
            </div>
            {course.createdBy && onContactInstructor && (
              <button className={styles.contactBtn} onClick={() => onContactInstructor(course.createdBy)}>
                <FaEnvelope /> Contactar Instructor
              </button>
            )}
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}><FaChartBar /> Tu Progreso</h3>
            <div className={styles.progressBar}>
              <div className={styles.progressBarFill} style={{ width: `${progress}%`, background: color }} />
            </div>
            <div className={styles.progressStats}>
              <div>
                <span className={styles.statNum}>{completedMaterials.size}</span>
                <span className={styles.statLabel}>Completados</span>
              </div>
              <div>
                <span className={styles.statNum}>{totalMaterials - completedMaterials.size}</span>
                <span className={styles.statLabel}>Pendientes</span>
              </div>
              <div>
                <span className={styles.statNum}>{modules.length}</span>
                <span className={styles.statLabel}>Módulos</span>
              </div>
            </div>
            {savingProgress && <span className={styles.savingHint}><FaSpinner className={styles.spinSmall} /> Guardando...</span>}
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}><FaClock /> Acciones rápidas</h3>
            <button className={styles.quickBtn} style={{ color, borderColor: `${color}33` }} onClick={() => setShowVideo(true)}>
              <FaVideo /> Videoconferencia
            </button>
            {course.description && (
              <div className={styles.quickInfo}>
                <FaBookOpen /> {course.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {showVideo && (
        <div className={styles.videoOverlay} onClick={() => setShowVideo(false)}>
          <div className={styles.videoModal} onClick={e => e.stopPropagation()}>
            <div className={styles.videoHeader}>
              <h3 className={styles.videoTitle}><FaVideo /> Videoconferencia</h3>
              <button className={styles.videoClose} onClick={() => setShowVideo(false)}><FaTimes /></button>
            </div>
            <div className={styles.videoFrame}>
              <iframe
                src={`https://meet.jit.si/ProEvol-${course.id}-${Date.now()}#config.startWithAudioMuted=true&config.startWithVideoMuted=true`}
                allow="camera; microphone; fullscreen; display-capture"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                title="Videoconferencia"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;
