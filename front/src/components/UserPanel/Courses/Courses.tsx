import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaTh, FaList, FaHeart, FaBookOpen, FaUserTie, FaLaptop, FaBuilding, FaExternalLinkAlt, FaStar, FaCompass, FaBookmark, FaCheck, FaSpinner, FaClock, FaGraduationCap, FaFire, FaChevronRight, FaPlay } from 'react-icons/fa';
import { fetchMyCourses, fetchAvailableCourses, enrollCourse, type Course, type CourseEnrollment } from '../../../services/coursesApi';
import CourseView from './CourseView';
import styles from './Courses.module.scss';

const COLORS = ['#dc2626', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

interface CoursesProps {
  onContactInstructor?: (userId: number) => void;
}

const Courses = ({ onContactInstructor }: CoursesProps) => {
  const [tab, setTab] = useState<'mis-cursos' | 'explorar'>('mis-cursos');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('up_fav_courses') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (tab === 'mis-cursos') {
      setLoading(true);
      fetchMyCourses()
        .then(setEnrollments)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      fetchAvailableCourses()
        .then(res => setAvailableCourses(res.courses || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const enrolledIds = useMemo(() => new Set(enrollments.map(e => e.courseId)), [enrollments]);

  const categories = useMemo(() => {
    const source = tab === 'mis-cursos' ? enrollments.map(e => e.course).filter(Boolean as unknown as (x: any) => x is Course) : availableCourses;
    return ['Todas', ...new Set(source.map(c => c.category).filter(Boolean) as string[])];
  }, [tab, enrollments, availableCourses]);

  const filtered = useMemo(() => {
    if (tab === 'mis-cursos') {
      return enrollments.filter(e => {
        const c = e.course;
        if (!c) return false;
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.category?.toLowerCase() || '').includes(search.toLowerCase());
        const matchCategory = filterCategory === 'Todas' || c.category === filterCategory;
        return matchSearch && matchCategory;
      });
    }
    return availableCourses.filter(c => {
      if (!c) return false;
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.category?.toLowerCase() || '').includes(search.toLowerCase());
      const matchCategory = filterCategory === 'Todas' || c.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [tab, search, filterCategory, enrollments, availableCourses]);

  const toggleFav = (id: number) => {
    const sid = String(id);
    setFavorites(prev => {
      const next = prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid];
      localStorage.setItem('up_fav_courses', JSON.stringify(next));
      return next;
    });
  };

  const handleEnroll = async (courseId: number) => {
    setEnrolling(courseId);
    try {
      const enrollment = await enrollCourse(courseId);
      setEnrollments(prev => [...prev, enrollment]);
      setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (e) { console.error(e); }
    finally { setEnrolling(null); }
  };

  if (selectedCourse) {
    return <CourseView course={selectedCourse} onBack={() => setSelectedCourse(null)} onContactInstructor={onContactInstructor} />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}><FaGraduationCap /></div>
          <div>
            <h1 className={styles.heroTitle}>Aprendizaje y Desarrollo</h1>
            <p className={styles.heroSub}>Accede a cursos diseñados para tu crecimiento profesional</p>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{enrollments.length}</span>
            <span className={styles.heroStatLabel}>Inscritos</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{availableCourses.length}</span>
            <span className={styles.heroStatLabel}>Disponibles</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{favorites.length}</span>
            <span className={styles.heroStatLabel}>Favoritos</span>
          </div>
        </div>
      </div>

      <div className={styles.tabRow}>
        <button className={`${styles.tab} ${tab === 'mis-cursos' ? styles.tabActive : ''}`}
          onClick={() => setTab('mis-cursos')}>
          <FaBookmark /> Mis Cursos
          {enrollments.length > 0 && <span className={styles.tabCount}>{enrollments.length}</span>}
        </button>
        <button className={`${styles.tab} ${tab === 'explorar' ? styles.tabActive : ''}`}
          onClick={() => setTab('explorar')}>
          <FaCompass /> Explorar
          {availableCourses.length > 0 && <span className={styles.tabCount}>{availableCourses.length}</span>}
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} type="text" placeholder="Buscar cursos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.filterGroup}>
            {categories.map(cat => (
              <button key={cat} className={`${styles.filterBtn} ${filterCategory === cat ? styles.filterActive : ''}`} onClick={() => setFilterCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className={styles.viewTabs}>
            <button className={`${styles.viewTab} ${view === 'grid' ? styles.viewTabActive : ''}`} onClick={() => setView('grid')} title="Vista cuadrícula"><FaTh /></button>
            <button className={`${styles.viewTab} ${view === 'list' ? styles.viewTabActive : ''}`} onClick={() => setView('list')} title="Vista lista"><FaList /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaSpinner className={styles.spinnerIcon} /></div>
          <h3 className={styles.emptyTitle}>Cargando cursos...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaBookOpen /></div>
          <h3 className={styles.emptyTitle}>
            {tab === 'mis-cursos' ? 'No estás inscrito en ningún curso' : 'No hay cursos disponibles'}
          </h3>
          <p className={styles.emptyText}>
            {tab === 'mis-cursos'
              ? 'Explora cursos disponibles y comienza tu aprendizaje'
              : 'No hay cursos publicados para tu perfil en este momento'}
          </p>
        </div>
      ) : (
        <div className={`${view === 'grid' ? styles.grid : styles.list}`}>
          {filtered.map((item, idx) => {
            const c = tab === 'mis-cursos' ? (item as CourseEnrollment).course : item as Course;
            const cid = c.id;
            const isFav = favorites.includes(String(cid));
            const color = COLORS[cid % COLORS.length];
            const enrollment = tab === 'mis-cursos' ? (item as CourseEnrollment) : null;
            return (
              <div key={cid} className={`${view === 'grid' ? styles.card : styles.listCard}`} style={{ animationDelay: `${idx * 0.04}s` }}>
                <div className={view === 'grid' ? styles.cardThumb : styles.listThumb} style={{ background: `${color}15` }}>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.title} className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardImgPlaceholder} style={{ color }}>
                      {c.title.charAt(0)}
                      <div className={styles.cardImgGradient} style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)` }} />
                    </div>
                  )}
                  <span className={styles.cardType} style={{ background: c.level === 'virtual' ? 'rgba(37,99,235,0.12)' : 'rgba(16,185,129,0.12)', color: c.level === 'virtual' ? '#2563eb' : '#10b981' }}>
                    {c.level === 'virtual' ? <FaLaptop /> : <FaBuilding />} {c.level || 'Presencial'}
                  </span>
                  <button className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`} onClick={() => toggleFav(c.id)}>
                    <FaHeart />
                  </button>
                  {enrollment && (
                    <div className={styles.cardProgress}>
                      <div className={styles.cardProgressFill} style={{ width: `${enrollment.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className={view === 'grid' ? styles.cardBody : styles.listBody}>
                  <span className={styles.cardCode}>{c.category || 'General'}</span>
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <div className={styles.cardInstructor}>
                    <FaUserTie className={styles.cardInstructorIcon} />
                    <span>{c.creator ? `${c.creator.firstName} ${c.creator.lastName}` : 'Instructor'}</span>
                  </div>
                  {c.description && (
                    <p className={styles.cardDesc}>{c.description}</p>
                  )}
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      {enrollment ? (
                        <span className={styles.cardProgressText}>
                          <FaClock /> {enrollment.progress}% completado
                        </span>
                      ) : (
                        <span className={styles.cardModules}>
                          <FaBookOpen /> {c._count?.modules || 0} módulos
                        </span>
                      )}
                      {c.duration && (
                        <span className={styles.cardDuration}>
                          <FaClock /> {c.duration}h
                        </span>
                      )}
                    </div>
                    {tab === 'mis-cursos' ? (
                      <button className={styles.openBtn} onClick={() => setSelectedCourse(c)}>
                        {enrollment && enrollment.progress > 0 ? 'Continuar' : 'Comenzar'} <FaPlay />
                      </button>
                    ) : (
                      <button className={styles.enrollBtn}
                        disabled={enrolling === cid}
                        onClick={() => handleEnroll(cid)}>
                        {enrolling === cid ? <FaSpinner className={styles.spin} /> : <FaCheck />}
                        {enrolling === cid ? 'Inscribiendo...' : 'Inscribirse'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
