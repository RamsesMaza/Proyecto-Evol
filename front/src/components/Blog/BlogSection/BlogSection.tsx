import styles from "./BlogSection.module.scss";
import BlogCard from "../BlogCard/BlogCard";
import { blogPosts } from "../blogData";

const BlogSection = () => {
  const featured = blogPosts[0];

  return (
    <section className={styles.blog}>
      <div className={styles.hero}>
        <img src={featured.image} alt={featured.title} />

        <div className={styles.overlay}>
          <span className={styles.category}>{featured.category}</span>

          <h1>{featured.title}</h1>

          <span className={styles.meta}>
            {featured.author} • {featured.date}
          </span>

          <button className={styles.cta}>Leer artículo</button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {blogPosts.slice(1).map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
