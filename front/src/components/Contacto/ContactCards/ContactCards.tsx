import { useEffect, useRef, useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import styles from "./ContactCards.module.scss";

const data = [
  { icon: <FaPhoneAlt />, title: "Teléfono", desc: "+51 958 358 020", sub: "Lunes a Viernes" },
  { icon: <FaEnvelope />, title: "Correo", desc: "comercial@acs.pe", sub: "informes@acs.pe" },
  { icon: <FaMapMarkerAlt />, title: "Ubicación", desc: "Calle Chasquitambo 576", sub: "Los Olivos, Lima" },
  { icon: <FaClock />, title: "Horario", desc: "08:00 AM - 05:00 PM", sub: "Atención inmediata" }
];

const ContactCards = () => {
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
    <section ref={ref} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {data.map((item, i) => (
            <div key={i} className={`${styles.card} ${visible ? styles.enter : ''}`} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className={styles.iconWrap}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
              <p className={styles.cardSub}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactCards;
