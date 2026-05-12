import { useEffect, useRef, useState } from "react";
import styles from "./Values.module.scss";
import { FaShieldAlt, FaLightbulb, FaHandshake } from "react-icons/fa";

const values = [
  { icon: <FaShieldAlt />, title: "Integridad", desc: "Actuamos con ética y honestidad en cada proceso de auditoría." },
  { icon: <FaLightbulb />, title: "Excelencia", desc: "Buscamos la mejora continua para ofrecer estándares de clase mundial." },
  { icon: <FaHandshake />, title: "Compromiso", desc: "Nos dedicamos plenamente al éxito y crecimiento de nuestros clientes." },
];

const Values = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={styles.values}>
      <div className={styles.container}>
        <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <span className={styles.sectionBadge}>Nuestra Base</span>
          <h2 className={styles.sectionTitle}>Nuestros Valores</h2>
          <p className={styles.sectionDesc}>Principios que guían cada certificación y cada relación con nuestros clientes.</p>
        </div>
        <div className={styles.grid}>
          {values.map((v, i) => (
            <div key={i} className={`${styles.card} ${visible ? styles.cardEnter : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className={styles.iconWrap}>{v.icon}</div>
              <h3 className={styles.cardTitle}>{v.title}</h3>
              <p className={styles.cardDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
