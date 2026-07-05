import { useState, useEffect, useCallback } from 'react';
import { FaBox, FaSearch, FaSpinner, FaChevronLeft, FaChevronRight, FaStar, FaImage } from 'react-icons/fa';
import { fetchProducts, fetchCategories } from '../../services/productsApi';
import type { ProductData, CategoryData } from '../../services/productsApi';
import styles from './SalesProductos.module.scss';

const SalesProductos = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const LIMIT = 12;

  const load = useCallback(async () => {
    try { setLoading(true);
      const data = await fetchProducts({ search: search || undefined, categoryId: categoryFilter || undefined, page, limit: LIMIT });
      setProducts(data.products); setTotal(data.pagination.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  const totalPages = Math.ceil(total / LIMIT);
  const imgSrc = (p: ProductData) => p.image || p.images?.[0];

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaBox /></div>
          <div><h2 className={styles.title}>Catálogo de Productos</h2><p className={styles.subtitle}>{total} productos disponibles</p></div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar productos..." />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> :
        <div className={styles.grid}>
          {products.map(p => (
            <div key={p.id} className={styles.card}>
              <div className={styles.imageWrap}>
                {imgSrc(p) ? <img src={imgSrc(p)} alt={p.title} className={styles.image} /> : <div className={styles.noImage}><FaImage /></div>}
                {p.isOffer && <span className={styles.badge}>Oferta</span>}
                {p.isFeatured && <span className={styles.badgeFeatured}>Destacado</span>}
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>{p.title}</h4>
                {p.category && <span className={styles.cat}>{p.category.name}</span>}
                <div className={styles.row}>
                  <span className={styles.price}>S/ {p.price.toFixed(2)}</span>
                  <span className={styles.rating}><FaStar /> {p.rating?.toFixed(1) || '-'}</span>
                </div>
                <span className={styles.stock}>Stock: {p.stock}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className={styles.empty}>No se encontraron productos</div>}
        </div>}

      {totalPages > 1 && <div className={styles.pagination}>
        <span className={styles.pageInfo}>Pág. {page} de {totalPages}</span>
        <div className={styles.pageBtns}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
          {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => (
            <button key={i + 1} className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
        </div>
      </div>}
    </div>
  );
};

export default SalesProductos;
