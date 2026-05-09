import styles from "./ContactHero.module.scss";

const ContactHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.slide} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1>Contáctanos</h1>
        <div className={styles.divider} />
        <p>Expertos en certificación ISO a tu disposición.</p>
      </div>
    </section>
  );
};

export default ContactHero;