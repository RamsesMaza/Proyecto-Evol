import { useState, useMemo } from 'react';
import { FaSearch, FaTh, FaList, FaHeart, FaBookOpen, FaUserTie, FaLaptop, FaBuilding, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import CourseView from './CourseView';
import styles from './Courses.module.scss';

export interface Course {
  id: string;
  code: string;
  title: string;
  type: 'Presencial' | 'Virtual';
  instructor: string;
  category: string;
  image: string;
  students: number;
  rating: number;
  color: string;
}

const COLORS = ['#dc2626', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

const PLACEHOLDER_SVGS = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#dc2626" opacity="0.06"/><circle cx="200" cy="100" r="40" fill="#dc2626" opacity="0.1"/><rect x="180" y="80" width="40" height="40" rx="4" fill="#dc2626" opacity="0.08"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#2563eb" opacity="0.06"/><circle cx="200" cy="100" r="40" fill="#2563eb" opacity="0.1"/><rect x="180" y="80" width="40" height="40" rx="4" fill="#2563eb" opacity="0.08"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#10b981" opacity="0.06"/><circle cx="200" cy="100" r="40" fill="#10b981" opacity="0.1"/><rect x="180" y="80" width="40" height="40" rx="4" fill="#10b981" opacity="0.08"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#8b5cf6" opacity="0.06"/><circle cx="200" cy="100" r="40" fill="#8b5cf6" opacity="0.1"/><rect x="180" y="80" width="40" height="40" rx="4" fill="#8b5cf6" opacity="0.08"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#f59e0b" opacity="0.06"/><circle cx="200" cy="100" r="40" fill="#f59e0b" opacity="0.1"/><rect x="180" y="80" width="40" height="40" rx="4" fill="#f59e0b" opacity="0.08"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#ec4899" opacity="0.06"/><circle cx="200" cy="100" r="40" fill="#ec4899" opacity="0.1"/><rect x="180" y="80" width="40" height="40" rx="4" fill="#ec4899" opacity="0.08"/></svg>`,
];

const defaultCourses: Course[] = [
  { id: '1', code: 'ISO-9001-2026', title: 'Implementación ISO 9001:2015', type: 'Virtual', instructor: 'Carlos Mendoza', category: 'Calidad', image: '', students: 48, rating: 4.8, color: '#dc2626' },
  { id: '2', code: 'ISO-14001-2026', title: 'Gestión Ambiental Empresarial', type: 'Presencial', instructor: 'María Torres', category: 'Ambiente', image: '', students: 32, rating: 4.6, color: '#10b981' },
  { id: '3', code: 'ISO-27001-2026', title: 'Seguridad de la Información', type: 'Virtual', instructor: 'Ana Castillo', category: 'Seguridad', image: '', students: 56, rating: 4.9, color: '#2563eb' },
  { id: '4', code: 'ISO-45001-2026', title: 'Salud Ocupacional ISO 45001', type: 'Presencial', instructor: 'Pedro Rivas', category: 'SST', image: '', students: 28, rating: 4.7, color: '#8b5cf6' },
  { id: '5', code: 'HACCP-2026', title: 'Inocuidad Alimentaria HACCP', type: 'Virtual', instructor: 'Lucía Fernández', category: 'Alimentos', image: '', students: 41, rating: 4.5, color: '#f59e0b' },
  { id: '6', code: 'ISO-22000-2026', title: 'ISO 22000:2018 — SGA', type: 'Virtual', instructor: 'Lucía Fernández', category: 'Alimentos', image: '', students: 35, rating: 4.4, color: '#ec4899' },
  { id: '7', code: 'AUDIT-2026', title: 'Auditoría Interna de Calidad', type: 'Presencial', instructor: 'Carlos Mendoza', category: 'Calidad', image: '', students: 22, rating: 4.3, color: '#f97316' },
  { id: '8', code: 'SGSST-2026', title: 'SG-SST para PYMES', type: 'Virtual', instructor: 'Pedro Rivas', category: 'SST', image: '', students: 39, rating: 4.6, color: '#14b8a6' },
];

const svgUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const Courses = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('up_fav_courses') || '[]'); } catch { return []; }
  });

  const categories = useMemo(() => {
    const cats = ['Todas', ...new Set(defaultCourses.map(c => c.category))];
    return cats;
  }, []);

  const filtered = useMemo(() => {
    return defaultCourses.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'Todas' || c.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [search, filterCategory]);

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('up_fav_courses', JSON.stringify(next));
      return next;
    });
  };

  if (selectedCourse) {
    return <CourseView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaBookOpen /></div>
          <div>
            <h1 className={styles.headerTitle}>Cursos</h1>
            <p className={styles.headerSub}>2026 — Cursos Activos</p>
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

      {/* Toolbar */}
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

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaBookOpen /></div>
          <h3 className={styles.emptyTitle}>{search || filterCategory !== 'Todas' ? 'Sin resultados' : 'No hay cursos disponibles'}</h3>
          <p className={styles.emptyText}>{search || filterCategory !== 'Todas' ? 'Intenta con otros filtros o términos de búsqueda' : 'Los cursos aparecerán aquí cuando estén disponibles'}</p>
        </div>
      ) : (
        <div className={`${view === 'grid' ? styles.grid : styles.list}`}>
          {filtered.map((course, idx) => {
            const imgIdx = parseInt(course.id) - 1;
            const isFav = favorites.includes(course.id);
            return (
              <div key={course.id} className={`${view === 'grid' ? styles.card : styles.listCard}`} style={{ animationDelay: `${idx * 0.04}s` }}>
                <div className={view === 'grid' ? styles.cardThumb : styles.listThumb}>
                  <img src={svgUrl(PLACEHOLDER_SVGS[imgIdx % PLACEHOLDER_SVGS.length])} alt={course.title} className={styles.cardImg} />
                  <span className={styles.cardType} style={{ background: course.type === 'Virtual' ? 'rgba(37,99,235,0.12)' : 'rgba(16,185,129,0.12)', color: course.type === 'Virtual' ? '#2563eb' : '#10b981' }}>
                    {course.type === 'Virtual' ? <FaLaptop /> : <FaBuilding />} {course.type}
                  </span>
                  <button className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`} onClick={() => toggleFav(course.id)}>
                    <FaHeart />
                  </button>
                </div>
                <div className={view === 'grid' ? styles.cardBody : styles.listBody}>
                  <span className={styles.cardCode}>{course.code}</span>
                  <h3 className={styles.cardTitle}>{course.title}</h3>
                  <div className={styles.cardInstructor}>
                    <FaUserTie className={styles.cardInstructorIcon} />
                    <span>{course.instructor}</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardRating}><FaStar /> {course.rating}</span>
                      <span className={styles.cardStudents}>{course.students} estudiantes</span>
                    </div>
                    <button className={styles.openBtn} onClick={() => setSelectedCourse(course)}>Abrir <FaExternalLinkAlt /></button>
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
