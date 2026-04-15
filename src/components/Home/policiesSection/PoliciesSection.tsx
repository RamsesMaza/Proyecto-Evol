import styles from './PoliciesSection.module.scss';
import pol1 from '../../../assets/img/pol-calidad.webp';
import pol2 from '../../../assets/img/pol-imparcialidad.webp';
import pol3 from '../../../assets/img/pol-confidencialidad.webp';
import pol4 from '../../../assets/img/pol-suspension.webp';
import pol5 from '../../../assets/img/pol-antisoborno.webp';

const policies = [
  { title: "Calidad", img: pol1, code: "POL-01" },
  { title: "Imparcialidad", img: pol2, code: "POL-02" },
  { title: "Confidencialidad", img: pol3, code: "POL-03" },
  { title: "Suspensión", img: pol4, code: "POL-04" },
  { title: "Antisoborno", img: pol5, code: "POL-05" },
];

const PoliciesSection = () => {
  return (
    <section className={styles.policies}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h2>Nuestras Políticas</h2>
          <div className={styles.line}></div>
        </div>

        <div className={styles.grid}>
          {policies.map((policy, i) => (
            <article className={styles.card} key={i}>
              <div className={styles.badge}>{policy.code}</div>
              
              <img src={policy.img} alt={policy.title} />
              
              <div className={styles.overlay}>
                <h3 className={styles.title}>{policy.title}</h3>
                <a href="#" className={styles.btn}>
                  Ver Documento
                </a>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PoliciesSection;