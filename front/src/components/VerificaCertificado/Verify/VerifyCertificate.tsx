import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCertificate, FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaClock, FaBook, FaAward, FaBuilding } from 'react-icons/fa';
import { verifyCertificate, type VerifyResponse } from '../../../services/certificatesApi';
import styles from './VerifyCertificate.module.scss';

const VerifyCertificatePage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setSearched(false);
    try {
      const res = await verifyCertificate(code.trim());
      setResult(res);
    } catch {
      setResult({ valid: false, error: 'Error al verificar el certificado' });
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const cert = result?.certificate;

  return (
    <section className={styles.verifyCertificate}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Verifica tu Certificado</h1>
          <div className={styles.line}></div>
          <nav className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link> / <span>Verifica tu Certificado</span>
          </nav>
        </header>

        <div className={styles.content}>
          <p>
            Ingrese el código de seguridad de su certificado para validar su
            autenticidad en nuestra base de datos global.
          </p>

          <form className={styles.verifyForm} onSubmit={handleSearch}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <FaCertificate className={styles.iconInput} />
                <input
                  type="text"
                  placeholder="Ej: ACS-XXXXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.btn} disabled={loading}>
                <FaSearch /> {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </form>

          {loading && (
            <div className={styles.resultCard}>
              <div className={styles.spinner} />
              <p>Verificando certificado...</p>
            </div>
          )}

          {searched && !loading && result && !result.valid && (
            <div className={`${styles.resultCard} ${styles.resultInvalid}`}>
              <div className={styles.resultIcon}>
                <FaTimesCircle />
              </div>
              <h3>Certificado no encontrado</h3>
              <p>El código ingresado no corresponde a ningún certificado válido en nuestro sistema.</p>
            </div>
          )}

          {searched && !loading && result?.valid && cert && (
            <div className={`${styles.resultCard} ${styles.resultValid}`}>
              <div className={styles.resultIcon}>
                <FaCheckCircle />
              </div>
              <h3>Certificado Válido</h3>
              <div className={styles.certGrid}>
                <div className={styles.certField}>
                  <FaCertificate /> <span>Título:</span>
                  <strong>{cert.title}</strong>
                </div>
                {cert.description && (
                  <div className={styles.certField}>
                    <FaBook /> <span>Descripción:</span>
                    <strong>{cert.description}</strong>
                  </div>
                )}
                <div className={styles.certField}>
                  <FaUser /> <span>Titular:</span>
                  <strong>{cert.user?.firstName} {cert.user?.lastName}</strong>
                </div>
                <div className={styles.certField}>
                  <FaAward /> <span>Emisor:</span>
                  <strong>{cert.issuer}</strong>
                </div>
                <div className={styles.certField}>
                  <FaCalendarAlt /> <span>Emisión:</span>
                  <strong>{new Date(cert.issueDate).toLocaleDateString()}</strong>
                </div>
                {cert.expiryDate && (
                  <div className={styles.certField}>
                    <FaCalendarAlt /> <span>Vencimiento:</span>
                    <strong>{new Date(cert.expiryDate).toLocaleDateString()}</strong>
                  </div>
                )}
                {cert.course && (
                  <div className={styles.certField}>
                    <FaBook /> <span>Curso:</span>
                    <strong>{cert.course}</strong>
                  </div>
                )}
                {cert.hours && (
                  <div className={styles.certField}>
                    <FaClock /> <span>Horas:</span>
                    <strong>{cert.hours}h</strong>
                  </div>
                )}
                <div className={styles.certField}>
                  <FaBuilding /> <span>Código:</span>
                  <strong>{cert.credentialId}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VerifyCertificatePage;
