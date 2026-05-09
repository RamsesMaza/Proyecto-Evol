
import styles from "./BlogCard.module.scss";
import type { BlogPost } from "../blogData";

interface Props {
  post: BlogPost;
}

const BlogCard = ({ post }: Props) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        <img src={post.image} alt={post.title} />
      </div>

      <div className={styles.content}>
        <span className={styles.category}>{post.category}</span>
        <h3>{post.title}</h3>
        <p>{post.author} • {post.date}</p>
      </div>
    </div>
  );
};

export default BlogCard;