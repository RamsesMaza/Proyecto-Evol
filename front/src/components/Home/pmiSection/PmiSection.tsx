import styles from './pmiSection.module.scss';
import pmiImg from '../../../assets/img/pmi.webp';
import badge from '../../../assets/img/pmi-badge.webp';

const PmiSection = () => {
  const courses = [
    "Gerencia de proyectos de construcción bajo el enfoque PMI",
    "Dirección de proyectos en servicios de ingeniería y arquitectura",
    "Gestión de planeamiento y control de proyectos",
    "Profesional en Gestión de Proyectos (PMP)",
    "PMI Agile Certified Practitioner (PMI-ACP)",
    "Certified Associate in Project Management (CAPM)",
    "Program Management Professional (PgMP)",
    "PMI Construction Professional (PMI-CP)"
  ];

  return (
    <section className={styles.pmi}>
      <div className={styles.container}>
        
        <div className={styles.left}>
          <h2>¿Gestionas proyectos ahora, aspiras a dirigirlos o quieres ingresar al mundo de la Dirección de Proyectos?</h2>
          
          <p>
            Nuestros cursos PMI en ACS están pensados para profesionales como tú, 
            listos para potenciar competencias y destacar en el mercado laboral.
          </p>

          <h3>Cursos Disponibles</h3>

          <ul>
            {courses.map((course, index) => (
              <li key={index}>{course}</li>
            ))}
          </ul>

          <div className={styles.footer}>
            <img src={badge} alt="PMI Authorized Training Partner" />
            <a href="#cursos" className={styles.btn}>
              Explorar Catálogo
            </a>
          </div>
        </div>

        <div className={styles.right}>
          <img src={pmiImg} alt="Equipo de gestión de proyectos" />
        </div>

      </div>
    </section>
  );
};

export default PmiSection;