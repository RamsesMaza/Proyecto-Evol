import { useState, useEffect, useMemo, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaBook, FaFilePowerpoint, FaLink, FaYoutube, FaChevronDown, FaChevronRight, FaFolder, FaEye, FaEyeSlash, FaImage, FaSearch, FaUsers, FaClock, FaChalkboardTeacher, FaFilePdf, FaVideo, FaGlobe, FaCopy, FaCheck, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { fetchAllCourses, createCourse, updateCourse, togglePublishCourse, deleteCourse, addModule, deleteModule, addMaterial, deleteMaterial, fetchCourse, updateModule, updateMaterial, searchUsers, type Course, type CourseModule, type CourseMaterial, type SearchUser } from '../../services/coursesApi';
import styles from './AuditorCourses.module.scss';

const ROLES = ['ADMIN', 'USER', 'SALES', 'TI', 'MARKETING', 'AUDITOR'] as const;
const LEVELS = ['basico', 'intermedio', 'avanzado'] as const;

interface MaterialForm {
  title: string; type: string; fileUrl: string; embedUrl: string; duration: number;
}

const emptyMaterial = (): MaterialForm => ({ title: '', type: 'pdf', fileUrl: '', embedUrl: '', duration: 0 });

const AuditorCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [courseModules, setCourseModules] = useState<Record<number, CourseModule[]>>({});

  /* Edit modal */
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  /* Module modal */
  const [moduleCourseId, setModuleCourseId] = useState<number | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [showModule, setShowModule] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);

  /* Material modal */
  const [materialModuleId, setMaterialModuleId] = useState<number | null>(null);
  const [material, setMaterial] = useState<MaterialForm>(emptyMaterial());
  const [showMaterial, setShowMaterial] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);

  /* Delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'module' | 'material'; id: number; name: string } | null>(null);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  /* Visibility */
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [visibilityMode, setVisibilityMode] = useState<'all' | 'roles' | 'users' | 'both'>('all');
  const [userSearchQ, setUserSearchQ] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<SearchUser[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);
  const userSearchTimer = useRef<ReturnType<typeof setTimeout>>();

  const refreshModuleCache = async () => {
    const expandedIds = [...expandedCourses];
    const entries = await Promise.all(expandedIds.map(id => fetchCourse(id).then(c => [id, c.modules || []] as const).catch(() => null)));
    const merged: Record<number, CourseModule[]> = {};
    for (const entry of entries) {
      if (entry) merged[entry[0]] = entry[1];
    }
    setCourseModules(prev => ({ ...prev, ...merged }));
  };

  const load = async () => {
    try {
      const res = await fetchAllCourses({ search, pageSize: '200' });
      setCourses(res.courses);
      await refreshModuleCache();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) {
        setShowUserSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter(c => c.title.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q));
  }, [search, courses]);

  const parseUsers = (val: string | null | undefined): SearchUser[] => {
    try { return val ? JSON.parse(val) : []; } catch { return []; }
  };

  /* ─── Create / Edit course ─── */
  const openCreate = () => {
    setEditCourse({
      id: 0, title: '', description: '', category: '', level: 'basico', imageUrl: '',
      duration: 0, published: false, visibleToRoles: '[]', visibleToUsers: '[]', createdBy: null,
      createdAt: '', updatedAt: '', creator: null, _count: { modules: 0, enrollments: 0 },
    });
    setSelectedRoles([]);
    setSelectedUsers([]);
    setVisibilityMode('all');
    setShowEdit(true);
  };

  const openEdit = async (c: Course) => {
    const full = await fetchCourse(c.id);
    const roles = parseRoles(full.visibleToRoles);
    const users = parseUsers(full.visibleToUsers);
    setSelectedRoles(roles);
    setSelectedUsers(users);
    if (roles.length > 0 && users.length > 0) setVisibilityMode('both');
    else if (users.length > 0) setVisibilityMode('users');
    else if (roles.length > 0) setVisibilityMode('roles');
    else setVisibilityMode('all');
    setEditCourse(full);
    setShowEdit(true);
  };

  const handleSaveCourse = async () => {
    if (!editCourse) return;
    const visRoles = visibilityMode === 'roles' || visibilityMode === 'both' ? JSON.stringify(selectedRoles) : '[]';
    const visUsers = visibilityMode === 'users' || visibilityMode === 'both' ? JSON.stringify(selectedUsers.map(u => u.id)) : '[]';
    try {
      if (editCourse.id === 0) {
        await createCourse({
          title: editCourse.title, description: editCourse.description || undefined,
          category: editCourse.category || undefined, level: editCourse.level || 'basico',
          imageUrl: editCourse.imageUrl || undefined, duration: editCourse.duration || undefined,
          visibleToRoles: visRoles, visibleToUsers: visUsers,
        });
      } else {
        await updateCourse(editCourse.id, {
          title: editCourse.title, description: editCourse.description,
          category: editCourse.category, level: editCourse.level,
          imageUrl: editCourse.imageUrl, duration: editCourse.duration,
          visibleToRoles: visRoles, visibleToUsers: visUsers,
        });
      }
      setShowEdit(false);
      load();
    } catch (e) { console.error(e); }
  };

  /* ─── User search ─── */
  const handleUserSearch = (q: string) => {
    setUserSearchQ(q);
    if (userSearchTimer.current) clearTimeout(userSearchTimer.current);
    if (q.length < 2) { setUserSearchResults([]); return; }
    userSearchTimer.current = setTimeout(async () => {
      try {
        const res = await searchUsers(q);
        setUserSearchResults(res.users.filter(u => !selectedUsers.some(su => su.id === u.id)));
      } catch { setUserSearchResults([]); }
    }, 300);
  };

  const addUser = (u: SearchUser) => {
    setSelectedUsers(prev => [...prev, u]);
    setUserSearchResults(prev => prev.filter(r => r.id !== u.id));
    setUserSearchQ('');
  };

  const removeUser = (id: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== id));
  };

  /* ─── Publish / Delete ─── */
  const handleTogglePublish = async (id: number) => {
    await togglePublishCourse(id);
    load();
  };

  const confirmDelete = (type: 'course' | 'module' | 'material', id: number, name: string) => {
    setDeleteTarget({ type, id, name });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'course') await deleteCourse(deleteTarget.id);
      else if (deleteTarget.type === 'module') await deleteModule(deleteTarget.id);
      else await deleteMaterial(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) { console.error(e); }
  };

  /* ─── Modules ─── */
  const openAddModule = (courseId: number) => {
    setModuleCourseId(courseId);
    setModuleTitle('');
    setModuleDesc('');
    setEditingModule(null);
    setShowModule(true);
  };

  const openEditModule = (mod: CourseModule) => {
    setModuleCourseId(mod.courseId);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || '');
    setEditingModule(mod);
    setShowModule(true);
  };

  const handleSaveModule = async () => {
    if (!moduleCourseId || !moduleTitle.trim()) return;
    try {
      if (editingModule) {
        await updateModule(editingModule.id, { title: moduleTitle, description: moduleDesc || undefined });
      } else {
        await addModule(moduleCourseId, { title: moduleTitle, description: moduleDesc || undefined });
      }
      setShowModule(false);
      load();
    } catch (e) { console.error(e); }
  };

  /* ─── Materials ─── */
  const openAddMaterial = (moduleId: number) => {
    setMaterialModuleId(moduleId);
    setMaterial(emptyMaterial());
    setEditingMaterial(null);
    setShowMaterial(true);
  };

  const openEditMaterial = (mat: CourseMaterial) => {
    setMaterialModuleId(mat.moduleId);
    setMaterial({ title: mat.title, type: mat.type, fileUrl: mat.fileUrl || '', embedUrl: mat.embedUrl || '', duration: mat.duration || 0 });
    setEditingMaterial(mat);
    setShowMaterial(true);
  };

  const handleSaveMaterial = async () => {
    if (!materialModuleId || !material.title.trim()) return;
    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, {
          title: material.title, type: material.type,
          fileUrl: material.fileUrl || null, embedUrl: material.embedUrl || null,
          duration: material.duration || null,
        });
      } else {
        await addMaterial(materialModuleId, {
          title: material.title, type: material.type,
          fileUrl: material.fileUrl || undefined, embedUrl: material.embedUrl || undefined,
          duration: material.duration || undefined,
        });
      }
      setShowMaterial(false);
      load();
    } catch (e) { console.error(e); }
  };

  const toggleRole = (r: string) => {
    setSelectedRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const copyCourseId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case 'basico': return { bg: 'rgba(16,185,129,0.12)', color: '#10b981' };
      case 'intermedio': return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' };
      case 'avanzado': return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' };
      default: return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' };
    }
  };

  /* ─── Render ─── */
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Cursos</h1>
          <p className={styles.subtitle}>{courses.length} cursos • {courses.filter(c => c.published).length} publicados</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate}><FaPlus /> Nuevo Curso</button>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Buscar por título o categoría..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.statsRow}>
          <span className={styles.statChip}><FaBook /> {courses.length}</span>
          <span className={styles.statChip}><FaEye /> {courses.filter(c => c.published).length}</span>
          <span className={styles.statChip}><FaEyeSlash /> {courses.filter(c => !c.published).length}</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <FaBook className={styles.emptyIcon} />
          <h3>{search ? 'Sin resultados' : 'No hay cursos'}</h3>
          <p>Crea tu primer curso para empezar</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(c => {
            const lvl = getLevelColor(c.level);
            const visibleRoles = parseRoles(c.visibleToRoles);
            const visibleUsers = parseRoles(c.visibleToUsers);
            const isExpanded = expandedCourses.has(c.id);
            return (
              <div key={c.id} className={`${styles.card} ${isExpanded ? styles.cardExpanded : ''}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardThumb}>
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="" className={styles.thumbImg} />
                    ) : (
                      <div className={styles.thumbPlaceholder} style={{ background: `linear-gradient(135deg, ${lvl.color}22, ${lvl.color}08)` }}>
                        <span style={{ color: lvl.color }}>{c.title.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className={styles.thumbBadges}>
                      <span className={styles.badge} style={{ background: lvl.bg, color: lvl.color }}>{c.level}</span>
                      {c.duration && <span className={styles.badge}><FaClock /> {c.duration}h</span>}
                    </div>
                    <button className={`${styles.publishBadge} ${c.published ? styles.pubOn : styles.pubOff}`}
                      onClick={() => handleTogglePublish(c.id)} title={c.published ? 'Ocultar' : 'Publicar'}>
                      {c.published ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <h3 className={styles.cardTitle}>{c.title}</h3>
                      <button className={styles.copyBtn} onClick={() => copyCourseId(c.id)} title="Copiar ID">
                        {copiedId === c.id ? <FaCheck /> : <FaCopy />}
                      </button>
                    </div>
                    {c.category && <span className={styles.cardCategory}>{c.category}</span>}
                    {c.description && <p className={styles.cardDesc}>{c.description}</p>}
                    <div className={styles.cardMeta}>
                      <span><FaFolder /> {c._count?.modules || 0} módulos</span>
                      <span><FaUsers /> {c._count?.enrollments || 0} estudiantes</span>
                      {c.creator && <span><FaChalkboardTeacher /> {c.creator.firstName}</span>}
                    </div>
                    {(visibleRoles.length > 0 || visibleUsers.length > 0) && (
                      <div className={styles.visBadges}>
                        {visibleRoles.length > 0 && visibleRoles.map(r => <span key={r} className={styles.visBadge}>{r}</span>)}
                        {visibleUsers.length > 0 && <span className={styles.visBadge}>{visibleUsers.length} usuario{visibleUsers.length > 1 ? 's' : ''}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.actionBtn} onClick={() => openEdit(c)}><FaEdit /> Editar</button>
                  <button className={styles.actionBtnDanger} onClick={() => confirmDelete('course', c.id, c.title)}><FaTrash /> Eliminar</button>
                  <button className={styles.expandBtn} onClick={async () => {
                    const next = new Set(expandedCourses);
                    if (next.has(c.id)) {
                      next.delete(c.id);
                    } else {
                      next.add(c.id);
                      try {
                        const full = await fetchCourse(c.id);
                        setCourseModules(prev => ({ ...prev, [c.id]: full.modules || [] }));
                      } catch (e) { console.error(e); }
                    }
                    setExpandedCourses(next);
                  }}>
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />} {isExpanded ? 'Contraer' : 'Módulos'}
                  </button>
                </div>

                {isExpanded && (
                  <div className={styles.cardModules}>
                    <button className={styles.addModulePrimary} onClick={() => openAddModule(c.id)}>
                      <FaPlus /> Añadir Módulo
                    </button>
                    {(!courseModules[c.id] || courseModules[c.id].length === 0) ? (
                      <p className={styles.emptySmall}>Sin módulos aún</p>
                    ) : (
                      <div className={styles.moduleGrid}>
                        {courseModules[c.id].map(mod => {
                          const matOpen = expandedModules.has(mod.id);
                          return (
                            <div key={mod.id} className={styles.moduleCard}>
                              <div className={styles.moduleHeader}>
                                <div className={styles.moduleTitleRow}>
                                  <FaFolder className={styles.moduleIcon} />
                                  <div>
                                    <span className={styles.moduleName}>{mod.title}</span>
                                    {mod.description && <span className={styles.moduleDesc}>{mod.description}</span>}
                                  </div>
                                </div>
                                <div className={styles.moduleActions}>
                                  <button className={styles.smallBtn} onClick={() => openAddMaterial(mod.id)} title="Añadir material"><FaPlus /></button>
                                  <button className={styles.smallBtnEdit} onClick={() => openEditModule(mod)} title="Editar módulo"><FaEdit /></button>
                                  <button className={styles.smallBtnDanger} onClick={() => confirmDelete('module', mod.id, mod.title)} title="Eliminar"><FaTrash /></button>
                                  <button className={styles.smallBtnNeutral} onClick={() => {
                                    const next = new Set(expandedModules);
                                    if (next.has(mod.id)) next.delete(mod.id); else next.add(mod.id);
                                    setExpandedModules(next);
                                  }}>
                                    {matOpen ? <FaChevronDown /> : <FaChevronRight />}
                                  </button>
                                </div>
                              </div>
                              {matOpen && (
                                <div className={styles.materialList}>
                                  {(!mod.materials || mod.materials.length === 0) ? (
                                    <p className={styles.emptySmall}>Sin materiales</p>
                                  ) : (
                                    mod.materials.map(mat => (
                                      <div key={mat.id} className={styles.materialRow}>
                                        <span className={styles.matIcon}>
                                          {mat.type === 'pdf' ? <FaFilePdf /> : mat.type === 'video' ? <FaVideo /> : mat.type === 'link' ? <FaGlobe /> : <FaFilePowerpoint />}
                                        </span>
                                        <span className={styles.matName}>{mat.title}</span>
                                        <span className={styles.matType}>{mat.type}</span>
                                        <button className={styles.smallBtnEdit} onClick={() => openEditMaterial(mat)} title="Editar"><FaEdit /></button>
                                        <button className={styles.smallBtnDanger} onClick={() => confirmDelete('material', mat.id, mat.title)} title="Eliminar"><FaTrash /></button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Edit Course Modal ─── */}
      {showEdit && editCourse && (
        <div className={styles.overlay} onClick={() => setShowEdit(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{editCourse.id === 0 ? 'Nuevo Curso' : 'Editar Curso'}</h2>
              <button className={styles.modalClose} onClick={() => setShowEdit(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formCol}>
                  <div className={styles.field}>
                    <label className={styles.label}>Título del curso</label>
                    <input className={styles.input} value={editCourse.title} onChange={e => setEditCourse({ ...editCourse, title: e.target.value })} placeholder="Ej: ISO 9001:2015" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Descripción</label>
                    <textarea className={styles.textarea} rows={3} value={editCourse.description || ''}
                      onChange={e => setEditCourse({ ...editCourse, description: e.target.value })} placeholder="Describe el curso..." />
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Categoría</label>
                      <input className={styles.input} value={editCourse.category || ''}
                        onChange={e => setEditCourse({ ...editCourse, category: e.target.value })} placeholder="Calidad, SST..." />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Nivel</label>
                      <select className={styles.select} value={editCourse.level}
                        onChange={e => setEditCourse({ ...editCourse, level: e.target.value })}>
                        {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Duración (horas)</label>
                      <input className={styles.input} type="number" min={0} value={editCourse.duration || ''}
                        onChange={e => setEditCourse({ ...editCourse, duration: Number(e.target.value) })} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>URL de imagen</label>
                      <input className={styles.input} value={editCourse.imageUrl || ''}
                        onChange={e => setEditCourse({ ...editCourse, imageUrl: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className={styles.formCol}>
                  <div className={styles.visSection}>
                    <label className={styles.label}>¿Quién puede ver este curso?</label>
                    <div className={styles.visTabs}>
                      <button className={`${styles.visTab} ${visibilityMode === 'all' ? styles.visTabActive : ''}`}
                        onClick={() => setVisibilityMode('all')}>
                        <FaGlobe /> Todos
                      </button>
                      <button className={`${styles.visTab} ${visibilityMode === 'roles' ? styles.visTabActive : ''}`}
                        onClick={() => setVisibilityMode('roles')}>
                        <FaUsers /> Roles
                      </button>
                      <button className={`${styles.visTab} ${visibilityMode === 'users' ? styles.visTabActive : ''}`}
                        onClick={() => setVisibilityMode('users')}>
                        <FaUserPlus /> Usuarios
                      </button>
                      <button className={`${styles.visTab} ${visibilityMode === 'both' ? styles.visTabActive : ''}`}
                        onClick={() => setVisibilityMode('both')}>
                        <FaUsers /> Ambos
                      </button>
                    </div>
                    {(visibilityMode === 'roles' || visibilityMode === 'both') && (
                      <div className={styles.roleGrid}>
                        {ROLES.map(r => (
                          <button key={r} className={`${styles.roleChip} ${selectedRoles.includes(r) ? styles.roleChipActive : ''}`}
                            onClick={() => toggleRole(r)}>
                            {selectedRoles.includes(r) ? <FaCheck /> : <FaPlus />} {r}
                          </button>
                        ))}
                      </div>
                    )}
                    {(visibilityMode === 'users' || visibilityMode === 'both') && (
                      <div className={styles.userPicker}>
                        <div className={styles.userSearchWrap} ref={userSearchRef}>
                          <FaSearch className={styles.userSearchIcon} />
                          <input className={styles.userSearchInput}
                            value={userSearchQ}
                            onChange={e => { handleUserSearch(e.target.value); }}
                            onFocus={() => userSearchResults.length > 0 && setShowUserSearch(true)}
                            placeholder="Buscar usuarios por nombre o email..." />
                          {showUserSearch && userSearchResults.length > 0 && (
                            <div className={styles.userSearchDropdown}>
                              {userSearchResults.map(u => (
                                <button key={u.id} className={styles.userSearchItem}
                                  onClick={() => { addUser(u); setShowUserSearch(false); }}>
                                  <div className={styles.userSearchName}>{u.firstName} {u.lastName}</div>
                                  <div className={styles.userSearchEmail}>{u.email}</div>
                                  <span className={styles.userSearchRole}>{u.role}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedUsers.length > 0 && (
                          <div className={styles.selectedUsers}>
                            {selectedUsers.map(u => (
                              <div key={u.id} className={styles.selectedUserChip}>
                                <span>{u.firstName} {u.lastName}</span>
                                <button className={styles.removeUserBtn} onClick={() => removeUser(u.id)}><FaUserMinus /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedUsers.length === 0 && (
                          <p className={styles.visHint}>Busca y selecciona usuarios específicos que puedan ver este curso</p>
                        )}
                      </div>
                    )}
                    {visibilityMode === 'all' && (
                      <p className={styles.visHint}>El curso será visible para todos los usuarios autenticados</p>
                    )}
                  </div>

                  {editCourse.id !== 0 && (
                    <div className={styles.quickStats}>
                      <div className={styles.qStat}><FaFolder /> {editCourse.modules?.length || 0} módulos</div>
                      <div className={styles.qStat}><FaUsers /> {editCourse._count?.enrollments || 0} inscritos</div>
                      <div className={styles.qStat}>{editCourse.published ? <FaEye /> : <FaEyeSlash />} {editCourse.published ? 'Publicado' : 'No publicado'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnSecondary} onClick={() => setShowEdit(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSaveCourse} disabled={!editCourse.title.trim()}>
                <FaSave /> {editCourse.id === 0 ? 'Crear Curso' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Module Modal ─── */}
      {showModule && (
        <div className={styles.overlay} onClick={() => setShowModule(false)}>
          <div className={`${styles.modal} ${styles.modalSmall}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModule(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre del módulo</label>
                <input className={styles.input} value={moduleTitle} onChange={e => setModuleTitle(e.target.value)}
                  placeholder="Ej: Introducción a la norma" autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Descripción (opcional)</label>
                <textarea className={styles.textarea} rows={2} value={moduleDesc} onChange={e => setModuleDesc(e.target.value)}
                  placeholder="Breve descripción del contenido..." />
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnSecondary} onClick={() => setShowModule(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSaveModule} disabled={!moduleTitle.trim()}>
                <FaSave /> {editingModule ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Material Modal ─── */}
      {showMaterial && (
        <div className={styles.overlay} onClick={() => setShowMaterial(false)}>
          <div className={`${styles.modal} ${styles.modalSmall}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{editingMaterial ? 'Editar Material' : 'Nuevo Material'}</h2>
              <button className={styles.modalClose} onClick={() => setShowMaterial(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Título del material</label>
                <input className={styles.input} value={material.title} onChange={e => setMaterial({ ...material, title: e.target.value })}
                  placeholder="Ej: Presentación Semana 1" autoFocus />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Tipo</label>
                  <select className={styles.select} value={material.type} onChange={e => setMaterial({ ...material, type: e.target.value })}>
                    <option value="pdf">PDF</option>
                    <option value="ppt">PPT</option>
                    <option value="video">Video</option>
                    <option value="link">Enlace</option>
                    <option value="doc">Documento</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Duración (min)</label>
                  <input className={styles.input} type="number" min={0} value={material.duration || ''}
                    onChange={e => setMaterial({ ...material, duration: Number(e.target.value) })} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>URL del archivo</label>
                <input className={styles.input} value={material.fileUrl} onChange={e => setMaterial({ ...material, fileUrl: e.target.value })}
                  placeholder="https://..." />
              </div>
              {material.type === 'video' && (
                <div className={styles.field}>
                  <label className={styles.label}>URL del video (YouTube/Vimeo)</label>
                  <input className={styles.input} value={material.embedUrl} onChange={e => setMaterial({ ...material, embedUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..." />
                </div>
              )}
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnSecondary} onClick={() => setShowMaterial(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSaveMaterial} disabled={!material.title.trim()}>
                <FaSave /> {editingMaterial ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete confirm ─── */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={`${styles.modal} ${styles.modalConfirm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <FaTrash />
            </div>
            <h3 className={styles.confirmTitle}>¿Eliminar {deleteTarget.type === 'course' ? 'curso' : deleteTarget.type === 'module' ? 'módulo' : 'material'}?</h3>
            <p className={styles.confirmText}>
              Se eliminará <strong>"{deleteTarget.name}"</strong> de forma permanente.
              {deleteTarget.type === 'course' && ' También se eliminarán todos sus módulos y materiales.'}
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className={styles.btnDanger} onClick={executeDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const parseRoles = (val: string | null | undefined): string[] => {
  try { return val ? JSON.parse(val) : []; } catch { return []; }
};

export default AuditorCourses;
