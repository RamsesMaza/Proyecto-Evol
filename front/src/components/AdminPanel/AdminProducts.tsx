import { useState, useEffect, useCallback } from 'react';
import { FaBox, FaSearch, FaSyncAlt, FaSpinner, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaStar, FaImage, FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '../../services/productsApi';
import type { ProductData, CategoryData, ProductFormData } from '../../services/productsApi';
import styles from './AdminProducts.module.scss';

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductData | null>(null);
  const [form, setForm] = useState<ProductFormData>({
    title: '', description: '', price: 0, categoryId: 0, stock: 0,
    isNew: false, isFeatured: false, isOffer: false, image: null,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const LIMIT = 12;

  const load = useCallback(async () => {
    try { setLoading(true); setError('');
      const data = await fetchProducts({ search: search || undefined, categoryId: categoryFilter || undefined, page, limit: LIMIT });
      setProducts(data.products); setTotal(data.pagination.total);
    } catch { setError('Error al cargar productos'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 3000); return () => clearTimeout(t); } }, [error]);
  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  const totalPages = Math.ceil(total / LIMIT);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', price: 0, categoryId: categories[0]?.id || 0, stock: 0, isNew: false, isFeatured: false, isOffer: false, image: null });
    setFormError(''); setShowForm(true);
  };

  const openEdit = (p: ProductData) => {
    setEditing(p);
    setForm({
      title: p.title, name: p.name, description: p.description || '', fullDescription: p.fullDescription,
      price: p.price, oldPrice: p.oldPrice, categoryId: p.categoryId, image: p.image, stock: p.stock,
      isNew: p.isNew, isFeatured: p.isFeatured, isOffer: p.isOffer, images: p.images?.length ? p.images : undefined,
    });
    setFormError(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('El título es obligatorio'); return; }
    if (!form.categoryId) { setFormError('Seleccione una categoría'); return; }
    setSaving(true); setFormError('');
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await createProduct(form);
      }
      setShowForm(false); load();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try { await deleteProduct(id); setConfirmDelete(null); load(); }
    catch (e: any) { setError(e.message); }
    finally { setDeleting(null); }
  };

  const imgSrc = (p: ProductData) => p.image || p.images?.[0];

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaBox /></div>
          <div><h2 className={styles.title}>Productos</h2><p className={styles.subtitle}>{total} productos registrados</p></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.btnPrimary} onClick={openCreate}><FaPlus /> Nuevo Producto</button>
          <button className={styles.refresh} onClick={load}><FaSyncAlt /></button>
        </div>
      </div>

      {error && <div className={styles.toast}><FaExclamationTriangle /> {error}</div>}

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar productos..." />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name} ({c._count?.products ?? 0})</option>)}
        </select>
      </div>

      {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando...</div> :
        <div className={styles.grid}>
          {products.map(p => (
            <div key={p.id} className={styles.card}>
              <div className={styles.imageWrap}>
                {imgSrc(p) ? <img src={imgSrc(p)} alt={p.title} className={styles.image} /> : <div className={styles.noImage}><FaImage /></div>}
                {p.isOffer && <span className={styles.badge}>Oferta</span>}
                {p.isFeatured && <span className={styles.badge} style={{ background: '#8b5cf6', right: 4, left: 'auto' }}>Destacado</span>}
                <div className={styles.cardActions}>
                  <button className={styles.cardAction} title="Editar" onClick={() => openEdit(p)}><FaEdit /></button>
                  <button className={styles.cardAction} title="Eliminar" onClick={() => setConfirmDelete(p.id)}><FaTrash /></button>
                </div>
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>{p.title}</h4>
                {p.category && <span className={styles.cat}>{p.category.name}</span>}
                <div className={styles.row}>
                  <span className={styles.price}>S/ {p.price.toFixed(2)}</span>
                  <span className={styles.rating}><FaStar /> {p.rating?.toFixed(1) || '-'} ({p.reviewCount || 0})</span>
                </div>
                <span className={styles.stock}>Stock: {p.stock}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className={styles.empty}>No se encontraron productos</div>}
        </div>}

      {totalPages > 1 && <div className={styles.pagination}>
        <span className={styles.pageInfo}>{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}</span>
        <div className={styles.pageBtns}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => (
            <button key={i + 1} className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
        </div>
      </div>}

      {showForm && <div className={styles.modalOverlay} onClick={() => !saving && setShowForm(false)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>{editing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <button onClick={() => setShowForm(false)} disabled={saving}><FaTimes /></button>
          </div>
          <div className={styles.modalBody}>
            {formError && <div className={styles.formError}><FaExclamationTriangle /> {formError}</div>}
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Título *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Nombre del producto" />
              </div>
              <div className={styles.field}>
                <label>Categoría *</label>
                <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: Number(e.target.value) }))}>
                  <option value={0}>Seleccionar...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Precio (S/)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className={styles.field}>
                <label>Stock</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className={styles.field} style={{ gridColumn: '1/-1' }}>
                <label>Descripción</label>
                <textarea rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Breve descripción del producto" />
              </div>
              <div className={styles.field} style={{ gridColumn: '1/-1' }}>
                <label>URL de imagen</label>
                <input value={form.image || ''} onChange={e => setForm(p => ({ ...p, image: e.target.value || null }))} placeholder="https://ejemplo.com/imagen.jpg" />
              </div>
            </div>
            <div className={styles.checkRow}>
              <label className={styles.checkLabel}><input type="checkbox" checked={form.isNew} onChange={e => setForm(p => ({ ...p, isNew: e.target.checked }))} /> Nuevo</label>
              <label className={styles.checkLabel}><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} /> Destacado</label>
              <label className={styles.checkLabel}><input type="checkbox" checked={form.isOffer} onChange={e => setForm(p => ({ ...p, isOffer: e.target.checked }))} /> Oferta</label>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setShowForm(false)} disabled={saving}>Cancelar</button>
            <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
              {saving ? <><FaSpinner className={styles.spinnerSmall} /> Guardando...</> : <><FaSave /> {editing ? 'Actualizar' : 'Crear'} Producto</>}
            </button>
          </div>
        </div>
      </div>}

      {confirmDelete !== null && <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
        <div className={styles.modal} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}><h3><FaExclamationTriangle style={{ color: '#ef4444' }} /> Confirmar</h3><button onClick={() => setConfirmDelete(null)}><FaTimes /></button></div>
          <div className={styles.modalBody}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnOutline} onClick={() => setConfirmDelete(null)}>Cancelar</button>
            <button className={styles.btnDanger} onClick={() => handleDelete(confirmDelete)} disabled={deleting === confirmDelete}>
              {deleting === confirmDelete ? <><FaSpinner className={styles.spinnerSmall} /> Eliminando...</> : <><FaTrash /> Eliminar</>}
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default AdminProducts;
