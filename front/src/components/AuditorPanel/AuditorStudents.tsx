import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaUsers, FaBook, FaUserGraduate, FaChevronDown, FaChevronRight, FaPercent, FaCheckCircle, FaClock, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import { fetchAllCourses, fetchEnrollmentsByCourse, type Course, type EnrollmentWithUser } from '../../services/coursesApi';
import styles from './AuditorStudents.module.scss';

const AuditorStudents = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [enrollmentsMap, setEnrollmentsMap] = useState<Record<number, EnrollmentWithUser[]>>({});
  const [loadingStudents, setLoadingStudents] = useState<Set<number>>(new Set());

  const load = async () => {
    try {
      const res = await fetchAllCourses({ pageSize: '200' });
      setCourses(res.courses);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalStudents = useMemo(() =>
    courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0),
    [courses]
  );

  const filtered = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter(c => c.title.toLowerCase().includes(q));
  }, [search, courses]);

  const toggleExpanded = async (courseId: number) => {
    const next = new Set(expanded);
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
      if (!enrollmentsMap[courseId]) {
        setLoadingStudents(prev => new Set(prev).add(courseId));
        try {
          const enrollments = await fetchEnrollmentsByCourse(courseId);
          setEnrollmentsMap(prev => ({ ...prev, [courseId]: enrollments }));
        } catch (e) {
          setEnrollmentsMap(prev => ({ ...prev, [courseId]: [] }));
        }
        setLoadingStudents(prev => {
          const s = new Set(prev);
          s.delete(courseId);
          return s;
        });
      }
    }
    setExpanded(next);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return { bg: '#10b981', text: '#fff' };
    if (progress >= 50) return { bg: '#f59e0b', text: '#fff' };
    return { bg: '#3b82f6', text: '#fff' };
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Estudiantes por Curso</h1>
          <p className={styles.subtitle}>{courses.length} cursos • {totalStudents} estudiantes inscritos</p>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <FaSearch className={styles.searchIcon} />
        <input className={styles.searchInput} placeholder="Buscar curso..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <FaUsers className={styles.emptyIcon} />
          <h3>{search ? 'Sin resultados' : 'No hay cursos con estudiantes'}</h3>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(course => {
            const isOpen = expanded.has(course.id);
            const enrolled = course._count?.enrollments || 0;
            const students = enrollmentsMap[course.id] || [];
            const isLoadingStudents = loadingStudents.has(course.id);

            return (
              <div key={course.id} className={`${styles.card} ${isOpen ? styles.cardExpanded : ''}`}>
                <div className={styles.cardMain} onClick={() => toggleExpanded(course.id)}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardIcon}>
                      <FaBook />
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>{course.title}</h3>
                      <div className={styles.cardMeta}>
                        <span><FaUsers /> {enrolled} inscritos</span>
                        {course.duration && <span><FaClock /> {course.duration}h</span>}
                        <span>{course.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <div className={styles.countBadge}>{enrolled}</div>
                    <FaChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
                  </div>
                </div>

                {isOpen && (
                  <div className={styles.studentSection}>
                    {isLoadingStudents ? (
                      <div className={styles.loadingSmall}><div className={styles.spinnerSmall} /></div>
                    ) : students.length === 0 ? (
                      <p className={styles.emptySmall}>Sin estudiantes inscritos en este curso</p>
                    ) : (
                      <div className={styles.table}>
                        <div className={styles.tableHead}>
                          <span className={styles.thName}>Estudiante</span>
                          <span className={styles.thEmail}>Email</span>
                          <span className={styles.thProgress}>Progreso</span>
                          <span className={styles.thStatus}>Estado</span>
                          <span className={styles.thDate}>Inscripción</span>
                        </div>
                        {students.map(s => {
                          const pColor = getProgressColor(s.progress);
                          return (
                            <div key={s.id} className={styles.tableRow}>
                              <span className={styles.tdName}>
                                <div className={styles.avatar}>
                                  {s.user.firstName.charAt(0)}{s.user.lastName.charAt(0)}
                                </div>
                                {s.user.firstName} {s.user.lastName}
                              </span>
                              <span className={styles.tdEmail}>
                                <FaEnvelope /> {s.user.email}
                              </span>
                              <span className={styles.tdProgress}>
                                <div className={styles.progressBar}>
                                  <div className={styles.progressFill} style={{ width: `${s.progress}%`, background: pColor.bg }} />
                                </div>
                                <span className={styles.progressText}>{Math.round(s.progress)}%</span>
                              </span>
                              <span className={styles.tdStatus}>
                                {s.completed ? (
                                  <span className={styles.statusDone}><FaCheckCircle /> Completado</span>
                                ) : s.progress > 0 ? (
                                  <span className={styles.statusActive}><FaClock /> En curso</span>
                                ) : (
                                  <span className={styles.statusNew}><FaClock /> Iniciado</span>
                                )}
                              </span>
                              <span className={styles.tdDate}>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditorStudents;
