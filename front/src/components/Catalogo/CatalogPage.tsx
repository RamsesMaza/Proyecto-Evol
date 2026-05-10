import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar, FaTimes, FaFilter, FaEye, FaMinus, FaPlus, FaCheck } from 'react-icons/fa';
import styles from './catalog.module.scss';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface Product {
  id: number; title: string; name: string; description: string;
  fullDescription?: string; price: number; oldPrice?: number;
  categoryId: number; image?: string; images: string[];
  stock: number; isNew: boolean; isFeatured: boolean; isOffer: boolean;
  rating: number; reviewCount: number; specs: string[];
  category: { id: number; name: string; slug: string };
}

interface Category { id: number; name: string; slug: string; _count: { products: number }; }

const ITEMS_PER_PAGE = 12;

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} className={styles.star} />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className={styles.star} />);
    else stars.push(<FaRegStar key={i} className={styles.starEmpty} />);
  }
  return stars;
};

const formatPrice = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SkeletonCard = () => (
  <div className={`${styles.card} ${styles.skeleton}`}>
    <div className={styles.skeletonImage} />
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeletonLine} ${styles.short}`} />
      <div className={styles.skeletonLine} />
      <div className={`${styles.skeletonLine} ${styles.medium}`} />
    </div>
  </div>
);

const CatalogPage = () => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [qvQty, setQvQty] = useState(1);
  const [qvAdded, setQvAdded] = useState(false);

  useEffect(() => { setQvQty(1); setQvAdded(false); }, [quickView]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('categoryId', String(selectedCategory));
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', String(ITEMS_PER_PAGE));

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch {
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sort, page, minPrice, maxPrice, showToast]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      setCategories(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, selectedCategory, sort, minPrice, maxPrice]);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id, title: product.title, name: product.name,
      price: product.price, image: product.image, quantity: 1,
    });
    showToast(`${product.title} agregado al carrito`, 'success');
  };

  const handleApplyPrice = () => {
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setSort('newest');
    setPage(1);
  };

  const hasFilters = selectedCategory || minPrice || maxPrice || search;

  return (
    <section className={styles.catalogPage}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text" placeholder="Buscar certificaciones..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button className={styles.mobileFilterToggle} onClick={() => setShowMobileFilter(true)}>
          <FaFilter /> Filtros
        </button>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h3>Categorías</h3>
              <button
                className={`${styles.filterBtn} ${!selectedCategory ? styles.active : ''}`}
                onClick={() => setSelectedCategory(null)}
              >Todas <span className={styles.count}>({total})</span></button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >{cat.name} <span className={styles.count}>({cat._count.products})</span></button>
              ))}
            </div>

            <div className={styles.sidebarSection}>
              <h3>Precio</h3>
              <div className={styles.priceInputs}>
                <input type="number" placeholder="Mín" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span>—</span>
                <input type="number" placeholder="Máx" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
              <button className={styles.applyBtn} onClick={handleApplyPrice}>Aplicar</button>
            </div>

            {hasFilters && (
              <div className={styles.sidebarSection}>
                <button className={styles.applyBtn} onClick={clearFilters} style={{ background: '#6b7280' }}>
                  Limpiar Filtros
                </button>
              </div>
            )}
          </aside>

          <div className={styles.mainContent}>
            <div className={styles.toolbar}>
              <span className={styles.resultCount}>{total} producto(s) encontrados</span>
              <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
                <option value="rating">Mejor valorados</option>
                <option value="name">A-Z</option>
              </select>
            </div>

            <div className={styles.grid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : products.map((product) => (
                    <div key={product.id} className={styles.card}>
                      {product.isOffer && <span className={`${styles.badge} ${styles.offer}`}>-{Math.round((1 - product.price / (product.oldPrice || product.price)) * 100)}%</span>}
                      {product.isNew && !product.isOffer && <span className={`${styles.badge} ${styles.new}`}>Nuevo</span>}
                      {product.isFeatured && !product.isOffer && !product.isNew && <span className={`${styles.badge} ${styles.featured}`}>Popular</span>}

                      <div className={styles.cardImage}>
                        {product.image
                          ? <img src={product.image} alt={product.title} loading="lazy" />
                          : <FaSearch className={styles.placeholderIcon} />}
                      </div>

                      <button className={styles.quickViewBtn} onClick={() => setQuickView(product)}>
                        <FaEye /> Vista rápida
                      </button>

                      <div className={styles.cardBody}>
                        <div className={styles.cardCategory}>{product.category.name}</div>
                        <Link to={`/producto/${product.id}`} className={styles.cardTitle}>{product.title}</Link>
                        <div className={styles.cardName}>{product.name}</div>

                        <div className={styles.cardRating}>
                          {renderStars(product.rating)}
                          <span className={styles.ratingText}>({product.reviewCount})</span>
                        </div>

                        <div className={styles.cardPrice}>
                          <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
                          {product.oldPrice && <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>}
                        </div>

                        <button className={styles.addToCartBtn} onClick={() => handleAddToCart(product)}>
                          <FaShoppingCart /> Agregar al carrito
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === page ? styles.active : ''}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
                <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {quickView && (
        <div className={styles.quickViewOverlay} onClick={() => setQuickView(null)}>
          <div className={styles.quickViewContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeQuickView} onClick={() => setQuickView(null)}><FaTimes /></button>
            <div className={styles.quickViewGrid}>
              <div className={styles.quickViewImageCol}>
                <div className={styles.quickViewImage}>
                  {quickView.image
                    ? <img src={quickView.image} alt={quickView.title} />
                    : <FaSearch style={{ fontSize: 80, color: '#d1d5db' }} />}
                </div>
                {quickView.isOffer && (
                  <div className={styles.qvOfferTag}>
                    -{Math.round((1 - quickView.price / (quickView.oldPrice || quickView.price)) * 100)}%
                  </div>
                )}
              </div>
              <div className={styles.quickViewInfo}>
                <div className={styles.qvCategory}>{quickView.category.name}</div>
                <h2 className={styles.qvTitle}>{quickView.title}</h2>
                <p className={styles.qvSubtitle}>{quickView.name}</p>

                <div className={styles.qvRatingRow}>
                  <div className={styles.qvStars}>{renderStars(quickView.rating)}</div>
                  <span className={styles.qvReviewCount}>({quickView.reviewCount} reseñas)</span>
                </div>

                <div className={styles.qvPriceRow}>
                  <span className={styles.qvPrice}>{formatPrice(quickView.price)}</span>
                  {quickView.oldPrice && <span className={styles.qvOldPrice}>{formatPrice(quickView.oldPrice)}</span>}
                  {quickView.isOffer && <span className={styles.qvDiscountBadge}>OFERTA</span>}
                </div>

                <p className={styles.qvDesc}>{quickView.description}</p>

                {quickView.specs.length > 0 && (
                  <div className={styles.qvSpecs}>
                    <h4>Características</h4>
                    <ul>
                      {quickView.specs.slice(0, 4).map((spec: any, i: number) => (
                        <li key={i}><FaCheck className={styles.qvCheckIcon} /> {spec.label}: <strong>{spec.value}</strong></li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.qvActions}>
                  <div className={styles.qvQtySelector}>
                    <button className={styles.qvQtyBtn} onClick={() => setQvQty(Math.max(1, qvQty - 1))} disabled={qvQty <= 1}>
                      <FaMinus />
                    </button>
                    <span className={styles.qvQtyValue}>{qvQty}</span>
                    <button className={styles.qvQtyBtn} onClick={() => setQvQty(Math.min(quickView.stock, qvQty + 1))} disabled={qvQty >= quickView.stock}>
                      <FaPlus />
                    </button>
                  </div>
                  <button
                    className={`${styles.qvAddBtn} ${qvAdded ? styles.qvAdded : ''}`}
                    onClick={() => {
                      for (let i = 0; i < qvQty; i++) {
                        addItem({
                          productId: quickView.id, title: quickView.title, name: quickView.name,
                          price: quickView.price, image: quickView.image, quantity: 1,
                        });
                      }
                      setQvAdded(true);
                      showToast(`${qvQty} × ${quickView.title} agregado al carrito`, 'success');
                      setTimeout(() => { setQuickView(null); }, 800);
                    }}
                    disabled={qvAdded}
                  >
                    {qvAdded ? <><FaCheck /> Agregado</> : <><FaShoppingCart /> Agregar al carrito</>}
                  </button>
                </div>

                <Link to={`/producto/${quickView.id}`} className={styles.qvFullDetail} onClick={() => setQuickView(null)}>
                  Ver detalle completo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMobileFilter && (
        <div className={styles.mobileFilterOverlay} onClick={() => setShowMobileFilter(false)}>
          <div className={styles.mobileFilterPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <h3>Filtros</h3>
              <button onClick={() => setShowMobileFilter(false)}><FaTimes /></button>
            </div>
            <div className={styles.sidebarSection}>
              <h3>Categorías</h3>
              <button className={`${styles.filterBtn} ${!selectedCategory ? styles.active : ''}`} onClick={() => { setSelectedCategory(null); setShowMobileFilter(false); }}>Todas</button>
              {categories.map((cat) => (
                <button key={cat.id} className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.active : ''}`} onClick={() => { setSelectedCategory(cat.id); setShowMobileFilter(false); }}>{cat.name}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CatalogPage;
