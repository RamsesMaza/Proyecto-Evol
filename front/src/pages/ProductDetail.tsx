import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaWhatsapp, FaShareAlt, FaCheck, FaMinus, FaPlus, FaPaperPlane } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

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
    if (rating >= i) stars.push(<FaStar key={i} style={{ color: '#f59e0b', fontSize: 14 }} />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} style={{ color: '#f59e0b', fontSize: 14 }} />);
    else stars.push(<FaRegStar key={i} style={{ color: '#e5e7eb', fontSize: 14 }} />);
  }
  return stars;
};

const ProductDetail: React.FC = () => {
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

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al enviar reseña');
      }
      showToast('Reseña enviada correctamente', 'success');
      setReviewName('');
      setReviewRating(0);
      setReviewComment('');
      loadProduct();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>Cargando...</div>;
  }

  if (!product) {
    return <div style={{ padding: '100px', textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>Producto no encontrado</div>;
  }

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#888', marginBottom: 30 }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</Link>
          <span>/</span>
          <Link to="/servicios" style={{ color: '#888', textDecoration: 'none' }}>Servicios</Link>
          <span>/</span>
          <span style={{ color: '#111' }}>{product.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ height: 400, background: '#f3f4f6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#d1d5db', position: 'relative' }}>
              {product.isOffer && <span style={{ position: 'absolute', top: 16, left: 16, background: '#ef4444', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>-{discount}%</span>}
              {product.isNew && !product.isOffer && <span style={{ position: 'absolute', top: 16, left: 16, background: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Nuevo</span>}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#C10E1A', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>{product.category.name}</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>{product.title}</h1>
            <div style={{ fontSize: 16, color: '#666', marginBottom: 14 }}>{product.name}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {renderStars(product.rating)}
              <span style={{ fontSize: 13, color: '#888' }}>({product.reviewCount} reseñas)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#111' }}>{formatPrice(product.price)}</span>
              {product.oldPrice && <span style={{ fontSize: 18, color: '#aaa', textDecoration: 'line-through' }}>{formatPrice(product.oldPrice)}</span>}
            </div>

            <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, margin: '16px 0 24px' }}>{product.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', borderRadius: 10, padding: '6px 10px' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}><FaMinus /></button>
                <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}><FaPlus /></button>
              </div>
              <button onClick={handleAddToCart} style={{ flex: 1, padding: '14px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Poppins', sans-serif", transition: 'all 0.3s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#C10E1A')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
              ><FaShoppingCart /> Agregar al carrito</button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <a href={`https://wa.me/51999999999?text=${encodeURIComponent(`Hola, quiero más información sobre ${product.title}: ${product.name}`)}`} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, padding: 12, background: '#25d366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', fontFamily: "'Poppins', sans-serif" }}>
                <FaWhatsapp /> Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, background: '#fff', borderRadius: 20, padding: 30, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f0f0f0', marginBottom: 24 }}>
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600,
                color: activeTab === tab ? '#C10E1A' : '#888',
                borderBottom: activeTab === tab ? '2px solid #C10E1A' : '2px solid transparent',
                marginBottom: -2, transition: 'all 0.2s',
              }}>{tab === 'description' ? 'Descripción' : tab === 'specs' ? 'Especificaciones' : 'Reseñas'}</button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div style={{ color: '#555', fontSize: 14, lineHeight: 1.8 }}>
              {product.fullDescription || product.description}
            </div>
          )}

          {activeTab === 'specs' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {product.specs.map((spec: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: '#f9fafb', borderRadius: 10, alignItems: 'center' }}>
                  <FaCheck style={{ color: '#10b981', flexShrink: 0 }} />
                  <div><div style={{ fontSize: 12, color: '#888' }}>{spec.label}</div><div style={{ fontWeight: 600, fontSize: 14 }}>{spec.value}</div></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div style={{ marginBottom: 28, padding: 20, background: '#f9fafb', borderRadius: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>Deja tu reseña</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="text" placeholder="Tu nombre" value={reviewName} onChange={(e) => setReviewName(e.target.value)}
                    style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>Calificación:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setReviewRating(star)} type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 18, color: star <= reviewRating ? '#f59e0b' : '#e5e7eb' }}>
                        <FaStar />
                      </button>
                    ))}
                  </div>
                  <textarea placeholder="Comentario (opcional)" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3}
                    style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: 'none', resize: 'vertical' }} />
                  <button onClick={handleSubmitReview} disabled={submittingReview}
                    style={{ alignSelf: 'flex-start', padding: '10px 24px', background: submittingReview ? '#aaa' : '#C10E1A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: submittingReview ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Poppins', sans-serif" }}>
                    <FaPaperPlane /> {submittingReview ? 'Enviando...' : 'Enviar reseña'}
                  </button>
                </div>
              </div>

              {product.reviews.length === 0 ? (
                <p style={{ color: '#888', fontSize: 14 }}>No hay reseñas todavía. ¡Sé el primero en comentar!</p>
              ) : (
                product.reviews.map((review) => (
                  <div key={review.id} style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: 14 }}>{review.userName}</strong>
                      <div style={{ display: 'flex', gap: 2 }}>{renderStars(review.rating)}</div>
                    </div>
                    {review.comment && <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {product.related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Productos Relacionados</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {product.related.map((r) => (
                <Link key={r.id} to={`/producto/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ height: 140, background: '#f3f4f6', borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 32 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{r.name}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>{formatPrice(r.price)}</div>
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
