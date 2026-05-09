import ContactForm from "../../Home/ContactForm/ContactForm";
import styles from "./ContactMainSection.module.scss";

const ContactMainSection = () => {
  return (
    <section className={styles.mainSection}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.formArea}>
            <div className={styles.header}>
              <h2>¿Tienes alguna duda?</h2>
              <p>Completa el formulario y un asesor se pondrá en contacto contigo.</p>
            </div>
            <ContactForm />
          </div>
          <div className={styles.mapArea}>
            <iframe 
              title="Mapa ACS"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.545229554477!2d-77.06742582405626!3d-11.97143498826139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf65c1979435%3A0xe54d24a91986c753!2sCalle%20Chasquitambo%20576%2C%20Los%20Olivos%2015301!5e0!3m2!1ses-419!2spe!4v1713650000000!5m2!1ses-419!2spe"
              width="100%" height="100%" style={{ border: 0, borderRadius: '15px' }} allowFullScreen loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMainSection;