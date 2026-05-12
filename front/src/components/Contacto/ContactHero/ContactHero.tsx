import styles from "./ContactHero.module.scss";

const ContactHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.slide} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <span className={styles.badge}>Comunícate con nosotros</span>
        <h1 className={styles.title}>Contáctanos</h1>
        <div className={styles.divider} />
        <p className={styles.sub}>Expertos en certificación ISO a tu disposición.</p>
      </div>
    </section>
  );
};

export default ContactHero;
