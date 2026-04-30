import { Link } from 'react-router-dom';
import { FaClipboardList, FaExchangeAlt, FaSearch, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import styles from './SolicitudesLanding.module.scss';

const options = [
  {
    number: '01', icon: <FaClipboardList />,
    eyebrow: 'Certificación ISO',
    title: 'Solicitar Servicios',
    description: 'Inicia tu proceso de certificación bajo estándares internacionales ISO. Un asesor certificado te guiará en cada etapa del proceso.',
    benefits: ['Evaluación inicial sin costo', 'Asesor certificado dedicado', 'Plan de certificación personalizado', 'Soporte integral durante el proceso'],
    path: '/solicitudes/servicios', cta: 'Solicitar ahora',
  },
  {
    number: '02', icon: <FaExchangeAlt />,
    eyebrow: 'Cambia de organismo',
    title: 'Transferencia de Certificación',
    description: '¿Ya tienes una certificación ISO con otro organismo? Transfiere a ACS de manera ágil, manteniendo la vigencia de tu certificado.',
    benefits: ['Proceso simplificado y ágil', 'Sin pérdida de vigencia', 'Reconocimiento INACAL', 'Transición sin interrupciones'],
    path: '/solicitudes/transferencia', cta: 'Transferir mi certificado',
  },
  {
    number: '03', icon: <FaSearch />,
    eyebrow: 'Servicios especializados',
    title: 'Otras Auditorías',
    description: 'Auditorías de segunda parte, evaluación de proveedores, pre-auditorías y más servicios especializados de evaluación de conformidad.',
    benefits: ['Auditorías a proveedores', 'Evaluación de cumplimiento normativo', 'Pre-auditorías de certificación', 'Auditorías de debida diligencia'],
    path: '/solicitudes/auditorias', cta: 'Explorar opciones',
  },
];

const SolicitudesLanding = () => {
  return (
    <div className={styles.solicitudes}>
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>American Certification Service</span>
          <h1>Solicitudes</h1>
          <p>Selecciona el tipo de servicio que necesitas. Nuestros expertos te atenderán de forma personalizada.</p>
          <nav className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link><span>/</span><span>Solicitudes</span>
          </nav>
        </div>
      </section>

      <section className={styles.cardsSection}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {options.map((opt, i) => (
              <article key={i} className={styles.card}>
                <div className={styles.cardAccent} />
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>{opt.number}</span>
                  <div className={styles.cardIcon}>{opt.icon}</div>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardEyebrow}>{opt.eyebrow}</p>
                  <h2>{opt.title}</h2>
                  <p className={styles.cardDesc}>{opt.description}</p>
                  <ul className={styles.benefits}>
                    {opt.benefits.map((b, j) => (
                      <li key={j}><FaCheckCircle /><span>{b}</span></li>
                    ))}
                  </ul>
                </div>
                <div className={styles.cardFooter}>
                  <Link to={opt.path} className={styles.btn}>
                    {opt.cta} <FaArrowRight />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div className={styles.container}>
          <h2>¿No sabes qué servicio necesitas?</h2>
          <p>Contáctanos directamente y un asesor te orientará sin compromiso.</p>
          <a href="https://wa.me/51958358020" target="_blank" rel="noreferrer" className={styles.ctaBtn}>
            Hablar con un asesor
          </a>
        </div>
      </section>
    </div>
  );
};

export default SolicitudesLanding;
