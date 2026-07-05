import { useState, useEffect } from 'react';
import { FaTrophy, FaDownload, FaSearch, FaTimes, FaExternalLinkAlt, FaCalendarAlt, FaGraduationCap, FaAward, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { fetchMyCertificates, type Certificate } from '../../../services/certificatesApi';
import styles from './Certificates.module.scss';

const COLORS = ['#dc2626', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const genCertSvg = (title: string, description: string, issuer: string, date: string, credentialId: string, idx: number) => {
  const color = COLORS[idx % COLORS.length];
  const dateStr = new Date(date).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
    <rect width="800" height="560" fill="#fff"/>
    <rect x="20" y="20" width="760" height="520" rx="16" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="6,4"/>
    <rect x="30" y="30" width="740" height="500" rx="12" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
    <rect x="0" y="0" width="800" height="100" fill="${color}" opacity="0.05"/>
    <text x="400" y="58" text-anchor="middle" font-family="Poppins, sans-serif" font-size="22" font-weight="800" fill="${color}" letter-spacing="4">CERTIFICADO</text>
    <text x="400" y="82" text-anchor="middle" font-family="Poppins, sans-serif" font-size="10" font-weight="500" fill="#94a3b8" letter-spacing="3">DE RECONOCIMIENTO</text>
    <text x="400" y="155" text-anchor="middle" font-family="Poppins, sans-serif" font-size="26" font-weight="700" fill="#0f172a">${escapeXml(title)}</text>
    <text x="400" y="195" text-anchor="middle" font-family="Poppins, sans-serif" font-size="13" fill="#64748b">${description ? escapeXml(description) : 'Reconocimiento otorgado por su participación'}</text>
    <text x="400" y="240" text-anchor="middle" font-family="Poppins, sans-serif" font-size="11" fill="#94a3b8">Emitido por</text>
    <text x="400" y="265" text-anchor="middle" font-family="Poppins, sans-serif" font-size="16" font-weight="700" fill="${color}">${escapeXml(issuer)}</text>
    <line x1="200" y1="370" x2="600" y2="370" stroke="#e2e8f0" stroke-width="1"/>
    <text x="400" y="350" text-anchor="middle" font-family="Poppins, sans-serif" font-size="10" fill="#94a3b8">FECHA DE EMISIÓN</text>
    <text x="400" y="395" text-anchor="middle" font-family="Poppins, sans-serif" font-size="13" font-weight="600" fill="#0f172a">${escapeXml(dateStr)}</text>
    <text x="400" y="430" text-anchor="middle" font-family="Poppins, sans-serif" font-size="10" fill="#94a3b8">CREDENTIAL ID: ${escapeXml(credentialId)}</text>
    <circle cx="400" cy="500" r="18" fill="${color}" opacity="0.1"/>
    <text x="400" y="505" text-anchor="middle" font-family="Poppins, sans-serif" font-size="14" fill="${color}">&#9733;</text>
  </svg>`;
};

const svgToDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const Certificates = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMyCertificates()
      .then(setCerts)
      .catch(() => setError('Error al cargar certificados'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = certs.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className={styles.wrapper}><div className={styles.loading}><FaSpinner className={styles.spinner} /> Cargando certificados...</div></div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}><FaAward /></div>
          <div>
            <h1 className={styles.headerTitle}>Mis Certificados</h1>
            <p className={styles.headerSub}>Todos tus certificados emitidos</p>
          </div>
        </div>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} type="text" placeholder="Buscar certificados..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div className={styles.errorMsg}><FaExclamationTriangle /> {error}</div>}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaTrophy /></div>
          <h3 className={styles.emptyTitle}>{search ? 'Sin resultados' : 'Aún no tienes certificados'}</h3>
          <p className={styles.emptyText}>{search ? 'Intenta con otro término de búsqueda' : 'Cuando recibas un certificado, aparecerá aquí'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((cert, idx) => {
            const svg = genCertSvg(cert.title, cert.description || '', cert.issuer, cert.createdAt, cert.credentialId, idx);
            return (
              <div key={cert.id} className={styles.card} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className={styles.cardThumb} onClick={() => setPreview({ ...cert, imageSvg: svg } as any)}>
                  <img src={svgToDataUrl(svg)} alt={cert.title} className={styles.cardImg} />
                  <div className={styles.cardOverlay}>
                    <FaSearch className={styles.cardOverlayIcon} />
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardBadge} style={{ background: `${COLORS[idx % COLORS.length]}18`, color: COLORS[idx % COLORS.length] }}>
                    <FaGraduationCap /> {cert.issuer}
                  </div>
                  <h3 className={styles.cardTitle}>{cert.title}</h3>
                  <p className={styles.cardCourse}>{cert.description || ''}</p>
                  <div className={styles.cardMeta}>
                    <FaCalendarAlt className={styles.cardMetaIcon} />
                    <span>{new Date(cert.createdAt).toLocaleDateString('es-PE')}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.viewBtn} onClick={() => setPreview({ ...cert, imageSvg: svg } as any)}><FaSearch /> Ver</button>
                    <button className={styles.downloadBtn} onClick={() => downloadCert(svg, cert.title)}><FaDownload /> Descargar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div className={styles.modalOverlay} onClick={() => setPreview(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalToolbar}>
              <span className={styles.modalTitle}>{preview.title}</span>
              <div className={styles.modalActions}>
                <button className={styles.modalBtn} onClick={() => downloadCert((preview as any).imageSvg, preview.title)}><FaDownload /> Descargar</button>
                <button className={styles.modalClose} onClick={() => setPreview(null)}><FaTimes /></button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <img src={svgToDataUrl((preview as any).imageSvg)} alt={preview.title} className={styles.modalImg} />
              <div className={styles.modalInfo}>
                {preview.description && (
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalInfoLabel}>{preview.description}</span>
                  </div>
                )}
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>Emisor</span>
                  <span className={styles.modalInfoValue}>{preview.issuer}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalInfoLabel}>Emisión</span>
                    <span className={styles.modalInfoValue}>{new Date(preview.createdAt).toLocaleDateString('es-PE')}</span>
                  </div>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>Credencial</span>
                  <span className={styles.modalInfoValue}>{preview.credentialId} <FaExternalLinkAlt className={styles.credIcon} /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const downloadCert = (svg: string, title: string) => {
  const link = document.createElement('a');
  link.href = svgToDataUrl(svg);
  link.download = `${title.replace(/\s+/g, '_')}.svg`;
  link.click();
};

export default Certificates;
