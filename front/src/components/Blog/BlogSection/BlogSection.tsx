import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaClock, FaUser, FaCommentAlt, FaLongArrowAltRight } from 'react-icons/fa';
import { blogPosts } from '../blogData';
import BlogCard from '../BlogCard/BlogCard';
import styles from './BlogSection.module.scss';

const POSTS_PER_PAGE = 6;

const BlogSection = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [visible, setVisible] = useState(POSTS_PER_PAGE);

  const categories = useMemo(() => {
    const cats = [...new Set(blogPosts.map((p) => p.category))];
    return ['Todos', ...cats];
  }, []);

  const featured = useMemo(() => blogPosts.find((p) => p.featured) || blogPosts[0], []);

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'Todos' || p.category === activeCategory;
      return matchSearch && matchCat && p.slug !== featured.slug;
    });
  }, [search, activeCategory, featured.slug]);

  const displayed = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <section className={styles.blog}>
      {/* ─── HERO ─── */}
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src={featured.image} alt="" />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroCategory}>{featured.category}</span>
          <h1 className={styles.heroTitle}>{featured.title}</h1>
          <p className={styles.heroExcerpt}>{featured.excerpt}</p>
          <div className={styles.heroMeta}>
            <span><FaUser /> {featured.author}</span>
            <span><FaClock /> {featured.readingTime}</span>
            <span><FaCommentAlt /> {featured.commentsCount} comentarios</span>
          </div>
          <Link to={`/blog/${featured.slug}`} className={styles.heroCta}>
            Leer artículo <FaLongArrowAltRight />
          </Link>
        </div>
      </div>

      {/* ─── TOOLBAR ─── */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(POSTS_PER_PAGE); }}
          />
        </div>
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisible(POSTS_PER_PAGE); }}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── SECTION HEADER ─── */}
      <div className={styles.sectionHeader}>
        <h2>Artículos Recientes</h2>
        <span>{filtered.length} artículos</span>
      </div>

      {/* ─── GRID ─── */}
      {displayed.length === 0 ? (
        <div className={styles.empty}>
          <p>No se encontraron artículos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayed.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* ─── LOAD MORE ─── */}
      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button onClick={() => setVisible((v) => v + POSTS_PER_PAGE)} className={styles.loadMore}>
            Cargar más artículos
          </button>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
