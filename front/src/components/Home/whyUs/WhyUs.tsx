import styles from "./WhyUs.module.scss";
import { FaThumbsUp, FaUsers } from "react-icons/fa";
import { GiPeru } from "react-icons/gi";

const WhyUs = () => {
  return (
    <section className={styles.whyUs}>
      <h2>¿Por qué trabajar con nosotros?</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <GiPeru />
          <h3>Organismo Peruano</h3>
          <p>
            Garantizamos eficiencia, confianza e imparcialidad en nuestras
            auditorías de Certificación con estándares de nivel internacional.
          </p>
        </div>

        <div className={styles.card}>
          <FaThumbsUp />
          <h3>Nuestra Experiencia</h3>
          <p>
            Contamos con staff de auditores competentes y calificados con
            certificaciones nacionales e internacionales.
          </p>
        </div>

        <div className={styles.card}>
          <FaUsers />
          <h3>Nuestro Compromiso</h3>
          <p>
            ACS es una empresa de calidad donde aplicamos confianza,
            imparcialidad, competencia e integridad a nuestros clientes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;