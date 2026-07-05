import { FaBook, FaFilePowerpoint, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import styles from './AuditorDashboard.module.scss';

interface Props {
  onNavigate: (key: string) => void;
}

const AuditorDashboard = ({ onNavigate }: Props) => (
  <div className={styles.wrapper}>
    <div className={styles.header}>
      <h1 className={styles.title}>Panel de Auditoría</h1>
      <p className={styles.subtitle}>Gestiona cursos, módulos y materiales educativos</p>
    </div>
    <div className={styles.grid}>
      <div className={styles.card} onClick={() => onNavigate('cursos')}>
        <div className={styles.cardIcon} style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><FaBook /></div>
        <h3 className={styles.cardTitle}>Cursos</h3>
        <p className={styles.cardDesc}>Crear y gestionar cursos educativos</p>
      </div>
      <div className={styles.card}>
        <div className={styles.cardIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><FaFilePowerpoint /></div>
        <h3 className={styles.cardTitle}>Materiales</h3>
        <p className={styles.cardDesc}>Subir PPTs, PDFs y recursos</p>
      </div>
      <div className={styles.card}>
        <div className={styles.cardIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><FaUsers /></div>
        <h3 className={styles.cardTitle}>Estudiantes</h3>
        <p className={styles.cardDesc}>Visualizar inscripciones y progreso</p>
      </div>
    </div>
  </div>
);

export default AuditorDashboard;
