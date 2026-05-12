import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaWhatsapp, FaCheck, FaMinus, FaPlus, FaPaperPlane } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import styles from './ProductDetail.module.scss';

interface Product {
  id: number; title: string; name: string; description: string;
  fullDescription?: string; price: number; oldPrice?: number;
  category: { id: number; name: string; slug: string };
  image?: string; images: string[]; stock: number;
  isNew: boolean; isFeatured: boolean; isOffer: boolean;
  rating: number; reviewCount: number; specs: string[];
  related: Product[];
  reviews: { id: number; userName: string; rating: number; comment?: string; createdAt: string }[];
}

const formatPrice = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} className={styles.starFilled} />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className={styles.starFilled} />);
    else stars.push(<FaRegStar key={i} className={styles.starEmpty} />);
  }
  return stars;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id, title: product.title, name: product.name,
      price: product.price, image: product.image, quantity: qty,
    });
    showToast(`${product.title} agregado al carrito`, 'success');
  };

  const loadProduct = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => { setLoading(false); showToast('Error al cargar producto', 'error'); });
  }, [id, showToast]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  const handleSubmitReview = async () => {
    if (!product || !reviewName.trim() || reviewRating === 0) {
      showToast('Completa tu nombre y selecciona una calificación', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: reviewName.trim(), rating: reviewRating, comment: reviewComment.trim() || undefined }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Error al enviar reseña'); }
      showToast('Reseña enviada correctamente', 'success');
      setReviewName(''); setReviewRating(0); setReviewComment('');
      loadProduct();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (!product) return <div className={styles.loading}>Producto no encontrado</div>;

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link to="/">Inicio</Link> <span>/</span>
          <Link to="/servicios">Servicios</Link> <span>/</span>
          <span>{product.title}</span>
        </div>

        <div className={styles.main}>
          <div className={styles.imageSection}>
            <div className={styles.imageBox}>
              {product.isOffer && <span className={styles.badgeOffer}>-{discount}%</span>}
              {product.isNew && !product.isOffer && <span className={styles.badgeNew}>Nuevo</span>}
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.category}>{product.category.name}</div>
            <h1 className={styles.title}>{product.title}</h1>
            <div className={styles.name}>{product.name}</div>

            <div className={styles.ratingRow}>
              {renderStars(product.rating)}
              <span>({product.reviewCount} reseñas)</span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              {product.oldPrice && <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>}
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.actions}>
              <div className={styles.qtySelector}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}><FaMinus /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}><FaPlus /></button>
              </div>
              <button onClick={handleAddToCart} className={styles.addBtn}>
                <FaShoppingCart /> Agregar al carrito
              </button>
            </div>

            <a href={`https://wa.me/51999999999?text=${encodeURIComponent(`Hola, quiero más información sobre ${product.title}: ${product.name}`)}`}
              target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
              <FaWhatsapp /> Consultar por WhatsApp
            </a>
          </div>
        </div>

        <div className={styles.tabsCard}>
          <div className={styles.tabs}>
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}>
                {tab === 'description' ? 'Descripción' : tab === 'specs' ? 'Especificaciones' : 'Reseñas'}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className={styles.tabContent}>{product.fullDescription || product.description}</div>
          )}

          {activeTab === 'specs' && (
            <div className={styles.specsGrid}>
              {product.specs.map((spec: any, i: number) => (
                <div key={i} className={styles.specItem}>
                  <FaCheck />
                  <div><div className={styles.specLabel}>{spec.label}</div><div className={styles.specValue}>{spec.value}</div></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className={styles.reviewForm}>
                <h3>Deja tu reseña</h3>
                <input type="text" placeholder="Tu nombre" value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)} />
                <div className={styles.starPicker}>
                  <span>Calificación:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)} type="button"
                      className={star <= reviewRating ? styles.starActive : styles.starInactive}>
                      <FaStar />
                    </button>
                  ))}
                </div>
                <textarea placeholder="Comentario (opcional)" value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)} rows={3} />
                <button onClick={handleSubmitReview} disabled={submittingReview} className={styles.submitBtn}>
                  <FaPaperPlane /> {submittingReview ? 'Enviando...' : 'Enviar reseña'}
                </button>
              </div>

              {product.reviews.length === 0 ? (
                <p className={styles.noReviews}>No hay reseñas todavía. ¡Sé el primero en comentar!</p>
              ) : (
                product.reviews.map((review) => (
                  <div key={review.id} className={styles.review}>
                    <div className={styles.reviewHeader}>
                      <strong>{review.userName}</strong>
                      <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
                    </div>
                    {review.comment && <p>{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {product.related.length > 0 && (
          <div className={styles.related}>
            <h2>Productos Relacionados</h2>
            <div className={styles.relatedGrid}>
              {product.related.map((r) => (
                <Link key={r.id} to={`/producto/${r.id}`} className={styles.relatedCard}>
                  <div className={styles.relatedImage} />
                  <div className={styles.relatedTitle}>{r.title}</div>
                  <div className={styles.relatedName}>{r.name}</div>
                  <div className={styles.relatedPrice}>{formatPrice(r.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
