import { Link } from 'react-router-dom';
import { FaSearch, FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';
import type { BlogPost } from '../blogData';
import styles from './BlogSidebar.module.scss';

interface Props {
  categories: string[];
  recent: BlogPost[];
  allTags: string[];
}

const BlogSidebar = ({ categories, recent, allTags }: Props) => (
  <aside className={styles.sidebar}>
    <div className={styles.widget}>
      <h4 className={styles.widgetTitle}>Buscar</h4>
      <div className={styles.searchBox}>
        <FaSearch className={styles.searchIcon} />
        <input type="text" placeholder="Buscar..." />
      </div>
    </div>

    <div className={styles.widget}>
      <h4 className={styles.widgetTitle}>Categorías</h4>
      <ul className={styles.catList}>
        {categories.map((cat) => (
          <li key={cat}>
            <Link to={`/blog?categoria=${cat}`}>{cat}</Link>
          </li>
        ))}
      </ul>
    </div>

    <div className={styles.widget}>
      <h4 className={styles.widgetTitle}>Posts Recientes</h4>
      <div className={styles.recentList}>
        {recent.map((p) => (
          <Link key={p.id} to={`/blog/${p.slug}`} className={styles.recentItem}>
            <div className={styles.recentImage}>
              <img src={p.image} alt={p.title} />
            </div>
            <div className={styles.recentInfo}>
              <span className={styles.recentTitle}>{p.title}</span>
              <span className={styles.recentDate}>{p.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>

    <div className={styles.widget}>
      <h4 className={styles.widgetTitle}>Tags</h4>
      <div className={styles.tagCloud}>
        {allTags.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>

    <div className={styles.widget}>
      <h4 className={styles.widgetTitle}>Síguenos</h4>
      <div className={styles.socialRow}>
        <a href="#" className={styles.socialLink}><FaTwitter /></a>
        <a href="#" className={styles.socialLink}><FaLinkedin /></a>
        <a href="#" className={styles.socialLink}><FaFacebook /></a>
      </div>
    </div>
  </aside>
);

export default BlogSidebar;
