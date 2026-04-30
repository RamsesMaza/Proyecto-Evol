import styles from "./InfoSections.module.scss";
import auditorImg from "../../../assets/img/Trato.webp";
import isoImg from "../../../assets/img/iso9001.webp";

const InfoSections = () => {
  return (
    <section className={styles.info}>
      <div className={styles.container}>
        
        {/* Quiénes Somos */}
        <div className={styles.grid}>
          <div className={styles.textContent}>
            <span className={styles.highlightText}>Somos ACS</span>
            <h2>Certificación para la Integridad Empresarial</h2>
            <p>
              ACS es un organismo de certificación independiente que destaca por su enfoque orientado 
              a operar a escala internacional mirando al futuro. Nuestra actividad principal se centra 
              en la certificación de sistemas de gestión, con un compromiso fundamental con la transparencia, 
              la ética y la integridad.
            </p>
          </div>
          <div className={styles.imageContent}>
            <img src={auditorImg} alt="Auditor ACS" />
          </div>
        </div>

        {/* Misión y Visión */}
        <div className={`${styles.grid} ${styles.reverse}`}>
          <div className={styles.imageContent}>
            <img src={isoImg} alt="Excelencia ISO" />
          </div>
          <div className={styles.textContent}>
            <div className={styles.box}>
              <h3>Misión</h3>
              <p>
                En ACS, nuestra misión es ser líderes en la prestación de servicios de certificación ISO, 
                brindando a las organizaciones las herramientas y la orientación necesarias para alcanzar 
                estándares de excelencia reconocidos a nivel mundial. Nos comprometemos a proporcionar 
                servicios de alta calidad, confiables y eficientes que impulsen el éxito y la 
                competitividad de nuestros clientes en sus respectivas industrias.
              </p>
            </div>
            <div className={styles.box}>
              <h3>Visión</h3>
              <p>
                Nos visualizamos como la opción preferida y de confianza para las empresas que buscan 
                certificaciones ISO, destacándonos por nuestra excelencia en servicio al cliente y 
                nuestro compromiso con la mejora continua. Aspiramos a ser reconocidos como referentes 
                en el campo de la certificación ISO, contribuyendo al crecimiento sostenible y al 
                desarrollo de nuestras comunidades y del mercado global.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default InfoSections;