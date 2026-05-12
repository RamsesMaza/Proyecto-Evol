import { useState, useEffect, useRef } from 'react';
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit,
  FaGlobeAmericas, FaCity, FaMapPin,
  FaGift, FaCreditCard, FaUserCircle,
  FaTimes, FaSave, FaHome, FaBuilding, FaCamera,
  FaCheckCircle, FaStar, FaBook, FaCertificate, FaClock,
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import UserHeader from './UserHeader';
import Sidebar from './Sidebar';
import Calendar from './Calendar/Calendar';
import Certificates from './Certificates/Certificates';
import Courses from './Courses/Courses';
import Messages from './Messages/Messages';
import styles from './UserPanel.module.scss';

interface ProfileData {
  address: string;
  email: string;
  phone: string;
}

interface AccountData {
  firstName: string;
  lastName: string;
  birthday: string;
  gender: string;
}

interface CardData {
  type: string;
  holder: string;
  number: string;
  expiry: string;
  balance: number;
}

interface AddressData {
  address: string;
  city: string;
  country: string;
  department: string;
  district: string;
  zip: string;
}

const defaultProfile: ProfileData = { address: '', email: '', phone: '' };
const defaultAccount: AccountData = { firstName: '', lastName: '', birthday: '', gender: '' };
const defaultCard: CardData = { type: 'Visa', holder: '', number: '', expiry: '', balance: 0 };
const defaultAddress: AddressData = { address: '', city: 'Lima', country: 'Perú', department: '', district: '', zip: '' };

const loadData = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};

const maskCard = (num: string) => {
  const digits = num.replace(/\D/g, '').slice(0, 16);
  if (digits.length < 4) return '****  ****  ****  ****';
  const last4 = digits.slice(-4);
  return `****  ****  ****  ${last4}`;
};

const UserPanel = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editModal, setEditModal] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>(() => loadData('up_profile', defaultProfile));
  const [account, setAccount] = useState<AccountData>(() => loadData('up_account', defaultAccount));
  const [card, setCard] = useState<CardData>(() => loadData('up_card', defaultCard));
  const [address, setAddress] = useState<AddressData>(() => loadData('up_address', defaultAddress));

  const [formProfile, setFormProfile] = useState<ProfileData>(profile);
  const [formAccount, setFormAccount] = useState<AccountData>(account);
  const [formCard, setFormCard] = useState<CardData>(card);
  const [formAddress, setFormAddress] = useState<AddressData>(address);

  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem('up_avatar') || '');
  const [successMsg, setSuccessMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => { setEntered(true); }, []);

  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 2500); return () => clearTimeout(t); } }, [successMsg]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      localStorage.setItem('up_avatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user) {
      setProfile(prev => ({ ...prev, email: user.email || prev.email }));
      setAccount(prev => ({ ...prev, firstName: user.firstName || prev.firstName, lastName: user.lastName || prev.lastName }));
    }
  }, [user]);

  useEffect(() => { localStorage.setItem('up_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('up_account', JSON.stringify(account)); }, [account]);
  useEffect(() => { localStorage.setItem('up_card', JSON.stringify(card)); }, [card]);
  useEffect(() => { localStorage.setItem('up_address', JSON.stringify(address)); }, [address]);

  const openEdit = (section: string) => {
    if (section === 'profile') setFormProfile(profile);
    if (section === 'account') setFormAccount(account);
    if (section === 'card') setFormCard(card);
    if (section === 'address') setFormAddress(address);
    setEditModal(section);
  };

  const saveEdit = () => {
    if (editModal === 'profile') setProfile(formProfile);
    if (editModal === 'account') setAccount(formAccount);
    if (editModal === 'card') setCard(formCard);
    if (editModal === 'address') setAddress(formAddress);
    setEditModal(null);
    setSuccessMsg('Cambios guardados correctamente');
  };

  const updateForm = (section: string, field: string, value: string | number) => {
    const setters: Record<string, React.Dispatch<React.SetStateAction<any>>> = {
      profile: setFormProfile, account: setFormAccount, card: setFormCard, address: setFormAddress,
    };
    setters[section]?.((prev: any) => ({ ...prev, [field]: value }));
  };

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : 'U';
  const displayEmail = user?.email || profile.email || 'No especificado';
  const displayPhone = user?.phone || profile.phone || 'No especificado';
  const displayAddress = profile.address || address.address || 'No especificado';
  const displayFirstName = account.firstName || user?.firstName || '—';
  const displayLastName = account.lastName || user?.lastName || '—';
  const displayCardNum = card.number ? maskCard(card.number) : '****  ****  ****  ****';

  const modalContent = () => {
    if (!editModal) return null;

    const fields: { key: string; label: string; type?: string; placeholder?: string }[] = [];
    const setter = (k: string, v: string | number) => updateForm(editModal, k, v);
    let data: Record<string, any> = {};

    if (editModal === 'profile') { data = formProfile; fields.push({ key: 'email', label: 'Correo', type: 'email' }, { key: 'phone', label: 'Teléfono', type: 'tel' }, { key: 'address', label: 'Dirección' }); }
    if (editModal === 'account') { data = formAccount; fields.push({ key: 'firstName', label: 'Nombre' }, { key: 'lastName', label: 'Apellidos' }, { key: 'birthday', label: 'Fecha de Nacimiento', type: 'date' }, { key: 'gender', label: 'Género', type: 'select' }); }
    if (editModal === 'card') { data = formCard; fields.push({ key: 'type', label: 'Tipo de Tarjeta' }, { key: 'holder', label: 'Titular' }, { key: 'number', label: 'Número', type: 'text' }, { key: 'expiry', label: 'Vencimiento', placeholder: 'MM/AA' }, { key: 'balance', label: 'Balance', type: 'number' }); }
    if (editModal === 'address') { data = formAddress; fields.push({ key: 'address', label: 'Dirección' }, { key: 'city', label: 'Ciudad' }, { key: 'department', label: 'Departamento' }, { key: 'district', label: 'Distrito' }, { key: 'country', label: 'País' }, { key: 'zip', label: 'Código Postal' }); }

    return (
      <div className={styles.modalOverlay} onClick={() => setEditModal(null)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Editar {editModal === 'profile' ? 'Perfil' : editModal === 'account' ? 'Cuenta' : editModal === 'card' ? 'Tarjeta' : 'Dirección'}</h3>
            <button className={styles.modalClose} onClick={() => setEditModal(null)}><FaTimes /></button>
          </div>
          <div className={styles.modalBody}>
            {fields.map(f => (
              <div key={f.key} className={`${styles.modalField} ${f.type === 'date' ? styles.dateField : ''}`}>
                <label className={styles.modalLabel}>{f.label}</label>
                {f.type === 'date' ? (
                  <DatePicker
                    selected={data[f.key] ? new Date(data[f.key] + 'T00:00:00') : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setter(f.key, `${yyyy}-${mm}-${dd}`);
                      } else {
                        setter(f.key, '');
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/AAAA"
                    className={styles.modalInput}
                    wrapperClassName={styles.datePickerWrap}
                    popperClassName={styles.datePopper}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                ) : f.type === 'select' ? (
                  <select className={styles.modalSelect} value={data[f.key] ?? ''} onChange={e => setter(f.key, e.target.value)}>
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                ) : (
                  <input
                    className={styles.modalInput}
                    type={f.type || 'text'}
                    value={data[f.key] ?? ''}
                    onChange={e => setter(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    placeholder={f.placeholder || ''}
                  />
                )}
              </div>
            ))}
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.modalBtnSecondary} onClick={() => setEditModal(null)}>Cancelar</button>
            <button className={styles.modalBtnPrimary} onClick={saveEdit}><FaSave /> Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.layout}>
      <Sidebar active={activeSection} onSelect={setActiveSection} collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        <UserHeader />
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
          <span /><span /><span />
        </button>

        <div className={styles.content}>
          {activeSection === 'inicio' && (
            <>
              <div className={styles.welcomeHeader}>
                <div className={styles.welcomeAccent} />
                <div className={styles.welcomeContent}>
                  <span className={styles.welcomeGreet}>Bienvenido de nuevo</span>
                  <h1 className={styles.welcomeTitle}>{user?.firstName || 'Usuario'}</h1>
                  <p className={styles.welcomeSub}>Gestiona tu perfil, cursos y más desde tu panel personal</p>
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.statCard}><FaBook className={styles.statIcon} /><div><span className={styles.statNum}>4</span><span className={styles.statLabel}>Cursos</span></div></div>
                <div className={styles.statCard}><FaCertificate className={styles.statIcon} /><div><span className={styles.statNum}>2</span><span className={styles.statLabel}>Certificados</span></div></div>
                <div className={styles.statCard}><FaStar className={styles.statIcon} /><div><span className={styles.statNum}>1,280</span><span className={styles.statLabel}>Puntos</span></div></div>
                <div className={styles.statCard}><FaClock className={styles.statIcon} /><div><span className={styles.statNum}>12</span><span className={styles.statLabel}>Horas</span></div></div>
              </div>

            <div className={styles.gridContainer}>
              {/* Item 1 - Profile */}
              <div className={`${styles.item1} ${entered ? styles.itemEnter : ''}`} style={{ animationDelay: '0s' }}>
                <button className={styles.gridEditBtn} onClick={() => openEdit('profile')}><FaEdit /></button>
                <div className={styles.avatarWrap}>
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className={styles.profileAvatarLarge} />
                  ) : (
                    <div className={styles.profileAvatarLarge}>{initials}</div>
                  )}
                  <button className={styles.avatarOverlay} onClick={() => fileRef.current?.click()} title="Cambiar foto">
                    <FaCamera />
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                <h2 className={styles.gridProfileName}>{displayFirstName} {displayLastName}</h2>
                <span className={styles.profileBadge}><FaStar /> Premium</span>
                <div className={styles.profileMeta}>
                  <FaClock /> Miembro desde 2024
                </div>
                <div className={styles.gridProfileInfo}>
                  <div className={styles.profileInfoItem}>
                    <span className={styles.profileInfoIcon}><FaEnvelope /></span>
                    <span className={styles.profileInfoText}>{displayEmail}</span>
                  </div>
                  <div className={styles.profileInfoItem}>
                    <span className={styles.profileInfoIcon}><FaPhone /></span>
                    <span className={styles.profileInfoText}>{displayPhone}</span>
                  </div>
                  <div className={styles.profileInfoItem}>
                    <span className={styles.profileInfoIcon}><FaMapMarkerAlt /></span>
                    <span className={styles.profileInfoText}>{displayAddress}</span>
                  </div>
                </div>
              </div>

              {/* Item 2 - Account Details */}
              <div className={`${styles.item2} ${entered ? styles.itemEnter : ''}`} style={{ animationDelay: '0.05s' }}>
                <button className={styles.gridEditBtn} onClick={() => openEdit('account')}><FaEdit /></button>
                <div className={styles.itemHeader}>
                  <FaUserCircle className={styles.itemIcon} />
                  <h3 className={styles.gridItemTitle}>Detalles de Cuenta</h3>
                </div>
                <div className={styles.gridItemBody}>
                  <div className={styles.gridField}><span className={styles.gridLabel}>Nombre</span><span className={styles.gridValue}>{displayFirstName}</span></div>
                  <div className={styles.gridField}><span className={styles.gridLabel}>Apellidos</span><span className={styles.gridValue}>{displayLastName}</span></div>
                  <div className={styles.gridField}><span className={styles.gridLabel}>Cumpleaños</span><span className={styles.gridValue}>{account.birthday || '—'}</span></div>
                  <div className={styles.gridField}><span className={styles.gridLabel}>Género</span><span className={`${styles.genderBadge} ${account.gender === 'Masculino' ? styles.genderM : account.gender === 'Femenino' ? styles.genderF : ''}`}>{account.gender || '—'}</span></div>
                </div>
              </div>

              {/* Item 3 - Payment Method */}
              <div className={`${styles.item3} ${entered ? styles.itemEnter : ''}`} style={{ animationDelay: '0.1s' }}>
                <button className={styles.gridEditBtn} onClick={() => openEdit('card')}><FaEdit /></button>
                <div className={styles.itemHeader}>
                  <FaCreditCard className={styles.itemIcon} />
                  <h3 className={styles.gridItemTitle}>Método de Pago</h3>
                </div>
                <div className={styles.creditCard}>
                  <div className={styles.ccTop}>
                    <div className={styles.ccChip} />
                    <div className={styles.ccBrand}>
                      {card.type === 'mastercard' ? 'Mastercard' : card.type === 'visa' ? 'Visa' : card.type || 'Visa'}
                    </div>
                  </div>
                  <div className={styles.ccNumber}>{displayCardNum}</div>
                  <div className={styles.ccRow}>
                    <div><span className={styles.ccLabel}>Titular</span><span className={styles.ccValue}>{card.holder || '—'}</span></div>
                    <div><span className={styles.ccLabel}>Vence</span><span className={styles.ccValue}>{card.expiry || '—'}</span></div>
                    <div><span className={styles.ccLabel}>CVV</span><span className={styles.ccValue}>***</span></div>
                  </div>
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardInfoItem}>
                    <span className={styles.cardInfoLabel}>Tipo</span>
                    <span className={styles.cardInfoValue}>{card.type || 'Visa'}</span>
                  </div>
                  <div className={styles.cardInfoDivider} />
                  <div className={styles.cardInfoItem}>
                    <span className={styles.cardInfoLabel}>Estado</span>
                    <span className={styles.cardInfoStatus}>Activa</span>
                  </div>
                  <div className={styles.cardInfoDivider} />
                  <div className={styles.cardInfoItem}>
                    <span className={styles.cardInfoLabel}>Pagos</span>
                    <span className={styles.cardInfoValue}>—</span>
                  </div>
                </div>
              </div>

              {/* Item 4 - Purchase Data */}
              <div className={`${styles.item4} ${entered ? styles.itemEnter : ''}`} style={{ animationDelay: '0.15s' }}>
                <button className={styles.gridEditBtn} onClick={() => openEdit('address')}><FaEdit /></button>
                <div className={styles.itemHeader}>
                  <FaMapMarkerAlt className={styles.itemIcon} />
                  <h3 className={styles.gridItemTitle}>Datos de Compra</h3>
                </div>
                <div className={styles.addressGrid}>
                  <div className={styles.addressItem}>
                    <span className={styles.addressLabel}><FaHome /> Dirección</span>
                    <span className={styles.addressValue}>{address.address || '—'}</span>
                  </div>
                  <div className={styles.addressItem}>
                    <span className={styles.addressLabel}><FaCity /> Ciudad</span>
                    <span className={styles.addressValue}>{address.city || '—'}</span>
                  </div>
                  <div className={styles.addressItem}>
                    <span className={styles.addressLabel}><FaGlobeAmericas /> País</span>
                    <span className={styles.addressValue}>{address.country || '—'}</span>
                  </div>
                  <div className={styles.addressItem}>
                    <span className={styles.addressLabel}><FaBuilding /> Departamento</span>
                    <span className={styles.addressValue}>{address.department || '—'}</span>
                  </div>
                  <div className={styles.addressItem}>
                    <span className={styles.addressLabel}><FaMapMarkerAlt /> Distrito</span>
                    <span className={styles.addressValue}>{address.district || '—'}</span>
                  </div>
                  <div className={styles.addressItem}>
                    <span className={styles.addressLabel}><FaMapPin /> Código Postal</span>
                    <span className={styles.addressValue}>{address.zip || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Item 5 - Offers */}
              <div className={`${styles.item5} ${entered ? styles.itemEnter : ''}`} style={{ animationDelay: '0.2s' }}>
                <div className={styles.offersHeader}>
                  <FaGift className={styles.offersIconSmall} />
                  <h3 className={styles.offersTitle}>Ofertas y Beneficios</h3>
                </div>
                <div className={styles.offersList}>
                  <div className={styles.offerCard}>
                    <div className={styles.offerDot} />
                    <div className={styles.offerContent}>
                      <span className={styles.offerName}>Descuento en cursos premium</span>
                      <span className={styles.offerStatus}>Próximamente</span>
                    </div>
                  </div>
                  <div className={styles.offerCard}>
                    <div className={styles.offerDot} />
                    <div className={styles.offerContent}>
                      <span className={styles.offerName}>Acceso a webinar exclusivo</span>
                      <span className={styles.offerStatus}>Próximamente</span>
                    </div>
                  </div>
                  <div className={styles.offerCard}>
                    <div className={styles.offerDot} />
                    <div className={styles.offerContent}>
                      <span className={styles.offerName}>Certificación gratuita</span>
                      <span className={styles.offerStatus}>Próximamente</span>
                    </div>
                  </div>
                </div>
                <p className={styles.offersFoot}>Estamos preparando más beneficios para ti</p>
              </div>
            </div>
            </>
          )}

          {activeSection === 'calendario' && <Calendar />}

          {activeSection === 'certificados' && <Certificates />}

          {activeSection === 'cursos' && <Courses />}

          {activeSection === 'mensajes' && <Messages />}
        </div>
      </div>

      {modalContent()}

      {successMsg && (
        <div className={styles.toast}>
          <FaCheckCircle /> {successMsg}
        </div>
      )}
    </div>
  );
};

export default UserPanel;
