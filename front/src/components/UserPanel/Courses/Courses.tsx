import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaTh, FaList, FaHeart, FaBookOpen, FaUserTie, FaLaptop, FaBuilding, FaExternalLinkAlt, FaStar, FaCompass, FaBookmark, FaCheck, FaSpinner } from 'react-icons/fa';
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
      <div className={styles.tabRow}>
        <button className={`${styles.tab} ${tab === 'mis-cursos' ? styles.tabActive : ''}`}
          onClick={() => setTab('mis-cursos')}>
          <FaBookmark /> Mis Cursos
        </button>
        <button className={`${styles.tab} ${tab === 'explorar' ? styles.tabActive : ''}`}
          onClick={() => setTab('explorar')}>
          <FaCompass /> Explorar
        </button>
      </div>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaBookOpen /></div>
          <div>
            <h1 className={styles.headerTitle}>Cursos</h1>
            <p className={styles.headerSub}>{tab === 'mis-cursos' ? 'Mis Cursos' : 'Cursos Disponibles'}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.resultCount}>{filtered.length} resultados</span>
          <div className={styles.viewTabs}>
            <button className={`${styles.viewTab} ${view === 'grid' ? styles.viewTabActive : ''}`} onClick={() => setView('grid')}><FaTh /></button>
            <button className={`${styles.viewTab} ${view === 'list' ? styles.viewTabActive : ''}`} onClick={() => setView('list')}><FaList /></button>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} type="text" placeholder="Buscar cursos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
          {categories.map(cat => (
            <button key={cat} className={`${styles.filterBtn} ${filterCategory === cat ? styles.filterActive : ''}`} onClick={() => setFilterCategory(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaSpinner className={styles.spinnerIcon} /></div>
          <h3 className={styles.emptyTitle}>Cargando...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaBookOpen /></div>
          <h3 className={styles.emptyTitle}>
            {tab === 'mis-cursos' ? 'No hay cursos disponibles' : 'No hay cursos disponibles'}
          </h3>
          <p className={styles.emptyText}>
            {tab === 'mis-cursos'
              ? 'Inscríbete en cursos desde la pestaña Explorar'
              : 'No hay cursos publicados para tu perfil'}
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
                <div className={view === 'grid' ? styles.cardThumb : styles.listThumb}>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.title} className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardImgPlaceholder} style={{ background: `${color}11`, color }}>{c.title.charAt(0)}</div>
                  )}
                  <span className={styles.cardType} style={{ background: c.level === 'virtual' ? 'rgba(37,99,235,0.12)' : 'rgba(16,185,129,0.12)', color: c.level === 'virtual' ? '#2563eb' : '#10b981' }}>
                    {c.level === 'virtual' ? <FaLaptop /> : <FaBuilding />} {c.level || 'Presencial'}
                  </span>
                  <button className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`} onClick={() => toggleFav(c.id)}>
                    <FaHeart />
                  </button>
                </div>
                <div className={view === 'grid' ? styles.cardBody : styles.listBody}>
                  <span className={styles.cardCode}>{c.category || 'General'}</span>
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <div className={styles.cardInstructor}>
                    <FaUserTie className={styles.cardInstructorIcon} />
                    <span>{c.creator ? `${c.creator.firstName} ${c.creator.lastName}` : 'Instructor'}</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardRating}><FaStar /> {c.level}</span>
                      {enrollment ? (
                        <span className={styles.cardStudents}>{enrollment.progress}%</span>
                      ) : (
                        <span className={styles.cardStudents}><FaBookOpen /> {c._count?.modules || 0} módulos</span>
                      )}
                    </div>
                    {tab === 'mis-cursos' ? (
                      <button className={styles.openBtn} onClick={() => setSelectedCourse(c)}>Abrir <FaExternalLinkAlt /></button>
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
