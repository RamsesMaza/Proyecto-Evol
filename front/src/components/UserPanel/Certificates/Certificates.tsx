import { useState, useEffect } from 'react';
import { FaTrophy, FaDownload, FaSearch, FaTimes, FaExternalLinkAlt, FaCalendarAlt, FaGraduationCap, FaAward } from 'react-icons/fa';
import styles from './Certificates.module.scss';

interface Certificate {
  id: string;
  title: string;
  course: string;
  issuer: string;
  date: string;
  description: string;
  credentialId: string;
  imageSvg: string;
}

const COLORS = ['#dc2626', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

const genCertSvg = (name: string, course: string, date: string, idx: number) => {
  const color = COLORS[idx % COLORS.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
    <rect width="800" height="560" fill="#fff"/>
    <rect x="20" y="20" width="760" height="520" rx="16" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="6,4"/>
    <rect x="30" y="30" width="740" height="500" rx="12" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
    <rect x="0" y="0" width="800" height="100" fill="${color}" opacity="0.05"/>
    <text x="400" y="58" text-anchor="middle" font-family="Poppins, sans-serif" font-size="22" font-weight="800" fill="${color}" letter-spacing="4">CERTIFICADO</text>
    <text x="400" y="82" text-anchor="middle" font-family="Poppins, sans-serif" font-size="10" font-weight="500" fill="#94a3b8" letter-spacing="3">DE FINALIZACIÓN</text>
    <text x="400" y="160" text-anchor="middle" font-family="Poppins, sans-serif" font-size="28" font-weight="700" fill="#0f172a">${escapeXml(name)}</text>
    <text x="400" y="200" text-anchor="middle" font-family="Poppins, sans-serif" font-size="14" fill="#64748b">Ha completado satisfactoriamente el curso</text>
    <text x="400" y="245" text-anchor="middle" font-family="Poppins, sans-serif" font-size="20" font-weight="700" fill="${color}">${escapeXml(course)}</text>
    <text x="400" y="285" text-anchor="middle" font-family="Poppins, sans-serif" font-size="12" fill="#94a3b8">con una duración de 40 horas académicas</text>
    <line x1="200" y1="380" x2="600" y2="380" stroke="#e2e8f0" stroke-width="1"/>
    <text x="400" y="360" text-anchor="middle" font-family="Poppins, sans-serif" font-size="10" fill="#94a3b8">FECHA DE EMISIÓN</text>
    <text x="400" y="405" text-anchor="middle" font-family="Poppins, sans-serif" font-size="13" font-weight="600" fill="#0f172a">${escapeXml(date)}</text>
    <text x="400" y="440" text-anchor="middle" font-family="Poppins, sans-serif" font-size="10" fill="#94a3b8">CREDENCIAL ID: ${Math.random().toString(36).slice(2, 10).toUpperCase()}</text>
    <circle cx="400" cy="500" r="18" fill="${color}" opacity="0.1"/>
    <text x="400" y="505" text-anchor="middle" font-family="Poppins, sans-serif" font-size="14" fill="${color}">&#9733;</text>
  </svg>`;
};

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const svgToDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const defaultCerts: Certificate[] = [
  { id: '1', title: 'ISO 9001:2015 — Gestión de Calidad', course: 'Sistema de Gestión de Calidad — Implementación y Auditoría Interna', issuer: 'ACS Academy', date: '15 Marzo 2026', description: 'Formación completa en normas ISO 9001:2015 para la implementación, mantenimiento y auditoría de sistemas de gestión de calidad.', credentialId: '', imageSvg: '' },
  { id: '2', title: 'ISO 14001:2015 — Gestión Ambiental', course: 'Sistema de Gestión Ambiental —Normativa y Sostenibilidad', issuer: 'ACS Academy', date: '28 Febrero 2026', description: 'Gestión ambiental empresarial basada en ISO 14001:2015, incluyendo identificación de aspectos ambientales y cumplimiento legal.', credentialId: '', imageSvg: '' },
  { id: '3', title: 'ISO 27001:2022 — Seguridad de la Información', course: 'SGSI — Gestión de Seguridad de la Información', issuer: 'ACS Academy', date: '10 Enero 2026', description: 'Implementación de Sistemas de Gestión de Seguridad de la Información bajo ISO 27001:2022, análisis de riesgos y controles.', credentialId: '', imageSvg: '' },
  { id: '4', title: 'ISO 45001:2018 — Salud y Seguridad Ocupacional', course: 'SG-SST — Gestión de Seguridad y Salud en el Trabajo', issuer: 'ACS Academy', date: '5 Diciembre 2025', description: 'Sistemas de gestión de seguridad y salud ocupacional según ISO 45001:2018, identificación de peligros y evaluación de riesgos.', credentialId: '', imageSvg: '' },
  { id: '5', title: 'ISO 22000:2018 — Seguridad Alimentaria', course: 'Inocuidad Alimentaria — Sistema HACCP e ISO 22000', issuer: 'ACS Academy', date: '20 Noviembre 2025', description: 'Gestión de inocuidad alimentaria bajo ISO 22000:2018, principios HACCP y programas de prerrequisitos.', credentialId: '', imageSvg: '' },
];

const loadCerts = (): Certificate[] => {
  try {
    const raw = localStorage.getItem('up_certificates');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultCerts.map((c, i) => {
    const svg = genCertSvg(c.title, c.course, c.date, i);
    return { ...c, imageSvg: svg, credentialId: `ACS-${Math.random().toString(36).slice(2, 10).toUpperCase()}` };
  });
};

const Certificates = () => {
  const [certs] = useState<Certificate[]>(loadCerts);
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [search, setSearch] = useState('');

  const filtered = certs.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}><FaAward /></div>
          <div>
            <h1 className={styles.headerTitle}>Certificados</h1>
            <p className={styles.headerSub}>Todos tus logros académicos en un solo lugar</p>
          </div>
        </div>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} type="text" placeholder="Buscar certificados..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><FaTrophy /></div>
          <h3 className={styles.emptyTitle}>{search ? 'Sin resultados' : 'Aún no tienes certificados'}</h3>
          <p className={styles.emptyText}>{search ? 'Intenta con otro término de búsqueda' : 'Completa tus cursos para obtener tus certificados aquí'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((cert, idx) => (
            <div key={cert.id} className={styles.card} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className={styles.cardThumb} onClick={() => setPreview(cert)}>
                <img src={svgToDataUrl(cert.imageSvg)} alt={cert.title} className={styles.cardImg} />
                <div className={styles.cardOverlay}>
                  <FaSearch className={styles.cardOverlayIcon} />
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardBadge} style={{ background: `${COLORS[idx % COLORS.length]}18`, color: COLORS[idx % COLORS.length] }}>
                  <FaGraduationCap /> {cert.issuer}
                </div>
                <h3 className={styles.cardTitle}>{cert.title}</h3>
                <p className={styles.cardCourse}>{cert.course}</p>
                <div className={styles.cardMeta}>
                  <FaCalendarAlt className={styles.cardMetaIcon} />
                  <span>{cert.date}</span>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.viewBtn} onClick={() => setPreview(cert)}><FaSearch /> Ver</button>
                  <button className={styles.downloadBtn} onClick={() => downloadCert(cert)}><FaDownload /> Descargar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className={styles.modalOverlay} onClick={() => setPreview(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalToolbar}>
              <span className={styles.modalTitle}>{preview.title}</span>
              <div className={styles.modalActions}>
                <button className={styles.modalBtn} onClick={() => downloadCert(preview)}><FaDownload /> Descargar</button>
                <button className={styles.modalClose} onClick={() => setPreview(null)}><FaTimes /></button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <img src={svgToDataUrl(preview.imageSvg)} alt={preview.title} className={styles.modalImg} />
              <div className={styles.modalInfo}>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>{preview.description}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalInfoLabel}>Curso</span>
                    <span className={styles.modalInfoValue}>{preview.course}</span>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalInfoLabel}>Emisión</span>
                    <span className={styles.modalInfoValue}>{preview.date}</span>
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

const downloadCert = (cert: Certificate) => {
  const link = document.createElement('a');
  link.href = svgToDataUrl(cert.imageSvg);
  link.download = `${cert.title.replace(/\s+/g, '_')}.svg`;
  link.click();
};

export default Certificates;
