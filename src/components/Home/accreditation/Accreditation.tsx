import styles from "./Accreditation.module.scss";

import ACS from "../../../assets/logos/Logo-Color-Acs.webp";
import INACAL from "../../../assets/logos/INACAL.webp";

const Accreditation = () => {
  return (
    <section className={styles.accreditation}>
      <h2>
        Contamos con la Acreditación de <span>Inacal</span> en Nuestra ISO 37001
      </h2>

      <div className={styles.logos}>
        <img src={ACS} alt="ACS" />
        <div className={styles.divider}></div>
        <img src={INACAL} alt="INACAL" />
      </div>

      <p>
        Certifícate con nosotros y demuestra tu compromiso contra el soborno.
      </p>
    </section>
  );
};

export default Accreditation;