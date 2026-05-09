import styles from './ClientsSection.module.scss';
import logo1 from '../../../assets/img/logo-gestion.webp';
import logo2 from '../../../assets/img/logo-cispor.webp';
import logo3 from '../../../assets/img/logo-madetech.webp';

const ClientsSection = () => {
  const logos = [logo1, logo2, logo3];

  return (
    <section className={styles.clients}>
      <div className={styles.container}>
        <div className={styles.content}>
          
          <div className={styles.text}>
            <h2>Tu éxito es nuestro mayor orgullo. Conoce nuestros principales clientes</h2>
            <div className={styles.line}></div>
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.track}>
              {[...logos, ...logos].map((logo, index) => (
                <div className={styles.logoItem} key={index}>
                  <img src={logo} alt={`Cliente ${index}`} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ClientsSection;