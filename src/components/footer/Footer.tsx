import styles from "./Footer.module.scss";
import { FaLinkedin } from "react-icons/fa";

import ACS from "../../assets/logos/Logo-Color-Acs.webp";
import bg from "../../assets/img/footer-bg.webp";


const Footer: React.FC = () => {
  return (
    <footer
      className={styles.footer}
      style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${bg})` }}
    >
      <div className={styles.container}>
        {/* LEFT */}
        <div className={styles.left}>
          <img src={ACS} alt="ACS Logo" className={styles.logo} />

          <p>
            Somos un organismo de certificación peruano, que brinda auditorías
            de certificación, auditorías a proveedores y evaluaciones de
            cumplimiento bajo los requerimientos de diversos estándares
            internacionales.
          </p>
        </div>

        {/* CENTER */}
        <div className={styles.links}>
          <h3>Enlaces Rápidos</h3>

          <nav>
            <a className={styles.active}>Inicio</a>
            <a>Nosotros</a>
            <a>Solicitudes</a>
            <a>Servicios</a>
            <a>Blog</a>
            <a>Contacto</a>
          </nav>

          <button className={styles.verifyBtn}>Verifica tu certificado</button>
        </div>

        {/* RIGHT */}
        <div className={styles.contact}>
          <h3>Información de Contacto</h3>

          <p>Calle chasquitambo nro. 576 urb.</p>
          <p>Parque naranjal Lima – Lima – Los Olivos</p>
          <p>informes@acs.pe</p>
          <p>+51 958 358 020</p>
          <p>Lun. – Vie.: 8:00 a.m. – 5:00 p.m.</p>

          <div className={styles.social}>
            <FaLinkedin />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
