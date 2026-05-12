import { Link } from 'react-router-dom';
import { FaUser, FaClock, FaArrowRight } from 'react-icons/fa';
import type { BlogPost } from '../blogData';
import styles from './BlogCard.module.scss';

interface Props {
  post: BlogPost;
}

const BlogCard = ({ post }: Props) => (
  <Link to={`/blog/${post.slug}`} className={styles.card}>
    <div className={styles.imageBox}>
      <img src={post.image} alt={post.title} />
      <span className={styles.category}>{post.category}</span>
    </div>
    <div className={styles.body}>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <div className={styles.footer}>
        <div className={styles.meta}>
          <span><FaUser /> {post.author}</span>
          <span><FaClock /> {post.readingTime}</span>
        </div>
        <span className={styles.arrow}><FaArrowRight /></span>
      </div>
    </div>
  </Link>
);

export default BlogCard;
