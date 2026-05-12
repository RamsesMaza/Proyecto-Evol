import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaClock,
  FaUser,
  FaCommentAlt,
  FaTag,
  FaArrowLeft,
  FaArrowRight,
  FaPaperPlane,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";
import { blogPosts } from "../Blog/blogData";
import BlogSidebar from "../Blog/BlogSidebar/BlogSidebar";
import styles from "./BlogPost.module.scss";

const BlogPost = () => {
  const { slug } = useParams();
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  const post = useMemo(() => blogPosts.find((p) => p.slug === slug), [slug]);
  const recent = useMemo(
    () => blogPosts.filter((p) => p.slug !== slug).slice(0, 4),
    [slug],
  );
  const categories = useMemo(
    () => [...new Set(blogPosts.map((p) => p.category))],
    [],
  );
  const allTags = useMemo(
    () => [...new Set(blogPosts.flatMap((p) => p.tags))],
    [],
  );

  if (!post) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1>Artículo no encontrado</h1>
          <Link to="/blog" className={styles.backLink}>
            <FaArrowLeft /> Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  const index = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = index > 0 ? blogPosts[index - 1] : null;
  const nextPost = index < blogPosts.length - 1 ? blogPosts[index + 1] : null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    alert("Comentario enviado (simulado).");
    setCommentName("");
    setCommentText("");
  };

  return (
    <div className={styles.page}>
      <section className={styles.banner}>
        <div className={styles.bannerBg}>
          <span className={styles.bannerLabel}>BLOG</span>
          <h1 className={styles.bannerTitle}>{post.title}</h1>
          <div className={styles.bannerMeta}>
            <span>
              <FaUser /> {post.author}
            </span>
            <span>
              <FaClock /> {post.readingTime}
            </span>
            <span>
              <FaCommentAlt /> {post.commentsCount} comentarios
            </span>
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        <main className={styles.main}>
          <figure className={styles.featuredImage}>
            <img src={post.image} alt={post.title} />
          </figure>

          <article className={styles.article}>
            {post.content?.map((block, i) => {
              if (block.type === "heading")
                return (
                  <h2 key={i} className={styles.h2}>
                    {block.value}
                  </h2>
                );
              if (block.type === "blockquote")
                return (
                  <blockquote key={i} className={styles.blockquote}>
                    {block.value}
                  </blockquote>
                );
              return (
                <p key={i} className={styles.p}>
                  {block.value}
                </p>
              );
            })}
          </article>

          <div className={styles.tags}>
            <FaTag className={styles.tagIcon} />
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.share}>
            <span className={styles.shareLabel}>Compartir:</span>
            <a href="#" className={styles.shareLink}>
              <FaTwitter />
            </a>
            <a href="#" className={styles.shareLink}>
              <FaLinkedin />
            </a>
            <a href="#" className={styles.shareLink}>
              <FaFacebook />
            </a>
          </div>

          <nav className={styles.postNav}>
            {prevPost ? (
              <Link
                to={`/blog/${prevPost.slug}`}
                className={styles.postNavLink}
              >
                <FaArrowLeft /> <span>{prevPost.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link
                to={`/blog/${nextPost.slug}`}
                className={`${styles.postNavLink} ${styles.postNavRight}`}
              >
                <span>{nextPost.title}</span> <FaArrowRight />
              </Link>
            ) : (
              <div />
            )}
          </nav>

          <section className={styles.comments}>
            <h3 className={styles.commentsTitle}>
              Comentarios ({post.commentsCount})
            </h3>

            <div className={styles.comment}>
              <div className={styles.commentAvatar}>CM</div>
              <div className={styles.commentBody}>
                <strong>Carlos Mendoza</strong>
                <span className={styles.commentDate}>12 Feb 2024</span>
                <p>Excelente artículo. Muy informativo y bien estructurado.</p>
              </div>
            </div>

            <div className={styles.comment}>
              <div className={styles.commentAvatar}>LR</div>
              <div className={styles.commentBody}>
                <strong>Lucía Ramos</strong>
                <span className={styles.commentDate}>11 Feb 2024</span>
                <p>Gracias por compartir este conocimiento. Muy útil.</p>
              </div>
            </div>

            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <h4 className={styles.commentFormTitle}>Deja un comentario</h4>
              <input
                type="text"
                placeholder="Tu nombre *"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className={styles.commentInput}
                required
              />
              <textarea
                placeholder="Tu comentario *"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={styles.commentTextarea}
                rows={4}
                required
              />
              <button type="submit" className={styles.commentSubmit}>
                <FaPaperPlane /> Enviar comentario
              </button>
            </form>
          </section>
        </main>

        <BlogSidebar
          categories={categories}
          recent={recent}
          allTags={allTags}
        />
      </div>
    </div>
  );
};

export default BlogPost;
