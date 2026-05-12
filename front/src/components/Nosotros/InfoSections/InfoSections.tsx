import { useEffect, useRef, useState } from "react";
import styles from "./InfoSections.module.scss";
import { FaAward, FaBullseye, FaEye } from "react-icons/fa";
import auditorImg from "../../../assets/img/Trato.webp";
import isoImg from "../../../assets/img/iso9001.webp";

const InfoSections = () => {
  const [vis1, setVis1] = useState(false);
  const [vis2, setVis2] = useState(false);
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el1 = ref1.current;
    const el2 = ref2.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === el1 && entry.isIntersecting) { setVis1(true); }
        if (entry.target === el2 && entry.isIntersecting) { setVis2(true); }
      });
    }, { threshold: 0.15 });

    if (el1) observer.observe(el1);
    if (el2) observer.observe(el2);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.info}>
      <div className={styles.container}>
        {/* Quiénes Somos */}
        <div ref={ref1} className={`${styles.grid} ${vis1 ? styles.gridVisible : ''}`}>
          <div className={styles.imageCol}>
            <div className={styles.imageWrap}>
              <img src={auditorImg} alt="Auditor ACS" />
              <div className={styles.imageAccent} />
            </div>
            <div className={styles.statsCard}>
              <span className={styles.statNum}>+15</span>
              <span className={styles.statLabel}>Años de experiencia</span>
            </div>
          </div>
          <div className={styles.textCol}>
            <span className={styles.badge}><FaAward /> Quiénes Somos</span>
            <h2 className={styles.title}>Certificación para la Integridad Empresarial</h2>
            <p className={styles.paragraph}>
              ACS es un organismo de certificación independiente que destaca por su enfoque orientado 
              a operar a escala internacional mirando al futuro. Nuestra actividad principal se centra 
              en la certificación de sistemas de gestión, con un compromiso fundamental con la transparencia, 
              la ética y la integridad.
            </p>
          </div>
        </div>

        {/* Misión y Visión */}
        <div ref={ref2} className={`${styles.grid} ${styles.gridReverse} ${vis2 ? styles.gridVisible : ''}`}>
          <div className={styles.mvCol}>
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}><FaBullseye /></div>
              <h3 className={styles.mvTitle}>Misión</h3>
              <p className={styles.mvText}>
                En ACS, nuestra misión es ser líderes en la prestación de servicios de certificación ISO, 
                brindando a las organizaciones las herramientas y la orientación necesarias para alcanzar 
                estándares de excelencia reconocidos a nivel mundial. Nos comprometemos a proporcionar 
                servicios de alta calidad, confiables y eficientes que impulsen el éxito y la 
                competitividad de nuestros clientes en sus respectivas industrias.
              </p>
            </div>
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}><FaEye /></div>
              <h3 className={styles.mvTitle}>Visión</h3>
              <p className={styles.mvText}>
                Nos visualizamos como la opción preferida y de confianza para las empresas que buscan 
                certificaciones ISO, destacándonos por nuestra excelencia en servicio al cliente y 
                nuestro compromiso con la mejora continua. Aspiramos a ser reconocidos como referentes 
                en el campo de la certificación ISO, contribuyendo al crecimiento sostenible y al 
                desarrollo de nuestras comunidades y del mercado global.
              </p>
            </div>
          </div>
          <div className={styles.imageCol}>
            <div className={styles.imageWrap}>
              <img src={isoImg} alt="Excelencia ISO" />
              <div className={styles.imageAccent} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSections;
