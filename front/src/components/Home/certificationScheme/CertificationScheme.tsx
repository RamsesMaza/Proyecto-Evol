import styles from './CertificationScheme.module.scss';
import schemeImg from '../../../assets/img/esquema-certificacion.webp'; 
import { FaFilePdf } from 'react-icons/fa'; 

const CertificationScheme = () => {
  return (
    <section className={styles.scheme}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h2>Conoce nuestro Esquema de Certificación</h2>
          <div className={styles.line}></div>
        </div>

        <div className={styles.diagramContainer}>
          <img src={schemeImg} alt="Esquema de Certificación" />
        </div>

        <div className={styles.downloadSection}>
          <div className={styles.info}>
            <h3>Procedimiento de Decisión de Certificación</h3>
            <div className={styles.shortLine}></div>
            <p>
              Este documento detalla los procesos para otorgar, rechazar, mantener, 
              renovar, suspender, restaurar o retirar la certificación.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <FaFilePdf />
            </div>
            <span className={styles.fileName}>PO03-PR-01 Decisión_V02</span>
            <a href="#" className={styles.downloadBtn}>
              Descargar aquí!
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CertificationScheme;