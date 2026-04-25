import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import styles from "./ContactCards.module.scss";

const data = [
  { icon: <FaPhoneAlt />, title: "Teléfono", desc: "+51 958 358 020", sub: "Lunes a Viernes" },
  { icon: <FaEnvelope />, title: "Correo", desc: "comercial@acs.pe", sub: "informes@acs.pe" },
  { icon: <FaMapMarkerAlt />, title: "Ubicación", desc: "Calle Chasquitambo 576", sub: "Los Olivos, Lima" },
  { icon: <FaClock />, title: "Horario", desc: "08:00 AM - 05:00 PM", sub: "Atención inmediata" }
];

const ContactCards = () => {
  return (
    <section className={styles.cardsSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {data.map((item, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
              <p className={styles.sub}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactCards;