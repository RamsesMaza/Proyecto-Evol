import { useState } from 'react';
import { FaTimes, FaStar, FaRegStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaBriefcase, FaCalendarAlt, FaDollarSign, FaShoppingCart, FaFileInvoiceDollar, FaTag, FaClock, FaComment } from 'react-icons/fa';
import type { Cliente } from './types';
import styles from '../SalesClientes.module.scss';

interface ClienteProfileProps {
  cliente: Cliente;
  onClose: () => void;
  onToggleFavorite: (c: Cliente) => void;
}

type ProfileTab = 'info' | 'historial' | 'cotizaciones' | 'actividad' | 'notas';

const ClienteProfile = ({ cliente, onClose, onToggleFavorite }: ClienteProfileProps) => {
  const [tab, setTab] = useState<ProfileTab>('info');
  const c = cliente;

  const initials = `${(c.firstName || '?').charAt(0)}${(c.lastName || '?').charAt(0)}`.toUpperCase();

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'info', label: 'Información' },
    { key: 'historial', label: 'Compras' },
    { key: 'cotizaciones', label: 'Cotizaciones' },
    { key: 'actividad', label: 'Actividad' },
    { key: 'notas', label: 'Notas' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      activo: { label: 'Activo', cls: 'statusActivo' },
      inactivo: { label: 'Inactivo', cls: 'statusInactivo' },
      nuevo: { label: 'Nuevo', cls: 'statusNuevo' },
      frecuente: { label: 'Frecuente', cls: 'statusFrecuente' },
    };
    const s = map[status] || map.activo;
    return <span className={`${styles.profileBadgeSm} ${styles[s.cls]}`}>{s.label}</span>;
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case 'compra': return <FaShoppingCart />;
      case 'cotizacion': return <FaFileInvoiceDollar />;
      case 'mensaje': return <FaEnvelope />;
      case 'llamada': return <FaPhone />;
      case 'reunion': return <FaClock />;
      case 'nota': return <FaComment />;
      default: return <FaClock />;
    }
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <button className={styles.drawerClose} onClick={onClose}><FaTimes /></button>
          <h3 className={styles.drawerTitle}>Perfil del Cliente</h3>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatarLarge}>{initials}</div>
            <div className={styles.profileHeaderInfo}>
              <div className={styles.profileNameRow}>
                <h2 className={styles.profileName}>{c.firstName} {c.lastName}</h2>
                <button className={styles.favBtn} onClick={() => onToggleFavorite(c)}>
                  {c.isFavorite ? <FaStar /> : <FaRegStar />}
                </button>
              </div>
              {statusBadge(c.status)}
              <p className={styles.profileCompany}>{c.company}</p>
            </div>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.profileStat}>
              <FaDollarSign className={styles.profileStatIcon} />
              <div>
                <span className={styles.profileStatValue}>S/ {c.totalGastado.toLocaleString()}</span>
                <span className={styles.profileStatLabel}>Total gastado</span>
              </div>
            </div>
            <div className={styles.profileStat}>
              <FaShoppingCart className={styles.profileStatIcon} />
              <div>
                <span className={styles.profileStatValue}>{c.totalCompras}</span>
                <span className={styles.profileStatLabel}>Compras</span>
              </div>
            </div>
            <div className={styles.profileStat}>
              <FaFileInvoiceDollar className={styles.profileStatIcon} />
              <div>
                <span className={styles.profileStatValue}>{c.cotizaciones.length}</span>
                <span className={styles.profileStatLabel}>Cotizaciones</span>
              </div>
            </div>
            <div className={styles.profileStat}>
              <FaCalendarAlt className={styles.profileStatIcon} />
              <div>
                <span className={styles.profileStatValue}>{c.createdAt}</span>
                <span className={styles.profileStatLabel}>Registro</span>
              </div>
            </div>
          </div>

          <div className={styles.profileTabs}>
            {tabs.map(t => (
              <button key={t.key} className={`${styles.profileTab} ${tab === t.key ? styles.profileTabActive : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.profileTabContent}>
            {tab === 'info' && (
              <div className={styles.profileInfoGrid}>
                <div className={styles.infoItem}><FaEnvelope className={styles.infoIcon} /><div><span className={styles.infoLabel}>Email</span><span className={styles.infoValue}>{c.email}</span></div></div>
                <div className={styles.infoItem}><FaPhone className={styles.infoIcon} /><div><span className={styles.infoLabel}>Teléfono</span><span className={styles.infoValue}>{c.phone}</span></div></div>
                <div className={styles.infoItem}><FaBuilding className={styles.infoIcon} /><div><span className={styles.infoLabel}>Empresa</span><span className={styles.infoValue}>{c.company}</span></div></div>
                <div className={styles.infoItem}><FaBriefcase className={styles.infoIcon} /><div><span className={styles.infoLabel}>Cargo</span><span className={styles.infoValue}>{c.position}</span></div></div>
                <div className={styles.infoItem}><FaMapMarkerAlt className={styles.infoIcon} /><div><span className={styles.infoLabel}>Dirección</span><span className={styles.infoValue}>{c.address}</span></div></div>
                <div className={styles.infoItem}><FaCalendarAlt className={styles.infoIcon} /><div><span className={styles.infoLabel}>Última compra</span><span className={styles.infoValue}>{c.ultimaCompra || 'Sin compras'}</span></div></div>
                {c.tags.length > 0 && (
                  <div className={styles.infoItemFull}>
                    <span className={styles.infoLabel}>Etiquetas</span>
                    <div className={styles.tagsRow}>
                      {c.tags.map(tag => <span key={tag} className={styles.tag}><FaTag /> {tag}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'historial' && (
              <div className={styles.timeline}>
                {c.activity.filter(a => a.type === 'compra').length === 0 ? (
                  <p className={styles.emptySmall}>Sin compras registradas</p>
                ) : (
                  c.activity.filter(a => a.type === 'compra').map(a => (
                    <div key={a.id} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <span className={styles.timelineTitle}>{a.description}</span>
                        {a.amount && <span className={styles.timelineAmount}>S/ {a.amount.toLocaleString()}</span>}
                        <span className={styles.timelineDate}>{a.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'cotizaciones' && (
              <div className={styles.cotizacionesList}>
                {c.cotizaciones.length === 0 ? (
                  <p className={styles.emptySmall}>Sin cotizaciones</p>
                ) : (
                  c.cotizaciones.map(cot => (
                    <div key={cot.id} className={styles.cotizacionCard}>
                      <div className={styles.cotizacionHeader}>
                        <span className={styles.cotizacionTitle}>{cot.description}</span>
                        <span className={`${styles.cotStatus} ${styles[`cotStatus${cot.status.charAt(0).toUpperCase() + cot.status.slice(1)}`]}`}>
                          {cot.status === 'pendiente' ? 'Pendiente' : cot.status === 'aprobada' ? 'Aprobada' : cot.status === 'rechazada' ? 'Rechazada' : 'Convertida'}
                        </span>
                      </div>
                      <div className={styles.cotizacionMeta}>
                        <span>S/ {cot.amount.toLocaleString()}</span>
                        <span>{cot.items} ítem(s)</span>
                        <span>{cot.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'actividad' && (
              <div className={styles.timeline}>
                {c.activity.length === 0 ? (
                  <p className={styles.emptySmall}>Sin actividad reciente</p>
                ) : (
                  c.activity.map(a => (
                    <div key={a.id} className={styles.timelineItem}>
                      <div className={`${styles.timelineDot} ${styles[`tlDot${a.type.charAt(0).toUpperCase() + a.type.slice(1)}`] || ''}`}>
                        {activityIcon(a.type)}
                      </div>
                      <div className={styles.timelineContent}>
                        <span className={styles.timelineTitle}>{a.description}</span>
                        {a.amount && <span className={styles.timelineAmount}>S/ {a.amount.toLocaleString()}</span>}
                        <span className={styles.timelineDate}>{a.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'notas' && (
              <div className={styles.notasList}>
                {c.notas.length === 0 ? (
                  <p className={styles.emptySmall}>Sin notas registradas</p>
                ) : (
                  c.notas.map(n => (
                    <div key={n.id} className={styles.notaCard}>
                      <p className={styles.notaText}>{n.content}</p>
                      <div className={styles.notaMeta}>
                        <span className={styles.notaAuthor}>{n.author}</span>
                        <span className={styles.notaDate}>{n.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteProfile;
