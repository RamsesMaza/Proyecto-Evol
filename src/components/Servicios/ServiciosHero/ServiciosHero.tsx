import styles from "./ServiciosHero.module.scss";

const ServiciosHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.slide} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1>Nuestros Servicios</h1>
        <div className={styles.divider} />
        <p>Soluciones integrales de certificación para llevar tu empresa al siguiente nivel.</p>
      </div>
    </section>
  );
};

export default ServiciosHero;
