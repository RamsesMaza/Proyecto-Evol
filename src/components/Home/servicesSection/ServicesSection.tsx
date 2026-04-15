import styles from './servicesSection.module.scss';
import { FiArrowRight } from 'react-icons/fi'; 

import iso37001 from '../../../assets/img/iso37001.webp';
import iso9001 from '../../../assets/img/iso9001.webp';
import iso14001 from '../../../assets/img/iso14001.webp';
import iso45001 from '../../../assets/img/iso45001.webp';

const services = [
  {
    code: "ISO 37001",
    title: "Sistemas de Gestión Antisoborno",
    img: iso37001,
    id: "01"
  },
  {
    code: "ISO 9001",
    title: "Sistemas de Gestión de la Calidad",
    img: iso9001,
    id: "02"
  },
  {
    code: "ISO 14001",
    title: "Sistemas de Gestión Ambiental",
    img: iso14001,
    id: "03"
  },
  {
    code: "ISO 45001",
    title: "Seguridad y Salud en el Trabajo",
    img: iso45001,
    id: "04"
  }
];

const ServicesSection = () => {
  return (
    <section className={styles.services}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <span>Excelencia en Certificación</span>
          <h2>Nuestros Servicios <em>ISO</em></h2>
          <div className={styles.line}></div>
        </div>

        <div className={styles.grid}>
          {services.map((service, i) => (
            <article className={styles.card} key={i}>
              <img 
                src={service.img} 
                className={styles.cardImg} 
                alt={service.code} 
              />
              
              <div className={styles.overlay}></div>

              <div className={styles.content}>
                <span className={styles.number}>{service.id}</span>
                <h3>{service.code}</h3>
                <p>{service.title}</p>

                <a href="#" className={styles.btn}>
                  Saber más <FiArrowRight />
                </a>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;