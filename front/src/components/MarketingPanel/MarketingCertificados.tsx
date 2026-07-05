import { useState, useEffect, useRef } from 'react';
import { FaCertificate, FaSpinner, FaExclamationTriangle, FaPlus, FaTimes, FaTrash, FaSearch, FaSave, FaUser, FaAward, FaIdBadge, FaImage, FaCalendarAlt, FaBook, FaClock, FaCheckCircle } from 'react-icons/fa';
import { fetchCertificates, createCertificate, deleteCertificate, fetchCertUsers, type CertListResponse, type CertUser } from '../../services/certificatesApi';
import styles from './MarketingCertificados.module.scss';

const initialForm = {
  userId: 0, title: '', description: '', issuer: 'ACS Academy',
  expiryDate: '', imageUrl: '', course: '', hours: 0,
};

const MarketingCertificados = () => {
  const [data, setData] = useState<CertListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState<CertUser[]>([]);
  const [creating, setCreating] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [step, setStep] = useState<'user' | 'details'>('user');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setLoading(true); setError(''); setData(await fetchCertificates({ search, page: '1', pageSize: '50' })); }
    catch { setError('Error al cargar certificados'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (showCreate) {
      fetchCertUsers().then(r => { setUsers(r.users); if (r.users.length > 0) setStep('user'); }).catch(() => {});
      setImagePreview('');
      setUserSearch('');
      setForm(initialForm);
    }
  }, [showCreate]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setForm(f => ({ ...f, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview('');
    setForm(f => ({ ...f, imageUrl: '' }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCreate = async () => {
    if (!form.userId || !form.title.trim()) return;
    setCreating(true);
    try {
      await createCertificate({
        userId: form.userId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        issuer: form.issuer || undefined,
        expiryDate: form.expiryDate || undefined,
        imageUrl: form.imageUrl || undefined,
        course: form.course.trim() || undefined,
        hours: form.hours > 0 ? form.hours : undefined,
      });
      setShowCreate(false);
      setForm(initialForm);
      load();
    } catch { setError('Error al crear certificado'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este certificado?')) return;
    try { await deleteCertificate(id); load(); }
    catch { setError('Error al eliminar certificado'); }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = users.find(u => u.id === form.userId);
  const handleQuickSearch = () => { load(); };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FaCertificate /></div>
          <div><h2 className={styles.title}>Certificados</h2><p className={styles.subtitle}>Gestiona los certificados de los usuarios</p></div>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}><FaPlus /> Nuevo Certificado</button>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error} <button className={styles.retryBtn} onClick={load}>Reintentar</button></div>}

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} type="text" placeholder="Buscar por título o usuario..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickSearch()} />
        </div>
        <button className={styles.filterBtn} onClick={handleQuickSearch} disabled={loading}>
          {loading ? <FaSpinner /> : <FaSearch />} Buscar
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando certificados...</div>
      ) : !data || data.certificates.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaCertificate /></div>
          <h3 className={styles.emptyTitle}>{search ? 'Sin resultados' : 'Aún no hay certificados'}</h3>
          <p className={styles.emptyText}>{search ? 'Intenta con otro término de búsqueda' : 'Crea el primer certificado para tus usuarios'}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Título</th>
                <th>Curso</th>
                <th>Emisor</th>
                <th>Vencimiento</th>
                <th>Creado por</th>
                <th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {data.certificates.map(c => (
                <tr key={c.id}>
                  <td><span className={styles.userCell}><FaUser /> {c.user?.firstName} {c.user?.lastName}</span></td>
                  <td><strong>{c.title}</strong></td>
                  <td>{c.course || '—'}</td>
                  <td>{c.issuer}</td>
                  <td>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('es-PE') : '—'}</td>
                  <td>{c.creator ? `${c.creator.firstName} ${c.creator.lastName}` : '—'}</td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)} title="Eliminar"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <div className={styles.steps}>
                  <span className={`${styles.step} ${step === 'user' ? styles.stepActive : styles.stepDone}`}>
                    {step === 'done' ? <FaCheckCircle /> : '1'} Usuario
                  </span>
                  <span className={styles.stepLine} />
                  <span className={`${styles.step} ${step === 'details' ? styles.stepActive : step === 'done' ? styles.stepDone : ''}`}>
                    {step === 'done' ? <FaCheckCircle /> : '2'} Detalles
                  </span>
                </div>
              </div>
              <button className={styles.modalClose} onClick={() => setShowCreate(false)}><FaTimes /></button>
            </div>

            {step === 'user' && (
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}><FaUser /> Seleccionar Usuario</label>
                  <input className={styles.formInput} type="text" placeholder="Buscar usuario por nombre o email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} autoFocus />
                </div>
                <div className={styles.userList}>
                  {filteredUsers.length === 0 ? (
                    <div className={styles.noUsers}>No se encontraron usuarios</div>
                  ) : (
                    filteredUsers.map(u => (
                      <button key={u.id} className={`${styles.userOption} ${form.userId === u.id ? styles.userOptionActive : ''}`}
                        onClick={() => { setForm(f => ({ ...f, userId: u.id })); setUserSearch(`${u.firstName} ${u.lastName}`); }}>
                        <div className={styles.userOptionAvatar}>{u.firstName.charAt(0)}{u.lastName.charAt(0)}</div>
                        <div className={styles.userOptionInfo}>
                          <span className={styles.userOptionName}>{u.firstName} {u.lastName}</span>
                          <span className={styles.userOptionEmail}>{u.email}</span>
                        </div>
                        {form.userId === u.id && <FaCheckCircle className={styles.userOptionCheck} />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className={styles.modalBody}>
                {selectedUser && (
                  <div className={styles.selectedUser}>
                    <div className={styles.selectedUserAvatar}>{selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}</div>
                    <div>
                      <div className={styles.selectedUserName}>{selectedUser.firstName} {selectedUser.lastName}</div>
                      <div className={styles.selectedUserEmail}>{selectedUser.email}</div>
                    </div>
                    <button className={styles.changeUserBtn} onClick={() => { setStep('user'); setForm(f => ({ ...f, userId: 0 })); setUserSearch(''); }}>Cambiar</button>
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><FaCertificate /> Título del Certificado</label>
                    <input className={styles.formInput} type="text" placeholder="Ej: ISO 9001:2015 — Gestión de Calidad" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><FaIdBadge /> Emisor</label>
                    <input className={styles.formInput} type="text" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><FaBook /> Curso (opcional)</label>
                    <input className={styles.formInput} type="text" placeholder="Ej: Gestión de Calidad ISO 9001" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><FaClock /> Horas (opcional)</label>
                    <input className={styles.formInput} type="number" min="0" placeholder="Ej: 40" value={form.hours || ''} onChange={e => setForm(f => ({ ...f, hours: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Descripción (opcional)</label>
                  <textarea className={styles.formTextarea} placeholder="Descripción del certificado, logros, contenido..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><FaCalendarAlt /> Fecha de Emisión</label>
                    <input className={styles.formInput} type="date" value={new Date().toISOString().slice(0, 10)} disabled />
                    <span className={styles.formHint}>Se asignará la fecha actual automáticamente</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><FaCalendarAlt /> Fecha de Vencimiento (opcional)</label>
                    <input className={styles.formInput} type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}><FaImage /> Imagen / Sello (opcional)</label>
                  <div className={styles.imageUpload}>
                    {imagePreview ? (
                      <div className={styles.imagePreview}>
                        <img src={imagePreview} alt="Preview" />
                        <button className={styles.imageRemove} onClick={clearImage}><FaTimes /></button>
                      </div>
                    ) : (
                      <div className={styles.imageDropzone} onClick={() => fileRef.current?.click()}>
                        <FaImage className={styles.imageDropIcon} />
                        <span>Haz clic para subir una imagen o sello</span>
                        <span className={styles.imageDropHint}>PNG, JPG • Recomendado: 200x200px</span>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImage} style={{ display: 'none' }} />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.modalFooter}>
              {step === 'details' ? (
                <>
                  <button className={styles.cancelBtn} onClick={() => setStep('user')}><FaUser /> Cambiar Usuario</button>
                  <div className={styles.modalFooterRight}>
                    <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={handleCreate} disabled={creating || !form.title.trim()}>
                      {creating ? <FaSpinner /> : <FaSave />} Crear Certificado
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancelar</button>
                  <button className={styles.saveBtn} onClick={() => setStep('details')} disabled={!form.userId}>
                    Siguiente <FaUser />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingCertificados;
