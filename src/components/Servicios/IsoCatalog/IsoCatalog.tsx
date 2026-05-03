import { FaAward, FaLeaf, FaHardHat, FaShieldAlt, FaHandshake, FaBolt } from "react-icons/fa";
import styles from "./IsoCatalog.module.scss";

const isoData = [
  { id: 1, title: "ISO 9001", name: "Gestión de la Calidad", description: "Demuestra tu compromiso con la calidad y la satisfacción del cliente en cada proceso.", icon: <FaAward /> },
  { id: 2, title: "ISO 14001", name: "Gestión Ambiental", description: "Mejora tu desempeño ambiental y cumple con todas las normativas ecológicas vigentes.", icon: <FaLeaf /> },
  { id: 3, title: "ISO 45001", name: "Seguridad y Salud", description: "Garantiza un entorno de trabajo seguro, protegiendo a tus empleados y reduciendo riesgos laborales.", icon: <FaHardHat /> },
  { id: 4, title: "ISO 27001", name: "Seguridad de la Información", description: "Protege los datos sensibles de tu empresa y tus clientes con los más altos estándares.", icon: <FaShieldAlt /> },
  { id: 5, title: "ISO 37001", name: "Gestión Antisoborno", description: "Previene, detecta y enfrenta de forma eficaz el soborno en tus operaciones comerciales.", icon: <FaHandshake /> },
  { id: 6, title: "ISO 50001", name: "Gestión de la Energía", description: "Optimiza el uso de la energía, reduce costos operativos y promueve la sostenibilidad.", icon: <FaBolt /> },
];

const IsoCatalog = () => {
  return (
    <section className={styles.catalogSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Catálogo de Certificaciones ISO</h2>
          <div className={styles.divider}></div>
          <p>Impulsa el crecimiento, la credibilidad y el prestigio de tu empresa con nuestras certificaciones internacionales. Selecciona la norma que mejor se adapte a tus necesidades empresariales.</p>
        </div>
        
        <div className={styles.grid}>
          {isoData.map((iso) => (
            <article key={iso.id} className={styles.card}>
              <div className={styles.iconWrapper}>{iso.icon}</div>
              <h3>{iso.title}</h3>
              <h4>{iso.name}</h4>
              <p>{iso.description}</p>
              <button className={styles.ctaButton}>Solicitar Presupuesto</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IsoCatalog;
