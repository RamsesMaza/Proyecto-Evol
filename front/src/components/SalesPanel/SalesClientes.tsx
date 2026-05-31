import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSearch, FaFileExport, FaFileImport, FaDollarSign, FaStar, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaSyncAlt } from 'react-icons/fa';
import { useRefresh } from '../../context/RefreshContext';
import type { Cliente, FilterPreset } from './Clientes/types';
import { fetchClientes, updateCliente, fetchClienteStats } from '../../services/clientesApi';
import ClienteTable from './Clientes/ClienteTable';
import ClienteProfile from './Clientes/ClienteProfile';
import ConfirmDialog from './Clientes/ConfirmDialog';
import styles from './SalesClientes.module.scss';

type ModalType = 'status' | null;

const SalesClientes = () => {
  const { refreshKey, notifyRefresh } = useRefresh();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('todos');
  const [profileCliente, setProfileCliente] = useState<Cliente | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [targetCliente, setTargetCliente] = useState<Cliente | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [stats, setStats] = useState({ total: 0, activos: 0, nuevosEsteMes: 0, frecuentes: 0, conversionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [data, statsData] = await Promise.all([
        fetchClientes({ query: query || undefined, status: filterPreset, pageSize: 100 }),
        fetchClienteStats(),
      ]);
      setClientes(data.clientes);
      setTotal(data.total);
      setStats(statsData);
    } catch {
      setError('Error al cargar clientes. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [query, filterPreset, refreshKey]);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async () => {
    if (!targetCliente) return;
    const newStatus = targetCliente.status === 'inactivo' ? 'activo' : 'inactivo';
    try {
      await updateCliente(Number(targetCliente.id), { status: newStatus });
      setModal(null);
      setTargetCliente(null);
      toast(newStatus === 'inactivo' ? 'Cliente bloqueado' : 'Cliente reactivado');
      notifyRefresh();
    } catch {
      toast('Error al actualizar cliente');
    }
  };

  const handleToggleFavorite = async (c: Cliente) => {
    const newFav = !c.isFavorite;
    try {
      await updateCliente(Number(c.id), { isFavorite: newFav });
      setClientes(prev => prev.map(cl => cl.id === c.id ? { ...cl, isFavorite: newFav } : cl));
      setProfileCliente(prev => prev?.id === c.id ? { ...prev, isFavorite: newFav } : prev);
      notifyRefresh();
    } catch {
      toast('Error al actualizar cliente');
    }
  };

  const filters: { key: FilterPreset; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'activos', label: 'Activos' },
    { key: 'inactivos', label: 'Inactivos' },
    { key: 'nuevos', label: 'Nuevos' },
    { key: 'frecuentes', label: 'Frecuentes' },
  ];

  if (loading && clientes.length === 0) {
    return (
      <div className={styles.clientesModule}>
        <div className={styles.loadingState}>
          <FaSpinner className={styles.spinner} />
          <p className={styles.loadingText}>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.clientesModule}>
        <div className={styles.errorState}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button className={styles.btnPrimary} onClick={load}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.clientesModule}>
      <div className={styles.clientesHeader}>
        <div className={styles.clientesHeaderLeft}>
          <div className={styles.clientesHeaderIcon}><FaUsers /></div>
          <div>
            <h2 className={styles.clientesTitle}>Clientes</h2>
            <p className={styles.clientesSubtitle}>{total} clientes registrados</p>
          </div>
        </div>
        <div className={styles.clientesHeaderActions}>
          <button className={styles.btnOutline} onClick={() => toast('Exportar — próximamente')}><FaFileExport /> Exportar</button>
          <button className={styles.btnOutline} onClick={() => toast('Importar — próximamente')}><FaFileImport /> Importar</button>
          <button className={styles.btnOutline} onClick={() => load()}><FaSyncAlt /> Actualizar</button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}><FaUsers className={styles.statIcon} /><div><span className={styles.statNum}>{stats.total}</span><span className={styles.statLabel}>Total</span></div></div>
        <div className={styles.statCard}><FaCheckCircle className={styles.statIcon} /><div><span className={styles.statNum}>{stats.activos}</span><span className={styles.statLabel}>Activos</span></div></div>
        <div className={styles.statCard}><FaStar className={styles.statIcon} /><div><span className={styles.statNum}>{stats.nuevosEsteMes}</span><span className={styles.statLabel}>Nuevos este mes</span></div></div>
        <div className={styles.statCard}><FaChartLine className={styles.statIcon} /><div><span className={styles.statNum}>{stats.frecuentes}</span><span className={styles.statLabel}>Frecuentes</span></div></div>
        <div className={styles.statCard}><FaDollarSign className={styles.statIcon} /><div><span className={styles.statNum}>{stats.conversionRate}%</span><span className={styles.statLabel}>Conversión</span></div></div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre, correo, empresa o teléfono..." />
          {query && <button className={styles.searchClear} onClick={() => setQuery('')}>✕</button>}
        </div>
        <div className={styles.filterTabs}>
          {filters.map(f => (
            <button key={f.key} className={`${styles.filterTab} ${filterPreset === f.key ? styles.filterTabActive : ''}`} onClick={() => setFilterPreset(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ClienteTable
        clientes={clientes}
        onView={c => setProfileCliente(c)}
        onEdit={c => toast(`Editar perfil de ${c.firstName} — próximamente`)}
                onDelete={() => toast(`No se puede eliminar usuarios del sistema — próximamente`)}
        onBlock={c => { setTargetCliente(c); setModal('status'); }}
        onMessage={c => toast(`Enviar mensaje a ${c.firstName} — próximamente`)}
        onCotizacion={c => toast(`Crear cotización para ${c.firstName} — próximamente`)}
        onVenta={c => toast(`Registrar venta para ${c.firstName} — próximamente`)}
        onHistory={c => { setProfileCliente(c); }}
      />

      {profileCliente && (
        <ClienteProfile cliente={profileCliente} onClose={() => setProfileCliente(null)} onToggleFavorite={handleToggleFavorite} />
      )}

      {modal === 'status' && targetCliente && (
        <ConfirmDialog
          title={targetCliente.status === 'inactivo' ? 'Reactivar Cliente' : 'Bloquear Cliente'}
          message={targetCliente.status === 'inactivo'
            ? `¿Reactivar a ${targetCliente.firstName} ${targetCliente.lastName}?`
            : `¿Bloquear a ${targetCliente.firstName} ${targetCliente.lastName}? No podrá acceder al sistema.`}
          confirmLabel={targetCliente.status === 'inactivo' ? 'Reactivar' : 'Bloquear'}
          danger={targetCliente.status !== 'inactivo'}
          onConfirm={handleBlock}
          onCancel={() => { setModal(null); setTargetCliente(null); }}
        />
      )}

      {toastMsg && (
        <div className={styles.toast}>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default SalesClientes;
