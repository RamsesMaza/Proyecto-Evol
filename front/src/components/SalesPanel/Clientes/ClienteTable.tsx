import { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEye, FaEdit, FaTrash, FaBan, FaEnvelope, FaHistory, FaFileInvoiceDollar, FaChartLine, FaCheckSquare, FaSquare, FaChevronLeft, FaChevronRight, FaEllipsisV } from 'react-icons/fa';
import type { Cliente, SortField, SortDir } from './types';
import styles from '../SalesClientes.module.scss';

interface ClienteTableProps {
  clientes: Cliente[];
  onView: (c: Cliente) => void;
  onEdit: (c: Cliente) => void;
  onDelete: (c: Cliente) => void;
  onBlock: (c: Cliente) => void;
  onMessage: (c: Cliente) => void;
  onCotizacion: (c: Cliente) => void;
  onVenta: (c: Cliente) => void;
  onHistory: (c: Cliente) => void;
}

const PAGE_SIZE = (() => { try { const p = JSON.parse(localStorage.getItem('sales_displayPrefs') || '{}'); return p.itemsPerPage || 8; } catch { return 8; } })();

const statusConfig: Record<string, { label: string; className: string }> = {
  activo: { label: 'Activo', className: 'statusActivo' },
  inactivo: { label: 'Inactivo', className: 'statusInactivo' },
  nuevo: { label: 'Nuevo', className: 'statusNuevo' },
  frecuente: { label: 'Frecuente', className: 'statusFrecuente' },
};

const ClienteTable = ({ clientes, onView, onEdit, onDelete, onBlock, onMessage, onCotizacion, onVenta, onHistory }: ClienteTableProps) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    const list = [...clientes];
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'firstName': aVal = a.firstName; bVal = b.firstName; break;
        case 'lastName': aVal = a.lastName; bVal = b.lastName; break;
        case 'email': aVal = a.email; bVal = b.email; break;
        case 'company': aVal = a.company; bVal = b.company; break;
        case 'status': aVal = a.status; bVal = b.status; break;
        case 'createdAt': aVal = a.createdAt; bVal = b.createdAt; break;
        case 'totalGastado': aVal = a.totalGastado; bVal = b.totalGastado; break;
        case 'ultimaCompra': aVal = a.ultimaCompra || ''; bVal = b.ultimaCompra || ''; break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [clientes, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map(c => c.id)));
    }
  };

  const initials = (c: Cliente) => `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase();

  const sortArrow = (field: SortField) => {
    if (sortField !== field) return <FaSort className={styles.sortIcon} />;
    return sortDir === 'asc' ? <FaSortUp className={styles.sortIconActive} /> : <FaSortDown className={styles.sortIconActive} />;
  };

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thCheck}>
                <button onClick={toggleAll} className={styles.checkBtn}>
                  {selected.size === paged.length && paged.length > 0 ? <FaCheckSquare /> : <FaSquare />}
                </button>
              </th>
              <th className={styles.thSort} onClick={() => toggleSort('firstName')}>
                Cliente {sortArrow('firstName')}
              </th>
              <th className={styles.thSort} onClick={() => toggleSort('email')}>
                Email {sortArrow('email')}
              </th>
              <th>Teléfono</th>
              <th className={styles.thSort} onClick={() => toggleSort('company')}>
                Empresa {sortArrow('company')}
              </th>
              <th className={styles.thSort} onClick={() => toggleSort('status')}>
                Estado {sortArrow('status')}
              </th>
              <th className={styles.thSort} onClick={() => toggleSort('createdAt')}>
                Registro {sortArrow('createdAt')}
              </th>
              <th className={styles.thActions}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => {
              const cfg = statusConfig[c.status] || statusConfig.activo;
              const isSelected = selected.has(c.id);
              return (
                <tr key={c.id} className={`${styles.tr} ${isSelected ? styles.trSelected : ''}`}>
                  <td className={styles.tdCheck}>
                    <button onClick={() => toggleSelect(c.id)} className={styles.checkBtn}>
                      {isSelected ? <FaCheckSquare /> : <FaSquare />}
                    </button>
                  </td>
                  <td>
                    <div className={styles.cellName}>
                      <div className={styles.cellAvatar}>{initials(c)}</div>
                      <div className={styles.cellNameInfo}>
                        <span className={styles.cellNameText}>{c.firstName} {c.lastName}</span>
                        {c.isFavorite && <span className={styles.favStar}>★</span>}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tdMuted}>{c.email}</td>
                  <td className={styles.tdMuted}>{c.phone}</td>
                  <td>
                    <span className={styles.cellCompany}>{c.company}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[cfg.className]}`}>{cfg.label}</span>
                  </td>
                  <td className={styles.tdMuted}>{c.createdAt}</td>
                  <td className={styles.tdActions}>
                    <div className={styles.actionMenuWrap}>
                      <button className={styles.actionDots} onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}>
                        <FaEllipsisV />
                      </button>
                      {openMenu === c.id && (
                        <>
                          <div className={styles.menuBackdrop} onClick={() => setOpenMenu(null)} />
                          <div className={styles.actionMenu}>
                            <button onClick={() => { onView(c); setOpenMenu(null); }}><FaEye /> Ver perfil</button>
                            <button onClick={() => { onEdit(c); setOpenMenu(null); }}><FaEdit /> Editar</button>
                            <button onClick={() => { onHistory(c); setOpenMenu(null); }}><FaHistory /> Historial</button>
                            <button onClick={() => { onCotizacion(c); setOpenMenu(null); }}><FaFileInvoiceDollar /> Cotización</button>
                            <button onClick={() => { onVenta(c); setOpenMenu(null); }}><FaChartLine /> Registrar venta</button>
                            <button onClick={() => { onMessage(c); setOpenMenu(null); }}><FaEnvelope /> Mensaje</button>
                            <button onClick={() => { onBlock(c); setOpenMenu(null); }}><FaBan /> Bloquear</button>
                            <div className={styles.menuDivider} />
                            <button className={styles.menuDanger} onClick={() => { onDelete(c); setOpenMenu(null); }}><FaTrash /> Eliminar</button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <p className={styles.emptyTitle}>No se encontraron clientes</p>
                    <p className={styles.emptySub}>Intenta con otros filtros o agrega un nuevo cliente</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} de {sorted.length}</span>
          <div className={styles.pageBtns}>
            <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteTable;
