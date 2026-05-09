import styles from './ContactForm.module.scss';
import auditorImg from '../../../assets/img/auditor.webp';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const ContactForm = () => {
  return (
    <section className={styles.contact}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.imageBox}>
            <img src={auditorImg} alt="Staff ACS" />
          </div>
          <div className={styles.formBox}>
            <h2>CERTIFÍCATE CON <span>NOSOTROS</span></h2>
            <p>Contamos con staff de auditores calificados con certificaciones internacionales.</p>
            <div className={styles.ctaRow}>
              <button className={styles.btnWsp}><FaWhatsapp /> WhatsApp</button>
              <button className={styles.btnMail}><FaEnvelope /> Contacto@acs.pe</button>
            </div>
            <form className={styles.form}>
              <div className={styles.row}>
                <input type="text" placeholder="NOMBRES COMPLETOS *" />
                <input type="text" placeholder="CELULAR *" />
              </div>
              <div className={styles.row}>
                <input type="email" placeholder="CORREO *" />
                <input type="text" placeholder="RUC *" />
              </div>
              <button type="submit" className={styles.submit}>ENVIAR</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;