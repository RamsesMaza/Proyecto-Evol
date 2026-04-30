import styles from "./Values.module.scss";
import { FaShieldAlt, FaLightbulb, FaHandshake } from "react-icons/fa";

const values = [
  { icon: <FaShieldAlt />, title: "Integridad", desc: "Actuamos con ética y honestidad en cada proceso de auditoría." },
  { icon: <FaLightbulb />, title: "Excelencia", desc: "Buscamos la mejora continua para ofrecer estándares de clase mundial." },
  { icon: <FaHandshake />, title: "Compromiso", desc: "Nos dedicamos plenamente al éxito y crecimiento de nuestros clientes." }
];

const Values = () => {
  return (
    <section className={styles.values}>
      <div className={styles.container}>
        <h2>Nuestros Valores</h2>
        <div className={styles.grid}>
          {values.map((v, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;