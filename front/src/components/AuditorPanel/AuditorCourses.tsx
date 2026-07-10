import { useState, useEffect, useMemo, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaBook, FaFilePowerpoint, FaLink, FaChevronDown, FaChevronRight, FaFolder, FaEye, FaEyeSlash, FaSearch, FaUsers, FaClock, FaChalkboardTeacher, FaFilePdf, FaVideo, FaGlobe, FaCopy, FaCheck, FaUserPlus, FaUserMinus, FaGraduationCap, FaArrowLeft, FaEllipsisV, FaImage, FaFile, FaFileAlt, FaUpload, FaYoutube, FaExternalLinkAlt, FaGripVertical, FaPlay, FaPen, FaFileWord } from 'react-icons/fa';
import { fetchAllCourses, createCourse, updateCourse, togglePublishCourse, deleteCourse, addModule, deleteModule, addMaterial, deleteMaterial, fetchCourse, updateModule, updateMaterial, searchUsers, type Course, type CourseModule, type CourseMaterial, type SearchUser } from '../../services/coursesApi';
import styles from './AuditorCourses.module.scss';

const ROLES = ['ADMIN', 'USER', 'SALES', 'TI', 'MARKETING', 'AUDITOR'] as const;
const LEVELS = ['basico', 'intermedio', 'avanzado'] as const;
const FILE_TYPES = ['pdf', 'ppt', 'doc', 'video', 'link'] as const;
const FILE_ICONS: Record<string, JSX.Element> = {
  pdf: <FaFilePdf />, ppt: <FaFilePowerpoint />, doc: <FaFileWord />, video: <FaVideo />, link: <FaGlobe />,
};
const FILE_COLORS: Record<string, string> = {
  pdf: '#dc2626', ppt: '#e9742a', doc: '#2563eb', video: '#7c3aed', link: '#10b981',
};

interface MaterialForm {
  title: string; type: string; fileUrl: string; embedUrl: string; duration: number;
}

const emptyMaterial = (): MaterialForm => ({ title: '', type: 'pdf', fileUrl: '', embedUrl: '', duration: 0 });

const AuditorCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'dashboard' | 'manage'>('dashboard');

  /* Course detail (manage view) */
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeModules, setActiveModules] = useState<CourseModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [moduleSearch, setModuleSearch] = useState('');

  /* Course edit modal */
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  /* Module inline create/edit */
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [moduleEditTitle, setModuleEditTitle] = useState('');
  const [moduleEditDesc, setModuleEditDesc] = useState('');

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

  const load = async () => {
    try {
      const res = await fetchAllCourses({ search, pageSize: '200' });
      setCourses(res.courses);
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

  const totalEnrollments = useMemo(() =>
    courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0),
  [courses]);

  const filteredModules = useMemo(() => {
    if (!moduleSearch) return activeModules;
    const q = moduleSearch.toLowerCase();
    return activeModules.filter(m => m.title.toLowerCase().includes(q));
  }, [moduleSearch, activeModules]);

  /* ─── Course management navigation ─── */
  const openManageCourse = async (c: Course) => {
    const full = await fetchCourse(c.id);
    setActiveCourse(full);
    const mods = full.modules || [];
    setActiveModules(mods);
    setSelectedModule(mods.length > 0 ? mods[0] : null);
    setModuleSearch('');
    setView('manage');
  };

  const closeManageCourse = () => {
    setActiveCourse(null);
    setActiveModules([]);
    setSelectedModule(null);
    setView('dashboard');
    load();
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
    if (activeCourse && activeCourse.id === id) {
      setActiveCourse(prev => prev ? { ...prev, published: !prev.published } : null);
    }
  };

  const confirmDelete = (type: 'course' | 'module' | 'material', id: number, name: string) => {
    setDeleteTarget({ type, id, name });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'course') {
        await deleteCourse(deleteTarget.id);
        if (activeCourse && activeCourse.id === deleteTarget.id) {
          closeManageCourse();
        }
      } else if (deleteTarget.type === 'module') {
        await deleteModule(deleteTarget.id);
        setActiveModules(prev => prev.filter(m => m.id !== deleteTarget.id));
        setSelectedModule(prev => prev?.id === deleteTarget.id ? null : prev);
      } else {
        await deleteMaterial(deleteTarget.id);
        setActiveModules(prev => prev.map(m => ({
          ...m,
          materials: m.materials.filter(mat => mat.id !== deleteTarget.id),
        })));
        if (selectedModule) {
          setSelectedModule(prev => prev ? {
            ...prev,
            materials: prev.materials.filter(mat => mat.id !== deleteTarget.id),
          } : null);
        }
      }
      setDeleteTarget(null);
    } catch (e) { console.error(e); }
  };

  /* ─── Module management ─── */
  const handleAddModule = async () => {
    if (!activeCourse) return;
    try {
      const mod = await addModule(activeCourse.id, { title: 'Nuevo Módulo', description: '' });
      setActiveModules(prev => [...prev, mod]);
      setSelectedModule(mod);
      setEditingModuleId(mod.id);
      setModuleEditTitle(mod.title);
      setModuleEditDesc(mod.description || '');
    } catch (e) { console.error(e); }
  };

  const startEditModule = (mod: CourseModule) => {
    setEditingModuleId(mod.id);
    setModuleEditTitle(mod.title);
    setModuleEditDesc(mod.description || '');
  };

  const cancelEditModule = () => {
    setEditingModuleId(null);
    setModuleEditTitle('');
    setModuleEditDesc('');
  };

  const saveEditModule = async (modId: number) => {
    if (!moduleEditTitle.trim()) return;
    try {
      const updated = await updateModule(modId, { title: moduleEditTitle, description: moduleEditDesc || undefined });
      setActiveModules(prev => prev.map(m => m.id === modId ? { ...m, ...updated } : m));
      setSelectedModule(prev => prev?.id === modId ? { ...prev, ...updated } : prev);
      setEditingModuleId(null);
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
      let saved: CourseMaterial;
      if (editingMaterial) {
        saved = await updateMaterial(editingMaterial.id, {
          title: material.title, type: material.type,
          fileUrl: material.fileUrl || null, embedUrl: material.embedUrl || null,
          duration: material.duration || null,
        });
      } else {
        saved = await addMaterial(materialModuleId, {
          title: material.title, type: material.type,
          fileUrl: material.fileUrl || undefined, embedUrl: material.embedUrl || undefined,
          duration: material.duration || undefined,
        });
      }
      const updateMods = (prev: CourseModule[]) => prev.map(m => {
        if (m.id === materialModuleId) {
          const exists = m.materials.some(x => x.id === saved.id);
          return {
            ...m,
            materials: exists
              ? m.materials.map(x => x.id === saved.id ? saved : x)
              : [...m.materials, saved],
          };
        }
        return m;
      });
      setActiveModules(updateMods);
      setSelectedModule(prev => prev?.id === materialModuleId ? { ...prev, materials: updateMods(activeModules).find(m => m.id === materialModuleId)?.materials || [] } : prev);
      setShowMaterial(false);
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

  /* ─── Dashboard view ─── */
  if (view === 'dashboard') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Cursos</h1>
            <p className={styles.subtitle}>Plataforma de administración educativa</p>
          </div>
          <button className={styles.createBtn} onClick={openCreate}><FaPlus /> Nuevo Curso</button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><FaBook /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{courses.length}</span>
              <span className={styles.statLabel}>Total Cursos</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><FaEye /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{courses.filter(c => c.published).length}</span>
              <span className={styles.statLabel}>Publicados</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><FaEyeSlash /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{courses.filter(c => !c.published).length}</span>
              <span className={styles.statLabel}>Borradores</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><FaGraduationCap /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalEnrollments}</span>
              <span className={styles.statLabel}>Inscripciones</span>
            </div>
          </div>
        </div>

        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <FaSearch className={styles.searchIcon} />
            <input className={styles.searchInput} placeholder="Buscar cursos..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <span className={styles.resultCount}>{filtered.length} curso{filtered.length !== 1 ? 's' : ''}</span>
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
          <div className={styles.courseGrid}>
            {filtered.map(c => {
              const lvl = getLevelColor(c.level);
              return (
                <div key={c.id} className={styles.courseCard}>
                  <div className={styles.courseThumb} style={{ background: `linear-gradient(135deg, ${lvl.color}15, ${lvl.color}05)` }}>
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="" className={styles.courseThumbImg} />
                    ) : (
                      <div className={styles.courseThumbLetter} style={{ color: lvl.color }}>{c.title.charAt(0)}</div>
                    )}
                    <div className={styles.courseThumbBadges}>
                      <span className={styles.badge} style={{ background: lvl.bg, color: lvl.color }}>{c.level}</span>
                      {c.duration && <span className={styles.badge}><FaClock /> {c.duration}h</span>}
                    </div>
                    <div className={`${styles.courseStatusBadge} ${c.published ? styles.statusPublished : styles.statusDraft}`}>
                      {c.published ? 'Publicado' : 'Borrador'}
                    </div>
                  </div>
                  <div className={styles.courseCardBody}>
                    <h3 className={styles.courseCardTitle}>{c.title}</h3>
                    {c.category && <span className={styles.courseCardCat}>{c.category}</span>}
                    <div className={styles.courseCardMeta}>
                      <span><FaFolder /> {c._count?.modules || 0}</span>
                      <span><FaUsers /> {c._count?.enrollments || 0}</span>
                    </div>
                    <div className={styles.courseCardActions}>
                      <button className={styles.manageBtn} onClick={() => openManageCourse(c)}>
                        <FaBook /> Gestionar
                      </button>
                      <button className={styles.iconBtn} onClick={() => openEdit(c)} title="Editar"><FaPen /></button>
                      <button className={styles.iconBtnDanger} onClick={() => confirmDelete('course', c.id, c.title)} title="Eliminar"><FaTrash /></button>
                      <button className={`${styles.iconBtnNeutral}`} onClick={() => handleTogglePublish(c.id)} title={c.published ? 'Ocultar' : 'Publicar'}>
                        {c.published ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Course edit modal */}
        {renderEditModal()}

        {/* Delete confirm */}
        {renderDeleteConfirm()}
      </div>
    );
  }

  /* ════════════════════════════════════════
     MANAGE VIEW
     ════════════════════════════════════════ */
  const activeLvl = activeCourse ? getLevelColor(activeCourse.level) : { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' };

  return (
    <div className={styles.wrapper}>
      {/* Course Manage Header */}
      <div className={styles.manageHeader}>
        <button className={styles.backBtn} onClick={closeManageCourse}><FaArrowLeft /> Volver</button>
        <div className={styles.manageHeaderInfo}>
          <div className={styles.manageThumb} style={{ background: `linear-gradient(135deg, ${activeLvl.color}20, ${activeLvl.color}08)` }}>
            <span style={{ color: activeLvl.color }}>{activeCourse?.title.charAt(0) || 'C'}</span>
          </div>
          <div>
            <h2 className={styles.manageTitle}>{activeCourse?.title}</h2>
            <div className={styles.manageMeta}>
              {activeCourse?.category && <span>{activeCourse.category}</span>}
              <span className={styles.manageLevel} style={{ background: activeLvl.bg, color: activeLvl.color }}>{activeCourse?.level}</span>
              <span>{activeModules.length} módulos</span>
              <span>{activeModules.reduce((s, m) => s + m.materials.length, 0)} materiales</span>
            </div>
          </div>
        </div>
        <div className={styles.manageActions}>
          <button className={`${styles.publishBtn} ${activeCourse?.published ? styles.publishBtnOn : styles.publishBtnOff}`}
            onClick={() => activeCourse && handleTogglePublish(activeCourse.id)}>
            {activeCourse?.published ? <><FaEye /> Publicado</> : <><FaEyeSlash /> Borrador</>}
          </button>
          <button className={styles.manageActionBtn} onClick={() => activeCourse && openEdit(activeCourse)}><FaPen /> Editar</button>
          <button className={styles.manageActionBtnDanger} onClick={() => activeCourse && confirmDelete('course', activeCourse.id, activeCourse.title)}><FaTrash /></button>
        </div>
      </div>

      {/* Manage Body */}
      <div className={styles.manageBody}>
        {/* Left Panel: Modules */}
        <div className={styles.modulesPanel}>
          <div className={styles.modulesPanelHeader}>
            <h3 className={styles.modulesPanelTitle}>Módulos</h3>
            <button className={styles.addModuleBtn} onClick={handleAddModule}><FaPlus /></button>
          </div>
          <div className={styles.modulesSearchWrap}>
            <FaSearch className={styles.modulesSearchIcon} />
            <input className={styles.modulesSearchInput} placeholder="Buscar módulo..." value={moduleSearch}
              onChange={e => setModuleSearch(e.target.value)} />
          </div>
          <div className={styles.modulesList}>
            {filteredModules.length === 0 ? (
              <div className={styles.modulesEmpty}>
                {moduleSearch ? 'Sin resultados' : 'Sin módulos aún'}
              </div>
            ) : (
              filteredModules.map((mod, idx) => {
                const isActive = selectedModule?.id === mod.id;
                const isEditing = editingModuleId === mod.id;
                const matCount = mod.materials?.length || 0;
                return (
                  <div key={mod.id} className={`${styles.moduleItem} ${isActive ? styles.moduleItemActive : ''}`}
                    onClick={() => !isEditing && setSelectedModule(mod)}>
                    {isEditing ? (
                      <div className={styles.moduleItemEdit} onClick={e => e.stopPropagation()}>
                        <input className={styles.moduleEditInput} value={moduleEditTitle}
                          onChange={e => setModuleEditTitle(e.target.value)}
                          placeholder="Título del módulo" autoFocus />
                        <input className={styles.moduleEditInput} value={moduleEditDesc}
                          onChange={e => setModuleEditDesc(e.target.value)}
                          placeholder="Descripción (opcional)" />
                        <div className={styles.moduleEditActions}>
                          <button className={styles.moduleEditSave} onClick={() => saveEditModule(mod.id)}><FaCheck /></button>
                          <button className={styles.moduleEditCancel} onClick={cancelEditModule}><FaTimes /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.moduleItemDrag}>
                          <FaGripVertical />
                        </div>
                        <div className={styles.moduleItemIcon}>
                          <FaFolder />
                        </div>
                        <div className={styles.moduleItemInfo}>
                          <span className={styles.moduleItemName}>{mod.title}</span>
                          <span className={styles.moduleItemCount}>{matCount} material{matCount !== 1 ? 'es' : ''}</span>
                        </div>
                        <div className={styles.moduleItemActions}>
                          <button className={styles.moduleItemAction} onClick={e => { e.stopPropagation(); startEditModule(mod); }} title="Editar"><FaPen /></button>
                          <button className={styles.moduleItemActionDanger} onClick={e => { e.stopPropagation(); confirmDelete('module', mod.id, mod.title); }} title="Eliminar"><FaTrash /></button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Materials */}
        <div className={styles.materialsPanel}>
          {selectedModule ? (
            <>
              <div className={styles.materialsHeader}>
                <div className={styles.materialsHeaderInfo}>
                  <FaFolder className={styles.materialsHeaderIcon} />
                  <div>
                    <h3 className={styles.materialsTitle}>{selectedModule.title}</h3>
                    {selectedModule.description && (
                      <p className={styles.materialsDesc}>{selectedModule.description}</p>
                    )}
                  </div>
                </div>
                <button className={styles.addMaterialBtn} onClick={() => openAddMaterial(selectedModule.id)}>
                  <FaPlus /> Agregar Material
                </button>
              </div>

              {/* Upload zone */}
              <div className={styles.uploadZone} onClick={() => openAddMaterial(selectedModule.id)}>
                <div className={styles.uploadZoneContent}>
                  <FaUpload className={styles.uploadZoneIcon} />
                  <p className={styles.uploadZoneText}>Sube materiales educativos</p>
                  <p className={styles.uploadZoneHint}>
                    Arrastra archivos o haz clic para agregar — PDF, PPT, DOC, Video o Enlaces
                  </p>
                  <div className={styles.uploadTypes}>
                    {FILE_TYPES.map(ft => (
                      <div key={ft} className={styles.uploadTypeItem}>
                        <span style={{ color: FILE_COLORS[ft] }}>{FILE_ICONS[ft]}</span>
                        <span>{ft.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Material list */}
              {(!selectedModule.materials || selectedModule.materials.length === 0) ? (
                <div className={styles.materialsEmpty}>
                  <FaFile className={styles.materialsEmptyIcon} />
                  <p>Este módulo aún no tiene materiales</p>
                </div>
              ) : (
                <div className={styles.materialsList}>
                  {selectedModule.materials.map(mat => {
                    const color = FILE_COLORS[mat.type] || '#64748b';
                    const icon = FILE_ICONS[mat.type] || <FaFile />;
                    return (
                      <div key={mat.id} className={styles.materialCard}>
                        <div className={styles.materialCardIcon} style={{ background: `${color}12`, color }}>
                          {icon}
                        </div>
                        <div className={styles.materialCardInfo}>
                          <span className={styles.materialCardName}>{mat.title}</span>
                          <div className={styles.materialCardMeta}>
                            <span className={styles.materialCardType} style={{ background: `${color}10`, color }}>{mat.type}</span>
                            {mat.duration && <span><FaClock /> {mat.duration} min</span>}
                            {mat.fileUrl && <span><FaLink /> URL</span>}
                          </div>
                        </div>
                        <div className={styles.materialCardActions}>
                          {mat.fileUrl && (
                            <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.materialCardAction} title="Abrir enlace">
                              <FaExternalLinkAlt />
                            </a>
                          )}
                          <button className={styles.materialCardActionEdit} onClick={() => openEditMaterial(mat)} title="Editar material">
                            <FaPen />
                          </button>
                          <button className={styles.materialCardActionDel} onClick={() => confirmDelete('material', mat.id, mat.title)} title="Eliminar material">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className={styles.materialsEmpty}>
              <FaBook className={styles.materialsEmptyIconBig} />
              <h3>Selecciona un módulo</h3>
              <p>Elige un módulo del panel izquierdo para ver sus materiales o crea uno nuevo</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Course Modal */}
      {renderEditModal()}

      {/* Module Modal (standalone create/edit fallback) */}
      {/* Material Modal */}
      {showMaterial && (
        <div className={styles.overlay} onClick={() => setShowMaterial(false)}>
          <div className={`${styles.modal} ${styles.modalSmall}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{editingMaterial ? 'Editar Material' : 'Nuevo Material'}</h2>
              <button className={styles.modalClose} onClick={() => setShowMaterial(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.materialFormTypes}>
                {FILE_TYPES.map(ft => (
                  <button key={ft} className={`${styles.materialFormType} ${material.type === ft ? styles.materialFormTypeActive : ''}`}
                    onClick={() => setMaterial({ ...material, type: ft })}>
                    <span style={{ color: FILE_COLORS[ft] }}>{FILE_ICONS[ft]}</span>
                    <span>{ft.toUpperCase()}</span>
                  </button>
                ))}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Título del material</label>
                <input className={styles.input} value={material.title} onChange={e => setMaterial({ ...material, title: e.target.value })}
                  placeholder="Ej: Presentación Semana 1" autoFocus />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Duración (min)</label>
                  <input className={styles.input} type="number" min={0} value={material.duration || ''}
                    onChange={e => setMaterial({ ...material, duration: Number(e.target.value) })} placeholder="0" />
                </div>
              </div>
              {material.type === 'video' ? (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>URL del video</label>
                    <div className={styles.inputWithIcon}>
                      <FaYoutube className={styles.inputIcon} />
                      <input className={styles.input} value={material.embedUrl}
                        onChange={e => setMaterial({ ...material, embedUrl: e.target.value })}
                        placeholder="https://www.youtube.com/embed/..." />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>O URL del archivo (fallback)</label>
                    <input className={styles.input} value={material.fileUrl}
                      onChange={e => setMaterial({ ...material, fileUrl: e.target.value })}
                      placeholder="https://..." />
                  </div>
                </>
              ) : (
                <div className={styles.field}>
                  <label className={styles.label}>URL del archivo</label>
                  <div className={styles.inputWithIcon}>
                    <FaLink className={styles.inputIcon} />
                    <input className={styles.input} value={material.fileUrl}
                      onChange={e => setMaterial({ ...material, fileUrl: e.target.value })}
                      placeholder="https://..." />
                  </div>
                </div>
              )}
              {material.type === 'video' && (
                <div className={styles.embedPreview}>
                  <FaVideo /> Ingresa una URL de YouTube o Vimeo para vista previa
                </div>
              )}
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnSecondary} onClick={() => setShowMaterial(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSaveMaterial} disabled={!material.title.trim()}>
                <FaSave /> {editingMaterial ? 'Guardar' : 'Subir Material'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {renderDeleteConfirm()}
    </div>
  );

  /* ─── Shared render helpers ─── */
  function renderEditModal() {
    if (!showEdit || !editCourse) return null;
    return (
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
                    <div className={styles.inputWithIcon}>
                      <FaImage className={styles.inputIcon} />
                      <input className={styles.input} value={editCourse.imageUrl || ''}
                        onChange={e => setEditCourse({ ...editCourse, imageUrl: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formCol}>
                <div className={styles.visSection}>
                  <label className={styles.label}>Visibilidad del curso</label>
                  <div className={styles.visTabs}>
                    <button className={`${styles.visTab} ${visibilityMode === 'all' ? styles.visTabActive : ''}`}
                      onClick={() => setVisibilityMode('all')}>
                      Todos
                    </button>
                    <button className={`${styles.visTab} ${visibilityMode === 'roles' ? styles.visTabActive : ''}`}
                      onClick={() => setVisibilityMode('roles')}>
                      Roles
                    </button>
                    <button className={`${styles.visTab} ${visibilityMode === 'users' ? styles.visTabActive : ''}`}
                      onClick={() => setVisibilityMode('users')}>
                      Usuarios
                    </button>
                    <button className={`${styles.visTab} ${visibilityMode === 'both' ? styles.visTabActive : ''}`}
                      onClick={() => setVisibilityMode('both')}>
                      Ambos
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
                          placeholder="Buscar usuarios..." />
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
                              <button onClick={() => removeUser(u.id)}><FaUserMinus /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedUsers.length === 0 && (
                        <p className={styles.visHint}>Busca y selecciona usuarios específicos</p>
                      )}
                    </div>
                  )}
                  {visibilityMode === 'all' && (
                    <p className={styles.visHint}>Visible para todos los usuarios autenticados</p>
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
    );
  }

  function renderDeleteConfirm() {
    if (!deleteTarget) return null;
    return (
      <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
        <div className={`${styles.modal} ${styles.modalConfirm}`} onClick={e => e.stopPropagation()}>
          <div className={styles.confirmIcon}><FaTrash /></div>
          <h3 className={styles.confirmTitle}>¿Eliminar {deleteTarget.type === 'course' ? 'curso' : deleteTarget.type === 'module' ? 'módulo' : 'material'}?</h3>
          <p className={styles.confirmText}>
            Se eliminará <strong>"{deleteTarget.name}"</strong> de forma permanente.
            {deleteTarget.type === 'course' && ' También todos sus módulos y materiales.'}
          </p>
          <div className={styles.confirmActions}>
            <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)}>Cancelar</button>
            <button className={styles.btnDanger} onClick={executeDelete}>Eliminar</button>
          </div>
        </div>
      </div>
    );
  }
};

const parseRoles = (val: string | null | undefined): string[] => {
  try { return val ? JSON.parse(val) : []; } catch { return []; }
};

export default AuditorCourses;
